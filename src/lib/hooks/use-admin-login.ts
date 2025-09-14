"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBusinessAdminAuth } from '@/lib/hooks/use-business-admin-auth'
import { useAuth } from '@/lib/contexts/auth-context'

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
  const searchParams = useSearchParams()
  const { user, hasBusinessAccess } = useBusinessAdminAuth()
  const { refreshProfile } = useAuth()

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

  // Redirect if already logged in AND has business access
  useEffect(() => {
    if (user && hasBusinessAccess) {
      console.log('🔐 Admin Login: User already has business access, redirecting')
      router.push('/admin')
    }
  }, [user, hasBusinessAccess, router])

  // Handle permission error messages from URL params
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'insufficient_permissions') {
      setError('Access denied: Your account does not have business admin permissions.')
    } else if (errorParam === 'no_business_access') {
      setError('No business access found. Contact your business owner to get access.')
    }
  }, [searchParams])

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('🔐 Admin Login: Attempting sign in via API')

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
      } else {
        console.log('✅ Admin Login: Sign in successful')
        console.log('🔍 Admin Login: API Response:', data)

        // Check if user has business access and redirect with proper auth sync
        if (data.profile && (data.profile.role_id === 'business-owner' || data.profile.role_id === 'business-admin')) {
          console.log('🔀 Admin Login: User has business role, redirecting with full page reload for clean state')
          // Use window.location for clean state initialization - most reliable approach
          window.location.href = '/admin'
        } else {
          console.log('❌ Admin Login: Access check failed:', {
            hasProfile: !!data.profile,
            roleId: data.profile?.role_id,
            expectedRoles: ['business-owner', 'business-admin']
          })
          setError('Access denied: Your account does not have business admin permissions.')
        }
      }
    } catch (err) {
      setError('Network error. Please try again.')
      updateField('password', '')
    } finally {
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