"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'

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

export function useBusinessAdminAuth() {
  const { user, profile, session, loading: authLoading, profileLoading, signOut } = useAuth()

  const [userBusinesses, setUserBusinesses] = useState<UserBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user businesses via API - memoized to prevent infinite loops
  const fetchUserBusinesses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🏢 Business Admin: Fetching user businesses')

      const response = await fetch('/api/auth/businesses')

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Business Admin: Not authenticated for businesses')
          setUserBusinesses([])
          return
        }
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Business Admin: Found', data.businesses?.length || 0, 'businesses')

      setUserBusinesses(data.businesses || [])

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch businesses'
      console.error('💥 Business Admin: Business fetch error:', errorMessage)
      setError(errorMessage)
      setUserBusinesses([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize business data when auth is ready
  useEffect(() => {
    if (!authLoading) {
      if (user && profile && (profile.role_id === 'business-owner' || profile.role_id === 'business-admin')) {
        console.log('🏢 Business Admin: User has business role, fetching businesses')
        fetchUserBusinesses()
      } else {
        console.log('🏢 Business Admin: User is not a business user, clearing business data')
        setUserBusinesses([])
        setLoading(false)
      }
    }
  }, [authLoading, user, profile, fetchUserBusinesses])

  // Computed values
  const isAuthenticated = !!user && !!session
  const isBusinessUser = profile?.role_id === 'business-owner' || profile?.role_id === 'business-admin'
  const hasBusinessAccess = userBusinesses.length > 0

  return {
    // Auth state from global context
    user,
    profile: profile ? {
      id: profile.id,
      email: profile.email,
      role_id: profile.role_id,
      full_name: profile.full_name
    } : null,
    session,

    // Business-specific data
    userBusinesses,

    // Loading states
    loading: authLoading || profileLoading || loading,
    error,

    // Computed values
    isAuthenticated,
    isBusinessUser,
    hasBusinessAccess,

    // Actions
    signOut,
    refetch: fetchUserBusinesses
  }
}