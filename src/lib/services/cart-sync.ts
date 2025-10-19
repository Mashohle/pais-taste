import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Types
export interface CartItem {
  id: string
  business_id: string
  item_type: 'menu_item' | 'product' | 'service'
  name: string
  description?: string
  price: number
  quantity: number

  // Type-specific IDs
  menu_item_id?: string
  product_id?: string
  service_id?: string

  // Service booking
  booking_details?: {
    date: string
    time: string
    duration: number
    staff_id?: string
    [key: string]: any
  }

  // Customization
  options?: Record<string, any>
  notes?: string

  // Availability flag
  is_available: boolean

  // Metadata
  created_at?: string
}

export interface CartBusiness {
  id: string
  name: string
  slug: string
  category: string
  logo_url?: string
  delivery_fee?: number
  minimum_order?: number
}

export interface CartState {
  items: CartItem[]
  business: CartBusiness | null
  loading: boolean
  syncing: boolean
  isOpen: boolean
}

const CART_STORAGE_KEY = 'sidehusl_cart'

/**
 * CartSyncService - Handles hybrid cart persistence
 * - Guests: localStorage only
 * - Logged in: localStorage + database (synced)
 */
export class CartSyncService {
  /**
   * Initialize cart on app load
   * Loads from appropriate source based on auth state
   */
  async initialize(userId?: string): Promise<CartState> {
    if (userId) {
      return await this.initializeAuthenticatedCart(userId)
    } else {
      return this.initializeGuestCart()
    }
  }

  /**
   * Initialize cart for logged-in user
   * Merges localStorage with database, prioritizing database
   */
  private async initializeAuthenticatedCart(userId: string): Promise<CartState> {
    try {
      // Load from both sources
      const dbCart = await this.loadFromDatabase(userId)
      const localCart = this.loadFromLocalStorage()

      // If both have items, merge them
      if (dbCart.items.length > 0 && localCart.items.length > 0) {
        // Database wins - it's the source of truth for logged-in users
        // But we'll add any local items that aren't in the database
        const merged = this.mergeCart(dbCart, localCart)

        // Save merged cart to database
        await this.saveToDatabase(userId, merged)

        // Update localStorage to match
        this.saveToLocalStorage(merged)

        return merged
      }

      // If only database has items, use that
      if (dbCart.items.length > 0) {
        this.saveToLocalStorage(dbCart)
        return dbCart
      }

      // If only localStorage has items, save to database
      if (localCart.items.length > 0) {
        await this.saveToDatabase(userId, localCart)
        return localCart
      }

      // Both empty
      return { items: [], business: null, loading: false, syncing: false, isOpen: false }
    } catch (error) {
      console.error('Error initializing authenticated cart:', error)
      // Fallback to localStorage
      return this.loadFromLocalStorage()
    }
  }

  /**
   * Initialize cart for guest user
   * Loads from localStorage only
   */
  private initializeGuestCart(): CartState {
    return this.loadFromLocalStorage()
  }

  /**
   * Save cart (hybrid - both localStorage and database if authenticated)
   */
  async saveCart(userId: string | undefined, cart: CartState): Promise<void> {
    // Always save to localStorage for instant feedback
    this.saveToLocalStorage(cart)

    // If logged in, also save to database (async)
    if (userId) {
      try {
        await this.saveToDatabase(userId, cart)
      } catch (error) {
        console.error('Error saving cart to database:', error)
        // Continue - localStorage save already succeeded
      }
    }
  }

  /**
   * Handle user login - transfer guest cart to database
   */
  async onLogin(userId: string): Promise<CartState> {
    const localCart = this.loadFromLocalStorage()

    try {
      // Load user's saved cart from database
      const dbCart = await this.loadFromDatabase(userId)

      // If user has a guest cart, merge it
      if (localCart.items.length > 0) {
        const merged = this.mergeCart(dbCart, localCart)
        await this.saveToDatabase(userId, merged)
        this.saveToLocalStorage(merged)
        return merged
      }

      // No guest cart, just use database cart
      this.saveToLocalStorage(dbCart)
      return dbCart
    } catch (error) {
      console.error('Error on login cart sync:', error)
      return localCart
    }
  }

  /**
   * Handle user logout - keep cart in localStorage
   */
  onLogout(): void {
    // Keep cart in localStorage
    // User can continue shopping as guest
  }

