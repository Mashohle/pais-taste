-- Phase 2: Row Level Security Policies for Category-Specific Features
-- This migration adds RLS policies for all the new category-specific tables

-- ============================================================================
-- ENABLE RLS ON ALL NEW TABLES
-- ============================================================================

ALTER TABLE booking_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_locations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STATUS TABLES POLICIES (System defaults + business overrides)
-- ============================================================================

-- Booking statuses policies
CREATE POLICY "Public can view system default booking statuses" ON booking_statuses
FOR SELECT USING (business_id IS NULL AND is_active = true);

CREATE POLICY "Business staff can view their booking statuses" ON booking_statuses
FOR SELECT USING (
  business_id IS NULL -- System defaults
  OR can_access_business(business_id, auth.uid())
);

CREATE POLICY "Business admins can manage their booking statuses" ON booking_statuses
FOR ALL USING (
  business_id IS NOT NULL 
  AND can_access_business(business_id, auth.uid())
  AND auth.uid() IN (
    SELECT user_id FROM business_users 
    WHERE business_id = booking_statuses.business_id 
    AND role IN ('owner', 'admin')
    AND is_active = true
  )
);

-- Payment statuses policies
CREATE POLICY "Public can view system default payment statuses" ON payment_statuses
FOR SELECT USING (business_id IS NULL AND is_active = true);

CREATE POLICY "Business staff can view their payment statuses" ON payment_statuses
FOR SELECT USING (
  business_id IS NULL -- System defaults
  OR can_access_business(business_id, auth.uid())
);

CREATE POLICY "Business admins can manage their payment statuses" ON payment_statuses
FOR ALL USING (
  business_id IS NOT NULL 
  AND can_access_business(business_id, auth.uid())
  AND auth.uid() IN (
    SELECT user_id FROM business_users 
    WHERE business_id = payment_statuses.business_id 
    AND role IN ('owner', 'admin')
    AND is_active = true
  )
);

-- Order statuses policies
CREATE POLICY "Public can view system default order statuses" ON order_statuses
FOR SELECT USING (business_id IS NULL AND is_active = true);

CREATE POLICY "Business staff can view their order statuses" ON order_statuses
FOR SELECT USING (
  business_id IS NULL -- System defaults
  OR can_access_business(business_id, auth.uid())
);

CREATE POLICY "Business admins can manage their order statuses" ON order_statuses
FOR ALL USING (
  business_id IS NOT NULL 
  AND can_access_business(business_id, auth.uid())
  AND auth.uid() IN (
    SELECT user_id FROM business_users 
    WHERE business_id = order_statuses.business_id 
    AND role IN ('owner', 'admin')
    AND is_active = true
  )
);

-- ============================================================================
-- PRODUCT/RETAIL POLICIES
-- ============================================================================

-- Product categories policies
CREATE POLICY "Public can view active product categories" ON product_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Business staff can manage product categories" ON product_categories
FOR ALL USING (can_access_business(business_id, auth.uid()));

-- Products policies
CREATE POLICY "Public can view published products" ON products
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM menu_items 
    WHERE menu_items.id = products.menu_item_id 
    AND menu_items.published = true
  )
  OR can_access_business(business_id, auth.uid())
);

CREATE POLICY "Business staff can manage products" ON products
FOR ALL USING (can_access_business(business_id, auth.uid()));

-- Product variants policies
CREATE POLICY "Public can view variants of published products" ON product_variants
FOR SELECT USING (
  is_active = true
  AND EXISTS(
    SELECT 1 FROM products p
    JOIN menu_items mi ON p.menu_item_id = mi.id
    WHERE p.id = product_variants.product_id 
    AND mi.published = true
  )
  OR EXISTS(
    SELECT 1 FROM products p
    WHERE p.id = product_variants.product_id 
    AND can_access_business(p.business_id, auth.uid())
  )
);

CREATE POLICY "Business staff can manage product variants" ON product_variants
FOR ALL USING (
  EXISTS(
    SELECT 1 FROM products 
    WHERE products.id = product_variants.product_id 
    AND can_access_business(products.business_id, auth.uid())
  )
);

-- ============================================================================
-- SERVICE/BOOKING POLICIES
-- ============================================================================

-- Staff members policies
CREATE POLICY "Public can view active staff for booking" ON staff_members
FOR SELECT USING (is_active = true);

