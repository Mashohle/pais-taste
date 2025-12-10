"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

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

interface CustomerProfileData {
  user: User
  session: Session
  profile: UserProfile
}

interface CustomerAuthContextType {
  // State
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  error: string | null

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

export function CustomerAuthProvider({ children }: CustomerAuthProviderProps) {
  const [data, setData] = useState<CustomerProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch user profile via API
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/profile')

      if (!response.ok) {
        if (response.status === 401) {
          setData(null)
          return
        }
        throw new Error(`API error: ${response.status}`)
      }

      const profileData = await response.json()
      setData(profileData)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile'
      setError(errorMessage)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      // Get authenticated user from Supabase (secure method)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // If we have a user, fetch the profile from API
        await fetchProfile()
      } else {
        setData(null)
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile()
        } else if (event === 'SIGNED_OUT') {
          setData(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Update session without refetching profile
          if (data) {
            setData({ ...data, session })
          }
        }
      }
    )

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    setData(null)
  }

  // Helper functions
  const getDisplayName = (): string => {
    if (data?.profile?.full_name) return data.profile.full_name
    if (data?.user?.user_metadata?.full_name) return data.user.user_metadata.full_name
    if (data?.user?.email) return data.user.email.split('@')[0]
    return 'User'
  }

  const isProfileComplete = (): boolean => {
    if (!data?.profile) return false
    return !!(
      data.profile.full_name &&
      data.profile.phone &&
      data.profile.preferred_pickup_location
    )
  }

  // Computed values
  const isAuthenticated = !!data?.user && !!data?.session
  const isSuperAdmin = data?.profile?.role === 'super_admin'
  const isBusinessUser = data?.profile?.role === 'business_owner' || data?.profile?.role === 'business_admin'

  const value: CustomerAuthContextType = {
    // State
    user: data?.user || null,
    session: data?.session || null,
    profile: data?.profile || null,
    loading,
    error,

    // Computed values
    isAuthenticated,
    isSuperAdmin,
    isBusinessUser,

    // Actions
    signOut,
    refetch: fetchProfile,

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

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  }
  return context
}
