"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

// Base auth state that all providers share
export interface BaseAuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

// Base context type
interface BaseAuthContextType extends BaseAuthState {
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refetch: () => Promise<void>
}

const BaseAuthContext = createContext<BaseAuthContextType | undefined>(undefined)

interface BaseAuthProviderProps {
  children: ReactNode
}

export function BaseAuthProvider({ children }: BaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch current auth state
  const fetchAuthState = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current session (secure method)
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (currentSession) {
        // Get user data (secure method)
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        setUser(currentUser)
        setSession(currentSession)
      } else {
        setUser(null)
        setSession(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch auth state'
      setError(errorMessage)
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [supabase.auth])

  // Initialize auth state
  useEffect(() => {
    fetchAuthState()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('🔐 [BaseAuth] Auth state changed:', event)

      if (newSession) {
        setSession(newSession)
        setUser(newSession.user)
      } else {
        setSession(null)
        setUser(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchAuthState, supabase.auth])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setError(null)
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        throw signOutError
      }

      setUser(null)
      setSession(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out'
      setError(errorMessage)
      throw err
    }
  }, [supabase.auth])

  // Refetch auth state
  const refetch = useCallback(async () => {
    await fetchAuthState()
  }, [fetchAuthState])

  const value: BaseAuthContextType = {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user && !!session,
    signOut,
    refetch,
  }

  return (
    <BaseAuthContext.Provider value={value}>
      {children}
    </BaseAuthContext.Provider>
  )
}

// Hook to use base auth
export function useBaseAuth() {
  const context = useContext(BaseAuthContext)
  if (context === undefined) {
    throw new Error('useBaseAuth must be used within a BaseAuthProvider')
  }
  return context
}
