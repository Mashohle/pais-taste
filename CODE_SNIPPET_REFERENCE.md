# Code Snippet Reference - Customer Auth Architecture

## 1. Current Customer Auth Context (How It Works)

### Location: `/src/lib/contexts/auth-context.tsx`

```typescript
// INITIALIZATION
useEffect(() => {
  const initAuth = async () => {
    // Step 1: Get session from Supabase
    const { data: { session } } = await supabase.auth.getSession()
    
    // Step 2: If session exists, fetch profile
    if (session?.user) {
      await fetchProfile()  // Calls /api/auth/profile
    }
    
    setLoading(false)
  }
  
  initAuth()
  
  // Step 3: Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN') {
        await fetchProfile()
      }
    }
  )
}, [])

// FETCH PROFILE FROM API
const fetchProfile = async () => {
  const response = await fetch('/api/auth/profile')
  const data = await response.json()
  setSession(data.session)
  setUser(data.user)
  setProfile(data.profile)
}
```

**What it does**:
1. Checks if user has session
2. Fetches profile if signed in
3. Listens for auth changes
4. Updates state on sign in/out

---

## 2. Admin Business Context (Reference Pattern)

### Location: `/src/lib/context/business-admin-context.tsx`

```typescript
// INITIALIZATION (Much simpler!)
useEffect(() => {
  fetchBusinessProfile()
}, [])

// FETCH COMBINED DATA (Single call)
const fetchBusinessProfile = useCallback(async () => {
  const response = await fetch('/api/auth/business-profile')
  
  if (!response.ok) {
    if (response.status === 401) {
      setData(null)
      return
    }
    throw new Error(`API error: ${response.status}`)
  }
  
  const profileData = await response.json()
  setData(profileData)
  
  // Set first business as current
  if (profileData.businesses?.length > 0) {
    setCurrentBusiness(profileData.businesses[0])
  }
}, [])
```

**Key difference**:
- Single `/api/auth/business-profile` call returns EVERYTHING
- No need to listen for auth changes (handled in hook)
- Includes businesses and permissions in one response

---

## 3. Customer API Routes

### Current: `/api/auth/profile` (Returns User + Profile)

```typescript
export async function GET() {
  const supabase = await createClient()
  
  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  // Get profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return NextResponse.json({
    user,
    session,
    profile: profileData
  })
}
```

**Returns**: User + Profile only

---

### Admin: `/api/auth/business-profile` (Returns Everything)

```typescript
export async function GET() {
  const supabase = await createClient()
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  // Get businesses (with relations)
  const { data: businessUsers } = await supabase
    .from('business_users')
    .select(`
      id, role, is_active, permissions,
      businesses!inner (
        *,
        business_categories (id, name, icon, color)
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
  
  // Transform and return
  const businesses = businessUsers?.map(bu => ({
    id: bu.id,
    name: bu.businesses.name,
    role: bu.role,
    business: bu.businesses
  }))
  
  return NextResponse.json({
    user,
    profile,
    businesses,
    isBusinessUser: profile.role_id === 'business-owner' || profile.role_id === 'business-admin'
  })
}
```

**Returns**: User + Profile + Businesses + Permissions in ONE call

---

## 4. Current Customer Orders Hook

### Location: `/src/lib/hooks/use-active-orders.ts`

```typescript
export function useActiveOrders(filters: ActiveOrderFilters = {}) {
  const [orders, setOrders] = useState<ActiveOrderItem[]>([])
  const [loading, setLoading] = useState(true)
  
  const fetchOrders = useCallback(async (newOffset: number = 0) => {
    try {
      setLoading(true)
      
      // Make separate API call
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: newOffset.toString(),
      })
      
      const response = await fetch(`/api/customer/orders/active?${params}`)
      const data = await response.json()
      
      setOrders(data.orders)
      setStats(data.stats)
      
    } finally {
      setLoading(false)
    }
  }, [filters])
  
  // Fetch on mount
  useEffect(() => {
    fetchOrders(0)
  }, [filters])
  
  return { orders, stats, loading, error }
}
```

**Issues**:
- Separate API call from useAuth()
- Component-level fetching
- No shared context
- Waterfall pattern (waits for auth first)

---

## 5. Admin Layout Integration

### Location: `/src/app/admin/layout.tsx`

```typescript
export default function AdminLayout({ children }) {
  return (
    <BusinessAdminProvider>
      <BusinessAdminGuard>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </BusinessAdminGuard>
    </BusinessAdminProvider>
  )
}

