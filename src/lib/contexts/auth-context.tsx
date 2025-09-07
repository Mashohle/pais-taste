"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Profile types
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
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

export interface ProfileUpdateData {
  full_name?: string | null
  phone?: string | null
  preferred_pickup_location?: string | null
  avatar_url?: string | null
  date_of_birth?: string | null
  address?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  dietary_preferences?: string[] | null
  allergies?: string[] | null
  marketing_emails?: boolean
  sms_notifications?: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  profileLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, userData: { full_name: string; phone: string }) => Promise<{ error: Error | null; user: User | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error: Error | null }>
  updateProfile: (updates: ProfileUpdateData) => Promise<UserProfile | null>
  refreshProfile: () => Promise<void>
  getDisplayName: () => string
  isProfileComplete: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      setProfileLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          await createProfile(userId)
        } else if (error.message?.includes('relation "public.profiles" does not exist')) {
          await createProfile(userId)
        } else {
          throw error
        }
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  // Create new profile for user
  const createProfile = async (userId: string) => {
    try {
      const currentUser = await supabase.auth.getUser()
      if (!currentUser.data.user) throw new Error('No authenticated user')

      const newProfile = {
        id: userId,
        email: currentUser.data.user.email || '',
        full_name: currentUser.data.user.user_metadata?.full_name || '',
        phone: currentUser.data.user.user_metadata?.phone || '',
        preferred_pickup_location: '',
        avatar_url: null,
        date_of_birth: null,
        address: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        dietary_preferences: null,
        allergies: null,
        marketing_emails: true,
        sms_notifications: true
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      if (error) {
        console.log('Cannot create profile (table may not exist):', error.message)
        // Create a minimal profile object from auth user data
        const fallbackProfile = {
          id: userId,
          email: currentUser.data.user.email || '',
          full_name: currentUser.data.user.user_metadata?.full_name || '',
          phone: currentUser.data.user.user_metadata?.phone || '',
          // Set other fields to default values
          preferred_pickup_location: '',
          avatar_url: null,
          date_of_birth: null,
          address: null,
          emergency_contact_name: null,
          emergency_contact_phone: null,
          dietary_preferences: null,
          allergies: null,
          marketing_emails: true,
          sms_notifications: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setProfile(fallbackProfile as UserProfile)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error creating profile:', error)
      setProfile(null)
    }
  }

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Real-time profile updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setProfile(payload.new as UserProfile)
          } else if (payload.eventType === 'DELETE') {
            setProfile(null)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, userData: { full_name: string; phone: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      return { error, user: data.user }
    } catch (error) {
      return { error: error as Error, user: null }
    }
  }

  const signOut = async () => {
    setProfile(null) // Clear profile immediately
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/account`,
        }
      })
      
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const updateProfile = async (updates: ProfileUpdateData): Promise<UserProfile | null> => {
    if (!user) throw new Error('No user found')

    try {
      setProfileLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    } finally {
      setProfileLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

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

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithOAuth,
    updateProfile,
    refreshProfile,
    getDisplayName,
    isProfileComplete
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}