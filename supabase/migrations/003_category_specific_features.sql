-- Phase 2: Category-Specific Features Migration
-- This migration adds tables and functionality for different business categories

-- ============================================================================
-- CONFIGURABLE STATUS TABLES
-- ============================================================================

-- Booking/Service statuses (configurable per business)
CREATE TABLE IF NOT EXISTS booking_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE, -- NULL for system defaults
  code VARCHAR(50) NOT NULL, -- e.g., 'scheduled', 'confirmed'
  name VARCHAR(100) NOT NULL, -- e.g., 'Scheduled', 'Confirmed'
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280', -- Status color for UI
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- Default status for new bookings
  is_final BOOLEAN DEFAULT false, -- Final states (completed, cancelled, etc.)
  sort_order INTEGER DEFAULT 0,
  
  -- Workflow rules
  can_transition_to VARCHAR(50)[], -- Array of status codes this can transition to
  requires_staff_action BOOLEAN DEFAULT false,
  requires_customer_confirmation BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, code)
);

-- Payment statuses (configurable per business)
CREATE TABLE IF NOT EXISTS payment_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE, -- NULL for system defaults
  code VARCHAR(50) NOT NULL, -- e.g., 'pending', 'paid'
  name VARCHAR(100) NOT NULL, -- e.g., 'Pending', 'Paid'
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Payment specific
  requires_action BOOLEAN DEFAULT false, -- Requires manual action
  is_paid_status BOOLEAN DEFAULT false, -- Indicates payment is complete
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, code)
);

-- Insert default booking statuses (system-wide defaults)
INSERT INTO booking_statuses (business_id, code, name, description, color, is_default, is_final, sort_order, can_transition_to) VALUES
(NULL, 'scheduled', 'Scheduled', 'Appointment has been scheduled', '#3B82F6', true, false, 1, ARRAY['confirmed', 'cancelled', 'no_show']),
(NULL, 'confirmed', 'Confirmed', 'Appointment confirmed by customer', '#10B981', false, false, 2, ARRAY['in_progress', 'cancelled', 'no_show']),
(NULL, 'in_progress', 'In Progress', 'Service is currently being performed', '#F59E0B', false, false, 3, ARRAY['completed', 'cancelled']),
(NULL, 'completed', 'Completed', 'Service has been completed', '#059669', false, true, 4, ARRAY[]::VARCHAR[]),
(NULL, 'cancelled', 'Cancelled', 'Appointment was cancelled', '#EF4444', false, true, 5, ARRAY[]::VARCHAR[]),
(NULL, 'no_show', 'No Show', 'Customer did not show up', '#6B7280', false, true, 6, ARRAY[]::VARCHAR[])
ON CONFLICT (business_id, code) DO NOTHING;

-- Insert default payment statuses (system-wide defaults)
INSERT INTO payment_statuses (business_id, code, name, description, color, is_default, is_paid_status, sort_order) VALUES
(NULL, 'pending', 'Pending', 'Payment is pending', '#F59E0B', true, false, 1),
(NULL, 'deposit_paid', 'Deposit Paid', 'Deposit has been paid', '#3B82F6', false, false, 2),
(NULL, 'paid', 'Paid', 'Payment completed', '#10B981', false, true, 3),
(NULL, 'refunded', 'Refunded', 'Payment has been refunded', '#6B7280', false, false, 4),
(NULL, 'failed', 'Failed', 'Payment failed', '#EF4444', false, false, 5)
ON CONFLICT (business_id, code) DO NOTHING;

-- Order statuses (for existing orders - making them configurable too)
CREATE TABLE IF NOT EXISTS order_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE, -- NULL for system defaults
  code VARCHAR(50) NOT NULL, -- e.g., 'received', 'preparing'
  name VARCHAR(100) NOT NULL, -- e.g., 'Received', 'Preparing'
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  is_final BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Workflow rules
  can_transition_to VARCHAR(50)[],
  requires_staff_action BOOLEAN DEFAULT false,
  requires_customer_notification BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, code)
);

