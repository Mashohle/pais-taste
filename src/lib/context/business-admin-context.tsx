"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserBusiness {
  id: string
  name: string
  slug: string
  role: 'owner' | 'admin' | 'staff' | 'viewer'
  is_active: boolean
  permissions: Record<string, unknown>
  business: {
    id: string
    name: string
    slug: string
    is_active: boolean
    business_categories?: {
      id: string
      name: string
      icon: string
      color?: string
    }
  }
}

interface UserProfile {
  id: string
  email: string
  role_id: string
  full_name: string | null
}

interface BusinessProfileData {
  user: any
  profile: UserProfile
  businesses: UserBusiness[]
  isBusinessUser: boolean
}

interface BusinessAdminContextType {
  // Auth state
  user: any
  profile: UserProfile | null
  session: null

  // Business-specific data
  userBusinesses: UserBusiness[]
  currentBusiness: UserBusiness | null

  // Loading states
  loading: boolean
  error: string | null

  // Computed values
  isAuthenticated: boolean
  isBusinessUser: boolean
  hasBusinessAccess: boolean

  // Actions
  signOut: () => Promise<void>
  refetch: () => Promise<void>
  setCurrentBusiness: (business: UserBusiness | null) => void
}

const BusinessAdminContext = createContext<BusinessAdminContextType | undefined>(undefined)

export function BusinessAdminProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BusinessProfileData | null>(null)
  const [currentBusiness, setCurrentBusiness] = useState<UserBusiness | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch combined business profile (user + profile + businesses in one call)
  const fetchBusinessProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/business-profile')

      if (!response.ok) {
        if (response.status === 401) {
          setData(null)
          return
        }
        throw new Error(`API error: ${response.status}`)
      }

      const profileData = await response.json()
      setData(profileData)

      // Set first business as current if available
      if (profileData.businesses?.length > 0) {
        setCurrentBusiness(profileData.businesses[0])
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch business profile'
      setError(errorMessage)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    fetchBusinessProfile()
  }, [fetchBusinessProfile])

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut()
    setData(null)
    setCurrentBusiness(null)
  }

  // Computed values
  const isAuthenticated = !!data?.user
  const isBusinessUser = data?.isBusinessUser || false
  const hasBusinessAccess = (data?.businesses?.length || 0) > 0

  const value: BusinessAdminContextType = {
    // Auth state
    user: data?.user || null,
    profile: data?.profile || null,
    session: null,

    // Business-specific data
    userBusinesses: data?.businesses || [],
    currentBusiness,

    // Loading states
    loading,
    error,

    // Computed values
    isAuthenticated,
    isBusinessUser,
    hasBusinessAccess,

    // Actions
    signOut,
    refetch: fetchBusinessProfile,
    setCurrentBusiness
  }

  return (
    <BusinessAdminContext.Provider value={value}>
      {children}
    </BusinessAdminContext.Provider>
  )
}

export function useBusinessAdminAuth() {
  const context = useContext(BusinessAdminContext)
  if (context === undefined) {
    throw new Error('useBusinessAdminAuth must be used within a BusinessAdminProvider')
  }
  return context
}
