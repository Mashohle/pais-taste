-- Migration: Add Guest User Account
-- This creates a special guest user account for handling orders placed by non-authenticated users
-- instead of using NULL user_ids, which simplifies queries and data consistency

-- Step 1: Create the guest user in auth.users
-- Note: We use a deterministic UUID so it's the same across all environments
DO $$
DECLARE
  guest_user_id UUID := '00000000-0000-0000-0000-000000000001';
  guest_email TEXT := 'guest@pais-taste.internal';
BEGIN
  -- Insert into auth.users if it doesn't exist
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    guest_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    guest_email,
    crypt('guest-user-no-login', gen_salt('bf')), -- Password that nobody can actually use
    NOW(),
    '{"provider":"email","providers":["email"],"system_user":true}',
    '{"full_name":"Guest User","is_system_user":true}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- Step 2: Create the corresponding profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    guest_user_id,
    guest_email,
    'Guest User',
    'customer',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Step 3: Update existing orders with NULL user_id to use the guest user
  UPDATE public.orders
  SET user_id = guest_user_id
  WHERE user_id IS NULL;

  RAISE NOTICE 'Guest user created with ID: %', guest_user_id;
  RAISE NOTICE 'Updated % orders to use guest user ID', (SELECT COUNT(*) FROM public.orders WHERE user_id = guest_user_id);
END $$;

-- Step 4: Add a comment to the orders table documenting the guest user
COMMENT ON COLUMN public.orders.user_id IS 'User ID of the customer who placed the order. Uses guest user ID (00000000-0000-0000-0000-000000000001) for non-authenticated orders.';
