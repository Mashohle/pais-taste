"use client"

import { useState, useEffect, useCallback } from 'react'

export interface BusinessApplication {
  id: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
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
  operating_hours: Record<string, { open: string; close: string; closed?: boolean }>
  documents: Array<{ id: string; name: string; url: string; type: string }>
  agree_to_terms: boolean
  agree_to_commission: boolean
  reviewed_by?: string
  reviewed_at?: string
  approval_notes?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export function useSuperAdminApplications() {
  const [applications, setApplications] = useState<BusinessApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/applications')

      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }

      const data = await response.json()
      setApplications(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load applications'
      setError(errorMessage)
      console.error('Failed to fetch applications:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const approveApplication = useCallback(async (applicationId: string, approvalNotes: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ approval_notes: approvalNotes })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve application')
      }

      const result = await response.json()
      await fetchApplications() // Refresh the list
      return { success: true, data: result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve application'
      return { success: false, error: errorMessage }
    }
  }, [fetchApplications])

  const rejectApplication = useCallback(async (applicationId: string, rejectionReason: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejection_reason: rejectionReason })
      })

      if (!response.ok) {
        throw new Error('Failed to reject application')
      }

      await fetchApplications() // Refresh the list
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject application'
      return { success: false, error: errorMessage }
    }
  }, [fetchApplications])

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    approveApplication,
    rejectApplication
  }
}
