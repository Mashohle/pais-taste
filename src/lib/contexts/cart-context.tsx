'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'traditional' | 'combo'
  business_id: string
  menu_item_id?: string
}

// New interface for reorder items
export interface ReorderItem {
  name: string
  quantity: number
  unit_price: number
  menu_item_id?: string // Optional for menu item lookup
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  business_id: string | null
  business_name?: string
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'ADD_ITEMS'; payload: CartItem[] } // New action for bulk add
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'SET_BUSINESS'; payload: { business_id: string; business_name?: string } }
  | { type: 'CLEAR_BUSINESS' }
  | { type: 'SWITCH_BUSINESS'; payload: { business_id: string; business_name?: string; preserveItems?: boolean } }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      // Check if trying to add item from different business
      if (state.business_id && action.payload.business_id !== state.business_id) {
        throw new Error(`Cannot mix items from different businesses. Cart contains items from another business.`)
      }
      
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
      }
      
      // Set business context when adding first item
      const newState = {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      }
      
      if (!state.business_id) {
        newState.business_id = action.payload.business_id
      }
      
      return newState

    case 'ADD_ITEMS': // New case for bulk adding
      // Validate all items belong to same business
      const businessIds = [...new Set(action.payload.map(item => item.business_id))]
      if (businessIds.length > 1) {
        throw new Error('Cannot add items from multiple businesses at once.')
      }
      
      const itemBusinessId = businessIds[0]
      if (state.business_id && itemBusinessId !== state.business_id) {
        throw new Error('Cannot mix items from different businesses. Cart contains items from another business.')
      }
      
      const newItems = [...state.items]
      
      action.payload.forEach(newItem => {
        const existingIndex = newItems.findIndex(item => item.id === newItem.id)
        if (existingIndex >= 0) {
          newItems[existingIndex].quantity += newItem.quantity
        } else {
          newItems.push(newItem)
        }
      })
      
      const updatedState = {
        ...state,
        items: newItems
      }
      
      // Set business context if not set
      if (!state.business_id && action.payload.length > 0) {
        updatedState.business_id = itemBusinessId
      }
      
      return updatedState

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity === 0) {
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

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      }

    case 'CLEAR_CART':
      return { ...state, items: [], business_id: null, business_name: undefined }

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }

    case 'SET_CART_OPEN':
      return { ...state, isOpen: action.payload }

    case 'SET_BUSINESS':
      return { 
        ...state, 
        business_id: action.payload.business_id,
        business_name: action.payload.business_name
      }

    case 'CLEAR_BUSINESS':
      return { 
        ...state, 
        business_id: null, 
        business_name: undefined, 
        items: [] // Clear items when clearing business context
      }

    case 'SWITCH_BUSINESS':
      return {
        ...state,
        business_id: action.payload.business_id,
        business_name: action.payload.business_name,
        items: action.payload.preserveItems ? state.items : [] // Clear items unless preserving
      }

    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  addItems: (items: CartItem[]) => void // New function for bulk add
  addReorderItems: (items: ReorderItem[], businessId: string) => void // New function for reorder
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  setBusiness: (businessId: string, businessName?: string) => void
  clearBusiness: () => void
  switchBusiness: (businessId: string, businessName?: string, options?: { preserveItems?: boolean; confirmSwitch?: boolean }) => Promise<boolean>
  validateBusinessCompatibility: (businessId: string) => boolean
  getBusinessContext: () => { business_id: string | null; business_name?: string }
  getTotalItems: () => number
  getTotalPrice: () => number
  hasItemsFromDifferentBusiness: (businessId: string) => boolean
} | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    business_id: null,
    business_name: undefined
  })

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    try {
      dispatch({ type: 'ADD_ITEM', payload: item })
    } catch (error) {
      throw error
    }
  }

  const addItems = (items: CartItem[]) => {
    try {
      dispatch({ type: 'ADD_ITEMS', payload: items })
    } catch (error) {
      throw error
    }
  }

  // New function to handle reorder items
  const addReorderItems = (reorderItems: ReorderItem[], businessId: string) => {
    const cartItems: CartItem[] = reorderItems.map((item, index) => ({
      id: item.menu_item_id || `reorder-${Date.now()}-${index}`, // Generate ID if not available
      name: item.name,
      price: item.unit_price,
      quantity: item.quantity,
      type: 'traditional' as const, // Default type, you might want to make this dynamic
      business_id: businessId,
      menu_item_id: item.menu_item_id
    }))
    
    try {
      dispatch({ type: 'ADD_ITEMS', payload: cartItems })
    } catch (error) {
      throw error
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const setCartOpen = (open: boolean) => {
    dispatch({ type: 'SET_CART_OPEN', payload: open })
  }

  const setBusiness = (businessId: string, businessName?: string) => {
    dispatch({ type: 'SET_BUSINESS', payload: { business_id: businessId, business_name: businessName } })
  }

  const clearBusiness = () => {
    dispatch({ type: 'CLEAR_BUSINESS' })
  }

  const switchBusiness = async (
    businessId: string, 
    businessName?: string, 
    options: { preserveItems?: boolean; confirmSwitch?: boolean } = {}
  ): Promise<boolean> => {
    // If no current business or same business, just set it
    if (!state.business_id || state.business_id === businessId) {
      dispatch({ type: 'SET_BUSINESS', payload: { business_id: businessId, business_name: businessName } })
      return true
    }

    // If cart is empty, switch freely
    if (state.items.length === 0) {
      dispatch({ type: 'SWITCH_BUSINESS', payload: { business_id: businessId, business_name: businessName } })
      return true
    }

    // If has items and confirmSwitch is requested, ask user
    if (options.confirmSwitch && typeof window !== 'undefined') {
      const currentBusinessName = state.business_name || 'current business'
      const newBusinessName = businessName || 'selected business'
      const confirmed = window.confirm(
        `You have items from ${currentBusinessName} in your cart. Switching to ${newBusinessName} will clear your current cart. Continue?`
      )
      
      if (!confirmed) {
        return false
      }
    }

    // Switch business (clear items unless preserveItems is true)
    dispatch({ 
      type: 'SWITCH_BUSINESS', 
      payload: { 
        business_id: businessId, 
        business_name: businessName,
        preserveItems: options.preserveItems 
      } 
    })
    
    return true
  }

  const validateBusinessCompatibility = (businessId: string): boolean => {
    return !state.business_id || state.business_id === businessId
  }

  const hasItemsFromDifferentBusiness = (businessId: string): boolean => {
    return state.items.length > 0 && state.business_id !== null && state.business_id !== businessId
  }

  const getBusinessContext = () => ({
    business_id: state.business_id,
    business_name: state.business_name
  })

  // Helper functions
  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      addItems,
      addReorderItems,
      updateQuantity,
      removeItem,
      clearCart,
      toggleCart,
      setCartOpen,
      setBusiness,
      clearBusiness,
      switchBusiness,
      validateBusinessCompatibility,
      getBusinessContext,
      getTotalItems,
      getTotalPrice,
      hasItemsFromDifferentBusiness
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}