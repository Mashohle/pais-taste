# Authentication Flow

## Overview
Clean, simple authentication system with role-based portal access and permission-based feature access.

## Architecture

### 1. **Global Auth Context** (`src/lib/contexts/auth-context.tsx`)
- Handles login/logout for ALL users
- Manages user session and profile
- Single source of truth for authentication

### 2. **Role-Based Portal Access**
Roles determine which portal you can access:
- `customer` → Customer Portal
- `business-owner` → Business Portal (full access)
- `business-admin` → Business Portal (admin access)
- `business-staff` → Business Portal (basic access)
- `super-admin` → Super Admin Portal
- `system` → System operations

### 3. **Permission-Based Feature Access**
Permissions control what you can do within portals:
- Resource + Action based (`menu:write`, `orders:read`, etc.)
- Assigned to roles via `role_permissions` table

## Key Principle
**Don't block login based on business relationships**
- Let users in based on their role
- Show empty states ("No businesses yet") instead of blocking access
- Fetch additional data (businesses, etc.) after login

## Database Structure

```sql
-- Portal access
profiles.role_id → roles.id

-- Business ownership (1 per business)
business_users → links business owners to businesses

-- Business staff (managed by owners)
staff_members → business admins/staff (NOT full user accounts)

-- Feature permissions
roles → role_permissions → permissions
```

## Auth Flow

1. **Global auth** verifies user identity
2. **Role check** determines portal access (`business-owner`, `super-admin`, etc.)
3. **Once inside portal**, fetch business relationships and show appropriate UI
4. **Permissions** control specific features within the portal

## Files

- **Global Auth**: `src/lib/contexts/auth-context.tsx`
- **Business Auth Hook**: `src/lib/hooks/use-business-admin-auth.ts`
- **Super Admin Auth Hook**: `src/lib/hooks/use-super-admin-auth.ts`
- **Guards**: `src/components/auth/*-guard.tsx`