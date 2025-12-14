"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Business Location Type
export interface BusinessLocation {
  id: string
  name: string
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode: string
  phone?: string
  email?: string
  isPrimary: boolean
}

// Document Type
export type DocumentType = 'id_document' | 'registration_certificate' | 'bank_statement'

export interface UploadedDocument {
  type: DocumentType
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
}

// Form Data Types
export interface BusinessApplicationFormData {
  // Basic Information
  businessName: string
  businessCategory: string
  businessType: string
  description: string

  // Owner Information
  ownerFirstName: string
  ownerLastName: string
  ownerEmail: string
  ownerPhone: string
  ownerIdNumber: string

  // Business Address (Headquarters)
  streetAddress: string
  suburb: string
  city: string
  province: string
  postalCode: string

  // Business Registration Details
  registrationNumber: string
  taxNumber: string
  bankName: string
  accountNumber: string
  branchCode: string

  // Business Locations
  locationType: 'single' | 'multiple'
  locations: BusinessLocation[]

  // Operating Hours
  operatingHours: Record<string, { open: string; close: string; closed: boolean }>

  // Documents
  documents: UploadedDocument[]

  // Terms Agreement
  agreeToTerms: boolean
  agreeToCommission: boolean
}

// API Submission Data
interface ApplicationSubmissionData {
  business_name: string
  business_category: string
  business_type?: string
  description?: string
  owner_first_name: string
  owner_last_name: string
  owner_email: string
  owner_phone?: string
  owner_id_number?: string
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
  location_type?: 'single' | 'multiple'
  locations?: BusinessLocation[]
  operating_hours?: Record<string, unknown>
  documents?: UploadedDocument[]
  agree_to_terms: boolean
  agree_to_commission: boolean
}

// Context Type
interface BusinessApplicationContextType {
  // Form State
  formData: BusinessApplicationFormData
  currentStep: number

  // Submission State
  isSubmitting: boolean
  submitSuccess: boolean
  submitError: string | null

  // Validation State
  validationErrors: Record<string, string>

  // Form Actions
  updateFormData: <K extends keyof BusinessApplicationFormData>(
    field: K,
    value: BusinessApplicationFormData[K]
  ) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  resetForm: () => void

  // Location Actions
  addLocation: (location: Omit<BusinessLocation, 'id'>) => void
  updateLocation: (id: string, location: Partial<BusinessLocation>) => void
  removeLocation: (id: string) => void

  // Document Actions
  addDocument: (document: UploadedDocument) => void
  removeDocument: (type: DocumentType) => void
  getDocument: (type: DocumentType) => UploadedDocument | undefined

  // Submission Actions
  submitApplication: () => Promise<void>
  resetSubmission: () => void

  // Validation
  validateStep: (step: number) => boolean
  validateField: (field: keyof BusinessApplicationFormData) => string | null
}

