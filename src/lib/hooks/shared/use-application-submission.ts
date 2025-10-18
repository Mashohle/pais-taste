import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SubmissionState {
  isSubmitting: boolean
  submitSuccess: boolean
  submitError: string
}

interface ApplicationData {
  business_name: string
  business_category: string
  business_type?: string
  description?: string
  owner_first_name: string
  owner_last_name: string
  owner_email: string
  owner_phone?: string
  owner_id_number?: string
  owner_password?: string
  street_address?: string
  suburb?: string
  city?: string
  province?: string
  postal_code?: string
  registration_number?: string
  tax_number?: string
  bank_name?: string
  account_number?: string
  branch_code?: string
  operating_hours?: Record<string, unknown>
  documents?: unknown[]
  agree_to_terms: boolean
  agree_to_commission: boolean
}

interface UseApplicationSubmissionReturn extends SubmissionState {
  submitApplication: (applicationData: ApplicationData) => Promise<void>
  resetSubmission: () => void
}

export function useApplicationSubmission(): UseApplicationSubmissionReturn {
  const router = useRouter()
  const [state, setState] = useState<SubmissionState>({
    isSubmitting: false,
    submitSuccess: false,
    submitError: ''
  })

  const submitApplication = async (applicationData: ApplicationData) => {
    if (state.isSubmitting) return // Prevent double submission
    
    setState(prev => ({
      ...prev,
      isSubmitting: true,
      submitError: ''
    }))
    
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application')
      }
      
      // Show success state
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        submitSuccess: true
      }))
      
      // Wait a moment to show success, then redirect
      setTimeout(() => {
        router.push(`/?application_id=${result.id}`)
      }, 2000)
      
    } catch (error) {
      console.error('Error submitting application:', error)
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        submitError: error instanceof Error ? error.message : 'Failed to submit application. Please try again.'
      }))
    }
  }

  const resetSubmission = () => {
    setState({
      isSubmitting: false,
      submitSuccess: false,
      submitError: ''
    })
  }

  return {
    ...state,
    submitApplication,
    resetSubmission
  }
}