"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBusinessAdminAuth } from '@/lib/context/business-admin-context'

interface AdminLoginState {
  email: string
  password: string
  showPassword: boolean
  error: string
  isLoading: boolean
}

export function useAdminLogin() {
  const [formState, setFormState] = useState<AdminLoginState>({
    email: '',
    password: '',
    showPassword: false,
    error: '',
    isLoading: false
  })

  const router = useRouter()
  const { user, hasBusinessAccess, loading: authLoading } = useBusinessAdminAuth()

  // Handle form field updates
  const updateField = (field: keyof AdminLoginState, value: string | boolean) => {
    setFormState(prev => ({ ...prev, [field]: value, error: '' }))
  }

  const setError = (error: string) => {
    setFormState(prev => ({ ...prev, error }))
  }

  const setLoading = (isLoading: boolean) => {
    setFormState(prev => ({ ...prev, isLoading }))
  }

  // Redirect if already logged in AND has business access (wait for loading to complete)
  useEffect(() => {
    // Don't redirect while still loading - wait for complete auth state
    if (authLoading) return

    if (user && hasBusinessAccess) {
      router.push('/admin')
    }
  }, [user, hasBusinessAccess, authLoading, router])


  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        updateField('password', '')
        setLoading(false)
      } else {
        // Check if user has business admin role
        if (data.profile && (data.profile.role_id === 'business-owner' || data.profile.role_id === 'business-admin')) {
          // Now verify they actually have business access by checking the business-profile endpoint
          try {
            const businessProfileResponse = await fetch('/api/auth/business-profile')
            const businessProfileData = await businessProfileResponse.json()

            if (businessProfileData.businesses && businessProfileData.businesses.length > 0) {
              // User has both role AND business access - proceed to admin
              // Use window.location for clean state initialization
              // Keep loading state active - it will show until the new page loads
              window.location.href = '/admin'
            } else {
              // User has the role but no businesses assigned
              setError('No business access found. Contact your business owner to get access.')
              setLoading(false)
            }
          } catch {
            // If business profile check fails, show generic error
            setError('Failed to verify business access. Please try again.')
            setLoading(false)
          }
        } else {
          setError('Access denied: Your account does not have business admin permissions.')
          setLoading(false)
        }
      }
    } catch {
      setError('Network error. Please try again.')
      updateField('password', '')
      setLoading(false)
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    updateField('showPassword', !formState.showPassword)
  }

  return {
    // State
    email: formState.email,
    password: formState.password,
    showPassword: formState.showPassword,
    error: formState.error,
    isLoading: formState.isLoading,

    // Actions
    updateField,
    togglePasswordVisibility,
    handleSubmit,

    // Computed
    canSubmit: !formState.isLoading && formState.email && formState.password
  }
}