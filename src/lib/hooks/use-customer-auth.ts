"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'

interface CustomerAuthFormData {
  name: string
  email: string
  phone: string
  password: string
}

interface CustomerAuthState {
  formData: CustomerAuthFormData
  isLogin: boolean
  showPassword: boolean
  isLoading: boolean
  showForgotPassword: boolean
  error: string
  success: string
}

export function useCustomerAuth() {
  const router = useRouter()
  const { user } = useAuth()

  const [state, setState] = useState<CustomerAuthState>({
    formData: {
      name: '',
      email: '',
      phone: '',
      password: ''
    },
    isLogin: true,
    showPassword: false,
    isLoading: false,
    showForgotPassword: false,
    error: '',
    success: ''
  })

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/account')
    }
  }, [user, router])

  const updateFormData = (field: keyof CustomerAuthFormData, value: string) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      error: '', // Clear errors when user types
      success: ''
    }))
  }

  const toggleAuthMode = () => {
    setState(prev => ({
      ...prev,
      isLogin: !prev.isLogin,
      error: '',
      success: '',
      formData: { name: '', email: '', phone: '', password: '' }
    }))
  }

  const togglePasswordVisibility = () => {
    setState(prev => ({ ...prev, showPassword: !prev.showPassword }))
  }

  const toggleForgotPassword = () => {
    setState(prev => ({
      ...prev,
      showForgotPassword: !prev.showForgotPassword,
      error: '',
      success: ''
    }))
  }

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }

  const setError = (error: string) => {
    setState(prev => ({ ...prev, error, success: '' }))
  }

  const setSuccess = (success: string) => {
    setState(prev => ({ ...prev, success, error: '' }))
  }

  // Handle main form submission (login/signup)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (state.isLogin) {
        // Login via API
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
        } else {
          // Success - redirect will happen via useEffect when user state updates
          console.log('✅ Customer login successful')
        }
      } else {
        // Sign up via API
        const response = await fetch('/api/auth/sign-up', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: state.formData.email,
            password: state.formData.password,
            full_name: state.formData.name,
            phone: state.formData.phone
          })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Sign up failed')
        } else {
          setSuccess('Account created! Please check your email to verify your account.')
          setState(prev => ({
            ...prev,
            formData: { name: '', email: '', phone: '', password: '' }
          }))
        }
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle password reset
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.formData.email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email')
      } else {
        setSuccess('Password reset link sent! Check your email.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Social login failed')
      } else if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    formData: state.formData,
    isLogin: state.isLogin,
    showPassword: state.showPassword,
    isLoading: state.isLoading,
    showForgotPassword: state.showForgotPassword,
    error: state.error,
    success: state.success,

    // Actions
    updateFormData,
    toggleAuthMode,
    togglePasswordVisibility,
    toggleForgotPassword,
    handleSubmit,
    handleForgotPassword,
    handleSocialLogin,

    // Computed values
    canSubmit: !state.isLoading &&
               state.formData.email &&
               state.formData.password &&
               (state.isLogin || (state.formData.name && state.formData.phone)),

    // Loading state for redirects
    isRedirecting: !!user
  }
}