const initialFormData: BusinessApplicationFormData = {
  // Basic Information
  businessName: '',
  businessCategory: '',
  businessType: '',
  description: '',

  // Owner Information
  ownerFirstName: '',
  ownerLastName: '',
  ownerEmail: '',
  ownerPhone: '',
  ownerIdNumber: '',

  // Business Address
  streetAddress: '',
  suburb: '',
  city: '',
  province: '',
  postalCode: '',

  // Business Registration Details
  registrationNumber: '',
  taxNumber: '',
  bankName: '',
  accountNumber: '',
  branchCode: '',

  // Business Locations
  locationType: 'single',
  locations: [],

  // Operating Hours
  operatingHours: {
    monday: { open: '08:00', close: '17:00', closed: false },
    tuesday: { open: '08:00', close: '17:00', closed: false },
    wednesday: { open: '08:00', close: '17:00', closed: false },
    thursday: { open: '08:00', close: '17:00', closed: false },
    friday: { open: '08:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '15:00', closed: false },
    sunday: { open: '10:00', close: '14:00', closed: true }
  },

  // Documents
  documents: [],

  // Terms Agreement
  agreeToTerms: false,
  agreeToCommission: false
}

const BusinessApplicationContext = createContext<BusinessApplicationContextType | undefined>(undefined)

interface BusinessApplicationProviderProps {
  children: ReactNode
}

export function BusinessApplicationProvider({ children }: BusinessApplicationProviderProps) {
  const router = useRouter()

  // Form State
  const [formData, setFormData] = useState<BusinessApplicationFormData>(initialFormData)
  const [currentStep, setCurrentStep] = useState(1)

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Validation State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Form Actions
  const updateFormData = useCallback(<K extends keyof BusinessApplicationFormData>(
    field: K,
    value: BusinessApplicationFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field when it's updated
    if (validationErrors[field as string]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })
    }
  }, [validationErrors])

  // Validation
  const validateField = useCallback((field: keyof BusinessApplicationFormData): string | null => {
    const value = formData[field]

    // Required fields validation
    const requiredFields: Partial<Record<keyof BusinessApplicationFormData, string>> = {
      businessName: 'Business name is required',
      businessCategory: 'Business category is required',
      ownerFirstName: 'First name is required',
      ownerLastName: 'Last name is required',
      ownerEmail: 'Email is required',
    }

    if (field in requiredFields && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return requiredFields[field] || 'This field is required'
    }

    // Email validation
    if (field === 'ownerEmail' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value as string)) {
        return 'Please enter a valid email address'
      }
    }

    return null
  }, [formData])

  const validateStep = useCallback((step: number): boolean => {
    const errors: Record<string, string> = {}

    // Step 1: Basic Information
    if (step === 1) {
      const fields: (keyof BusinessApplicationFormData)[] = ['businessName', 'businessCategory']
      fields.forEach(field => {
        const error = validateField(field)
        if (error) errors[field] = error
      })
    }

    // Step 2: Owner Details
    if (step === 2) {
      const fields: (keyof BusinessApplicationFormData)[] = [
        'ownerFirstName',
        'ownerLastName',
        'ownerEmail'
      ]
      fields.forEach(field => {
        const error = validateField(field)
        if (error) errors[field] = error
      })
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [validateField])

  const nextStep = useCallback(() => {
    const isValid = validateStep(currentStep)
    if (isValid) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, validateStep])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setCurrentStep(1)
    setValidationErrors({})
  }, [])

  // Location Actions
  const addLocation = useCallback((location: Omit<BusinessLocation, 'id'>) => {
    const newLocation: BusinessLocation = {
      ...location,
      id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation]
    }))
  }, [])

  const updateLocation = useCallback((id: string, updates: Partial<BusinessLocation>) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map(loc =>
        loc.id === id ? { ...loc, ...updates } : loc
      )
    }))
  }, [])

  const removeLocation = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== id)
    }))
  }, [])

  // Document Actions
  const addDocument = useCallback((document: UploadedDocument) => {
    setFormData(prev => {
      // Remove existing document of same type if exists
      const filteredDocs = prev.documents.filter(doc => doc.type !== document.type)
      return {
        ...prev,
        documents: [...filteredDocs, document]
      }
    })
  }, [])

  const removeDocument = useCallback((type: DocumentType) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.type !== type)
    }))
  }, [])

  const getDocument = useCallback((type: DocumentType): UploadedDocument | undefined => {
    return formData.documents.find(doc => doc.type === type)
  }, [formData.documents])

  // Transform form data to API format
  const getSubmissionData = useCallback((): ApplicationSubmissionData => {
    return {
      business_name: formData.businessName,
      business_category: formData.businessCategory,
      business_type: formData.businessType,
      description: formData.description,

      owner_first_name: formData.ownerFirstName,
      owner_last_name: formData.ownerLastName,
      owner_email: formData.ownerEmail,
      owner_phone: formData.ownerPhone,
      owner_id_number: formData.ownerIdNumber,

      street_address: formData.streetAddress,
      suburb: formData.suburb,
      city: formData.city,
      province: formData.province,
      postal_code: formData.postalCode,

      registration_number: formData.registrationNumber,
      tax_number: formData.taxNumber,
      bank_name: formData.bankName,
      account_number: formData.accountNumber,
      branch_code: formData.branchCode,

      location_type: formData.locationType,
      locations: formData.locations,

      operating_hours: formData.operatingHours,
      documents: formData.documents,

      agree_to_terms: formData.agreeToTerms,
      agree_to_commission: formData.agreeToCommission
    }
  }, [formData])

  // Submission Actions
  const submitApplication = useCallback(async () => {
    if (isSubmitting) return // Prevent double submission

    // Final validation
    if (!formData.agreeToTerms || !formData.agreeToCommission) {
      setSubmitError('Please agree to the terms and commission structure')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(getSubmissionData())
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application')
      }

      // Show success state
      setSubmitSuccess(true)

      // Wait a moment to show success, then redirect to success page
      setTimeout(() => {
        router.push(`/business/apply/success?application_id=${result.id}`)
      }, 2000)

    } catch (error) {
      console.error('Error submitting application:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isSubmitting, getSubmissionData, router])

  const resetSubmission = useCallback(() => {
    setIsSubmitting(false)
    setSubmitSuccess(false)
    setSubmitError(null)
  }, [])

  const value: BusinessApplicationContextType = {
    // Form State
    formData,
    currentStep,

    // Submission State
    isSubmitting,
    submitSuccess,
    submitError,

    // Validation State
    validationErrors,

    // Form Actions
    updateFormData,
    setCurrentStep,
    nextStep,
    prevStep,
    resetForm,

    // Location Actions
    addLocation,
    updateLocation,
    removeLocation,

    // Document Actions
    addDocument,
    removeDocument,
    getDocument,

    // Submission Actions
    submitApplication,
    resetSubmission,

    // Validation
    validateStep,
    validateField
  }

  return (
    <BusinessApplicationContext.Provider value={value}>
      {children}
    </BusinessApplicationContext.Provider>
  )
}

export function useBusinessApplication() {
  const context = useContext(BusinessApplicationContext)
  if (context === undefined) {
    throw new Error('useBusinessApplication must be used within a BusinessApplicationProvider')
  }
  return context
}
