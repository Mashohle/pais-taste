-- Add coordinates for existing businesses
-- Run this in Supabase SQL Editor

-- Pai's Taste in Pretoria North
-- Coordinates for Pretoria North, South Africa: -25.6849, 28.2279
UPDATE businesses
SET
  latitude = -25.6849,
  longitude = 28.2279
WHERE slug = 'pai-s-taste';

-- Verify the update
SELECT
  name,
  city,
  address_line1,
  latitude,
  longitude
FROM businesses
WHERE slug = 'pai-s-taste';

-- If you add more businesses later, use this format:
-- UPDATE businesses SET latitude = -25.XXXX, longitude = 28.XXXX WHERE slug = 'business-slug';

-- Common South African city coordinates for reference:
-- Johannesburg: -26.2041, 28.0473
-- Cape Town: -33.9249, 18.4241
-- Durban: -29.8587, 31.0218
-- Pretoria: -25.7479, 28.2293
-- Pretoria North: -25.6849, 28.2279
-- Port Elizabeth: -33.9608, 25.6022
-- Bloemfontein: -29.0852, 26.1596
