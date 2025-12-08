"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

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

interface BusinessDataContextType {
  businesses: Business[]
  categories: BusinessCategory[]
  loading: boolean
  categoriesLoading: boolean
  error: string | null
  refreshBusinesses: () => Promise<void>
  refreshCategories: () => Promise<void>
}

const BusinessDataContext = createContext<BusinessDataContextType | undefined>(undefined)

export function BusinessDataProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<BusinessCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Fetch categories
  const refreshCategories = useCallback(async () => {
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

  // Fetch businesses
  const refreshBusinesses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/customer/businesses')

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

  // Initial load only once
  useEffect(() => {
    if (!initialized) {
      refreshCategories()
      refreshBusinesses()
      setInitialized(true)
    }
  }, [initialized, refreshCategories, refreshBusinesses])

  return (
    <BusinessDataContext.Provider
      value={{
        businesses,
        categories,
        loading,
        categoriesLoading,
        error,
        refreshBusinesses,
        refreshCategories,
      }}
    >
      {children}
    </BusinessDataContext.Provider>
  )
}

export function useBusinessData() {
  const context = useContext(BusinessDataContext)
  if (context === undefined) {
    throw new Error('useBusinessData must be used within a BusinessDataProvider')
  }
  return context
}
