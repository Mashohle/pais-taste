"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

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
  
  const supabase = createClient()

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      setProfileLoading(true)
      console.log('🔍 Fetching profile for userId:', userId)
      
      // Add timeout to prevent hanging
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      )
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      console.log('🔍 Profile fetch result:', { data, error: error?.message, code: error?.code })

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('🔍 Profile not found, creating new profile')
          await createProfile(userId)
        } else if (error.message?.includes('relation "public.profiles" does not exist')) {
          console.log('🔍 Profiles table does not exist, creating fallback profile')
          await createProfile(userId)
        } else {
          console.error('🔍 Unexpected profile fetch error:', error)
          throw error
        }
      } else {
        console.log('🔍 Profile found:', { role: data.role, email: data.email })
        
        // Check if this is a super admin email but has wrong role
        const isSuperAdminEmail = data.email === '414hustlerz@gmail.com' || 
                                  data.email === 'superadmin@sidehusl.com'
        if (isSuperAdminEmail && data.role !== 'super_admin') {
          console.log('🔧 Super admin email detected but wrong role, updating...')
          try {
            const { data: updatedData, error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'super_admin' })
              .eq('id', userId)
              .select()
              .single()
            
            if (updateError) {
              console.error('🔧 Failed to update role:', updateError)
              // Still set the profile but with corrected role
              setProfile({ ...data, role: 'super_admin' })
            } else {
              console.log('🔧 Role updated successfully to super_admin')
              setProfile(updatedData)
            }
          } catch (updateErr) {
            console.error('🔧 Error updating role:', updateErr)
            setProfile({ ...data, role: 'super_admin' })
          }
        } else {
          setProfile(data)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      
      // If it was a timeout, try once more
      if (error instanceof Error && error.message === 'Profile fetch timeout') {
        console.log('🔄 Profile fetch timed out, retrying once...')
        try {
          const { data, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
          
          if (!retryError && data) {
            console.log('🔄 Retry successful:', { role: data.role, email: data.email })
            setProfile(data)
            return
          }
        } catch (retryErr) {
          console.log('🔄 Retry also failed:', retryErr)
        }
      }
      
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  // Create new profile for user
  const createProfile = async (userId: string) => {
    try {
      console.log('🏗️ Creating new profile for userId:', userId)
      const currentUser = await supabase.auth.getUser()
      if (!currentUser.data.user) throw new Error('No authenticated user')

      // Check if this is a super admin email
      const isSuperAdminEmail = currentUser.data.user.email === '414hustlerz@gmail.com' || 
                                currentUser.data.user.email === 'superadmin@sidehusl.com'
      const defaultRole = isSuperAdminEmail ? 'super_admin' : 'customer'

      const newProfile = {
        id: userId,
        email: currentUser.data.user.email || '',
        full_name: currentUser.data.user.user_metadata?.full_name || '',
        phone: currentUser.data.user.user_metadata?.phone || '',
        role: defaultRole,
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

      console.log('🏗️ Creating profile with role:', defaultRole)
      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      if (error) {
        console.log('🏗️ Cannot create profile in database:', error.message)
        // Create a minimal profile object from auth user data
        const fallbackProfile = {
          id: userId,
          email: currentUser.data.user.email || '',
          full_name: currentUser.data.user.user_metadata?.full_name || '',
          phone: currentUser.data.user.user_metadata?.phone || '',
          role: defaultRole, // Include the role in fallback too
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
        console.log('🏗️ Using fallback profile with role:', fallbackProfile.role)
        setProfile(fallbackProfile as UserProfile)
        return
      }

      console.log('🏗️ Profile created successfully:', { role: data.role, email: data.email })
      setProfile(data)
    } catch (error) {
      console.error('Error creating profile:', error)
      setProfile(null)
    }
  }

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      console.log('🚀 Getting initial session...')
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('🚀 Initial session result:', !!session, session?.user?.email, error?.message)
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('🔍 Initial profile fetch for:', session.user.email)
        await fetchProfile(session.user.id)
      } else {
        console.log('❌ No initial session found')
      }
      
      setLoading(false)
      console.log('🏁 Initial session setup complete')
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔥 Auth state change:', event)
        console.log('🔥 Session exists:', !!session)
        console.log('🔥 User:', session?.user?.email)
        console.log('🔥 Current URL:', window.location.href)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('🔍 Fetching profile for user:', session.user.email)
          try {
            await fetchProfile(session.user.id)
            console.log('🏁 Profile fetch complete successfully')
          } catch (error) {
            console.error('🏁 Profile fetch failed:', error)
            // Continue anyway - we still have the user
          }
        } else {
          console.log('❌ No session, clearing profile')
          setProfile(null)
        }
        
        setLoading(false)
        console.log('🏁 Auth loading finished, user:', session?.user?.email || 'none')
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
      console.log('Attempting to sign in with email:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Supabase auth error:', error)
        return { error }
      }
      
      console.log('Sign in successful for user:', data.user?.email)
      
      // Check cookies after successful login
      setTimeout(() => {
        console.log('🍪 Cookies after login:', document.cookie)
        const authCookies = document.cookie.split(';').filter(c => c.includes('sb-'))
        console.log('🍪 Auth cookies:', authCookies)
      }, 1000)
      
      return { error: null }
    } catch (error) {
      console.error('Sign in catch error:', error)
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