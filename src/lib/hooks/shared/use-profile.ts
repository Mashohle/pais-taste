"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'

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
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const { user, profile, refreshProfile } = useAuth()

  const updateProfile = async (updates: ProfileUpdateData) => {
    if (!user) throw new Error('No user found')

    try {
      setUpdating(true)
      setError(null)

      console.log('🔄 Profile Hook: Updating profile via API')

      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      console.log('✅ Profile Hook: Profile updated successfully')

      // Refresh the profile in auth context
      await refreshProfile()

      return data.profile
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      console.error('💥 Profile Hook: Update error:', errorMessage)
      setError(errorMessage)
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

      console.log('📸 Profile Hook: Uploading avatar via API')

      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/auth/profile/avatar', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar')
      }

      console.log('✅ Profile Hook: Avatar uploaded successfully')

      // Refresh the profile in auth context
      await refreshProfile()

      return data.avatar_url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar'
      console.error('💥 Profile Hook: Avatar upload error:', errorMessage)
      setError(errorMessage)
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

      console.log('🗑️ Profile Hook: Deleting avatar via API')

      const response = await fetch('/api/auth/profile/avatar', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete avatar')
      }

      console.log('✅ Profile Hook: Avatar deleted successfully')

      // Refresh the profile in auth context
      await refreshProfile()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete avatar'
      console.error('💥 Profile Hook: Avatar delete error:', errorMessage)
      setError(errorMessage)
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

  // Use profile from auth context instead of fetching separately
  return {
    profile,
    error,
    updating,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    refetch: refreshProfile,
    getDisplayName,
    getContactInfo,
    isProfileComplete,
    getMissingFields
  }
}