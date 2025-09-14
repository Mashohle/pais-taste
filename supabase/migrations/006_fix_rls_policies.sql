-- Fix infinite recursion in business_users RLS policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view business_users for their businesses" ON business_users;
DROP POLICY IF EXISTS "Business owners can manage business users" ON business_users;

-- Create simpler policies that don't cause recursion
CREATE POLICY "Users can view their own business_user records" ON business_users
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all business_users" ON business_users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Authenticated users can insert business_users" ON business_users
FOR INSERT WITH CHECK (auth.role() = 'authenticated');