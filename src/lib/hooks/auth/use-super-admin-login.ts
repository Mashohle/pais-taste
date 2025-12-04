"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCustomerAuth } from '@/lib/context/customer-auth-context'

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
  const searchParams = useSearchParams()
  const { user, profile, refetch } = useCustomerAuth()

  const [state, setState] = useState<SuperAdminLoginState>({
    formData: {
      email: '',
      password: ''
    },
    showPassword: false,
    isLoading: false,
    error: ''
  })

  // Redirect if already logged in as super admin
  useEffect(() => {
    if (user && profile && profile.role === 'super_admin') {
      console.log('🚀 Super Admin Login: User already super admin, redirecting')
      router.push('/super-admin')
    }
  }, [user, profile, router])

  // Handle error messages from URL parameters
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'insufficient_permissions') {
      setState(prev => ({
        ...prev,
        error: 'Access denied: Super admin permissions required.'
      }))
    }
  }, [searchParams])

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
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Super Admin Login: Attempting sign in via API')

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
        throw new Error(data.error || 'Login failed')
      }

      console.log('✅ Super Admin Login: Sign in successful')

      // Check if user has super admin role and redirect with proper auth sync
      if (data.profile?.role === 'super_admin') {
        console.log('🔀 Super Admin Login: Redirecting to dashboard with auth sync')

        // Refresh profile to ensure auth context is in sync
        await refetch()

        // Small delay to ensure auth context has updated
        setTimeout(() => {
          router.push('/super-admin')
        }, 150)
      } else {
        throw new Error('Access denied: Super admin permissions required')
      }

    } catch (err) {
      console.error('Super admin login error:', err)
      setError(err instanceof Error ? err.message : 'Invalid credentials or insufficient permissions')
    } finally {
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