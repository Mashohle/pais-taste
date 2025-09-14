"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const { signIn, user } = useAuth()

  // Handle form field updates
  const updateField = (field: keyof AdminLoginState, value: string | boolean) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  const setError = (error: string) => {
    setFormState(prev => ({ ...prev, error }))
  }

  const setLoading = (isLoading: boolean) => {
    setFormState(prev => ({ ...prev, isLoading }))
  }

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/admin')
    }
  }, [user, router])

  // Handle permission error messages from URL params
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'insufficient_permissions') {
      setError('Access denied: Your account does not have business admin permissions. Contact your business owner or try the Super Admin portal if you have those permissions.')
    }
  }, [searchParams])

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await signIn(formState.email, formState.password)

      if (signInError) {
        setError(signInError.message)
        updateField('password', '') // Clear password on error
      } else {
        router.push('/admin')
      }
    } catch (err) {
      setError('An unexpected error occurred')
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