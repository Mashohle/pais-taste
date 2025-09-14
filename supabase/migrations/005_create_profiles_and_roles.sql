-- Create profiles table with role-based access control
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'business_admin', 'business_owner', 'super_admin')),
    preferred_pickup_location TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    address JSONB,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    dietary_preferences TEXT[],
    allergies TEXT[],
    marketing_emails BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'customer'  -- Default role for new users
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create some sample users for testing
-- Note: These should be created through Supabase Auth, but we'll set up the profile data

-- Insert sample admin user profile (you'll need to create the auth user separately)
-- This is just a placeholder - the actual user creation happens in Supabase Auth
INSERT INTO public.profiles (id, email, full_name, role) 
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@sidehusl.com',
    'SideHusl Admin',
    'business_admin'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- Insert sample super admin user profile
INSERT INTO public.profiles (id, email, full_name, role) 
VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'superadmin@sidehusl.com',
    'SideHusl Super Admin',
    'super_admin'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- Insert sample customer user profile
INSERT INTO public.profiles (id, email, full_name, role) 
VALUES (
    '00000000-0000-0000-0000-000000000003'::uuid,
    'customer@example.com',
    'Test Customer',
    'customer'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();