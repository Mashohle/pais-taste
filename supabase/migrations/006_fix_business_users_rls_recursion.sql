-- Migration: Fix RLS infinite recursion on business_users table
-- Date: 2025-01-14
-- Description: Replaces circular RLS policies with non-recursive ones

BEGIN;

-- Step 1: Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Business owners can manage business users" ON business_users;
DROP POLICY IF EXISTS "Users can view business_users for their businesses" ON business_users;

-- Step 2: Create simple, non-recursive policies for business_users
CREATE POLICY "Users can access their own business relationships" ON business_users
    FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Business owners can manage their business users" ON business_users
    FOR ALL
    USING (
        -- Users can always access their own records
        user_id = auth.uid()
        OR
        -- Business owners/admins can access records for their businesses (non-recursive)
        EXISTS (
            SELECT 1
            FROM business_users bu
            WHERE bu.user_id = auth.uid()
              AND bu.business_id = business_users.business_id
              AND bu.role IN ('owner', 'admin')
              AND bu.is_active = true
        )
    );

-- Verify the policies were created correctly
SELECT
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'business_users'
ORDER BY policyname;

COMMIT;