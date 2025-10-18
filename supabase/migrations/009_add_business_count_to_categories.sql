-- Add business count field to business_categories table for performance
-- This migration adds cached business counts and triggers to maintain them

-- Add business_count field to business_categories table
ALTER TABLE business_categories
ADD COLUMN IF NOT EXISTS business_count INTEGER DEFAULT 0;

-- Function to update business count for a category
CREATE OR REPLACE FUNCTION update_category_business_count(category_id_param VARCHAR(50))
RETURNS VOID AS $$
BEGIN
  UPDATE business_categories
  SET business_count = (
    SELECT COUNT(*)
    FROM businesses
    WHERE category_id = category_id_param
    AND is_active = true
  )
  WHERE id = category_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to handle business count updates when businesses change
CREATE OR REPLACE FUNCTION trigger_update_business_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_active = true THEN
      PERFORM update_category_business_count(NEW.category_id);
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- If category changed, update both old and new categories
    IF OLD.category_id != NEW.category_id THEN
      PERFORM update_category_business_count(OLD.category_id);
      PERFORM update_category_business_count(NEW.category_id);
    -- If only is_active changed, update current category
    ELSIF OLD.is_active != NEW.is_active THEN
      PERFORM update_category_business_count(NEW.category_id);
    END IF;
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_active = true THEN
      PERFORM update_category_business_count(OLD.category_id);
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on businesses table to maintain counts
DROP TRIGGER IF EXISTS businesses_update_category_count ON businesses;
CREATE TRIGGER businesses_update_category_count
  AFTER INSERT OR UPDATE OR DELETE ON businesses
  FOR EACH ROW EXECUTE FUNCTION trigger_update_business_count();

-- Initialize all category counts
DO $$
DECLARE
  category_record RECORD;
BEGIN
  FOR category_record IN SELECT id FROM business_categories LOOP
    PERFORM update_category_business_count(category_record.id);
  END LOOP;
END $$;

-- Create index on business_count for fast querying
CREATE INDEX IF NOT EXISTS idx_business_categories_count ON business_categories(business_count);