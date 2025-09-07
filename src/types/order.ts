// lib/types.ts

export interface OrderItem {
  quantity: number
  unit_price: number
  menu_item_id?: string
  with_combo?: boolean
  menu_items: {
    name: string
    description?: string
    business_id?: string
  } | null
}

// Multi-tenant order with configurable statuses
export interface Order {
  id: string
  user_id: string
  business_id: string // Required for multi-tenant
  customer_name: string
  customer_phone: string
  total_amount: number
  
  // Legacy status fields (kept for backward compatibility)
  order_status: string
  payment_status: string
  
  // New configurable status system
  order_status_code?: string
  payment_status_code?: string
  
  payment_method: 'online' | 'cash_on_pickup'
  pickup_location: string
  special_instructions: string | null
  created_at: string
  updated_at?: string
  order_items: OrderItem[]
  
  // Business relationship for populated queries
  businesses?: {
    id: string
    name: string
    business_categories?: {
      name: string
    }
  }
}

export interface ReorderItem {
  name: string
  quantity: number
  unit_price: number
  menu_item_id?: string
  business_id: string // Required for multi-tenant
}

// Status configuration types
export interface OrderStatus {
  id: string
  business_id: string | null
  code: string
  name: string
  description?: string
  color: string
  is_active: boolean
  is_default: boolean
  is_final: boolean
  sort_order: number
  can_transition_to: string[]
  requires_staff_action: boolean
  requires_customer_notification: boolean
}

export interface PaymentStatus {
  id: string
  business_id: string | null
  code: string
  name: string
  description?: string
  color: string
  is_active: boolean
  is_default: boolean
  sort_order: number
  requires_action: boolean
  is_paid_status: boolean
}

// Business category types for order handling
export type BusinessCategory = 'food' | 'retail' | 'service'

export interface OrderValidation {
  isValidTransition: boolean
  allowedMethods: ('online' | 'cash_on_pickup')[]
  defaultStatus: string
  businessType: BusinessCategory
}