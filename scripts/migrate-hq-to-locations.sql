-- Migration script to add headquarters location to business_locations table
-- This should be run once to migrate existing businesses

-- TODO: This migration should be integrated into the business registration flow
-- When a new business is created, automatically create an entry in business_locations
-- with is_primary = true

-- Insert headquarters location for each business that doesn't have a primary location yet
INSERT INTO business_locations (
  business_id,
  name,
  address_line1,
  address_line2,
  city,
  state,
  postal_code,
  country,
  phone,
  email,
  settings,
  is_active,
  is_primary,
  created_at,
  updated_at
)
SELECT
  b.id as business_id,
  b.name || ' - Headquarters' as name,
  b.address_line1,
  b.address_line2,
  b.city,
  b.state,
  b.postal_code,
  b.country,
  b.phone,
  b.email,
  jsonb_build_object(
    'description', 'Main headquarters location',
    'opening_hours', COALESCE(b.settings->'opening_hours', '{}'::jsonb)
  ) as settings,
  true as is_active,
  true as is_primary,
  NOW() as created_at,
  NOW() as updated_at
FROM businesses b
WHERE NOT EXISTS (
  SELECT 1
  FROM business_locations bl
  WHERE bl.business_id = b.id
  AND bl.is_primary = true
);

-- Verify the migration
SELECT
  b.name as business_name,
  bl.name as location_name,
  bl.is_primary,
  bl.city
FROM businesses b
LEFT JOIN business_locations bl ON b.id = bl.business_id AND bl.is_primary = true
ORDER BY b.created_at DESC;
