"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { useCustomerAuth } from './customer-auth-context'
import { cartService, Cart, CartItem, CartBusiness } from '@/lib/services/cart.service'

interface CartContextValue {
  // State
  cart: Cart
  loading: boolean
  isOpen: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'id' | 'created_at'>, business?: CartBusiness) => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => Promise<void>
  setCartOpen: (isOpen: boolean) => void
  toggleCart: () => void

  // Computed values
  itemCount: number
  subtotal: number
  total: number
  hasItems: boolean
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useCustomerAuth()
  const [cart, setCart] = useState<Cart>({ items: [], business: null })
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const initialized = useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Load cart on mount - CLIENT-SIDE ONLY (localStorage)
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true

    const loadCart = () => {
      setLoading(true)
      try {
        // Clean up old cart storage keys
        const oldKeys = ['sidehusl_cart', 'cart']
        oldKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key)
          }
        })

        const localCart = cartService.loadFromLocalStorage()
        setCart(localCart)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        setCart({ items: [], business: null })
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [user?.id])

  // Auto-save function - CLIENT-SIDE ONLY (localStorage)
  const saveCart = useCallback((newCart: Cart) => {

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      cartService.saveToLocalStorage(newCart)
    }, 500)
  }, [])

  // Add item to cart
  const addItem = useCallback((item: Omit<CartItem, 'id' | 'created_at'>, business?: CartBusiness) => {

    setCart(prevCart => {

      if (prevCart.items.length === 0 && business) {
        const newItem: CartItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString()
        }
        const newCart: Cart = { items: [newItem], business }
        saveCart(newCart)
        return newCart
      }

      if (prevCart.business && item.business_id !== prevCart.business.id) {
        throw new Error('Cannot add items from different businesses. Please clear your cart first.')
      }

      const existingItemIndex = prevCart.items.findIndex(i =>
        i.menu_item_id === item.menu_item_id &&
        i.product_id === item.product_id &&
        i.service_id === item.service_id &&
        JSON.stringify(i.options) === JSON.stringify(item.options)
      )

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        newItems = [...prevCart.items]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + item.quantity
        }
      } else {
        const newItem: CartItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString()
        }
        newItems = [...prevCart.items, newItem]
      }

      const newCart: Cart = { ...prevCart, items: newItems }
      saveCart(newCart)
      return newCart
    })
  }, [saveCart])

  // Update quantity
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCart(prevCart => {
      let newItems: CartItem[]

      if (quantity === 0) {
        newItems = prevCart.items.filter(item => item.id !== itemId)
      } else {
        newItems = prevCart.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      }

      const newCart: Cart = { ...prevCart, items: newItems }

      if (newItems.length === 0) {
        newCart.business = null
      }

      saveCart(newCart)
      return newCart
    })
  }, [saveCart])

  // Remove item
  const removeItem = useCallback((itemId: string) => {
    updateQuantity(itemId, 0)
  }, [updateQuantity])

  // Clear cart
  const clearCart = useCallback(async () => {
    setCart({ items: [], business: null })
    cartService.clearLocalStorage()
  }, [])

  // Cart visibility
  const setCartOpen = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  // Computed values
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal + (cart.business?.delivery_fee || 0)
  const hasItems = cart.items.length > 0

  const value: CartContextValue = {
    cart,
    loading,
    isOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setCartOpen,
    toggleCart,
    itemCount,
    subtotal,
    total,
    hasItems
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