-- Insert default order statuses
INSERT INTO order_statuses (business_id, code, name, description, color, is_default, is_final, sort_order, can_transition_to) VALUES
(NULL, 'received', 'Received', 'Order has been received', '#3B82F6', true, false, 1, ARRAY['preparing', 'cancelled']),
(NULL, 'preparing', 'Preparing', 'Order is being prepared', '#F59E0B', false, false, 2, ARRAY['ready', 'cancelled']),
(NULL, 'ready', 'Ready', 'Order is ready for pickup/delivery', '#10B981', false, false, 3, ARRAY['collected', 'completed']),
(NULL, 'collected', 'Collected', 'Order has been collected', '#059669', false, true, 4, ARRAY[]::VARCHAR[]),
(NULL, 'completed', 'Completed', 'Order has been completed', '#059669', false, true, 5, ARRAY[]::VARCHAR[]),
(NULL, 'cancelled', 'Cancelled', 'Order was cancelled', '#EF4444', false, true, 6, ARRAY[]::VARCHAR[])
ON CONFLICT (business_id, code) DO NOTHING;

-- ============================================================================
-- RETAIL MODULE: Product catalog with variants and inventory
-- ============================================================================

-- Product categories for retail businesses
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (extends menu_items for retail)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE, -- Link to existing menu_items
  category_id UUID REFERENCES product_categories(id),
  sku VARCHAR(100),
  brand VARCHAR(255),
  weight DECIMAL(10,2),
  dimensions JSONB, -- {length, width, height, unit}
  
  -- Inventory
  track_inventory BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT false,
  
  -- Pricing
  cost_price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2), -- Original price for discounts
  
  -- SEO and metadata
  meta_title VARCHAR(255),
  meta_description TEXT,
  tags TEXT[],
  
  -- Status
  is_featured BOOLEAN DEFAULT false,
  requires_shipping BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants (sizes, colors, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "Large Red", "Size M"
  sku VARCHAR(100),
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  
  -- Inventory per variant
  stock_quantity INTEGER DEFAULT 0,
  
  -- Variant attributes
  attributes JSONB, -- {color: "red", size: "large"}
  
  -- Images specific to variant
  image_urls TEXT[],
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SERVICE MODULE: Appointment booking and staff management
-- ============================================================================

-- Staff members for service businesses
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- Optional: link to actual user account
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(100), -- e.g., "Stylist", "Mechanic", "Consultant"
  bio TEXT,
  avatar_url TEXT,
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  hire_date DATE,
  
  -- Settings
  color VARCHAR(7) DEFAULT '#0066CC', -- Calendar color
  booking_buffer INTEGER DEFAULT 15, -- Minutes between appointments
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services offered (extends menu_items for service businesses)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE, -- Link to existing menu_items
  
  -- Service specifics
  duration INTEGER NOT NULL, -- Duration in minutes
  buffer_time INTEGER DEFAULT 0, -- Buffer after service
  max_advance_booking INTEGER DEFAULT 30, -- Days in advance
  min_advance_booking INTEGER DEFAULT 0, -- Minimum hours in advance
  
  -- Booking settings
  requires_deposit BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(10,2),
  cancellation_hours INTEGER DEFAULT 24, -- Hours before cancellation allowed
  
  -- Staff assignment
  staff_required INTEGER DEFAULT 1,
  specific_staff_ids UUID[], -- If service requires specific staff
  
  -- Service attributes
  is_group_service BOOLEAN DEFAULT false,
  max_group_size INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service bookings/appointments (now with configurable statuses)
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id),
  customer_id UUID REFERENCES auth.users(id),
  
  -- Customer info (for guest bookings)
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20) NOT NULL,
  
  -- Booking details
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER NOT NULL, -- Actual duration in minutes
  
  -- Pricing
  service_price DECIMAL(10,2) NOT NULL,
  deposit_paid DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Configurable statuses (references to status tables)
  booking_status_code VARCHAR(50) DEFAULT 'scheduled',
  payment_status_code VARCHAR(50) DEFAULT 'pending',
  
  -- Additional info
  notes TEXT,
  special_requests TEXT,
  internal_notes TEXT, -- Staff only
  
  -- Completion details
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_photos TEXT[], -- For services that require photo proof
  completion_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff availability schedule
