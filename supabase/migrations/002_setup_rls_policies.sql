-- Enable Row Level Security (RLS) on all business tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's business IDs
CREATE OR REPLACE FUNCTION get_user_business_ids(user_uuid UUID)
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT business_id 
    FROM business_users 
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can access business
CREATE OR REPLACE FUNCTION can_access_business(business_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM business_users 
    WHERE business_id = business_uuid 
    AND user_id = user_uuid 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Businesses policies
CREATE POLICY "Users can view businesses they belong to" ON businesses
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM business_users 
    WHERE business_id = businesses.id AND is_active = true
  )
  OR is_active = true -- Allow public viewing of active businesses for discovery
);

CREATE POLICY "Business owners can update their business" ON businesses
FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM business_users 
    WHERE business_id = businesses.id 
    AND role IN ('owner', 'admin')
    AND is_active = true
  )
);

CREATE POLICY "Authenticated users can create businesses" ON businesses
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Business users policies
CREATE POLICY "Users can view business_users for their businesses" ON business_users
FOR SELECT USING (
  user_id = auth.uid() -- Can see own records
  OR 
  auth.uid() IN (
    SELECT bu.user_id FROM business_users bu
    WHERE bu.business_id = business_users.business_id 
    AND bu.role IN ('owner', 'admin')
    AND bu.is_active = true
  )
);

CREATE POLICY "Business owners can manage business users" ON business_users
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM business_users 
    WHERE business_id = business_users.business_id 
    AND role IN ('owner', 'admin')
    AND is_active = true
  )
);

-- Business hours policies
CREATE POLICY "Anyone can view business hours" ON business_hours
FOR SELECT USING (true); -- Public information

CREATE POLICY "Business staff can manage business hours" ON business_hours
FOR ALL USING (
  can_access_business(business_id, auth.uid())
);

-- Menu items policies
CREATE POLICY "Anyone can view published menu items" ON menu_items
FOR SELECT USING (
  published = true -- Public can see published items
  OR 
  can_access_business(business_id, auth.uid()) -- Business staff can see all items
);

CREATE POLICY "Business staff can manage menu items" ON menu_items
FOR ALL USING (
  can_access_business(business_id, auth.uid())
);

-- Orders policies
CREATE POLICY "Users can view their own orders or business staff can view business orders" ON orders
FOR SELECT USING (
  user_id = auth.uid() -- Customer can see own orders
  OR 
  can_access_business(business_id, auth.uid()) -- Business staff can see business orders
);

CREATE POLICY "Customers can create orders" ON orders
FOR INSERT WITH CHECK (
  user_id = auth.uid() OR user_id IS NULL -- Allow guest orders
);

CREATE POLICY "Business staff can update orders" ON orders
FOR UPDATE USING (
  can_access_business(business_id, auth.uid())
);

-- Order items policies
CREATE POLICY "Users can view order items for accessible orders" ON order_items
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() 
      OR can_access_business(orders.business_id, auth.uid())
    )
  )
);

CREATE POLICY "Business staff can manage order items" ON order_items
FOR ALL USING (
  can_access_business(business_id, auth.uid())
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Allow public access to businesses for discovery
GRANT SELECT ON businesses TO anon;
GRANT SELECT ON business_hours TO anon;
GRANT SELECT ON menu_items TO anon;