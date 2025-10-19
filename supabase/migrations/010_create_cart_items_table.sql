-- Migration: Create cart_items table for persistent cart storage
-- This enables logged-in users to have their cart saved across devices and sessions

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Universal fields for all business types
  item_type TEXT NOT NULL CHECK (item_type IN ('menu_item', 'product', 'service')),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),

  -- Type-specific IDs (only one will be set based on item_type)
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  product_id UUID, -- References products(id) when products table exists
  service_id UUID, -- References services(id) when services table exists

  -- Service booking details (stored as JSONB for flexibility)
  -- Example: { "date": "2025-01-20", "time": "14:00", "duration": 60, "staff_id": "uuid" }
  booking_details JSONB,

  -- Customization options (stored as JSONB for flexibility)
  -- Example: { "size": "large", "extras": ["cheese", "bacon"], "spice_level": "mild" }
  options JSONB,

  -- Additional notes from customer
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  -- Ensure each user can only have one entry per unique item configuration
  UNIQUE(user_id, business_id, menu_item_id, product_id, service_id, options),

  -- Validate that the correct ID is set based on item_type
  CHECK (
    (item_type = 'menu_item' AND menu_item_id IS NOT NULL AND product_id IS NULL AND service_id IS NULL) OR
    (item_type = 'product' AND product_id IS NOT NULL AND menu_item_id IS NULL AND service_id IS NULL) OR
    (item_type = 'service' AND service_id IS NOT NULL AND menu_item_id IS NULL AND product_id IS NULL)
  )
);

-- Create indexes for better query performance (IF NOT EXISTS for idempotency)
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_business_id ON cart_items(business_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_business ON cart_items(user_id, business_id);

-- Create updated_at trigger (DROP first if exists to avoid errors)
DROP TRIGGER IF EXISTS set_cart_items_updated_at ON cart_items;
CREATE TRIGGER set_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check if a cart item is still available
CREATE OR REPLACE FUNCTION check_cart_item_availability(cart_item_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  item RECORD;
  is_available BOOLEAN := FALSE;
BEGIN
  -- Get the cart item
  SELECT * INTO item FROM cart_items WHERE id = cart_item_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check availability based on item type
  CASE item.item_type
    WHEN 'menu_item' THEN
      -- Check if menu item exists and is available
      SELECT (m.available AND m.published) INTO is_available
      FROM menu_items m
      WHERE m.id = item.menu_item_id;

    WHEN 'product' THEN
      -- Check if product exists and is in stock
      -- TODO: Implement when products table is created
      -- SELECT (p.in_stock AND p.published) INTO is_available
      -- FROM products p
      -- WHERE p.id = item.product_id;
      is_available := TRUE; -- Default to true until products table exists

    WHEN 'service' THEN
      -- Check if service exists and is active
      -- TODO: Implement when services table is created
      -- SELECT s.is_active INTO is_available
      -- FROM services s
      -- WHERE s.id = item.service_id;
      is_available := TRUE; -- Default to true until services table exists
  END CASE;

  RETURN COALESCE(is_available, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cart with availability info
CREATE OR REPLACE FUNCTION get_cart_with_availability(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  business_id UUID,
  item_type TEXT,
  name TEXT,
  description TEXT,
  price DECIMAL(10,2),
  quantity INTEGER,
  menu_item_id UUID,
  product_id UUID,
  service_id UUID,
  booking_details JSONB,
  options JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.id,
    ci.business_id,
    ci.item_type,
    ci.name,
    ci.description,
    ci.price,
    ci.quantity,
    ci.menu_item_id,
    ci.product_id,
    ci.service_id,
    ci.booking_details,
    ci.options,
    ci.notes,
    ci.created_at,
    check_cart_item_availability(ci.id) as is_available
  FROM cart_items ci
  WHERE ci.user_id = p_user_id
  ORDER BY ci.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;

-- Users can only see their own cart items
CREATE POLICY "Users can view their own cart items"
  ON cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own cart items
CREATE POLICY "Users can insert their own cart items"
  ON cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update their own cart items"
  ON cart_items
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete their own cart items"
  ON cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comment on table
COMMENT ON TABLE cart_items IS 'Stores shopping cart items for logged-in users. Supports food orders, retail products, and service bookings with flexible JSONB fields for customization.';

-- Comments on columns
COMMENT ON COLUMN cart_items.item_type IS 'Type of item: menu_item (food), product (retail), or service (bookings)';
COMMENT ON COLUMN cart_items.booking_details IS 'For services: stores date, time, duration, and staff preferences as JSON';
COMMENT ON COLUMN cart_items.options IS 'Customization options like size, extras, spice level, etc. stored as JSON';
COMMENT ON COLUMN cart_items.notes IS 'Customer notes or special instructions for this item';
