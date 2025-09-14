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
  isRedirecting: boolean
  showForgotPassword: boolean
  error: string
  success: string
}

export function useCustomerAuth() {
  const router = useRouter()
  const { user, signIn, signUp, resetPassword, signInWithOAuth } = useAuth()
  
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
    isRedirecting: false,
    showForgotPassword: false,
    error: '',
    success: ''
  })

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setState(prev => ({ ...prev, isRedirecting: true }))
      router.push('/account')
    }
  }, [user, router])

  // Update form data and clear errors
  const updateFormData = (field: keyof CustomerAuthFormData, value: string) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      error: '' // Clear errors when user types
    }))
  }

  // Toggle between login and signup modes
  const toggleAuthMode = () => {
    setState(prev => ({
      ...prev,
      isLogin: !prev.isLogin,
      error: '',
      success: '',
      formData: { name: '', email: '', phone: '', password: '' }
    }))
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setState(prev => ({ ...prev, showPassword: !prev.showPassword }))
  }

  // Toggle forgot password mode
  const toggleForgotPassword = () => {
    setState(prev => ({
      ...prev,
      showForgotPassword: !prev.showForgotPassword,
      error: '',
      success: ''
    }))
  }

  // Set loading state
  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }

  // Set error message
  const setError = (error: string) => {
    setState(prev => ({ ...prev, error, success: '' }))
  }

  // Set success message
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
        // Login with existing auth context
        const { error } = await signIn(state.formData.email, state.formData.password)
        
        if (error) {
          setError(error.message)
        } else {
          router.push('/account')
        }
      } else {
        // Sign up
        const { error, user } = await signUp(state.formData.email, state.formData.password, {
          full_name: state.formData.name,
          phone: state.formData.phone,
        })

        if (error) {
          setError(error.message)
        } else if (user) {
          setSuccess('Account created! Please check your email to verify your account.')
          // Clear form
          setState(prev => ({
            ...prev,
            formData: { name: '', email: '', phone: '', password: '' }
          }))
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
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
      const { error } = await resetPassword(state.formData.email)

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password reset link sent! Check your email.')
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true)
    setError('')

    try {
      const { error } = await signInWithOAuth(provider)

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Social login failed. Please try again.')
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
    isRedirecting: state.isRedirecting,
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
    canSubmit: !state.isLoading && state.formData.email && state.formData.password && 
              (state.isLogin || (state.formData.name && state.formData.phone))
  }
}