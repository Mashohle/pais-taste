import { useEffect, useMemo, useRef } from 'react'
import { useCart } from '@/lib/contexts/cart-context'
import { useBusiness } from '../business/use-business'
import { useBusinessErrorHandler } from '../business/use-business-error-handler'

export interface CheckoutData {
  business: ReturnType<typeof useBusiness>['business'] | null
  cartItems: ReturnType<typeof useCart>['state']['items']
  subtotal: number
  total: number
  hasItems: boolean
}

export function useCheckout() {
  const { state, subtotal, total, hasItems, hasUnavailableItems } = useCart()
  const businessId = state.business?.id || null

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

  // Cart items (only available ones for checkout) - memoized to prevent recreating on every render
  const orderItems = useMemo(
    () => state.items.filter(item => item.is_available),
    [state.items]
  )

  // Track if validation has run to prevent re-running
  const validationRun = useRef(false)
  const lastValidatedBusiness = useRef<string | null>(null)

  // Validate checkout data
  useEffect(() => {
    // Only validate if business changed or first time
    if (businessId && business && lastValidatedBusiness.current !== businessId) {
      lastValidatedBusiness.current = businessId

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
          businessName: state.business?.name
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
    hasUnavailableItems,

    // Convenience getters
    isEmpty: !hasItems,
    businessId: businessId,
    businessName: state.business?.name || business?.name,
    isBusinessActive: business?.is_active || false
  }
}