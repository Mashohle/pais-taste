-- Add missing columns to businesses table for directory features

-- Add featured flag (admin can mark businesses as featured)
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add geolocation coordinates (for distance calculations)
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add long description field (for detailed business descriptions)
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS long_description TEXT;

-- Comment on the settings JSONB column structure
-- These values are set by business owners during onboarding/settings
COMMENT ON COLUMN businesses.settings IS 'Business-specific settings stored as JSON. Structure varies by business type:
{
  "operating_hours": {
    "monday": {"open": "HH:MM", "close": "HH:MM", "closed": boolean},
    "tuesday": {"open": "HH:MM", "close": "HH:MM", "closed": boolean},
    ... (one entry per day of week)
  },
  "food": {
    "delivery_fee": number,
    "minimum_order": number,
    "estimated_time": string,
    "features": [string]
  },
  "retail": {
    "features": [string]
  },
  "service": {
    "features": [string]
  },
  "price_range": string (e.g., "$", "$$", "$$$", "$$$$")
}';

-- Create index for geolocation queries (for distance-based search)
CREATE INDEX IF NOT EXISTS idx_businesses_coordinates ON businesses(latitude, longitude);

-- Create index for featured businesses (for faster featured-only queries)
CREATE INDEX IF NOT EXISTS idx_businesses_featured ON businesses(is_featured) WHERE is_featured = true;

-- Create index for verified businesses (for faster verified-only queries)
CREATE INDEX IF NOT EXISTS idx_businesses_verified ON businesses(is_verified) WHERE is_verified = true;
