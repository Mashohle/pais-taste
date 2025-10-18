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
  }, [])

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

  // Initial load
  useEffect(() => {
    fetchCategories()
    fetchBusinesses({ limit: 20 })
  }, [fetchCategories, fetchBusinesses])

  return {
    businesses,
    categories,
    loading,
    categoriesLoading,
    error,
    fetchBusinesses,
    searchBusinesses,
    filterByCategory,
    refreshData: () => {
      fetchCategories()
      fetchBusinesses({ limit: 20 })
    }
  }
}