"use client"

import { useState, useEffect, useMemo } from 'react'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: string
  preferred_pickup_location: string | null
  avatar_url: string | null
  date_of_birth: string | null
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  dietary_preferences: string[] | null
  allergies: string[] | null
  marketing_emails: boolean
  sms_notifications: boolean
  created_at: string
  updated_at: string
}

interface UseUsersOptions {
  searchTerm?: string
  roleFilter?: string
  statusFilter?: string
}

export function useUsers(options: UseUsersOptions = {}) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { searchTerm = '', roleFilter = 'all', statusFilter = 'all' } = options

  const fetchUsers = async () => {
    try {
      setError(null)
      const response = await fetch('/api/users')

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    setLoading(true)
    fetchUsers()
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filtered users based on search and filter criteria
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter

      // Status filter - you can extend this based on your needs
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'complete_profile' && isProfileComplete(user)) ||
        (statusFilter === 'incomplete_profile' && !isProfileComplete(user)) ||
        (statusFilter === 'marketing_enabled' && user.marketing_emails) ||
        (statusFilter === 'notifications_enabled' && user.sms_notifications)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  // Helper function to check if profile is complete
  const isProfileComplete = (user: UserProfile) => {
    return !!(
      user.full_name &&
      user.phone &&
      user.preferred_pickup_location
    )
  }

  // Statistics
  const stats = useMemo(() => ({
    total: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    businessAdmins: users.filter(u => u.role === 'business_admin').length,
    businessOwners: users.filter(u => u.role === 'business_owner').length,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
    completeProfiles: users.filter(u => isProfileComplete(u)).length,
    incompleteProfiles: users.filter(u => !isProfileComplete(u)).length,
    marketingOptIn: users.filter(u => u.marketing_emails).length,
    notificationsEnabled: users.filter(u => u.sms_notifications).length,
  }), [users])

  // Helper functions
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { variant: 'destructive' as const, text: 'Super Admin', icon: 'Crown' }
      case 'business_owner':
        return { variant: 'default' as const, text: 'Business Owner', icon: 'Building2' }
      case 'business_admin':
        return { variant: 'secondary' as const, text: 'Business Admin', icon: 'UserCog' }
      case 'customer':
        return { variant: 'outline' as const, text: 'Customer', icon: 'User' }
      default:
        return { variant: 'outline' as const, text: role, icon: 'User' }
    }
  }

  const getDisplayName = (user: UserProfile) => {
    if (user.full_name) return user.full_name
    return user.email.split('@')[0]
  }

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return {
    // Data
    users: filteredUsers,
    allUsers: users,

    // State
    loading,
    error,

    // Statistics
    stats,

    // Actions
    refetch,

    // Helper functions
    getRoleBadge,
    getDisplayName,
    isProfileComplete,
    formatJoinDate,
  }
}