function AdminLayoutContent({ children }) {
  // Hook provides all business data
  const { 
    user, 
    userBusinesses, 
    currentBusiness, 
    setCurrentBusiness 
  } = useBusinessAdminAuth()
  
  // Business context available immediately
  return (
    <div>
      {/* Business Switcher */}
      <Select value={currentBusiness.slug} onValueChange={handleSwitch}>
        {userBusinesses.map(b => <SelectItem>{b.name}</SelectItem>)}
      </Select>
      
      {/* All children have access to useBusinessAdminAuth() */}
      {children}
    </div>
  )
}
```

**Benefits**:
- Single provider wrapping entire admin section
- All data loaded in layout
- Business context available to all children
- Business switcher built-in

---

## 6. Customer Layout (Current)

### Location: `/src/app/account/layout.tsx`

```typescript
export default function AccountLayout({ children }) {
  const pathname = usePathname()
  
  if (pathname === '/auth' || pathname.startsWith('/auth/')) {
    return <>{children}</>
  }
  
  return (
    <ProtectedRoute redirectTo="/login">
      <AccountLayoutContent>{children}</AccountLayoutContent>
    </ProtectedRoute>
  )
}

function AccountLayoutContent({ children }) {
  // Uses basic auth hook
  const { signOut, user, getDisplayName } = useAuth()
  
  // No customer context
  // Each child component fetches its own data
  return (
    <div>
      <p>Welcome, {getDisplayName()}</p>
      {children}
    </div>
  )
}
```

**Issues**:
- No customer context provider
- Each child fetches separately
- No centralized business switching
- Profile data not pre-loaded

---

## 7. Cart Context (Separate from Auth)

### Location: `/src/lib/contexts/cart-context.tsx`

```typescript
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()  // Depends on auth
  const [state, dispatch] = useReducer(cartReducer, initialState)
  
  // Initialize cart
  useEffect(() => {
    async function initCart() {
      if (!user?.id) return
      
      // Load from database using user ID
      const cart = await cartSyncService.initialize(user?.id)
      dispatch({ type: 'SET_CART', payload: cart })
    }
    
    initCart()
  }, [user?.id])
  
  // Save on changes
  const saveCart = useCallback(async (newState: CartState) => {
    await cartSyncService.saveCart(user?.id, newState)
  }, [user?.id])
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
```

**Issue**: Cart is separate from auth/customer context
- Depends on useAuth() for user ID
- Could be integrated for better UX

---

## 8. Proposed: Customer Context (Mirror of Admin)

### Proposed Location: `/src/lib/context/customer-context.tsx`

```typescript
interface CustomerProfileData {
  user: User
  profile: UserProfile
  activeOrders: ActiveOrderItem[]
  orderStats: OrderStats | null
  isAuthenticated: boolean
}

interface CustomerContextType {
  // Auth state
  user: User | null
  profile: UserProfile | null
  
  // Customer data
  activeOrders: ActiveOrderItem[]
  orderStats: OrderStats | null
  
  // Loading states
  loading: boolean
  error: string | null
  
  // Computed
  isAuthenticated: boolean
  hasActiveOrders: boolean
  isProfileComplete: boolean
  
  // Actions
  signOut: () => Promise<void>
  refreshOrders: () => Promise<void>
}

