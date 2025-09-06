// TypeScript types for Phase 2: Category-Specific Features

// ============================================================================
// CONFIGURABLE STATUS TYPES
// ============================================================================

export interface BookingStatus {
  id: string
  business_id: string | null
  code: string
  name: string
  description: string | null
  color: string
  is_active: boolean
  is_default: boolean
  is_final: boolean
  sort_order: number
  can_transition_to: string[]
  requires_staff_action: boolean
  requires_customer_confirmation: boolean
  created_at: string
  updated_at: string
}

export interface PaymentStatus {
  id: string
  business_id: string | null
  code: string
  name: string
  description: string | null
  color: string
  is_active: boolean
  is_default: boolean
  sort_order: number
  requires_action: boolean
  is_paid_status: boolean
  created_at: string
  updated_at: string
}

export interface OrderStatus {
  id: string
  business_id: string | null
  code: string
  name: string
  description: string | null
  color: string
  is_active: boolean
  is_default: boolean
  is_final: boolean
  sort_order: number
  can_transition_to: string[]
  requires_staff_action: boolean
  requires_customer_notification: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// RETAIL/PRODUCT TYPES
// ============================================================================

export interface ProductCategory {
  id: string
  business_id: string
  name: string
  description: string | null
  parent_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  
  // Nested categories
  children?: ProductCategory[]
  parent?: ProductCategory
}

export interface Product {
  id: string
  business_id: string
  menu_item_id: string | null
  category_id: string | null
  sku: string | null
  brand: string | null
  weight: number | null
  dimensions: {
    length?: number
    width?: number
    height?: number
    unit?: string
  } | null
  
  // Inventory
  track_inventory: boolean
  stock_quantity: number
  low_stock_threshold: number
  allow_backorder: boolean
  
  // Pricing
  cost_price: number | null
  compare_at_price: number | null
  
  // SEO and metadata
  meta_title: string | null
  meta_description: string | null
  tags: string[]
  
  // Status
  is_featured: boolean
  requires_shipping: boolean
  
  created_at: string
  updated_at: string
  
  // Relations
  menu_item?: Record<string, unknown> // From menu_items table
  category?: ProductCategory
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string | null
  price: number | null
  compare_at_price: number | null
  cost_price: number | null
  stock_quantity: number
  attributes: Record<string, unknown>
  image_urls: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// SERVICE/BOOKING TYPES
// ============================================================================

export interface StaffMember {
  id: string
  business_id: string
  user_id: string | null
  name: string
  email: string | null
  phone: string | null
  role: string | null
  bio: string | null
  avatar_url: string | null
  is_active: boolean
  hire_date: string | null
  color: string
  booking_buffer: number
  created_at: string
  updated_at: string
  
  // Relations
  availability?: StaffAvailability[]
  time_off?: StaffTimeOff[]
}

export interface Service {
  id: string
  business_id: string
  menu_item_id: string | null
  duration: number
  buffer_time: number
  max_advance_booking: number
  min_advance_booking: number
  requires_deposit: boolean
  deposit_amount: number | null
  cancellation_hours: number
  staff_required: number
  specific_staff_ids: string[]
  is_group_service: boolean
  max_group_size: number
  created_at: string
  updated_at: string
  
  // Relations
  menu_item?: Record<string, unknown> // From menu_items table
  staff?: StaffMember[]
}

export interface ServiceBooking {
  id: string
  business_id: string
  service_id: string
  staff_id: string | null
  customer_id: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string
  booking_date: string
  start_time: string
  end_time: string
  duration: number
  service_price: number
  deposit_paid: number
  total_amount: number
  booking_status_code: string
  payment_status_code: string
  notes: string | null
  special_requests: string | null
  internal_notes: string | null
  completed_at: string | null
  completion_photos: string[]
  completion_notes: string | null
  created_at: string
  updated_at: string
  
  // Relations
  service?: Service
  staff?: StaffMember
  booking_status?: BookingStatus
  payment_status?: PaymentStatus
}

export interface StaffAvailability {
  id: string
  staff_id: string
  day_of_week: number
  start_time: string | null
  end_time: string | null
  is_available: boolean
  break_times: Array<{
    start_time: string
    end_time: string
  }>
}

export interface StaffTimeOff {
  id: string
  staff_id: string
  start_date: string
  end_date: string
  start_time: string | null
  end_time: string | null
  reason: string | null
  is_approved: boolean
  approved_by: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// UNIVERSAL FEATURE TYPES
// ============================================================================

export interface Review {
  id: string
  business_id: string
  customer_id: string | null
  order_id: string | null
  booking_id: string | null
  customer_name: string
  customer_email: string | null
  rating: number
  title: string | null
  review_text: string | null
  is_verified: boolean
  is_featured: boolean
  is_public: boolean
  response_text: string | null
  response_date: string | null
  responded_by: string | null
  created_at: string
  updated_at: string
  
