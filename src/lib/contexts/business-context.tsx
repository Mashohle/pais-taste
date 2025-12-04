"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCustomerAuth } from '@/lib/context/customer-auth-context'

export interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string
  email: string | null
  phone: string | null
  website: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string
  currency: string
  timezone: string
  logo_url: string | null
  primary_color: string
  accent_color: string
  is_active: boolean
  is_verified: boolean
  setup_completed: boolean
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined category data
  business_categories?: {
    id: string
    name: string
    description: string | null
    icon: string
    color: string
  }
}

export interface BusinessUser {
  id: string
  business_id: string
  user_id: string
  role: 'owner' | 'admin' | 'staff' | 'viewer'
  permissions: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

interface BusinessContextType {
  // Current business data
  currentBusiness: Business | null
  userBusinesses: Business[]
  currentUserRole: BusinessUser | null
  
  // Loading states
  loading: boolean
  businessesLoading: boolean
  
  // Business operations
  setCurrentBusiness: (business: Business | null) => void
  switchBusiness: (businessSlug: string) => Promise<void>
  createBusiness: (businessData: Partial<Business>) => Promise<Business | null>
  updateBusiness: (businessId: string, updates: Partial<Business>) => Promise<boolean>
  
  // Business access
  canAccess: (permission: string) => boolean
  isOwner: boolean
  isAdmin: boolean
  canManage: boolean
  
