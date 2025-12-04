"use client"

import { useState, useEffect } from 'react'
import { useCustomerAuth } from '@/lib/context/customer-auth-context'

interface SuperAdminAuthState {
  loading: boolean
  error: string | null
  isSuperAdmin: boolean
}

export function useSuperAdminAuth() {
  const { user, profile, session, loading: authLoading, signOut } = useCustomerAuth()

  const [state, setState] = useState<SuperAdminAuthState>({
    loading: true,
    error: null,
    isSuperAdmin: false
  })

  const updateState = (updates: Partial<SuperAdminAuthState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  // Check if current user is super admin
  useEffect(() => {
    let mounted = true

    const checkSuperAdminStatus = () => {
      if (!mounted) return

      console.log('🔥 Super Admin: Auth state change:', !!user, user?.email)

      if (!user || !profile) {
        updateState({
          loading: authLoading,
          isSuperAdmin: false,
          error: !user ? null : 'Profile not found'
        })
        return
      }

      // Check if user has super admin role
      const isSuperAdmin = profile.role_id === 'super-admin'

      console.log('🔍 Super Admin: Role check:', {
        email: user.email,
        role_id: profile.role_id,
        isSuperAdmin
      })

      updateState({
        loading: false,
        isSuperAdmin,
        error: isSuperAdmin ? null : 'Access denied: Super admin permissions required'
      })
    }

    checkSuperAdminStatus()

    return () => {
      mounted = false
    }
  }, [user, profile, authLoading])

  return {
    // Auth state from global context
    user,
    profile,
    session,
    isAuthenticated: !!user && !!session,

    // Super admin specific state
    ...state,

    // Combined loading state
    loading: authLoading || state.loading,

    // Actions
    signOut
  }
}