import { useEffect } from 'react'
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
  const { state, getBusinessContext } = useCart()
  const businessContext = getBusinessContext()
  
  // Get business data using the business hook
  const {
    business,
    loading: isLoadingBusiness,
    error: businessError
  } = useBusiness(businessContext.business_id)

  const {
    executeWithErrorHandling,
    isLoading: isValidating,
    hasError: hasValidationError,
    error: validationError
  } = useBusinessErrorHandler()

  // Calculate checkout totals
  const orderItems = state.items
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal

  // Validate checkout data
  useEffect(() => {
    if (businessContext.business_id && business) {
      executeWithErrorHandling(
        async () => {
          // Validate business is active and available for orders
          if (!business.is_active) {
            throw new Error('Business is currently inactive')
          }

          // Validate cart items belong to this business
          const invalidItems = orderItems.filter(item => 
            item.business_id !== businessContext.business_id
          )
          
          if (invalidItems.length > 0) {
            throw new Error('Cart contains items from different businesses')
          }

          return true
        },
        {
          operation: 'validate checkout',
          component: 'useCheckout',
          businessId: businessContext.business_id,
          businessName: businessContext.business_name
        }
      )
    }
  }, [businessContext.business_id, business, orderItems, executeWithErrorHandling])

  const checkoutData: CheckoutData = {
    business,
    cartItems: orderItems,
    subtotal,
    total,
    hasItems: orderItems.length > 0
  }

  return {
    ...checkoutData,
    isLoading: isLoadingBusiness || isValidating,
    hasError: !!businessError || hasValidationError,
    error: businessError || validationError,
    businessContext,

    // Convenience getters
    isEmpty: orderItems.length === 0,
    businessId: businessContext.business_id,
    businessName: businessContext.business_name || business?.name,
    isBusinessActive: business?.is_active || false
  }
}