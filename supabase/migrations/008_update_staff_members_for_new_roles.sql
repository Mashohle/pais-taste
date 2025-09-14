-- Migration: Update staff_members table for new role system
-- Date: 2025-01-14
-- Description: Update staff_members to work with new role system and clarify business relationships

BEGIN;

-- Step 1: Add role_id to staff_members table
ALTER TABLE staff_members ADD COLUMN role_id TEXT REFERENCES roles(id) DEFAULT 'business-staff';

-- Step 2: Update existing staff members with appropriate roles
-- Convert existing role strings to role_id references
UPDATE staff_members SET role_id = 'business-admin' WHERE role = 'admin';
UPDATE staff_members SET role_id = 'business-staff' WHERE role = 'staff' OR role IS NULL;

-- Step 3: Set default role for any staff without roles
UPDATE staff_members SET role_id = 'business-staff' WHERE role_id IS NULL;

-- Step 4: Add constraint to ensure staff members can only have business roles (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'check_staff_business_roles'
    AND table_name = 'staff_members'
  ) THEN
    ALTER TABLE staff_members ADD CONSTRAINT check_staff_business_roles
      CHECK (role_id IN ('business-admin', 'business-staff'));
  END IF;
END $$;

-- Step 5: Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_staff_members_role_id ON staff_members(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_business_id ON staff_members(business_id);

-- Step 6: Update RLS policies for staff_members
DROP POLICY IF EXISTS "Business owners can manage staff" ON staff_members;
DROP POLICY IF EXISTS "Staff can view own record" ON staff_members;

-- New RLS policies that work with the new role system
CREATE POLICY "Business owners can manage their staff" ON staff_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      JOIN profiles p ON bu.user_id = p.id
      WHERE bu.business_id = staff_members.business_id
        AND bu.user_id = auth.uid()
        AND bu.is_active = true
        AND p.role_id = 'business-owner'
    )
  );

-- Staff members can view their own records (if they're linked to a user profile)
CREATE POLICY "Staff can view own record" ON staff_members
  FOR SELECT USING (
    -- If staff member is linked to a user profile
    user_id = auth.uid()
    OR
    -- Or if the current user is the business owner
    EXISTS (
      SELECT 1 FROM business_users bu
      JOIN profiles p ON bu.user_id = p.id
      WHERE bu.business_id = staff_members.business_id
        AND bu.user_id = auth.uid()
        AND bu.is_active = true
        AND p.role_id = 'business-owner'
    )
  );

-- Step 7: Create helper function to get staff permissions
CREATE OR REPLACE FUNCTION get_staff_permissions(staff_member_id UUID)
RETURNS TABLE(permission_id TEXT, permission_name TEXT, resource TEXT, action TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as permission_id,
    p.name as permission_name,
    p.resource,
    p.action
  FROM staff_members sm
  JOIN roles r ON sm.role_id = r.id
  JOIN role_permissions rp ON r.id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE sm.id = staff_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create function to check if staff member has specific permission
CREATE OR REPLACE FUNCTION staff_has_permission(staff_member_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_members sm
    JOIN roles r ON sm.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE sm.id = staff_member_id AND p.id = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Add comments for clarity
COMMENT ON TABLE staff_members IS 'Business staff managed by business owners. These are NOT full user accounts.';
COMMENT ON COLUMN staff_members.role_id IS 'Role determining what permissions this staff member has within the business';
COMMENT ON COLUMN staff_members.user_id IS 'Optional: If staff member has a full user account, links to profiles table';

-- Step 10: Verify business_users table is only for owners
-- Note: We can't use a CHECK constraint with subqueries, so we'll enforce this through RLS and triggers instead
COMMENT ON TABLE business_users IS 'Business owners only - managed through application logic and RLS policies';

-- Update business_users RLS policy to be more specific
DROP POLICY IF EXISTS "Business owners can manage their business users" ON business_users;
CREATE POLICY "Business owners can manage their business users" ON business_users
  FOR ALL USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role_id IN ('super-admin', 'system')
    )
  );

-- Step 11: Create view for easy staff management
CREATE OR REPLACE VIEW business_staff_with_permissions AS
SELECT
  sm.id,
  sm.business_id,
  sm.user_id,
  sm.name,
  sm.email,
  sm.phone,
  sm.role as position,
  sm.role_id,
  r.name as role_name,
  sm.is_active,
  sm.created_at,
  -- Get permissions as JSON array
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'resource', p.resource,
          'action', p.action
        )
      )
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = sm.role_id
    ),
    '[]'::json
  ) as permissions
FROM staff_members sm
JOIN roles r ON sm.role_id = r.id;

-- Grant access to the view
GRANT SELECT ON business_staff_with_permissions TO authenticated;

-- RLS for the view (inherits from staff_members)
ALTER VIEW business_staff_with_permissions SET (security_barrier = true);

-- Verify the migration
DO $$
DECLARE
  staff_count INTEGER;
  staff_with_roles INTEGER;
BEGIN
  SELECT COUNT(*) INTO staff_count FROM staff_members;
  SELECT COUNT(*) INTO staff_with_roles FROM staff_members WHERE role_id IS NOT NULL;

  RAISE NOTICE 'Staff members migration completed:';
  RAISE NOTICE '- Total staff members: %', staff_count;
  RAISE NOTICE '- Staff with role_id: %', staff_with_roles;
END $$;

COMMIT;