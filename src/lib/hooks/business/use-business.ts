import { useState, useEffect } from 'react'

export interface BusinessData {
  id: string
  name: string
  slug: string
  description: string
  long_description?: string
  logo_url: string | null
  rating?: number
  review_count?: number
  address: string
  city: string | null
  province: string | null
  phone: string | null
  website: string | null
  email: string | null
  is_open: boolean
  status_text?: string
  is_active: boolean
  settings?: Record<string, unknown>
  category?: {
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
  // Additional data for business page
  reviews?: any[]
  menu_items?: any[]
  gallery?: any[]
  services?: any[]
}

export function useBusiness(businessId: string | null) {
  const [business, setBusiness] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!businessId) {
      setBusiness(null)
      setLoading(false)
      return
    }

    fetchBusiness()
  }, [businessId])

  async function fetchBusiness() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/customer/business/${businessId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch business')
      }

      setBusiness(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch business')
      setBusiness(null)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    if (businessId) {
      fetchBusiness()
    }
  }

  return {
    business,
    loading,
    error,
    refetch,

    // Convenience getters
    businessId: business?.id || null,
    businessName: business?.name || null,
    businessCategory: business?.category?.name || null,
    isBusinessActive: business?.is_active || false,
    isBusinessOpen: business?.is_open || false
  }
}