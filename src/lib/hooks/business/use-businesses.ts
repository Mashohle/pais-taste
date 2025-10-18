"use client"

import { useState, useEffect, useMemo } from 'react'

export interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  email: string
  phone: string
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string
  is_active: boolean
  is_verified: boolean
  setup_completed: boolean
  created_at: string
  updated_at: string
  business_users?: Array<{
    user_id: string
    role: string
    is_active: boolean
  }>
}

interface UseBusinessesOptions {
  searchTerm?: string
  statusFilter?: string
  categoryFilter?: string
}

export function useBusinesses(options: UseBusinessesOptions = {}) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { searchTerm = '', statusFilter = 'all', categoryFilter = 'all' } = options

  const fetchBusinesses = async () => {
    try {
      setError(null)
      const response = await fetch('/api/businesses')

      if (!response.ok) {
        throw new Error('Failed to fetch businesses')
      }

      const data = await response.json()
      setBusinesses(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Failed to fetch businesses:', err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    setLoading(true)
    fetchBusinesses()
  }

  useEffect(() => {
    fetchBusinesses()
  }, [])

  // Filtered businesses based on search and filter criteria
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(business => {
      // Search filter
      const matchesSearch = !searchTerm ||
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && business.is_active) ||
        (statusFilter === 'inactive' && !business.is_active) ||
        (statusFilter === 'verified' && business.is_verified) ||
        (statusFilter === 'unverified' && !business.is_verified) ||
        (statusFilter === 'setup_complete' && business.setup_completed) ||
        (statusFilter === 'setup_incomplete' && !business.setup_completed)

      // Category filter
      const matchesCategory = categoryFilter === 'all' ||
        business.category_id === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [businesses, searchTerm, statusFilter, categoryFilter])

  // Statistics
  const stats = useMemo(() => ({
    total: businesses.length,
    active: businesses.filter(b => b.is_active).length,
    verified: businesses.filter(b => b.is_verified).length,
    setupComplete: businesses.filter(b => b.setup_completed).length,
    inactive: businesses.filter(b => !b.is_active).length,
    unverified: businesses.filter(b => !b.is_verified).length,
  }), [businesses])

  // Helper functions
  const getStatusBadge = (business: Business) => {
    if (!business.is_active) {
      return { variant: 'destructive' as const, text: 'Inactive', icon: 'XCircle' }
    }
    if (business.is_verified) {
      return { variant: 'default' as const, text: 'Verified', icon: 'CheckCircle' }
    }
    return { variant: 'secondary' as const, text: 'Pending', icon: 'Clock' }
  }

  const formatLocation = (business: Business) => {
    const parts = [business.city, business.state].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Location not set'
  }

  const formatAddress = (business: Business) => {
    const addressParts = [
      business.address_line1,
      business.address_line2,
      business.city,
      business.state,
      business.postal_code
    ].filter(Boolean)

    return addressParts.length > 0 ? addressParts.join(', ') : 'Address not provided'
  }

  return {
    // Data
    businesses: filteredBusinesses,
    allBusinesses: businesses,

    // State
    loading,
    error,

    // Statistics
    stats,

    // Actions
    refetch,

    // Helper functions
    getStatusBadge,
    formatLocation,
    formatAddress,
  }
}