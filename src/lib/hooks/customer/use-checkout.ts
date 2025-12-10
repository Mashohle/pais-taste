import { useEffect, useMemo } from 'react'
import { useCart } from '@/lib/context/cart-context'
import { useBusiness } from '../business/use-business'
import { useBusinessErrorHandler } from '../business/use-business-error-handler'
import { CartItem } from '@/lib/services/cart.service'

export interface CheckoutData {
  business: ReturnType<typeof useBusiness>['business'] | null
  cartItems: CartItem[]
  subtotal: number
  total: number
  hasItems: boolean
}

export function useCheckout() {
  const { cart, subtotal, total, hasItems } = useCart()
  const businessId = cart.business?.id || null

  // Get business data using the business hook
  const {
    business,
    loading: isLoadingBusiness,
    error: businessError
  } = useBusiness(businessId)

  const {
    executeWithErrorHandling,
    isLoading: isValidating,
    hasError: hasValidationError,
    error: validationError
  } = useBusinessErrorHandler()

  // Cart items - memoized to prevent recreating on every render
  const orderItems = useMemo(
    () => cart.items,
    [cart.items]
  )

  // Validate checkout data
  useEffect(() => {
    // Only validate if business is available
    if (businessId && business) {

      executeWithErrorHandling(
        async () => {
          // Validate business is active and available for orders
          if (!business.is_active) {
            throw new Error('Business is currently inactive')
          }

          // Validate cart items belong to this business
          const invalidItems = orderItems.filter(item =>
            item.business_id !== businessId
          )

          if (invalidItems.length > 0) {
            throw new Error('Cart contains items from different businesses')
          }

          return true
        },
        {
          operation: 'validate checkout',
          component: 'useCheckout',
          businessId: businessId,
          businessName: cart.business?.name
        }
      )
    }
    // Only depend on businessId and business - validation should only re-run when business changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, business?.id, business?.is_active])

  const checkoutData: CheckoutData = {
    business,
    cartItems: orderItems,
    subtotal,
    total,
    hasItems
  }

  return {
    ...checkoutData,
    isLoading: isLoadingBusiness || isValidating,
    hasError: !!businessError || hasValidationError,
    error: businessError || validationError,

    // Convenience getters
    isEmpty: !hasItems,
    businessId: businessId,
    businessName: cart.business?.name || business?.name,
    isBusinessActive: business?.is_active || false
  }
}