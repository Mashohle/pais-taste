/**
 * System User Constants
 *
 * These are special user accounts used for system operations
 */

/**
 * Guest User ID
 *
 * Used for orders placed by non-authenticated users.
 * Instead of using NULL user_ids, all guest orders are assigned to this user.
 *
 * Benefits:
 * - Cleaner queries (no need for NULL checks)
 * - Consistent data model
 * - Easy to identify and filter guest orders
 * - Can be reassigned to real users when they register
 */
export const GUEST_USER_ID = '00000000-0000-0000-0000-000000000001' as const
export const GUEST_USER_EMAIL = 'guest@pais-taste.internal' as const

/**
 * Helper function to check if a user ID is the guest user
 */
export const isGuestUser = (userId: string | null | undefined): boolean => {
  return userId === GUEST_USER_ID
}

/**
 * Helper function to get the appropriate user ID for an order
 * Returns the authenticated user's ID if available, otherwise the guest user ID
 */
export const getOrderUserId = (authenticatedUserId: string | null | undefined): string => {
  return authenticatedUserId || GUEST_USER_ID
}
