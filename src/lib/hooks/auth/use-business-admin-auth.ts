"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

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
  user: User
  profile: UserProfile
  businesses: UserBusiness[]
  isBusinessUser: boolean
}

export function useBusinessAdminAuth() {
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

      console.log('🔍 Business Admin: Fetching combined business profile')

      const response = await fetch('/api/auth/business-profile')

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Business Admin: Not authenticated')
          setData(null)
          return
        }
        throw new Error(`API error: ${response.status}`)
      }

      const profileData = await response.json()
      console.log('✅ Business Admin: Profile loaded:', {
        email: profileData.profile?.email,
        isBusinessUser: profileData.isBusinessUser,
        businessCount: profileData.businesses?.length || 0
      })

      setData(profileData)

      // Set first business as current if available
      if (profileData.businesses?.length > 0) {
        console.log('🏢 Setting current business to:', profileData.businesses[0].name)
        setCurrentBusiness(profileData.businesses[0])
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch business profile'
      console.error('💥 Business Admin: Error:', errorMessage)
      setError(errorMessage)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    fetchBusinessProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

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

  return {
    // Auth state
    user: data?.user || null,
    profile: data?.profile || null,
    session: null, // We don't need session in this hook

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
}
