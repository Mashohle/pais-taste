// lib/hooks/useProfile.ts
"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/contexts/auth-context'

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

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const { user } = useAuth()

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          await createProfile()
          return
        }
        throw profileError
      }

      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async () => {
    if (!user) throw new Error('No user found')

    try {
      const newProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
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

      const { data, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      if (createError) throw createError

      setProfile(data)
    } catch (err) {
      setError(err.message || 'Failed to create profile')
      throw err
    }
  }

  const updateProfile = async (updates: ProfileUpdateData) => {
    if (!user) throw new Error('No user found')

    try {
      setUpdating(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setProfile(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    } finally {
      setUpdating(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('No user found')

    try {
      setUpdating(true)
      setError(null)

      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl })

      return publicUrl
    } catch (err) {
      setError(err.message || 'Failed to upload avatar')
      throw err
    } finally {
      setUpdating(false)
    }
  }

  const deleteAvatar = async () => {
    if (!user || !profile?.avatar_url) return

    try {
      setUpdating(true)
      setError(null)

      // Extract file path from URL
      const urlParts = profile.avatar_url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `avatars/${fileName}`

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove([filePath])

      if (deleteError) {
        console.warn('Failed to delete avatar from storage:', deleteError)
        // Continue anyway to remove from profile
      }

      // Update profile to remove avatar URL
      await updateProfile({ avatar_url: null })
    } catch (err) {
      setError(err.message || 'Failed to delete avatar')
      throw err
    } finally {
      setUpdating(false)
    }
  }

  const getDisplayName = () => {
    if (!profile) return 'User'
    
    if (profile.full_name) return profile.full_name
    if (profile.email) return profile.email.split('@')[0]
    return 'User'
  }

  const getContactInfo = () => {
    if (!profile) return { email: '', phone: '' }
    
    return {
      email: profile.email || '',
      phone: profile.phone || 'Not provided'
    }
  }

  const isProfileComplete = () => {
    if (!profile) return false
    
    return !!(
      profile.full_name &&
      profile.phone &&
      profile.preferred_pickup_location
    )
  }

  const getMissingFields = () => {
    if (!profile) return ['Full profile']
    
    const missing: string[] = []
    
    if (!profile.full_name) missing.push('Full name')
    if (!profile.phone) missing.push('Phone number')
    if (!profile.preferred_pickup_location) missing.push('Preferred pickup location')
    
    return missing
  }

  // Real-time subscription for profile changes
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

  // Fetch profile on user change
  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  return {
    profile,
    loading,
    error,
    updating,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    refetch: fetchProfile,
    getDisplayName,
    getContactInfo,
    isProfileComplete,
    getMissingFields
  }
}