// lib/types.ts

export interface OrderItem {
  quantity: number
  unit_price: number
  menu_items: {
    name: string
    description?: string
  } | null
}

export interface Order {
  id: string
  user_id: string
  customer_name: string
  customer_phone: string
  total_amount: number
  order_status: 'received' | 'preparing' | 'ready' | 'collected' | 'completed'
  payment_status: 'pending' | 'paid'
  payment_method: 'online' | 'cash_on_pickup'
  pickup_location: string
  special_instructions: string | null
  created_at: string
  updated_at?: string
  order_items: OrderItem[]
}

export interface ReorderItem {
  name: string
  quantity: number
  unit_price: number
  menu_item_id?: string
}