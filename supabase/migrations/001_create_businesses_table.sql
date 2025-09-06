-- Create business categories table (idempotent)
CREATE TABLE IF NOT EXISTS business_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) NOT NULL, -- Icon name (e.g., 'UtensilsCrossed', 'Store')
  color VARCHAR(50) NOT NULL, -- CSS class or hex color
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default business categories (with conflict handling)
INSERT INTO business_categories (id, name, description, icon, color, sort_order) VALUES
('food', 'Food & Restaurants', 'Restaurants, cafes, food delivery, catering', 'UtensilsCrossed', 'bg-orange-500', 1),
('retail', 'Retail & E-commerce', 'Stores, boutiques, online shops, marketplaces', 'Store', 'bg-blue-500', 2),
('service', 'Professional Services', 'Consulting, repairs, maintenance, freelancing', 'Wrench', 'bg-green-500', 3),
('car_wash', 'Car Wash & Detailing', 'Car wash, detailing, automotive care services', 'Car', 'bg-purple-500', 4),
('salon', 'Beauty & Wellness', 'Salons, spas, barbershops, wellness centers', 'Scissors', 'bg-pink-500', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Create onboarding steps table (idempotent)
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  component VARCHAR(100), -- React component name
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default onboarding steps (with conflict handling)
INSERT INTO onboarding_steps (id, name, description, component, sort_order) VALUES
(1, 'Category', 'Choose your business type', 'CategorySelection', 1),
(2, 'Basic Info', 'Business name and details', 'BasicInfo', 2),
(3, 'Location', 'Address and contact info', 'LocationInfo', 3),
(4, 'Settings', 'Configure your business', 'BusinessSettings', 4),
(5, 'Review', 'Review and create', 'ReviewStep', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  component = EXCLUDED.component,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Create businesses table for multi-tenancy (idempotent)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category_id VARCHAR(50) REFERENCES business_categories(id),
  
  -- Contact Information
  email VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(255),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'South Africa',
  
  -- Business Settings
  currency VARCHAR(3) DEFAULT 'ZAR',
  timezone VARCHAR(50) DEFAULT 'Africa/Johannesburg',
  
  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#000000',
  accent_color VARCHAR(7) DEFAULT '#0066CC',
  
  -- Operating Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  setup_completed BOOLEAN DEFAULT false,
  
  -- Business-specific settings (JSON for flexibility)
  settings JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handle migration from old category column to category_id (if needed)
DO $$
BEGIN
  -- Check if old category column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'category'
  ) THEN
    -- Add category_id column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'businesses' AND column_name = 'category_id'
    ) THEN
      ALTER TABLE businesses ADD COLUMN category_id VARCHAR(50);
    END IF;
    
    -- Migrate data from category to category_id
    UPDATE businesses 
    SET category_id = category 
    WHERE category_id IS NULL AND category IN ('food', 'retail', 'service', 'car_wash', 'salon');
    
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_businesses_category'
    ) THEN
      ALTER TABLE businesses 
      ADD CONSTRAINT fk_businesses_category 
      FOREIGN KEY (category_id) REFERENCES business_categories(id);
    END IF;
    
    -- Make category_id NOT NULL
    ALTER TABLE businesses ALTER COLUMN category_id SET NOT NULL;
    
    -- Drop old category column and its index
    DROP INDEX IF EXISTS idx_businesses_category;
    ALTER TABLE businesses DROP COLUMN category;
  ELSE
    -- If no old category column, ensure category_id is NOT NULL
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'businesses' AND column_name = 'category_id' 
      AND is_nullable = 'YES'
    ) THEN
      ALTER TABLE businesses ALTER COLUMN category_id SET NOT NULL;
    END IF;
    
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_businesses_category'
    ) THEN
      ALTER TABLE businesses 
      ADD CONSTRAINT fk_businesses_category 
      FOREIGN KEY (category_id) REFERENCES business_categories(id);
    END IF;
  END IF;
END $$;

-- Create indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_category_id ON businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active);

-- Add business_id to existing tables (idempotent)
DO $$
BEGIN
  -- Add business_id to menu_items if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
  END IF;
  
  -- Add business_id to orders if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
  END IF;
  
  -- Add business_id to order_items if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE order_items ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for business_id foreign keys (idempotent)
CREATE INDEX IF NOT EXISTS idx_menu_items_business_id ON menu_items(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_order_items_business_id ON order_items(business_id);

-- Business users/staff table (idempotent)
CREATE TABLE IF NOT EXISTS business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff', 'viewer')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, user_id)
);

-- Create indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_business_users_business_id ON business_users(business_id);
CREATE INDEX IF NOT EXISTS idx_business_users_user_id ON business_users(user_id);

-- Operating hours table (idempotent)
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, day_of_week)
);

-- Create index (idempotent)
CREATE INDEX IF NOT EXISTS idx_business_hours_business_id ON business_hours(business_id);

-- Update function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for updated_at (idempotent)
DO $$
BEGIN
  -- Trigger for businesses
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_businesses_updated_at'
  ) THEN
    CREATE TRIGGER update_businesses_updated_at 
    BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Trigger for business_users
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_business_users_updated_at'
  ) THEN
    CREATE TRIGGER update_business_users_updated_at 
    BEFORE UPDATE ON business_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Trigger for business_categories
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_business_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_business_categories_updated_at 
    BEFORE UPDATE ON business_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Trigger for onboarding_steps
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_onboarding_steps_updated_at'
  ) THEN
    CREATE TRIGGER update_onboarding_steps_updated_at 
    BEFORE UPDATE ON onboarding_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;