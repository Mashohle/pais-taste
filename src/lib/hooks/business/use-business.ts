import { useState, useEffect, useCallback } from 'react'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  combo_with: string | null
  combo_price: number | null
  published: boolean
  available: boolean
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

interface Review {
  id: string
  user_id: string
  business_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at?: string
}

interface GalleryItem {
  id: string
  business_id: string
  image_url: string
  caption?: string | null
  display_order?: number
  created_at?: string
}

interface Service {
  id: string
  business_id: string
  name: string
  description: string | null
  price: number
  duration?: number
  available: boolean
  created_at?: string
  updated_at?: string
}

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
  distance?: number | null
  features?: string[]
  // Additional data for business page
  reviews?: Review[]
  menu_items?: MenuItem[]
  gallery?: GalleryItem[]
  services?: Service[]
}

export function useBusiness(businessId: string | null) {
  const [business, setBusiness] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize userLocation from localStorage if available
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userLocation')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return null
        }
      }
    }
    return null
  })

  // Get user location on mount (and save to localStorage)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          }
          setUserLocation(location)
          // Save to localStorage for future page loads
          localStorage.setItem('userLocation', JSON.stringify(location))
        },
        (_error) => {
          console.log('Location access denied or unavailable:', _error)
        }
      )
    }
  }, [])

  const fetchBusiness = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let url = `/api/customer/business/${businessId}`
      if (userLocation) {
        url += `?lat=${userLocation.lat}&lon=${userLocation.lon}`
      }

      const response = await fetch(url)
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
  }, [businessId, userLocation])

  useEffect(() => {
    if (!businessId) {
      setBusiness(null)
      setLoading(false)
      return
    }

    fetchBusiness()
  }, [businessId, userLocation, fetchBusiness])

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