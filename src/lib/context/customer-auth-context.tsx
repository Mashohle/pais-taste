"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { BaseAuthProvider, useBaseAuth } from './base-auth-context'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: string
  preferred_pickup_location: string | null
  avatar_url: string | null
  date_of_birth: string | null
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  dietary_preferences: string[] | null
  allergies: string[] | null
  marketing_emails: boolean
  sms_notifications: boolean
  created_at: string
  updated_at: string
}

interface CustomerAuthContextType {
  // Base auth state
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null

  // Customer-specific state
  profile: UserProfile | null

  // Computed values
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isBusinessUser: boolean

  // Actions
  signOut: () => Promise<void>
  refetch: () => Promise<void>

  // Helper functions
  getDisplayName: () => string
  isProfileComplete: () => boolean
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined)

interface CustomerAuthProviderProps {
  children: ReactNode
}

function CustomerAuthProviderInner({ children }: CustomerAuthProviderProps) {
  // Get base auth state from BaseAuthProvider
  const baseAuth = useBaseAuth()
  const { user, session, loading: baseLoading, error: baseError } = baseAuth

  // Customer-specific state
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Fetch user profile via API
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    try {
      setProfileLoading(true)
      setProfileError(null)

      const response = await fetch('/api/auth/profile')

      if (!response.ok) {
        if (response.status === 401) {
          setProfile(null)
          return
        }
        throw new Error(`API error: ${response.status}`)
      }

      const profileData = await response.json()
      setProfile(profileData.profile)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile'
      setProfileError(errorMessage)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }, [user])

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setProfile(null)
      setProfileLoading(false)
    }
  }, [user, fetchProfile])

  // Sign out
  const signOut = async () => {
    await baseAuth.signOut()
    setProfile(null)
  }

  // Refetch both base auth and profile
  const refetch = async () => {
    await baseAuth.refetch()
    await fetchProfile()
  }

  // Helper functions
  const getDisplayName = (): string => {
    if (profile?.full_name) return profile.full_name
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const isProfileComplete = (): boolean => {
    if (!profile) return false
    return !!(
      profile.full_name &&
      profile.phone &&
      profile.preferred_pickup_location
    )
  }

  // Computed values
  const isAuthenticated = !!user && !!session
  const isSuperAdmin = profile?.role === 'super_admin'
  const isBusinessUser = profile?.role === 'business_owner' || profile?.role === 'business_admin'

  // Combined loading and error states
  const loading = baseLoading || profileLoading
  const error = baseError || profileError

  const value: CustomerAuthContextType = {
    // Base auth state
    user,
    session,
    loading,
    error,

    // Customer-specific state
    profile,

    // Computed values
    isAuthenticated,
    isSuperAdmin,
    isBusinessUser,

    // Actions
    signOut,
    refetch,

    // Helpers
    getDisplayName,
    isProfileComplete,
  }

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

// Export the full provider with BaseAuthProvider wrapper
export function CustomerAuthProvider({ children }: CustomerAuthProviderProps) {
  return (
    <BaseAuthProvider>
      <CustomerAuthProviderInner>{children}</CustomerAuthProviderInner>
    </BaseAuthProvider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  }
  return context
}
