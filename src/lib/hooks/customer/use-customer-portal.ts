import { useState, useEffect, useCallback } from 'react'

interface BusinessCategory {
  id: string
  name: string
  icon: string
  color: string
  description?: string
  count: number
}

interface Business {
  id: string
  name: string
  description: string
  slug: string
  address: string
  city?: string
  phone?: string
  website?: string
  logo_url?: string
  primary_color: string
  category: {
    id: string
    name: string
    icon: string
    color: string
  }
  rating: number
  review_count: number
  is_featured: boolean
  is_open?: boolean
  distance?: number | null
  opening_hours?: {
    [key: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }
  created_at: string
}

interface BusinessFilters {
  category?: string
  search?: string
  limit?: number
  offset?: number
}

export function useCustomerPortal() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<BusinessCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
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

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch('/api/customer/categories')

      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const data = await response.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  // Fetch businesses with filters
  const fetchBusinesses = useCallback(async (filters: BusinessFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      if (filters.category) searchParams.append('category', filters.category)
      if (filters.search) searchParams.append('search', filters.search)
      if (filters.limit) searchParams.append('limit', filters.limit.toString())
      if (filters.offset) searchParams.append('offset', filters.offset.toString())
      if (userLocation) {
        searchParams.append('lat', userLocation.lat.toString())
        searchParams.append('lon', userLocation.lon.toString())
      }

      const response = await fetch(`/api/customer/businesses?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch businesses')
      }

      const data = await response.json()
      setBusinesses(data.businesses || [])
    } catch (err) {
      console.error('Error fetching businesses:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch businesses')
    } finally {
      setLoading(false)
    }
  }, [userLocation])

  // Search businesses
  const searchBusinesses = useCallback((searchTerm: string, category?: string) => {
    fetchBusinesses({
      search: searchTerm || undefined,
      category: category || undefined,
      limit: 20
    })
  }, [fetchBusinesses])

  // Filter by category (using category ID)
  const filterByCategory = useCallback((categoryId: string | null) => {
    fetchBusinesses({
      category: categoryId || undefined,
      limit: 20
    })
  }, [fetchBusinesses])

  // Request user location
  const requestLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          }
          setUserLocation(location)
          localStorage.setItem('userLocation', JSON.stringify(location))
        },
        () => {
          // Use default location (Johannesburg) if geolocation fails
          const defaultLocation = {
            lat: -26.2041,
            lon: 28.0473
          }
          setUserLocation(defaultLocation)
          localStorage.setItem('userLocation', JSON.stringify(defaultLocation))
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        }
      )
    }
  }, [])

  // Request location on mount
  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Fetch businesses on mount and when user location changes
  useEffect(() => {
    fetchBusinesses({ limit: 20 })
  }, [fetchBusinesses]) // fetchBusinesses already depends on userLocation, so it will refetch when location changes

  return {
    businesses,
    categories,
    loading,
    categoriesLoading,
    error,
    userLocation,
    fetchBusinesses,
    searchBusinesses,
    filterByCategory,
    requestLocation,
    refreshData: () => {
      fetchCategories()
      fetchBusinesses({ limit: 20 })
    }
  }
}