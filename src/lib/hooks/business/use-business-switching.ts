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
  const { switchBusiness, getBusinessContext, hasItemsFromDifferentBusiness } = useCart()
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
      const currentContext = getBusinessContext()
      
      // If switching to same business, nothing to do
      if (currentContext.business_id === targetBusinessId) {
        return true
      }

      // Check if user has items from different business
      const hasConflictingItems = hasItemsFromDifferentBusiness(targetBusinessId)
      
      // Attempt to switch business
      const success = await switchBusiness(
        targetBusinessId,
        targetBusinessName,
        { 
          preserveItems: preserveCart,
          confirmSwitch: hasConflictingItems && confirmSwitch
        }
      )

      if (success) {
        // Show success notification if requested
        if (showNotification && typeof window !== 'undefined') {
          // You could integrate with a toast library here
          console.log(`Switched to ${targetBusinessName || 'business'}`)
        }

        // Redirect if specified
        if (redirectTo) {
          router.push(redirectTo)
        }
      }

      return success
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
    return hasItemsFromDifferentBusiness(targetBusinessId)
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