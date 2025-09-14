import { useState } from 'react'

interface BusinessApplicationForm {
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
  ownerPassword: string
  ownerPasswordConfirm: string
  
  // Business Address
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
  
  // Operating Hours
  operatingHours: Record<string, { open: string; close: string; closed: boolean }>
  
  // Documents
  documents: unknown[]
  
  // Terms Agreement
  agreeToTerms: boolean
  agreeToCommission: boolean
}

const initialFormState: BusinessApplicationForm = {
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
  ownerPassword: '',
  ownerPasswordConfirm: '',
  
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

export function useBusinessApplicationForm() {
  const [formData, setFormData] = useState<BusinessApplicationForm>(initialFormState)
  
  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const resetForm = () => {
    setFormData(initialFormState)
  }
  
  const getApplicationData = () => ({
    // Basic Information
    business_name: formData.businessName,
    business_category: formData.businessCategory,
    business_type: formData.businessType,
    description: formData.description,
    
    // Owner Information
    owner_first_name: formData.ownerFirstName,
    owner_last_name: formData.ownerLastName,
    owner_email: formData.ownerEmail,
    owner_phone: formData.ownerPhone,
    owner_id_number: formData.ownerIdNumber,
    owner_password: formData.ownerPassword,
    
    // Business Address
    street_address: formData.streetAddress,
    suburb: formData.suburb,
    city: formData.city,
    province: formData.province,
    postal_code: formData.postalCode,
    
    // Business Registration Details
    registration_number: formData.registrationNumber,
    tax_number: formData.taxNumber,
    bank_name: formData.bankName,
    account_number: formData.accountNumber,
    branch_code: formData.branchCode,
    
    // Operating Hours
    operating_hours: formData.operatingHours,
    
    // Documents
    documents: formData.documents,
    
    // Terms Agreement
    agree_to_terms: formData.agreeToTerms,
    agree_to_commission: formData.agreeToCommission
  })
  
  return {
    formData,
    updateFormData,
    resetForm,
    getApplicationData
  }
}