CREATE TABLE IF NOT EXISTS staff_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  
  -- Break times
  break_times JSONB DEFAULT '[]', -- Array of {start_time, end_time}
  
  UNIQUE(staff_id, day_of_week)
);

-- Staff time off / exceptions
CREATE TABLE IF NOT EXISTS staff_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME, -- For partial day off
  end_time TIME,   -- For partial day off
  reason VARCHAR(255),
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- UNIVERSAL FEATURES: Reviews, Analytics, etc.
-- ============================================================================

-- Customer reviews for all business types
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id), -- For order-based reviews
  booking_id UUID REFERENCES service_bookings(id), -- For service-based reviews
  
  -- Customer info (for guest reviews)
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  
  -- Review details
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  
  -- Review metadata
  is_verified BOOLEAN DEFAULT false, -- Verified purchase/booking
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  
  -- Business response
  response_text TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business locations (for multi-location businesses)
CREATE TABLE IF NOT EXISTS business_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  
  -- Contact
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Coordinates for mapping
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Settings
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Location-specific settings
  settings JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- UPDATE EXISTING ORDERS TABLE TO USE CONFIGURABLE STATUSES
-- ============================================================================

-- Add new status columns to orders table (keeping old ones for migration)
DO $$
BEGIN
  -- Add new status code columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_status_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_status_code VARCHAR(50) DEFAULT 'received';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_status_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status_code VARCHAR(50) DEFAULT 'pending';
  END IF;
  
  -- Migrate existing data
  UPDATE orders SET order_status_code = order_status WHERE order_status_code IS NULL OR order_status_code = '';
  UPDATE orders SET payment_status_code = payment_status WHERE payment_status_code IS NULL OR payment_status_code = '';
END $$;

-- ============================================================================
-- INDEXES AND CONSTRAINTS
-- ============================================================================

-- Status table indexes
CREATE INDEX IF NOT EXISTS idx_booking_statuses_business_id ON booking_statuses(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_statuses_business_id ON payment_statuses(business_id);
CREATE INDEX IF NOT EXISTS idx_order_statuses_business_id ON order_statuses(business_id);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_business_id ON product_categories(business_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- Service indexes
CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_business_id ON service_bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_date ON service_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_service_bookings_staff_id ON service_bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_business_id ON staff_members(business_id);

-- Universal indexes
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_business_locations_business_id ON business_locations(business_id);

-- Add updated_at triggers for new tables
DO $$
BEGIN
  -- Status tables
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_booking_statuses_updated_at') THEN
    CREATE TRIGGER update_booking_statuses_updated_at 
    BEFORE UPDATE ON booking_statuses FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payment_statuses_updated_at') THEN
    CREATE TRIGGER update_payment_statuses_updated_at 
    BEFORE UPDATE ON payment_statuses FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_order_statuses_updated_at') THEN
    CREATE TRIGGER update_order_statuses_updated_at 
    BEFORE UPDATE ON order_statuses FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Products
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_categories_updated_at') THEN
    CREATE TRIGGER update_product_categories_updated_at 
    BEFORE UPDATE ON product_categories FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_variants_updated_at') THEN
    CREATE TRIGGER update_product_variants_updated_at 
    BEFORE UPDATE ON product_variants FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Staff members
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_staff_members_updated_at') THEN
    CREATE TRIGGER update_staff_members_updated_at 
    BEFORE UPDATE ON staff_members FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Services
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_services_updated_at') THEN
    CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Service bookings
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_service_bookings_updated_at') THEN
    CREATE TRIGGER update_service_bookings_updated_at 
    BEFORE UPDATE ON service_bookings FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Staff time off
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_staff_time_off_updated_at') THEN
    CREATE TRIGGER update_staff_time_off_updated_at 
    BEFORE UPDATE ON staff_time_off FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Reviews
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reviews_updated_at') THEN
    CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Business locations
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_business_locations_updated_at') THEN
    CREATE TRIGGER update_business_locations_updated_at 
    BEFORE UPDATE ON business_locations FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;