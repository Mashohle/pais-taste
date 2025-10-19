import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusinessErrorHandler } from './use-business-error-handler'
import { BusinessData } from './use-business'

// Haversine formula to calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export interface DirectoryFilters {
  searchTerm: string
  selectedCategory: string
  selectedProvince: string
  selectedCity: string
  priceRange: string[]
  minRating: number[]
  maxDistance: number[]
  openNow: boolean
  featuredOnly: boolean
  verifiedOnly: boolean
  sortBy: string
}

export interface DirectoryBusiness extends BusinessData {
  distance?: number
  featured: boolean
  verified: boolean
}

export function useBusinessDirectory() {
  const [businesses, setBusinesses] = useState<DirectoryBusiness[]>([])
  const [categories, setCategories] = useState<{id: string; name: string; description?: string}[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [initialLoading, setInitialLoading] = useState(true)

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

  const {
    executeWithErrorHandling,
    hasError,
    error,
    isLoading: operationLoading
  } = useBusinessErrorHandler()

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
          // Save to localStorage for future page loads
          localStorage.setItem('userLocation', JSON.stringify(location))
        },
        (error) => {
          console.log('Location access denied or unavailable:', error)
          // Continue without location - distance will just be undefined
        }
      )
    }
  }, [])

  // Load businesses from database
  useEffect(() => {
    const loadBusinesses = async () => {
      const businessData = await executeWithErrorHandling(
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
            .eq('is_active', true)
            .order('created_at', { ascending: false })

          if (error) throw error
          return data || []
        },
        {
          operation: 'load businesses directory',
          component: 'useBusinessDirectory'
        }
      )

      if (!businessData) return

      // Helper function to calculate if business is currently open
      const isCurrentlyOpen = (operatingHours: any): boolean => {
        if (!operatingHours) return false

        const now = new Date()
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const today = days[now.getDay()]
        const todayHours = operatingHours[today]

        if (!todayHours || todayHours.closed) return false

        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        return currentTime >= todayHours.open && currentTime <= todayHours.close
      }

      // Transform database data to component format
      const transformedBusinesses: DirectoryBusiness[] = businessData.map(business => {
        const operatingHours = business.settings?.operating_hours
        const isOpen = isCurrentlyOpen(operatingHours)

        // Calculate distance if user location and business coordinates are available
        let distance = undefined
        if (userLocation && business.latitude && business.longitude) {
          distance = calculateDistance(userLocation.lat, userLocation.lon, business.latitude, business.longitude)
        }

        return {
          id: business.id,
          name: business.name,
          slug: business.slug || business.id,
          category: business.business_categories?.id || 'general',
          category_name: business.business_categories?.name || 'General',
          description: business.description || 'No description available',
          long_description: business.long_description || business.description || '',
          logo_url: business.logo_url,
          rating: 4.5, // Temporary hardcoded value matching business detail page
          review_count: 0, // Will be counted from reviews when implemented
          address: [
            business.address_line1,
            business.address_line2,
            business.city,
            business.state
          ].filter(Boolean).join(', '),
          city: business.city || 'Unknown',
          province: business.state || 'Unknown',
          coordinates: business.latitude && business.longitude ? {
            lat: business.latitude,
            lng: business.longitude
          } : undefined,
          phone: business.phone,
          website: business.website,
          email: business.email,
          is_open: isOpen,
          is_active: business.is_active,
          settings: business.settings,
          business_categories: business.business_categories,
          opening_hours: operatingHours,

          // Directory specific fields
          estimated_time: business.settings?.food?.estimated_time ||
                          business.settings?.service?.estimated_time ||
                          '30-45 min',
          delivery_fee: business.settings?.food?.delivery_fee || 0,
          minimum_order: business.settings?.food?.minimum_order || 0,
          price_range: business.settings?.price_range || '$$',
          features: [
            ...(business.settings?.food?.features || []),
            ...(business.settings?.retail?.features || []),
            ...(business.settings?.service?.features || [])
          ].filter(Boolean),
          distance, // Calculated based on user location
          featured: business.is_featured || false,
          verified: business.is_verified || false
        }
      })

      setBusinesses(transformedBusinesses)

      // Extract unique cities for filter
      const uniqueCities = Array.from(new Set(
        transformedBusinesses
          .map(b => b.city)
          .filter((city): city is string => Boolean(city))
      ))
      setCities(uniqueCities.sort())
      setInitialLoading(false)
    }

    loadBusinesses()
  }, [executeWithErrorHandling, userLocation])

  // Load business categories
  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await executeWithErrorHandling(
        async () => {
          const { data, error } = await supabase
            .from('business_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })

          if (error) throw error
          return data || []
        },
        {
          operation: 'load business categories',
          component: 'useBusinessDirectory'
        }
      )

      if (categoriesData) {
        setCategories(categoriesData)
      }
    }

    loadCategories()
  }, [executeWithErrorHandling])

  // Filter and sort businesses
  const getFilteredBusinesses = (filters: DirectoryFilters) => {
      const filtered = businesses.filter(business => {
        // Search filter
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase()
          const matchesSearch = 
            business.name.toLowerCase().includes(searchLower) ||
            business.description.toLowerCase().includes(searchLower) ||
            business.category_name.toLowerCase().includes(searchLower)
          if (!matchesSearch) return false
        }

        // Category filter
        if (filters.selectedCategory !== 'all' && business.category !== filters.selectedCategory) {
          return false
        }

        // Province filter
        if (filters.selectedProvince !== 'All Provinces' && business.province !== filters.selectedProvince) {
          return false
        }

        // City filter
        if (filters.selectedCity && business.city !== filters.selectedCity) {
          return false
        }

        // Price range filter
        if (filters.priceRange.length > 0 && !filters.priceRange.includes(business.price_range || '')) {
          return false
        }

        // Rating filter
        if (filters.minRating[0] > 0 && (business.rating || 0) < filters.minRating[0]) {
          return false
        }

        // Distance filter
        if (filters.maxDistance[0] < 50 && (business.distance || 0) > filters.maxDistance[0]) {
          return false
        }

        // Open now filter
        if (filters.openNow && !business.is_open) {
          return false
        }

        // Featured only filter
        if (filters.featuredOnly && !business.featured) {
          return false
        }

        // Verified only filter
        if (filters.verifiedOnly && !business.verified) {
          return false
        }

        return true
      })

      // Sort businesses
      switch (filters.sortBy) {
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
          break
        case 'distance':
          filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0))
          break
        case 'price_low':
          filtered.sort((a, b) => {
            const priceOrder = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 }
            return (priceOrder[a.price_range as keyof typeof priceOrder] || 2) - 
                   (priceOrder[b.price_range as keyof typeof priceOrder] || 2)
          })
          break
        case 'price_high':
          filtered.sort((a, b) => {
            const priceOrder = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 }
            return (priceOrder[b.price_range as keyof typeof priceOrder] || 2) - 
                   (priceOrder[a.price_range as keyof typeof priceOrder] || 2)
          })
          break
        case 'newest':
          // Already sorted by created_at desc from database
          break
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'relevance':
        default:
          // Featured first, then by rating
          filtered.sort((a, b) => {
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            return (b.rating || 0) - (a.rating || 0)
          })
          break
      }

      return filtered
  }

  const refetch = async () => {
    setInitialLoading(true)
    setBusinesses([])
    setCategories([])
    setCities([])
    // The useEffect will trigger a new fetch
  }

  // Request location on mount
  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  return {
    businesses,
    categories,
    cities,
    isLoading: initialLoading || operationLoading,
    hasError,
    error,
    userLocation,
    requestLocation,
    refetch,
    getFilteredBusinesses,

    // Stats
    totalBusinesses: businesses.length,
    businessesByCategory: categories.map(cat => ({
      category: cat,
      count: businesses.filter(b => b.category === cat.id).length
    }))
  }
}