'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useRef } from 'react'
import { useAuth } from './auth-context'
import { cartSyncService, CartItem, CartBusiness, CartState } from '@/lib/services/cart-sync'

// Action types
type CartAction =
  | { type: 'SET_CART'; payload: CartState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_BUSINESS'; payload: CartBusiness }
  | { type: 'UPDATE_AVAILABILITY'; payload: { itemId: string; isAvailable: boolean } }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'TOGGLE_CART' }

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return action.payload

    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_SYNCING':
      return { ...state, syncing: action.payload }

    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(item =>
        item.menu_item_id === action.payload.menu_item_id &&
        item.product_id === action.payload.product_id &&
        item.service_id === action.payload.service_id &&
        JSON.stringify(item.options) === JSON.stringify(action.payload.options)
      )

      if (existingItemIndex >= 0) {
        // Item exists, increase quantity
        const newItems = [...state.items]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.payload.quantity
        }
        return { ...state, items: newItems }
      } else {
        // New item, add to cart
        return { ...state, items: [...state.items, action.payload] }
      }
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity === 0) {
        // Remove item if quantity is 0
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        }
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      }

    case 'CLEAR_CART':
      return {
        items: [],
        business: null,
        loading: false,
        syncing: false,
        isOpen: false
      }

    case 'SET_BUSINESS':
      return {
        ...state,
        business: action.payload
      }

    case 'UPDATE_AVAILABILITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? { ...item, is_available: action.payload.isAvailable }
            : item
        )
      }

    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload
      }

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      }

    default:
      return state
  }
}

// Context type
interface CartContextType {
  state: CartState

  // Core actions
  addItem: (item: Omit<CartItem, 'id' | 'created_at'>) => Promise<void>
  addItems: (items: Omit<CartItem, 'id' | 'created_at'>[]) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>

  // Business
  setBusiness: (business: CartBusiness) => Promise<void>
  switchBusiness: (business: CartBusiness) => Promise<boolean>

  // Cart visibility
  setCartOpen: (isOpen: boolean) => void
  toggleCart: () => void

  // Sync
  syncCart: () => Promise<void>
  refreshAvailability: () => Promise<void>

  // Computed values
  subtotal: number
  total: number
  itemCount: number
  hasUnavailableItems: boolean
  hasItems: boolean
}

const CartContext = createContext<CartContextType | null>(null)

