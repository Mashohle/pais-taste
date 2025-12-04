"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role_id: string
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

interface AuthContextType {
  // State
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  profileLoading: boolean

  // Actions
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>

  // Helper functions
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isBusinessUser: boolean
  getDisplayName: () => string
  isProfileComplete: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // State
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const supabase = createClient()

  // Fetch user profile via API - simple and reliable
  const fetchProfile = async () => {
    try {
      setProfileLoading(true)
      console.log('🔍 API: Fetching user profile')

      const response = await fetch('/api/auth/profile')

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ API: Not authenticated')
          setProfile(null)
          setSession(null)
          setUser(null)
          return
        }
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ API: Profile fetched successfully:', data.profile?.role_id)

      setSession(data.session)
      setUser(data.user)
      setProfile(data.profile)

    } catch (error) {
      console.error('💥 API: Profile fetch error:', error)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      console.log('🚀 Initializing auth...')

      // Get initial session from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🚀 Initial session:', !!session, session?.user?.email)

      if (session?.user) {
        // If we have a session, fetch the profile from API
        await fetchProfile()
      } else {
        console.log('❌ No initial session')
        setSession(null)
        setUser(null)
        setProfile(null)
      }

      setLoading(false)
      console.log('🏁 Auth initialization complete')
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔥 Auth state change:', event, session?.user?.email)

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔑 User signed in, fetching profile')
          await fetchProfile()
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out, clearing state')
          setSession(null)
          setUser(null)
          setProfile(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed, updating session')
          setSession(session)
          setUser(session.user)
          // Don't refetch profile on token refresh - just update session
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sign out
  const signOut = async () => {
    console.log('👋 Signing out...')
    await supabase.auth.signOut()
    // State will be cleared by the auth listener
  }

  // Refresh profile manually
  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile for:', user.email)
      await fetchProfile()
    } else {
      console.log('🔄 Cannot refresh profile - no user')
    }
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
  const isSuperAdmin = profile?.role_id === 'super-admin'
  const isBusinessUser = profile?.role_id === 'business-owner' || profile?.role_id === 'business-admin'

  const value: AuthContextType = {
    // State
    user,
    session,
    profile,
    loading,
    profileLoading,

    // Actions
    signOut,
    refreshProfile,

    // Computed
    isAuthenticated,
    isSuperAdmin,
    isBusinessUser,
    getDisplayName,
    isProfileComplete,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within an AuthProvider')
  }
  return context
}