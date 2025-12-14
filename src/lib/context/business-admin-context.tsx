"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { BaseAuthProvider, useBaseAuth } from './base-auth-context'

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
    description?: string | null
    email?: string | null
    phone?: string | null
    website?: string | null
    address_line1?: string | null
    address_line2?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string
    currency?: string
    timezone?: string
    logo_url?: string | null
    primary_color?: string
    accent_color?: string
    is_active: boolean
    settings?: Record<string, unknown>
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
  user: User
  profile: UserProfile
  businesses: UserBusiness[]
  isBusinessUser: boolean
}

interface BusinessAdminContextType {
  // Base auth state
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null

  // Business-specific state
  profile: UserProfile | null
  userBusinesses: UserBusiness[]
  currentBusiness: UserBusiness | null

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

function BusinessAdminProviderInner({ children }: { children: ReactNode }) {
  // Get base auth state from BaseAuthProvider
  const baseAuth = useBaseAuth()
  const { user, session, loading: baseLoading, error: baseError } = baseAuth

  // Business-specific state
  const [data, setData] = useState<BusinessProfileData | null>(null)
  const [currentBusiness, setCurrentBusiness] = useState<UserBusiness | null>(null)
  const [profileLoading, setProfileLoading] = useState(true) // Start as true to prevent flash
  const [profileError, setProfileError] = useState<string | null>(null)

  // Fetch combined business profile (profile + businesses via API)
  const fetchBusinessProfile = useCallback(async () => {
    if (!user) {
      setData(null)
      setProfileLoading(false)
      return
    }

    try {
      setProfileLoading(true)
      setProfileError(null)

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
      setProfileError(errorMessage)
      setData(null)
    } finally {
      setProfileLoading(false)
    }
  }, [user])

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      fetchBusinessProfile()
    } else {
      setData(null)
      setProfileLoading(false)
    }
  }, [user, fetchBusinessProfile])

  // Sign out
  const signOut = async () => {
    await baseAuth.signOut()
    setData(null)
    setCurrentBusiness(null)
  }

  // Refetch both base auth and business profile
  const refetch = async () => {
    await baseAuth.refetch()
    await fetchBusinessProfile()
  }

  // Computed values
  const isAuthenticated = !!user && !!session
  const isBusinessUser = data?.isBusinessUser || false
  const hasBusinessAccess = (data?.businesses?.length || 0) > 0

  // Combined loading and error states
  const loading = baseLoading || profileLoading
  const error = baseError || profileError

  const value: BusinessAdminContextType = {
    // Base auth state
    user,
    session,
    loading,
    error,

    // Business-specific state
    profile: data?.profile || null,
    userBusinesses: data?.businesses || [],
    currentBusiness,

    // Computed values
    isAuthenticated,
    isBusinessUser,
    hasBusinessAccess,

    // Actions
    signOut,
    refetch,
    setCurrentBusiness,
  }

  return (
    <BusinessAdminContext.Provider value={value}>
      {children}
    </BusinessAdminContext.Provider>
  )
}

// Export the full provider with BaseAuthProvider wrapper
export function BusinessAdminProvider({ children }: { children: ReactNode }) {
  return (
    <BaseAuthProvider>
      <BusinessAdminProviderInner>{children}</BusinessAdminProviderInner>
    </BaseAuthProvider>
  )
}

export function useBusinessAdminAuth() {
  const context = useContext(BusinessAdminContext)
  if (context === undefined) {
    throw new Error('useBusinessAdminAuth must be used within a BusinessAdminProvider')
  }
  return context
}