// Provider
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    business: null,
    loading: true,
    syncing: false,
    isOpen: false
  })

  // Use ref to access latest state without triggering re-renders
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Track if we've initialized to prevent double-init
  const initialized = useRef(false)
  const previousUserId = useRef<string | undefined>(undefined)

  // Initialize cart on mount and when user changes
  useEffect(() => {
    // Skip if already initialized and user hasn't changed
    if (initialized.current && previousUserId.current === user?.id) {
      return
    }

    async function initCart() {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const cart = await cartSyncService.initialize(user?.id)
        dispatch({ type: 'SET_CART', payload: cart })
        initialized.current = true
        previousUserId.current = user?.id
      } catch (error) {
        console.error('Error initializing cart:', error)
        dispatch({ type: 'SET_CART', payload: { items: [], business: null, loading: false, syncing: false, isOpen: false } })
      }
    }

    initCart()
  }, [user?.id])

  // Save cart whenever it changes (without triggering state updates)
  const saveCart = useCallback(async (newState: CartState) => {
    try {
      await cartSyncService.saveCart(user?.id, newState)
    } catch (error) {
      console.error('Error saving cart:', error)
    }
  }, [user?.id])

  // Add item to cart
  const addItem = useCallback(async (item: Omit<CartItem, 'id' | 'created_at'>) => {
    const currentState = stateRef.current

    // Validate business compatibility
    if (currentState.business && item.business_id !== currentState.business.id) {
      throw new Error(`Cannot add items from different businesses. Please clear your cart first.`)
    }

    const newItem: CartItem = {
      ...item,
      id: `${Date.now()}-${Math.random()}`, // Temporary ID for localStorage
      is_available: true,
      created_at: new Date().toISOString()
    }

    dispatch({ type: 'ADD_ITEM', payload: newItem })

    // Save to persistence
    const newState = { ...currentState, items: [...currentState.items, newItem] }
    await saveCart(newState)
  }, [saveCart])

  // Update quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    const currentState = stateRef.current

    // Calculate new state
    const newItems = quantity === 0
      ? currentState.items.filter(item => item.id !== itemId)
      : currentState.items.map(item => item.id === itemId ? { ...item, quantity } : item)

    const newState = { ...currentState, items: newItems }

    // Dispatch to update React state
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } })

    // Save to persistence
    await saveCart(newState)
  }, [saveCart])

  // Remove item
  const removeItem = useCallback(async (itemId: string) => {
    const currentState = stateRef.current

    dispatch({ type: 'REMOVE_ITEM', payload: { id: itemId } })

    const newState = {
      ...currentState,
      items: currentState.items.filter(item => item.id !== itemId)
    }
    await saveCart(newState)
  }, [saveCart])

  // Clear cart
  const clearCart = useCallback(async () => {
    dispatch({ type: 'CLEAR_CART' })
    await cartSyncService.clearCart(user?.id)
  }, [user?.id])

  // Set business
  const setBusiness = useCallback(async (business: CartBusiness) => {
    const currentState = stateRef.current

    dispatch({ type: 'SET_BUSINESS', payload: business })

    const newState = { ...currentState, business }
    await saveCart(newState)
  }, [saveCart])

  // Switch business (clears cart if different business)
  const switchBusiness = useCallback(async (business: CartBusiness): Promise<boolean> => {
    const currentState = stateRef.current

    if (!currentState.business || currentState.business.id === business.id) {
      // No current business or same business - just set it
      await setBusiness(business)
      return true
    }

    // Different business with items in cart
    if (currentState.items.length > 0) {
      // In production, show a confirmation dialog
      const confirmed = window.confirm(
        `You have items from ${currentState.business.name} in your cart. Switching to ${business.name} will clear your cart. Continue?`
      )

      if (!confirmed) {
        return false
      }
    }

    // Clear cart and set new business
    dispatch({ type: 'CLEAR_CART' })
    dispatch({ type: 'SET_BUSINESS', payload: business })

    const newState = { items: [], business, loading: false, syncing: false, isOpen: false }
    await cartSyncService.saveCart(user?.id, newState)

    return true
  }, [user?.id, setBusiness])

  // Sync cart manually
  const syncCart = useCallback(async () => {
    if (!user?.id) return

    dispatch({ type: 'SET_SYNCING', payload: true })
    try {
      const cart = await cartSyncService.loadFromDatabase(user.id)
      dispatch({ type: 'SET_CART', payload: cart })
    } catch (error) {
      console.error('Error syncing cart:', error)
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false })
    }
  }, [user?.id])

  // Refresh availability
  const refreshAvailability = useCallback(async () => {
    const currentState = stateRef.current

    dispatch({ type: 'SET_SYNCING', payload: true })
    try {
      const updatedCart = await cartSyncService.refreshAvailability(currentState)
      dispatch({ type: 'SET_CART', payload: updatedCart })
      await saveCart(updatedCart)
    } catch (error) {
      console.error('Error refreshing availability:', error)
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false })
    }
  }, [saveCart])

  // Add multiple items
  const addItems = useCallback(async (items: Omit<CartItem, 'id' | 'created_at'>[]) => {
    for (const item of items) {
      await addItem(item)
    }
  }, [addItem])

  // Cart visibility
  const setCartOpen = useCallback((isOpen: boolean) => {
    dispatch({ type: 'SET_CART_OPEN', payload: isOpen })
  }, [])

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' })
  }, [])

  // Computed values
  const subtotal = state.items
    .filter(item => item.is_available)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)

  const total = subtotal + (state.business?.delivery_fee || 0)

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  const hasUnavailableItems = state.items.some(item => !item.is_available)

  const hasItems = state.items.length > 0

  const value: CartContextType = {
    state,
    addItem,
    addItems,
    updateQuantity,
    removeItem,
    clearCart,
    setBusiness,
    switchBusiness,
    setCartOpen,
    toggleCart,
    syncCart,
    refreshAvailability,
    subtotal,
    total,
    itemCount,
    hasUnavailableItems,
    hasItems
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Hook
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Re-export types
export type { CartItem, CartBusiness, CartState }
