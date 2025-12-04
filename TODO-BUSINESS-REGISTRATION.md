# Business Registration Flow - TODO

## Issue
Currently, when a new business is registered, the headquarters location is only stored in the `businesses` table (address_line1, address_line2, city, state, etc.), but NOT in the `business_locations` table.

This causes:
- Inconsistent data structure
- Locations page doesn't show the HQ unless manually migrated
- Extra complexity in the codebase to combine data from two sources

## Solution Required
When creating a new business during the registration/onboarding flow, automatically create a corresponding entry in the `business_locations` table with:

```sql
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
  is_primary,  -- IMPORTANT: Set to true for HQ
  created_at,
  updated_at
)
VALUES (
  <new_business_id>,
  <business_name> || ' - Headquarters',
  <address_line1>,
  <address_line2>,
  <city>,
  <state>,
  <postal_code>,
  <country>,
  <phone>,
  <email>,
  jsonb_build_object(
    'description', 'Main headquarters location',
    'opening_hours', <opening_hours_from_business_settings>
  ),
  true,  -- is_active
  true,  -- is_primary (marks as headquarters)
  NOW(),
  NOW()
);
```

## Files to Update
1. Look for business registration API routes or onboarding flow
2. After creating the `businesses` table entry, immediately create the `business_locations` entry
3. Ensure both operations are in the same transaction for data consistency

## Migration Script
For existing businesses, run: `/scripts/migrate-hq-to-locations.sql`

## Status
- [ ] Find business registration/onboarding code
- [ ] Add business_locations insert after business creation
- [ ] Test registration flow creates both entries
- [ ] Verify locations page shows HQ immediately after registration

## Future Locations Feature Expansions

### Add/Edit Location Modals
- Create location form modal with fields:
  - Name, address (line1, line2), city, state, postal code, country
  - Phone, email, capacity
  - Operating hours (per day of week)
  - Amenities (multi-select)
  - Description
- Validation for required fields
- Save to `business_locations` table via POST/PATCH API

### Location-Specific Features
- **Services per Location**: Allow different services/menu items per location
- **Staff Assignment**: Assign team members to specific locations
- **Inventory per Location**: Track inventory separately by location
- **Location-Based Orders**: Filter orders by location
- **Opening Hours Override**: Special hours for holidays/events
- **Location Images**: Upload photos for each location

### Map Integration
- Display locations on interactive map (Google Maps/Mapbox)
- Show distance from customer location
- Directions integration
- Service area visualization

### Analytics per Location
- Performance metrics by location
- Compare locations (sales, orders, ratings)
- Location-specific reports
