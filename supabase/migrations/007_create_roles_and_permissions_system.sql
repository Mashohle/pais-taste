-- Migration: Create Roles and Permissions System
-- Date: 2025-01-14
-- Description: Create a proper role and permission system for portal and feature access

BEGIN;

-- Step 1: Create roles table (determines portal access)
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  portal TEXT NOT NULL CHECK (portal IN ('customer', 'business', 'super-admin', 'system')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create permissions table (determines feature access within portals)
CREATE TABLE permissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource TEXT NOT NULL, -- 'dashboard', 'orders', 'menu', 'staff', 'analytics', 'settings', etc.
  action TEXT NOT NULL,   -- 'read', 'write', 'delete', 'manage'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create role_permissions junction table
CREATE TABLE role_permissions (
  role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Step 4: Add role_id to profiles table
ALTER TABLE profiles ADD COLUMN role_id TEXT REFERENCES roles(id);

-- Step 5: Insert default roles
INSERT INTO roles (id, name, description, portal) VALUES
  ('customer', 'Customer', 'Regular customer with access to customer portal', 'customer'),
  ('business-owner', 'Business Owner', 'Business owner with full access to business portal', 'business'),
  ('business-admin', 'Business Admin', 'Business admin with limited access to business portal', 'business'),
  ('business-staff', 'Business Staff', 'Business staff with basic access to business portal', 'business'),
  ('super-admin', 'Super Admin', 'System administrator with access to super admin portal', 'super-admin'),
  ('system', 'System', 'System user for automated operations', 'system');

-- Step 6: Insert default permissions
INSERT INTO permissions (id, name, description, resource, action) VALUES
  -- Dashboard permissions
  ('dashboard-read', 'View Dashboard', 'Can view dashboard', 'dashboard', 'read'),

  -- Orders permissions
  ('orders-read', 'View Orders', 'Can view orders', 'orders', 'read'),
  ('orders-write', 'Manage Orders', 'Can create and update orders', 'orders', 'write'),
  ('orders-delete', 'Delete Orders', 'Can delete orders', 'orders', 'delete'),

  -- Menu permissions
  ('menu-read', 'View Menu', 'Can view menu items', 'menu', 'read'),
  ('menu-write', 'Manage Menu', 'Can create and update menu items', 'menu', 'write'),
  ('menu-delete', 'Delete Menu Items', 'Can delete menu items', 'menu', 'delete'),

  -- Staff permissions
  ('staff-read', 'View Staff', 'Can view staff members', 'staff', 'read'),
  ('staff-write', 'Manage Staff', 'Can create and update staff members', 'staff', 'write'),
  ('staff-delete', 'Delete Staff', 'Can delete staff members', 'staff', 'delete'),

  -- Analytics permissions
  ('analytics-read', 'View Analytics', 'Can view business analytics', 'analytics', 'read'),

  -- Settings permissions
  ('settings-read', 'View Settings', 'Can view settings', 'settings', 'read'),
  ('settings-write', 'Manage Settings', 'Can update settings', 'settings', 'write'),

  -- Business permissions
  ('business-read', 'View Business', 'Can view business information', 'business', 'read'),
  ('business-write', 'Manage Business', 'Can update business information', 'business', 'write'),

  -- Products permissions (for retail)
  ('products-read', 'View Products', 'Can view products', 'products', 'read'),
  ('products-write', 'Manage Products', 'Can create and update products', 'products', 'write'),
  ('products-delete', 'Delete Products', 'Can delete products', 'products', 'delete'),

  -- Inventory permissions
  ('inventory-read', 'View Inventory', 'Can view inventory', 'inventory', 'read'),
  ('inventory-write', 'Manage Inventory', 'Can update inventory', 'inventory', 'write');

-- Step 7: Assign permissions to roles
-- Customer permissions (minimal)
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('customer', 'dashboard-read');

-- Business Owner permissions (full access)
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('business-owner', 'dashboard-read'),
  ('business-owner', 'orders-read'),
  ('business-owner', 'orders-write'),
  ('business-owner', 'orders-delete'),
  ('business-owner', 'menu-read'),
  ('business-owner', 'menu-write'),
  ('business-owner', 'menu-delete'),
  ('business-owner', 'staff-read'),
  ('business-owner', 'staff-write'),
  ('business-owner', 'staff-delete'),
  ('business-owner', 'analytics-read'),
  ('business-owner', 'settings-read'),
  ('business-owner', 'settings-write'),
  ('business-owner', 'business-read'),
  ('business-owner', 'business-write'),
  ('business-owner', 'products-read'),
  ('business-owner', 'products-write'),
  ('business-owner', 'products-delete'),
  ('business-owner', 'inventory-read'),
  ('business-owner', 'inventory-write');

-- Business Admin permissions (limited admin access)
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('business-admin', 'dashboard-read'),
  ('business-admin', 'orders-read'),
  ('business-admin', 'orders-write'),
  ('business-admin', 'menu-read'),
  ('business-admin', 'menu-write'),
  ('business-admin', 'staff-read'),
  ('business-admin', 'analytics-read'),
  ('business-admin', 'settings-read'),
  ('business-admin', 'business-read'),
  ('business-admin', 'products-read'),
  ('business-admin', 'products-write'),
  ('business-admin', 'inventory-read'),
  ('business-admin', 'inventory-write');

-- Business Staff permissions (basic access)
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('business-staff', 'dashboard-read'),
  ('business-staff', 'orders-read'),
  ('business-staff', 'orders-write'),
  ('business-staff', 'menu-read'),
  ('business-staff', 'products-read'),
  ('business-staff', 'inventory-read');

-- Super Admin permissions (everything)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'super-admin', id FROM permissions;

-- Step 8: Migrate existing role data
-- Update existing profiles with string roles to use new role_id system
UPDATE profiles SET role_id = 'customer' WHERE role = 'customer' OR role IS NULL;
UPDATE profiles SET role_id = 'business-owner' WHERE role = 'business_owner';
UPDATE profiles SET role_id = 'business-admin' WHERE role = 'business_admin';
UPDATE profiles SET role_id = 'super-admin' WHERE role = 'super_admin';
UPDATE profiles SET role_id = 'system' WHERE role = 'system';

-- Set default role for any profiles without roles
UPDATE profiles SET role_id = 'customer' WHERE role_id IS NULL;

-- Step 9: Create indexes for performance
CREATE INDEX idx_profiles_role_id ON profiles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_roles_portal ON roles(portal);
CREATE INDEX idx_permissions_resource ON permissions(resource);

-- Step 10: Add RLS policies for the new tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Roles table policies (readable by all authenticated users)
CREATE POLICY "Roles are readable by authenticated users" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permissions table policies (readable by authenticated users)
CREATE POLICY "Permissions are readable by authenticated users" ON permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Role permissions table policies (readable by authenticated users)
CREATE POLICY "Role permissions are readable by authenticated users" ON role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Update profiles RLS to work with new role system
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Step 11: Create helper functions
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT r.id
    FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_has_permission(permission_name TEXT, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles p
    JOIN roles r ON p.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions perm ON rp.permission_id = perm.id
    WHERE p.id = user_id AND perm.id = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_portal(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT r.portal
    FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the migration worked
DO $$
DECLARE
  role_count INTEGER;
  permission_count INTEGER;
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO role_count FROM roles;
  SELECT COUNT(*) INTO permission_count FROM permissions;
  SELECT COUNT(*) INTO profile_count FROM profiles WHERE role_id IS NOT NULL;

  RAISE NOTICE 'Migration completed:';
  RAISE NOTICE '- Roles created: %', role_count;
  RAISE NOTICE '- Permissions created: %', permission_count;
  RAISE NOTICE '- Profiles updated with role_id: %', profile_count;
END $$;

COMMIT;