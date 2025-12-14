"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { BaseAuthProvider, useBaseAuth } from './base-auth-context'

export interface SuperAdminProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  updated_at: string
}

interface SuperAdminAuthContextType {
  // Base auth state
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null

  // Super admin-specific state
  profile: SuperAdminProfile | null

  // Computed values
  isAuthenticated: boolean
  isSuperAdmin: boolean

  // Actions
  signOut: () => Promise<void>
  refetch: () => Promise<void>
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextType | undefined>(undefined)

interface SuperAdminAuthProviderProps {
  children: ReactNode
}

function SuperAdminAuthProviderInner({ children }: SuperAdminAuthProviderProps) {
  // Get base auth state from BaseAuthProvider
  const baseAuth = useBaseAuth()
  const { user, session, loading: baseLoading, error: baseError } = baseAuth

  // Super admin-specific state
  const [profile, setProfile] = useState<SuperAdminProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Fetch super admin profile via API
  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true)
      setProfileError(null)

      const response = await fetch('/api/auth/super-admin-profile')

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch super admin profile'
      setProfileError(errorMessage)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }, []) // No dependencies - stable function

  // Fetch profile when user ID changes (not on every token refresh)
  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    } else {
      setProfile(null)
      setProfileLoading(false)
    }
  }, [user?.id, fetchProfile])

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

  // Computed values
  const isAuthenticated = !!user && !!session
  const isSuperAdmin = profile?.role === 'super-admin'

  // Combined loading and error states
  const loading = baseLoading || profileLoading
  const error = baseError || profileError

  const value: SuperAdminAuthContextType = {
    // Base auth state
    user,
    session,
    loading,
    error,

    // Super admin-specific state
    profile,

    // Computed values
    isAuthenticated,
    isSuperAdmin,

    // Actions
    signOut,
    refetch,
  }

  return (
    <SuperAdminAuthContext.Provider value={value}>
      {children}
    </SuperAdminAuthContext.Provider>
  )
}

// Export the full provider with BaseAuthProvider wrapper
export function SuperAdminAuthProvider({ children }: SuperAdminAuthProviderProps) {
  return (
    <BaseAuthProvider>
      <SuperAdminAuthProviderInner>{children}</SuperAdminAuthProviderInner>
    </BaseAuthProvider>
  )
}

export function useSuperAdminAuth() {
  const context = useContext(SuperAdminAuthContext)
  if (context === undefined) {
    throw new Error('useSuperAdminAuth must be used within a SuperAdminAuthProvider')
  }
  return context
}
