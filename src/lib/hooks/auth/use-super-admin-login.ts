"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSuperAdminAuth } from '@/lib/context/super-admin-context'

interface SuperAdminLoginFormData {
  email: string
  password: string
}

interface SuperAdminLoginState {
  formData: SuperAdminLoginFormData
  showPassword: boolean
  isLoading: boolean
  error: string
}

export function useSuperAdminLogin() {
  const router = useRouter()
  const { user, isSuperAdmin, loading: authLoading } = useSuperAdminAuth()

  const [state, setState] = useState<SuperAdminLoginState>({
    formData: {
      email: '',
      password: ''
    },
    showPassword: false,
    isLoading: false,
    error: ''
  })

  // Redirect if already logged in as super admin (wait for loading to complete)
  useEffect(() => {
    // Don't redirect while still loading - wait for complete auth state
    if (authLoading) return

    if (user && isSuperAdmin) {
      router.push('/super-admin')
    }
  }, [user, isSuperAdmin, authLoading, router])

  // Update form data
  const updateFormData = (field: keyof SuperAdminLoginFormData, value: string) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      error: '' // Clear error on input
    }))
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setState(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }))
  }

  // Set loading state
  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }

  // Set error message
  const setError = (error: string) => {
    setState(prev => ({ ...prev, error }))
  }

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
          email: state.formData.email,
          password: state.formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
      } else {
        // Check if user has super admin role
        if (data.profile && data.profile.role_id === 'super-admin') {
          // Now verify they actually have super admin access by checking the super-admin-profile endpoint
          try {
            const superAdminProfileResponse = await fetch('/api/auth/super-admin-profile')
            const superAdminProfileData = await superAdminProfileResponse.json()

            if (superAdminProfileData.profile && superAdminProfileData.profile.role_id === 'super-admin') {
              // User has both role AND super admin access - proceed to super admin
              // Use window.location for clean state initialization
              // Keep loading state active - it will show until the new page loads
              window.location.href = '/super-admin'
            } else {
              // User has the role but profile doesn't confirm
              setError('Access denied: Super admin permissions required.')
              setLoading(false)
            }
          } catch {
            // If super admin profile check fails, show generic error
            setError('Failed to verify super admin access. Please try again.')
            setLoading(false)
          }
        } else {
          setError('Access denied: Super admin permissions required.')
          setLoading(false)
        }
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return {
    // State
    formData: state.formData,
    showPassword: state.showPassword,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    updateFormData,
    togglePasswordVisibility,
    handleSubmit,

    // Computed values
    canSubmit: !state.isLoading && state.formData.email && state.formData.password
  }
}