  // Relations
  order?: Record<string, unknown> // From orders table
  booking?: ServiceBooking
}

export interface BusinessLocation {
  id: string
  business_id: string
  name: string
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  phone: string | null
  email: string | null
  latitude: number | null
  longitude: number | null
  is_primary: boolean
  is_active: boolean
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================================
// BUSINESS CATEGORY SPECIFIC SETTINGS
// ============================================================================

export interface FoodBusinessSettings {
  delivery_enabled?: boolean
  pickup_enabled?: boolean
  online_ordering?: boolean
  table_service?: boolean
  locations?: string[] // BusinessLocation IDs
  kitchen_display?: boolean
  order_numbering?: string // 'sequential' | 'random'
  prep_time_buffer?: number // minutes
}

export interface RetailBusinessSettings {
  inventory_tracking?: boolean
  online_store?: boolean
  pickup_enabled?: boolean
  shipping_enabled?: boolean
  return_policy?: string
  low_stock_notifications?: boolean
  barcode_scanning?: boolean
  multi_location_inventory?: boolean
}

export interface ServiceBusinessSettings {
  booking_enabled?: boolean
  staff_scheduling?: boolean
  appointment_duration?: number // default duration in minutes
  advance_booking_days?: number
  cancellation_policy?: string
  deposit_required?: boolean
  group_bookings?: boolean
  online_booking?: boolean
  calendar_sync?: boolean
  reminder_notifications?: boolean
}

export interface CarWashSettings {
  service_types?: string[]
  booking_slots?: number
  wash_bays?: number
  loyalty_program?: boolean
  membership_plans?: boolean
  vehicle_size_pricing?: boolean
  queue_management?: boolean
}

export interface SalonSettings {
  staff_services?: Record<string, string[]> // staff_id -> service_ids
  booking_buffer?: number
  group_bookings?: boolean
  package_deals?: boolean
  commission_tracking?: boolean
  product_sales?: boolean
  membership_programs?: boolean
}

// Combined settings type
export type BusinessCategorySettings = {
  food?: FoodBusinessSettings
  retail?: RetailBusinessSettings
  service?: ServiceBusinessSettings
  car_wash?: CarWashSettings
  salon?: SalonSettings
}

// ============================================================================
// FORM/INPUT TYPES
// ============================================================================

export interface CreateProductData {
  name: string
  description?: string
  price: number
  category_id?: string
  sku?: string
  brand?: string
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit?: string
  }
  track_inventory?: boolean
  stock_quantity?: number
  low_stock_threshold?: number
  cost_price?: number
  compare_at_price?: number
  tags?: string[]
  is_featured?: boolean
  requires_shipping?: boolean
}

export interface CreateServiceData {
  name: string
  description?: string
  price: number
  duration: number
  buffer_time?: number
  max_advance_booking?: number
  min_advance_booking?: number
  requires_deposit?: boolean
  deposit_amount?: number
  cancellation_hours?: number
  staff_required?: number
  specific_staff_ids?: string[]
  is_group_service?: boolean
  max_group_size?: number
}

export interface CreateBookingData {
  service_id: string
  staff_id?: string
  customer_name: string
  customer_email?: string
  customer_phone: string
  booking_date: string
  start_time: string
  notes?: string
  special_requests?: string
}

export interface CreateReviewData {
  rating: number
  title?: string
  review_text?: string
  customer_name?: string
  customer_email?: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface BusinessAnalytics {
  period: 'day' | 'week' | 'month' | 'year'
  revenue: number
  orders: number
  bookings?: number
  customers: number
  avg_order_value: number
  growth_rate: number
  
  // Category-specific metrics
  top_products?: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  
  top_services?: Array<{
    name: string
    bookings: number
    revenue: number
  }>
  
  staff_performance?: Array<{
    staff_name: string
    bookings: number
    revenue: number
    rating: number
  }>
  
  customer_segments?: Array<{
    segment: string
    count: number
    revenue: number
  }>
  
  inventory_alerts?: Array<{
    product_name: string
    current_stock: number
    threshold: number
  }>
}

export interface BookingAvailability {
  date: string
  slots: Array<{
    time: string
    available: boolean
    staff_id?: string
    staff_name?: string
  }>
}