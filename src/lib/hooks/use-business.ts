import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusinessErrorHandler } from './use-business-error-handler'

export interface BusinessData {
  id: string
  name: string
  slug: string
  category: string
  category_name: string
  description: string
  long_description?: string
  logo_url: string | null
  rating?: number
  review_count?: number
  address: string
  city: string | null
  province: string | null
  coordinates?: { lat: number; lng: number }
  phone: string | null
  website: string | null
  email: string | null
  is_open: boolean
  is_active: boolean
  settings?: Record<string, unknown>
  business_categories?: {
    id: string
    name: string
    description: string
    icon: string
    color: string
  }
  // Computed fields
  hours?: string
  delivery_fee?: number
  minimum_order?: number
  price_range?: string
  features?: string[]
}

export function useBusiness(businessId: string | null) {
  const [business, setBusiness] = useState<BusinessData | null>(null)
  const {
    executeWithErrorHandling,
    validateBusinessData,
    hasError,
    error,
    isLoading,
    clearError
  } = useBusinessErrorHandler()

  useEffect(() => {
    if (!businessId) {
      setBusiness(null)
      clearError()
      return
    }

    const fetchBusiness = async () => {
      const businessData = await executeWithErrorHandling(
        async () => {
          // Check if businessId looks like a UUID or slug
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(businessId)
          
          let query = supabase
            .from('businesses')
            .select(`
              *,
              business_categories (
                id,
                name,
                description,
                icon,
                color
              )
            `)
            .eq('is_active', true)
          
          if (isUUID) {
            query = query.eq('id', businessId)
          } else {
            query = query.eq('slug', businessId)
          }

          const { data, error } = await query.single()

          if (error) throw error
          if (!data) throw new Error('Business not found')

          return data
        },
        {
          operation: 'fetch business',
          component: 'useBusiness',
          businessId,
          businessName: businessId
        }
      )

      if (!businessData) return

      // Validate business data
      const isValid = validateBusinessData(businessData, {
        operation: 'validate business data',
        component: 'useBusiness',
        businessId: businessData.id,
        businessName: businessData.name
      })

      if (!isValid) return

      // Transform and set business data
      const transformedBusiness: BusinessData = {
        id: businessData.id,
        name: businessData.name,
        slug: businessData.slug || businessData.id,
        category: businessData.business_categories?.name?.toLowerCase() || 'service',
        category_name: businessData.business_categories?.name || 'Service',
        description: businessData.description || '',
        long_description: businessData.long_description || businessData.description || '',
        logo_url: businessData.logo_url,
        rating: 4.5, // TODO: Calculate from reviews
        review_count: 0, // TODO: Count from reviews table
        address: [
          businessData.address_line1,
          businessData.address_line2,
          businessData.city,
          businessData.state
        ].filter(Boolean).join(', '),
        city: businessData.city,
        province: businessData.state,
        phone: businessData.phone,
        website: businessData.website,
        email: businessData.email,
        is_open: true, // TODO: Calculate based on operating hours
        is_active: businessData.is_active,
        settings: businessData.settings,
        business_categories: businessData.business_categories,
        // Computed fields
        hours: '9:00 AM - 10:00 PM', // TODO: Get from settings
        delivery_fee: businessData.settings?.food?.delivery_fee || 0,
        minimum_order: businessData.settings?.food?.minimum_order || 0,
        price_range: businessData.settings?.price_range || '$$',
        features: [
          ...(businessData.settings?.food?.features || []),
          ...(businessData.settings?.retail?.features || []),
          ...(businessData.settings?.service?.features || [])
        ].filter(Boolean)
      }

      setBusiness(transformedBusiness)
    }

    fetchBusiness()
  }, [businessId, executeWithErrorHandling, validateBusinessData, clearError])

  const refetch = () => {
    if (businessId) {
      clearError()
      // Trigger re-fetch by clearing business first
      setBusiness(null)
      // The useEffect will trigger a new fetch
    }
  }

  return {
    business,
    isLoading,
    hasError,
    error,
    refetch,
    
    // Convenience getters
    businessId: business?.id || null,
    businessName: business?.name || null,
    businessCategory: business?.category || null,
    isBusinessActive: business?.is_active || false,
    isBusinessOpen: business?.is_open || false
  }
}

// Hook for fetching multiple businesses by IDs
export function useBusinesses(businessIds: string[]) {
  const [businesses, setBusinesses] = useState<BusinessData[]>([])
  const {
    executeWithErrorHandling,
    hasError,
    error,
    isLoading
  } = useBusinessErrorHandler()

  useEffect(() => {
    if (businessIds.length === 0) {
      setBusinesses([])
      return
    }

    const fetchBusinesses = async () => {
      const businessesData = await executeWithErrorHandling(
        async () => {
          const { data, error } = await supabase
            .from('businesses')
            .select(`
              *,
              business_categories (
                id,
                name,
                description,
                icon,
                color
              )
            `)
            .in('id', businessIds)
            .eq('is_active', true)

          if (error) throw error
          return data || []
        },
        {
          operation: 'fetch multiple businesses',
          component: 'useBusinesses'
        }
      )

      if (!businessesData) return

      const transformedBusinesses = businessesData.map(businessData => ({
        id: businessData.id,
        name: businessData.name,
        slug: businessData.slug || businessData.id,
        category: businessData.business_categories?.name?.toLowerCase() || 'service',
        category_name: businessData.business_categories?.name || 'Service',
        description: businessData.description || '',
        logo_url: businessData.logo_url,
        rating: 4.5,
        review_count: 0,
        address: [
          businessData.address_line1,
          businessData.address_line2,
          businessData.city,
          businessData.state
        ].filter(Boolean).join(', '),
        city: businessData.city,
        province: businessData.state,
        phone: businessData.phone,
        website: businessData.website,
        email: businessData.email,
        is_open: true,
        is_active: businessData.is_active,
        settings: businessData.settings,
        business_categories: businessData.business_categories,
        features: []
      }))

      setBusinesses(transformedBusinesses)
    }

    fetchBusinesses()
  }, [businessIds, executeWithErrorHandling])

  return {
    businesses,
    isLoading,
    hasError,
    error
  }
}