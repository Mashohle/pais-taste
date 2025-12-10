import { useState } from 'react'
import { useCart } from '@/lib/context/cart-context'
import { useRouter } from 'next/navigation'

export interface BusinessSwitchOptions {
  confirmSwitch?: boolean
  preserveCart?: boolean
  redirectTo?: string
  showNotification?: boolean
}

export function useBusinessSwitching() {
  const { cart, clearCart } = useCart()
  const [isSwitching, setIsSwitching] = useState(false)
  const router = useRouter()

  const switchToBusinessType = async (
    targetBusinessId: string,
    targetBusinessName?: string,
    options: BusinessSwitchOptions = {}
  ): Promise<boolean> => {
    const {
      confirmSwitch = true,
      preserveCart = false,
      redirectTo
    } = options

    setIsSwitching(true)

    try {
      const currentBusinessId = cart.business?.id

      // If switching to same business, nothing to do
      if (currentBusinessId === targetBusinessId) {
        return true
      }

      // Check if user has items from different business
      const hasConflictingItems = cart.items.length > 0 && currentBusinessId !== targetBusinessId

      // Confirm if needed
      if (hasConflictingItems && confirmSwitch && !preserveCart) {
        const confirmed = window.confirm(
          `You have items from ${cart.business?.name || 'another business'} in your cart. ` +
          `Switching to ${targetBusinessName || 'this business'} will clear your cart. Continue?`
        )

        if (!confirmed) {
          return false
        }
      }

      // Clear cart when switching to different business
      if (hasConflictingItems) {
        await clearCart()
      }

      // Note: Business will be set when user adds first item from new business

      // Redirect if specified
      if (redirectTo) {
        router.push(redirectTo)
      }

      return true
    } catch (error) {
      console.error('Error switching business:', error)
      return false
    } finally {
      setIsSwitching(false)
    }
  }

  const getBusinessTypeFromCategory = (categoryName?: string): string => {
    if (!categoryName) return 'unknown'
    
    const normalized = categoryName.toLowerCase()
    
    if (normalized.includes('food') || normalized.includes('restaurant') || normalized.includes('cafe')) {
      return 'food'
    }
    
    if (normalized.includes('retail') || normalized.includes('shop') || normalized.includes('store')) {
      return 'retail'  
    }
    
    if (normalized.includes('service') || normalized.includes('appointment')) {
      return 'service'
    }
    
    return 'other'
  }

  const getBusinessTypeIcon = (businessType: string): string => {
    switch (businessType) {
      case 'food': return '🍽️'
      case 'retail': return '🛍️'
      case 'service': return '⚙️'
      default: return '🏢'
    }
  }

  const getBusinessTypeColor = (businessType: string): string => {
    switch (businessType) {
      case 'food': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'retail': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'service': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const shouldWarnAboutBusinessSwitch = (targetBusinessId: string): boolean => {
    const currentBusinessId = cart.business?.id
    return cart.items.length > 0 && currentBusinessId !== targetBusinessId
  }

  return {
    switchToBusinessType,
    getBusinessTypeFromCategory,
    getBusinessTypeIcon,
    getBusinessTypeColor,
    shouldWarnAboutBusinessSwitch,
    isSwitching
  }
}