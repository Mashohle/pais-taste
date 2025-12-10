/**
 * Cart Service - Client-side cart persistence
 * Handles localStorage ONLY - database persistence happens at checkout
 */

const CART_STORAGE_KEY = 'sidehusl_cart_v2' // New key to avoid conflicts

// Types
export interface CartItem {
  id: string
  business_id: string
  item_type: 'menu_item' | 'product' | 'service'
  name: string
  description?: string
  price: number
  quantity: number
  menu_item_id?: string
  product_id?: string
  service_id?: string
  options?: Record<string, unknown>
  notes?: string
  created_at: string
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

export interface Cart {
  items: CartItem[]
  business: CartBusiness | null
}

class CartService {
  /**
   * Load cart from localStorage
   */
  loadFromLocalStorage(): Cart {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (!stored) {
        return { items: [], business: null }
      }
      const cart = JSON.parse(stored) as Cart
      return {
        items: cart.items || [],
        business: cart.business || null
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return { items: [], business: null }
    }
  }

  /**
   * Save cart to localStorage
   */
  saveToLocalStorage(cart: Cart): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Clear cart from localStorage
   */
  clearLocalStorage(): void {
    localStorage.removeItem(CART_STORAGE_KEY)
  }
}

export const cartService = new CartService()
