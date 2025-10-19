import { useState } from 'react'
import { useCart } from '@/lib/contexts/cart-context'
import { useRouter } from 'next/navigation'

export interface BusinessSwitchOptions {
  confirmSwitch?: boolean
  preserveCart?: boolean
  redirectTo?: string
  showNotification?: boolean
}

export function useBusinessSwitching() {
  const { setBusiness, state } = useCart()
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
      redirectTo,
      showNotification = true
    } = options

    setIsSwitching(true)

    try {
      const currentBusinessId = state.business?.id

      // If switching to same business, nothing to do
      if (currentBusinessId === targetBusinessId) {
        return true
      }

      // Check if user has items from different business
      const hasConflictingItems = state.items.length > 0 && currentBusinessId !== targetBusinessId

      // Confirm if needed
      if (hasConflictingItems && confirmSwitch && !preserveCart) {
        const confirmed = window.confirm(
          `You have items from ${state.business?.name || 'another business'} in your cart. ` +
          `Switching to ${targetBusinessName || 'this business'} will clear your cart. Continue?`
        )

        if (!confirmed) {
          return false
        }
      }

      // Switch to new business (cart will be cleared if items exist from different business)
      await setBusiness({
        id: targetBusinessId,
        name: targetBusinessName || '',
        slug: targetBusinessId,
        category: 'unknown'
      })

      // Show success notification if requested
      if (showNotification && typeof window !== 'undefined') {
        // You could integrate with a toast library here
        console.log(`Switched to ${targetBusinessName || 'business'}`)
      }

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
    const currentBusinessId = state.business?.id
    return state.items.length > 0 && currentBusinessId !== targetBusinessId
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