CREATE POLICY "Business staff can manage staff members" ON staff_members
FOR ALL USING (can_access_business(business_id, auth.uid()));

-- Services policies
CREATE POLICY "Public can view published services" ON services
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM menu_items 
    WHERE menu_items.id = services.menu_item_id 
    AND menu_items.published = true
  )
  OR can_access_business(business_id, auth.uid())
);

CREATE POLICY "Business staff can manage services" ON services
FOR ALL USING (can_access_business(business_id, auth.uid()));

-- Service bookings policies
CREATE POLICY "Customers can view their own bookings" ON service_bookings
FOR SELECT USING (
  customer_id = auth.uid() -- Customer can see own bookings
  OR can_access_business(business_id, auth.uid()) -- Business staff can see business bookings
);

CREATE POLICY "Customers can create bookings" ON service_bookings
FOR INSERT WITH CHECK (
  customer_id = auth.uid() OR customer_id IS NULL -- Allow guest bookings
);

CREATE POLICY "Customers can update their own bookings" ON service_bookings
FOR UPDATE USING (
  customer_id = auth.uid() -- Customer can update own bookings
  OR can_access_business(business_id, auth.uid()) -- Business staff can update business bookings
);

CREATE POLICY "Business staff can manage all bookings" ON service_bookings
FOR ALL USING (can_access_business(business_id, auth.uid()));

-- Staff availability policies
CREATE POLICY "Public can view staff availability for booking" ON staff_availability
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM staff_members 
    WHERE staff_members.id = staff_availability.staff_id 
    AND staff_members.is_active = true
  )
);

CREATE POLICY "Business staff can manage staff availability" ON staff_availability
FOR ALL USING (
  EXISTS(
    SELECT 1 FROM staff_members 
    WHERE staff_members.id = staff_availability.staff_id 
    AND can_access_business(staff_members.business_id, auth.uid())
  )
);

-- Staff time off policies
CREATE POLICY "Business staff can view staff time off" ON staff_time_off
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM staff_members 
    WHERE staff_members.id = staff_time_off.staff_id 
    AND can_access_business(staff_members.business_id, auth.uid())
  )
);

CREATE POLICY "Staff can manage their own time off" ON staff_time_off
FOR ALL USING (
  EXISTS(
    SELECT 1 FROM staff_members 
    WHERE staff_members.id = staff_time_off.staff_id 
    AND (
      staff_members.user_id = auth.uid() -- Staff member managing own time off
      OR can_access_business(staff_members.business_id, auth.uid()) -- Business admin
    )
  )
);

-- ============================================================================
-- UNIVERSAL FEATURE POLICIES
-- ============================================================================

-- Reviews policies
CREATE POLICY "Public can view published reviews" ON reviews
FOR SELECT USING (is_public = true);

CREATE POLICY "Customers can create reviews for their orders/bookings" ON reviews
FOR INSERT WITH CHECK (
  customer_id = auth.uid() 
  AND (
    (order_id IS NOT NULL AND EXISTS(
      SELECT 1 FROM orders 
      WHERE orders.id = reviews.order_id 
      AND orders.user_id = auth.uid()
    ))
    OR
    (booking_id IS NOT NULL AND EXISTS(
      SELECT 1 FROM service_bookings 
      WHERE service_bookings.id = reviews.booking_id 
      AND service_bookings.customer_id = auth.uid()
    ))
  )
);

CREATE POLICY "Customers can update their own reviews" ON reviews
FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "Business staff can manage reviews" ON reviews
FOR ALL USING (can_access_business(business_id, auth.uid()));

-- Business locations policies
CREATE POLICY "Public can view active business locations" ON business_locations
FOR SELECT USING (is_active = true);

CREATE POLICY "Business staff can manage locations" ON business_locations
FOR ALL USING (can_access_business(business_id, auth.uid()));

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant public read access to necessary tables for discovery
GRANT SELECT ON booking_statuses TO anon;
GRANT SELECT ON payment_statuses TO anon;
GRANT SELECT ON order_statuses TO anon;
GRANT SELECT ON products TO anon;
GRANT SELECT ON product_variants TO anon;
GRANT SELECT ON services TO anon;
GRANT SELECT ON staff_members TO anon;
GRANT SELECT ON staff_availability TO anon;
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON business_locations TO anon;