  /**
   * Load cart from database
   */
  async loadFromDatabase(userId: string): Promise<CartState> {
    try {
      // Use the custom function to get cart with availability
      const { data: cartItems, error } = await supabase
        .rpc('get_cart_with_availability', { p_user_id: userId })

      if (error) throw error

      if (!cartItems || cartItems.length === 0) {
        return { items: [], business: null, loading: false, syncing: false, isOpen: false }
      }

      // Get business info from first item
      const businessId = cartItems[0].business_id
      const { data: business } = await supabase
        .from('businesses')
        .select('id, name, slug, business_categories(name), logo_url')
        .eq('id', businessId)
        .single()

      if (!business) {
        throw new Error('Business not found')
      }

      const businessData: CartBusiness = {
        id: business.id,
        name: business.name,
        slug: business.slug,
        category: Array.isArray(business.business_categories)
          ? business.business_categories[0]?.name || 'general'
          : (business.business_categories as any)?.name || 'general',
        logo_url: business.logo_url
      }

      return {
        items: cartItems.map((item: any) => ({
          id: item.id,
          business_id: item.business_id,
          item_type: item.item_type,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          quantity: item.quantity,
          menu_item_id: item.menu_item_id,
          product_id: item.product_id,
          service_id: item.service_id,
          booking_details: item.booking_details,
          options: item.options,
          notes: item.notes,
          is_available: item.is_available,
          created_at: item.created_at
        })),
        business: businessData,
        loading: false,
        syncing: false,
        isOpen: false
      }
    } catch (error) {
      console.error('Error loading cart from database:', error)
      throw error
    }
  }

  /**
   * Save cart to database
   */
  async saveToDatabase(userId: string, cart: CartState): Promise<void> {
    try {
      // Delete existing cart items for this user
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // Insert new cart items if any
      if (cart.items.length > 0 && cart.business) {
        const items = cart.items.map(item => ({
          user_id: userId,
          business_id: cart.business!.id,
          item_type: item.item_type,
          name: item.name,
          description: item.description || null,
          price: item.price,
          quantity: item.quantity,
          menu_item_id: item.menu_item_id || null,
          product_id: item.product_id || null,
          service_id: item.service_id || null,
          booking_details: item.booking_details || null,
          options: item.options || null,
          notes: item.notes || null
        }))

        const { error: insertError } = await supabase
          .from('cart_items')
          .insert(items)

        if (insertError) throw insertError
      }
    } catch (error) {
      console.error('Error saving cart to database:', error)
      throw error
    }
  }

  /**
   * Save cart to localStorage
   */
  saveToLocalStorage(cart: CartState): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }

  /**
   * Load cart from localStorage
   */
  loadFromLocalStorage(): CartState {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (!stored) {
        return { items: [], business: null, loading: false, syncing: false, isOpen: false }
      }

      const cart = JSON.parse(stored) as CartState

      // Ensure cart has required structure
      return {
        items: cart.items || [],
        business: cart.business || null,
        loading: false,
        syncing: false,
        isOpen: false
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      return { items: [], business: null, loading: false, syncing: false, isOpen: false }
    }
  }

  /**
   * Clear cart from both localStorage and database
   */
  async clearCart(userId?: string): Promise<void> {
    // Clear localStorage
    localStorage.removeItem(CART_STORAGE_KEY)

    // Clear database if logged in
    if (userId) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
      } catch (error) {
        console.error('Error clearing cart from database:', error)
      }
    }
  }

  /**
   * Merge two carts - database takes priority, but add unique local items
   */
  private mergeCart(dbCart: CartState, localCart: CartState): CartState {
    // If different businesses, keep database cart
    if (dbCart.business && localCart.business && dbCart.business.id !== localCart.business.id) {
      return dbCart
    }

    // Same business or one is empty - merge items
    const mergedItems = [...dbCart.items]

    localCart.items.forEach(localItem => {
      // Check if this item already exists in database cart
      const exists = mergedItems.some(dbItem =>
        dbItem.menu_item_id === localItem.menu_item_id &&
        dbItem.product_id === localItem.product_id &&
        dbItem.service_id === localItem.service_id &&
        JSON.stringify(dbItem.options) === JSON.stringify(localItem.options)
      )

      // Add if it doesn't exist
      if (!exists) {
        mergedItems.push(localItem)
      }
    })

    return {
      items: mergedItems,
      business: dbCart.business || localCart.business,
      loading: false,
      syncing: false,
      isOpen: false
    }
  }

  /**
   * Check if a specific item is still available
   */
  async checkItemAvailability(item: CartItem): Promise<boolean> {
    try {
      if (item.item_type === 'menu_item' && item.menu_item_id) {
        const { data, error } = await supabase
          .from('menu_items')
          .select('available, published')
          .eq('id', item.menu_item_id)
          .single()

        if (error) return false
        return data.available && data.published
      }

      // TODO: Add checks for products and services when tables exist
      return true
    } catch (error) {
      console.error('Error checking item availability:', error)
      return false
    }
  }

  /**
   * Refresh availability for all items in cart
   */
  async refreshAvailability(cart: CartState): Promise<CartState> {
    const itemsWithAvailability = await Promise.all(
      cart.items.map(async (item) => ({
        ...item,
        is_available: await this.checkItemAvailability(item)
      }))
    )

    return {
      ...cart,
      items: itemsWithAvailability
    }
  }
}

// Export singleton instance
export const cartSyncService = new CartSyncService()
