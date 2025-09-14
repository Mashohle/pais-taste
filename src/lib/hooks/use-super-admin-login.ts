"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'

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
  const { signIn, user, profile } = useAuth()
  
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
      console.log('🚀 Super admin already logged in, redirecting to dashboard')
      router.push('/super-admin')
    }
  }, [user, profile, router])

  // Handle error messages from URL parameters
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'insufficient_permissions') {
      setState(prev => ({
        ...prev,
        error: 'Access denied: Super admin permissions required. Your account does not have the necessary permissions to access this portal.'
      }))
    } else if (errorParam === 'wrong_portal') {
      setState(prev => ({
        ...prev,
        error: 'Super admin detected: You were redirected here because your account has super admin permissions. Please use this portal instead of the business admin portal.'
      }))
    }
  }, [searchParams])

  // Update form data
  const updateFormData = (field: keyof SuperAdminLoginFormData, value: string) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
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
      // Sign in the user
      const { error: signInError } = await signIn(state.formData.email, state.formData.password)
      
      if (signInError) {
        throw new Error(signInError.message || 'Login failed')
      }

      // If no error, login was successful
      // The layout component will handle the actual permission check
      router.push('/super-admin')

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