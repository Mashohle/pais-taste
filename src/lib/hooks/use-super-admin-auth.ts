"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface SuperAdminProfile {
  id: string
  email: string
  role: string
  full_name: string | null
}

interface SuperAdminAuthState {
  user: User | null
  profile: SuperAdminProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
}

export function useSuperAdminAuth() {
  const router = useRouter()
  const supabase = createClient()

  const [state, setState] = useState<SuperAdminAuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isSuperAdmin: false
  })

  const updateState = (updates: Partial<SuperAdminAuthState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const checkSuperAdminAccess = async (user: User): Promise<SuperAdminProfile | null> => {
    try {
      // First check if email is a known super admin
      const isSuperAdminEmail = user.email === '414hustlerz@gmail.com' ||
                                user.email === 'superadmin@sidehusl.com'

      if (!isSuperAdminEmail) {
        console.log('❌ Not a super admin email:', user.email)
        return null
      }

      // Try to get profile from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, role, full_name')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('🏗️ Creating super admin profile')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            role: 'super_admin',
            full_name: user.user_metadata?.full_name || null
          })
          .select('id, email, role, full_name')
          .single()

        if (createError) {
          // Database might not exist, create minimal profile
          return {
            id: user.id,
            email: user.email || '',
            role: 'super_admin',
            full_name: user.user_metadata?.full_name || null
          }
        }

        return newProfile
      }

      if (error) {
        console.error('Profile fetch error:', error)
        // Fallback: create minimal profile for known super admin
        return {
          id: user.id,
          email: user.email || '',
          role: 'super_admin',
          full_name: user.user_metadata?.full_name || null
        }
      }

      // Update role if needed
      if (profile.role !== 'super_admin') {
        console.log('🔧 Updating role to super_admin')
        await supabase
          .from('profiles')
          .update({ role: 'super_admin' })
          .eq('id', user.id)

        profile.role = 'super_admin'
      }

      return profile
    } catch (error) {
      console.error('Super admin check failed:', error)
      return null
    }
  }

  const signIn = async (email: string, password: string) => {
    updateState({ loading: true, error: null })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        updateState({ error: error.message, loading: false })
        return { success: false, error: error.message }
      }

      if (!data.user) {
        updateState({ error: 'Sign in failed', loading: false })
        return { success: false, error: 'Sign in failed' }
      }

      // Don't wait for profile check here - let the auth state change handle it
      return { success: true, error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed'
      updateState({ error: message, loading: false })
      return { success: false, error: message }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Handle auth state changes
  useEffect(() => {
    let mounted = true

    const handleAuthChange = async (session: Session | null) => {
      if (!mounted) return

      console.log('🔥 Super admin auth change:', !!session, session?.user?.email)

      if (!session?.user) {
        updateState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          isAuthenticated: false,
          isSuperAdmin: false,
          error: null
        })
        return
      }

      updateState({
        user: session.user,
        session,
        isAuthenticated: true,
        loading: true
      })

      // Check super admin access
      const profile = await checkSuperAdminAccess(session.user)

      if (!mounted) return

      const isSuperAdmin = profile?.role === 'super_admin'

      updateState({
        profile,
        isSuperAdmin,
        loading: false,
        error: isSuperAdmin ? null : 'Access denied: Super admin permissions required'
      })
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔥 Auth event:', event)
      handleAuthChange(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return {
    ...state,
    signIn,
    signOut
  }
}