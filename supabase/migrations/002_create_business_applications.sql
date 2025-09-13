-- Create business applications table
CREATE TABLE IF NOT EXISTS business_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Application Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  
  -- Basic Business Information
  business_name VARCHAR(255) NOT NULL,
  business_category VARCHAR(50) NOT NULL,
  business_type VARCHAR(100),
  description TEXT,
  
  -- Owner Information
  owner_first_name VARCHAR(100) NOT NULL,
  owner_last_name VARCHAR(100) NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  owner_phone VARCHAR(20),
  owner_id_number VARCHAR(20),
  
  -- Business Address
  street_address VARCHAR(255),
  suburb VARCHAR(100),
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'South Africa',
  
  -- Business Registration Details
  registration_number VARCHAR(50),
  tax_number VARCHAR(50),
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  branch_code VARCHAR(10),
  
  -- Operating Hours (JSON format)
  operating_hours JSONB DEFAULT '{}',
  
  -- Documents (JSON array of document info)
  documents JSONB DEFAULT '[]',
  
  -- Terms Agreement
  agree_to_terms BOOLEAN DEFAULT false,
  agree_to_commission BOOLEAN DEFAULT false,
  
  -- Approval Workflow
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  rejection_reason TEXT,
  
  -- Created Business (after approval)
  business_id UUID REFERENCES businesses(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_business_applications_status ON business_applications(status);
CREATE INDEX IF NOT EXISTS idx_business_applications_email ON business_applications(owner_email);
CREATE INDEX IF NOT EXISTS idx_business_applications_created_at ON business_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_business_applications_reviewed_by ON business_applications(reviewed_by);

-- Create trigger for updated_at
CREATE TRIGGER update_business_applications_updated_at 
  BEFORE UPDATE ON business_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create application documents table for file uploads
CREATE TABLE IF NOT EXISTS application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES business_applications(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'id_document', 'business_registration', 'tax_certificate', 'bank_statement', etc.
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  upload_status VARCHAR(20) DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploaded', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for application documents
CREATE INDEX IF NOT EXISTS idx_application_documents_application_id ON application_documents(application_id);

-- Insert some sample data for testing
INSERT INTO business_applications (
  business_name,
  business_category,
  business_type,
  description,
  owner_first_name,
  owner_last_name,
  owner_email,
  owner_phone,
  street_address,
  city,
  province,
  status
) VALUES 
(
  'Mama Zulu''s Kitchen',
  'food',
  'Restaurant',
  'Authentic South African cuisine with a modern twist, serving traditional dishes made from locally sourced ingredients.',
  'Nomsa',
  'Zulu',
  'nomsa@mamazulus.co.za',
  '+27 11 123 4567',
  '123 Main Road',
  'Soweto',
  'Gauteng',
  'pending'
),
(
  'Urban Style Boutique',
  'retail',
  'Clothing Store',
  'Contemporary fashion boutique specializing in African-inspired streetwear and accessories.',
  'Thabo',
  'Makena',
  'thabo@urbanstyle.co.za',
  '+27 21 987 6543',
  '45 Long Street',
  'Cape Town',
  'Western Cape',
  'pending'
),
(
  'Elite Car Detailing',
  'services',
  'Car Wash',
  'Premium car detailing and cleaning services using eco-friendly products.',
  'Michael',
  'Johnson',
  'mike@elitecar.co.za',
  '+27 31 456 7890',
  '78 Durban Road',
  'Durban',
  'KwaZulu-Natal',
  'under_review'
);