  // Utility
  refreshBusinesses: () => Promise<void>
  getBusiness: (slug: string) => Promise<Business | null>
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

interface BusinessProviderProps {
  children: ReactNode
  initialBusinessSlug?: string
}

export function BusinessProvider({ children, initialBusinessSlug }: BusinessProviderProps) {
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)
  const [userBusinesses, setUserBusinesses] = useState<Business[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<BusinessUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [businessesLoading, setBusinessesLoading] = useState(true)
  
  const { user } = useCustomerAuth()
  const router = useRouter()
  const pathname = usePathname()

  const fetchUserBusinesses = useCallback(async () => {
    if (!user) return

    try {
      const { data: businessUsers, error } = await supabase
        .from('business_users')
        .select(`
          *,
          businesses (
            *,
            business_categories (
              id,
              name,
              description,
              icon,
              color
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) {
        // This is normal for regular customers who don't own businesses
        console.log('No business access for user (expected for customers):', error.message || 'Table may not exist')
        setUserBusinesses([])
        return
      }

      const businesses = businessUsers?.map(bu => bu.businesses).filter(Boolean) || []
      setUserBusinesses(businesses as Business[])

      console.log('Fetched businesses:', { businessUsers, businesses }) // Debug log

      // Set current business role if we have a current business
      if (currentBusiness) {
        const userRole = businessUsers?.find(bu => bu.business_id === currentBusiness.id)
        setCurrentUserRole(userRole as BusinessUser)
      }
    } catch (_error) {
      console.error('Error fetching user businesses:', _error)
    }
  }, [user, currentBusiness])

  const initializeBusinessContext = useCallback(async () => {
    try {
      setBusinessesLoading(true)
      await fetchUserBusinesses()
    } catch (_error) {
      console.error('Error initializing business context:', _error)
    } finally {
      setBusinessesLoading(false)
      setLoading(false)
    }
  }, [fetchUserBusinesses])

  const handleBusinessSwitch = useCallback(async (business: Business) => {
    setCurrentBusiness(business)

    // Update current user role for this business
    if (user) {
      const { data: userRole } = await supabase
        .from('business_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('business_id', business.id)
        .eq('is_active', true)
        .single()

      setCurrentUserRole(userRole)
    }
  }, [user])

  const detectBusinessFromRoute = useCallback(() => {
    // Extract business slug from URL patterns like /business/[slug] or /[slug]
    const pathSegments = pathname.split('/')
    let potentialSlug: string | null = null

    // Check for /business/[slug] pattern
    if (pathSegments[1] === 'business' && pathSegments[2]) {
      potentialSlug = pathSegments[2]
    }
    // Check for direct slug pattern /[slug] (excluding known app routes)
    else if (pathSegments[1] && !['admin', 'account', 'api', 'auth'].includes(pathSegments[1])) {
      potentialSlug = pathSegments[1]
    }

    if (potentialSlug) {
      const business = userBusinesses.find(b => b.slug === potentialSlug)
      if (business) {
        handleBusinessSwitch(business)
      }
    }
  }, [pathname, userBusinesses, handleBusinessSwitch])

  // Initialize business context
  useEffect(() => {
    if (user) {
      initializeBusinessContext()
    } else {
      // Clear business data when user logs out
      setCurrentBusiness(null)
      setUserBusinesses([])
      setCurrentUserRole(null)
      setLoading(false)
      setBusinessesLoading(false)
    }
  }, [user, initializeBusinessContext])

  // Handle initial business slug or route-based business detection
  useEffect(() => {
    if (userBusinesses.length > 0 && !currentBusiness) {
      if (initialBusinessSlug) {
        const business = userBusinesses.find(b => b.slug === initialBusinessSlug)
        if (business) {
          handleBusinessSwitch(business)
        }
      } else {
        // Try to detect business from current route
        detectBusinessFromRoute()
      }
    }
  }, [userBusinesses, initialBusinessSlug, currentBusiness, handleBusinessSwitch, detectBusinessFromRoute])

  const switchBusiness = async (businessSlug: string) => {
    const business = userBusinesses.find(b => b.slug === businessSlug)
    if (business) {
      await handleBusinessSwitch(business)
      // Navigate to business dashboard
      router.push(`/${businessSlug}/admin`)
    }
  }

  const createBusiness = async (businessData: Partial<Business>): Promise<Business | null> => {
    if (!user) return null

    try {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert([businessData])
        .select()
        .single()

      if (businessError) throw businessError

      // Add current user as owner
      const { error: userError } = await supabase
        .from('business_users')
        .insert([{
          business_id: business.id,
          user_id: user.id,
          role: 'owner'
        }])

      if (userError) throw userError

      // Refresh businesses list
      await fetchUserBusinesses()

      return business as Business
    } catch (_error) {
      console.error('Error creating business:', _error)
      return null
    }
  }

  const updateBusiness = async (businessId: string, updates: Partial<Business>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', businessId)

      if (error) throw error

      // Update current business if it's the one being updated
      if (currentBusiness?.id === businessId) {
        setCurrentBusiness({ ...currentBusiness, ...updates })
      }

      // Refresh businesses list
      await fetchUserBusinesses()

      return true
    } catch (_error) {
      console.error('Error updating business:', _error)
      return false
    }
  }

  const getBusiness = async (slug: string): Promise<Business | null> => {
    try {
      const { data: business, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_categories (
            id,
            name,
            description,
            icon,
            color
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return business as Business
    } catch (_error) {
      console.error('Error fetching business:', _error)
      return null
    }
  }

  const refreshBusinesses = async () => {
    await fetchUserBusinesses()
  }

  // Permission checks
  const canAccess = (permission: string): boolean => {
    if (!currentUserRole) return false
    
    // Owners and admins have all permissions
    if (['owner', 'admin'].includes(currentUserRole.role)) return true
    
    // Check specific permissions
    return currentUserRole.permissions?.[permission] === true
  }

  const isOwner = currentUserRole?.role === 'owner'
  const isAdmin = ['owner', 'admin'].includes(currentUserRole?.role || '')
  const canManage = ['owner', 'admin', 'staff'].includes(currentUserRole?.role || '')

  const value = {
    currentBusiness,
    userBusinesses,
    currentUserRole,
    loading,
    businessesLoading,
    setCurrentBusiness,
    switchBusiness,
    createBusiness,
    updateBusiness,
    canAccess,
    isOwner,
    isAdmin,
    canManage,
    refreshBusinesses,
    getBusiness
  }

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}