export function CustomerContextProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CustomerProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  
  // Single fetch call on mount
  const fetchCustomerProfile = useCallback(async () => {
    try {
      setLoading(true)
      
      // Single API call gets everything
      const response = await fetch('/api/auth/customer-profile')
      
      if (!response.ok) {
        if (response.status === 401) {
          setData(null)
          return
        }
        throw new Error(`API error: ${response.status}`)
      }
      
      const profileData = await response.json()
      setData(profileData)
      
    } catch (err) {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchCustomerProfile()
  }, [])
  
  const value: CustomerContextType = {
    user: data?.user || null,
    profile: data?.profile || null,
    activeOrders: data?.activeOrders || [],
    orderStats: data?.orderStats || null,
    loading,
    isAuthenticated: !!data?.user,
    hasActiveOrders: (data?.activeOrders?.length || 0) > 0,
    isProfileComplete: isComplete(data?.profile),
    signOut: async () => {
      await supabase.auth.signOut()
      setData(null)
    },
    refreshOrders: fetchCustomerProfile
  }
  
  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerContext)
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerContextProvider')
  }
  return context
}
```

**Same pattern as admin**:
- Single provider
- Single context
- Single hook
- All data loaded once

---

## 9. Proposed: Combined API Endpoint

### Proposed Location: `/src/app/api/auth/customer-profile/route.ts`

```typescript
export async function GET() {
  const supabase = await createClient()
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  // Get active orders
  const { data: activeOrders } = await supabase
    .from('orders')
    .select(`
      *,
      businesses (id, name, slug, phone, business_categories (id, name)),
      order_items (quantity, unit_price, menu_items(name, image_url))
    `)
    .eq('user_id', user.id)
    .in('order_status_code', ['received', 'preparing', 'ready'])
    .order('created_at', { ascending: false })
    .limit(50)
  
  // Calculate stats
  const stats = {
    totalActiveOrders: activeOrders?.length || 0,
    totalValue: activeOrders?.reduce((sum, o) => sum + o.total_amount, 0) || 0,
    ordersByStatus: calculateStats(activeOrders || [])
  }
  
  return NextResponse.json({
    user,
    profile: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      phone: profile.phone,
      avatar_url: profile.avatar_url
    },
    activeOrders,
    orderStats: stats,
    isAuthenticated: true
  })
}
```

**Returns**: Everything in one response
- User from Supabase
- Profile from database
- Active orders with business/items
- Statistics pre-calculated

---

## 10. Usage Comparison

### Current (Multiple Fetches)
```typescript
// In /account/orders page
export default function OrdersPage() {
  // Fetch 1: Auth context fetches /api/auth/profile
  const { profile } = useAuth()
  
  // Fetch 2: This component fetches /api/customer/orders/active
  const { orders, loading } = useActiveOrders()
  
  if (loading) return <Loader />
  return <OrdersList orders={orders} />
}
```

**Result**: 2 separate API calls, waterfall pattern

### Proposed (Single Fetch)
```typescript
// In /account/orders page
export default function OrdersPage() {
  // Single fetch: /api/auth/customer-profile includes everything
  const { activeOrders, loading } = useCustomerAuth()
  
  if (loading) return <Loader />
  return <OrdersList orders={activeOrders} />
}
```

**Result**: 1 API call, orders already in context

---

## 11. Provider Setup Comparison

### Current (`app-providers.tsx`)
```typescript
export function AppProviders({ children }: AppProvidersProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  
  if (isAdminRoute) {
    return <NotificationProvider>{children}</NotificationProvider>
  }
  
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
}
```

### Proposed (`app-providers.tsx` - Updated)
```typescript
export function AppProviders({ children }: AppProvidersProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isAccountRoute = pathname?.startsWith('/account')
  
  if (isAdminRoute) {
    return <NotificationProvider>{children}</NotificationProvider>
  }
  
  if (isAccountRoute) {
    // Use unified customer context
    return (
      <CustomerContextProvider>
        <CartProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </CartProvider>
      </CustomerContextProvider>
    )
  }
  
  // Public pages: basic auth
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
}
```

---

## 12. Security Comparison

### Both approaches check auth server-side

**Current**:
```typescript
// /api/auth/profile
const { data: { user } } = await supabase.auth.getUser()
if (!user) return 401

// /api/customer/orders/active
const { data: { user } } = await supabase.auth.getUser()
if (!user) return 401
```

**Proposed**:
```typescript
// /api/auth/customer-profile
const { data: { user } } = await supabase.auth.getUser()
if (!user) return 401
// All data fetched for authenticated user
```

**Advantage of proposed**:
- Single auth check (atomic)
- Less chance of state mismatch
- All data guaranteed to be from same user session

---

## Summary Table

| Aspect | Current | Proposed (Admin Pattern) |
|--------|---------|--------------------------|
| **Context Hook** | `useAuth()` | `useCustomerAuth()` |
| **API Endpoints** | 3 separate calls | 1 combined call |
| **Data Load** | Waterfall | Atomic |
| **Location** | Global provider | Route-level provider |
| **Order Data** | Separate hook | In context |
| **Refetch** | useAuth() hook | useCustomerAuth() hook |
| **Business Context** | None | Available |
| **Performance** | Slower (waterfall) | Faster (single call) |
| **Scalability** | Hard to add features | Easy to add features |

---
