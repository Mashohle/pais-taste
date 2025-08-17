'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'traditional' | 'combo'
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
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'ADD_ITEMS'; payload: CartItem[] } // New action for bulk add
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
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
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      }

    case 'ADD_ITEMS': // New case for bulk adding
      const newItems = [...state.items]
      
      action.payload.forEach(newItem => {
        const existingIndex = newItems.findIndex(item => item.id === newItem.id)
        if (existingIndex >= 0) {
          newItems[existingIndex].quantity += newItem.quantity
        } else {
          newItems.push(newItem)
        }
      })
      
      return {
        ...state,
        items: newItems
      }

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
      return { ...state, items: [] }

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }

    case 'SET_CART_OPEN':
      return { ...state, isOpen: action.payload }

    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  addItems: (items: CartItem[]) => void // New function for bulk add
  addReorderItems: (items: ReorderItem[]) => void // New function for reorder
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  getTotalItems: () => number
  getTotalPrice: () => number
} | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false
  })

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const addItems = (items: CartItem[]) => {
    dispatch({ type: 'ADD_ITEMS', payload: items })
  }

  // New function to handle reorder items
  const addReorderItems = (reorderItems: ReorderItem[]) => {
    const cartItems: CartItem[] = reorderItems.map((item, index) => ({
      id: item.menu_item_id || `reorder-${Date.now()}-${index}`, // Generate ID if not available
      name: item.name,
      price: item.unit_price,
      quantity: item.quantity,
      type: 'traditional' as const // Default type, you might want to make this dynamic
    }))
    
    dispatch({ type: 'ADD_ITEMS', payload: cartItems })
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
      getTotalItems,
      getTotalPrice
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