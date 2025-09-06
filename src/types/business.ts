export type BusinessCategory = 'food' | 'retail' | 'service' | 'car_wash' | 'salon'

export type UserRole = 'owner' | 'admin' | 'staff' | 'viewer'

export interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  category: BusinessCategory
  
  // Contact Information
  email: string | null
  phone: string | null
  website: string | null
  
  // Address
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string
  
  // Business Settings
  currency: string
  timezone: string
  
  // Branding
  logo_url: string | null
  primary_color: string
  accent_color: string
  
  // Status
  is_active: boolean
  is_verified: boolean
  setup_completed: boolean
  
  // Flexible settings for different business types
  settings: BusinessSettings
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface BusinessSettings {
  // Food business settings
  food?: {
    delivery_enabled?: boolean
    pickup_enabled?: boolean
    online_ordering?: boolean
    table_service?: boolean
    locations?: BusinessLocation[]
  }
  
  // Retail business settings
  retail?: {
    inventory_tracking?: boolean
    online_store?: boolean
    pickup_enabled?: boolean
    shipping_enabled?: boolean
    return_policy?: string
  }
  
  // Service business settings  
  service?: {
    booking_enabled?: boolean
    staff_scheduling?: boolean
    appointment_duration?: number
    advance_booking_days?: number
    cancellation_policy?: string
  }
  
  // Car wash settings
  car_wash?: {
    service_types?: string[]
    booking_slots?: number
    wash_bays?: number
    loyalty_program?: boolean
  }
  
  // Salon settings
  salon?: {
    staff_services?: Record<string, string[]>
    booking_buffer?: number
    group_bookings?: boolean
    package_deals?: boolean
  }
  
  // Universal settings
  notifications?: {
    email_enabled?: boolean
    sms_enabled?: boolean
    push_enabled?: boolean
  }
  
  payment?: {
    cash_enabled?: boolean
    card_enabled?: boolean
    online_enabled?: boolean
    payment_processor?: string
  }
  
  operating_hours?: BusinessHours[]
  
  // Custom fields for extensibility
  [key: string]: any
}

export interface BusinessLocation {
  id: string
  name: string
  address: string
  phone?: string
  is_primary: boolean
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface BusinessHours {
  day_of_week: number // 0 = Sunday, 6 = Saturday
  open_time: string | null // HH:MM format
  close_time: string | null // HH:MM format
  is_closed: boolean
}

export interface BusinessUser {
  id: string
  business_id: string
  user_id: string
  role: UserRole
  permissions: BusinessPermissions
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BusinessPermissions {
  // Menu/Catalog management
  manage_menu?: boolean
  manage_inventory?: boolean
  
  // Order management
  view_orders?: boolean
  manage_orders?: boolean
  process_payments?: boolean
  
  // Staff management
  manage_staff?: boolean
  view_staff_schedule?: boolean
  
  // Customer management
  view_customers?: boolean
  manage_customers?: boolean
  
  // Analytics and reports
  view_analytics?: boolean
  export_data?: boolean
  
  // Business settings
  manage_settings?: boolean
  manage_integrations?: boolean
  
  // Service-specific permissions
  manage_appointments?: boolean
  manage_services?: boolean
  
  // Custom permissions
  [key: string]: boolean | undefined
}

// Business onboarding form data
export interface BusinessOnboardingData {
  // Basic info
  name: string
  slug: string
  category: BusinessCategory
  description?: string
  
  // Contact
  email?: string
  phone?: string
  website?: string
  
  // Address
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  
  // Branding
  logo_url?: string
  primary_color?: string
  accent_color?: string
  
  // Category-specific setup
  settings?: Partial<BusinessSettings>
}

// Business discovery/directory
export interface BusinessListing {
  id: string
  name: string
  slug: string
  description: string | null
  category: BusinessCategory
  logo_url: string | null
  primary_color: string
  city: string | null
  state: string | null
  rating?: number
  review_count?: number
  is_featured?: boolean
  distance?: number // For location-based search
}

// Business analytics data
export interface BusinessAnalytics {
  period: 'day' | 'week' | 'month' | 'year'
  revenue: number
  orders: number
  customers: number
  avg_order_value: number
  growth_rate: number
  top_items: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  customer_segments: Array<{
    segment: string
    count: number
    revenue: number
  }>
}