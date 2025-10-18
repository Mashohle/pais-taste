import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusinessErrorHandler } from './use-business-error-handler'
import { BusinessData } from './use-business'

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
  
  const {
    executeWithErrorHandling,
    hasError,
    error,
    isLoading
  } = useBusinessErrorHandler()

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

      // Transform database data to component format
      const transformedBusinesses: DirectoryBusiness[] = businessData.map(business => ({
        id: business.id,
        name: business.name,
        slug: business.slug || business.id,
        category: business.business_categories?.name?.toLowerCase() || 'service',
        category_name: business.business_categories?.name || 'Service',
        description: business.description || 'No description available',
        long_description: business.long_description || business.description || '',
        logo_url: business.logo_url,
        rating: 4.5, // TODO: Calculate from reviews
        review_count: Math.floor(Math.random() * 100), // TODO: Get from reviews
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
        is_open: true, // TODO: Calculate based on operating hours
        is_active: business.is_active,
        settings: business.settings,
        business_categories: business.business_categories,
        
        // Directory specific fields
        hours: '9:00 AM - 10:00 PM', // TODO: Get from settings
        delivery_fee: business.settings?.food?.delivery_fee || 0,
        minimum_order: business.settings?.food?.minimum_order || 0,
        price_range: business.settings?.price_range || '$$',
        features: [
          ...(business.settings?.food?.features || []),
          ...(business.settings?.retail?.features || []),
          ...(business.settings?.service?.features || [])
        ].filter(Boolean),
        distance: Math.random() * 10, // TODO: Calculate real distance
        featured: Math.random() > 0.7, // TODO: Get from business settings
        verified: Math.random() > 0.5 // TODO: Get from business verification status
      }))

      setBusinesses(transformedBusinesses)

      // Extract unique cities for filter
      const uniqueCities = Array.from(new Set(
        transformedBusinesses
          .map(b => b.city)
          .filter((city): city is string => Boolean(city))
      ))
      setCities(uniqueCities.sort())
    }

    loadBusinesses()
  }, [executeWithErrorHandling])

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
    setBusinesses([])
    setCategories([])
    setCities([])
    // The useEffect will trigger a new fetch
  }

  return {
    businesses,
    categories,
    cities,
    isLoading,
    hasError,
    error,
    refetch,
    getFilteredBusinesses,
    
    // Stats
    totalBusinesses: businesses.length,
    businessesByCategory: categories.map(cat => ({
      category: cat,
      count: businesses.filter(b => b.category === cat.name?.toLowerCase()).length
    }))
  }
}