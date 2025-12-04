import { useState, useEffect, useCallback } from 'react'
import { useBusinessAdminAuth } from '@/lib/context/business-admin-context'
import { BusinessPermissions } from '@/types/business'

export type UserRole = 'owner' | 'admin' | 'staff' | 'viewer'

export interface TeamMember {
  id: string
  business_id: string
  user_id: string
  role: UserRole
  permissions: BusinessPermissions
  is_active: boolean
  created_at: string
  updated_at?: string
  email: string
  full_name: string
  avatar_url?: string | null
}

interface UseTeamMembersReturn {
  teamMembers: TeamMember[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addTeamMember: (data: { email: string; role: UserRole; permissions?: BusinessPermissions }) => Promise<void>
  updateTeamMember: (memberId: string, data: { role?: UserRole; permissions?: BusinessPermissions; is_active?: boolean }) => Promise<void>
  removeTeamMember: (memberId: string) => Promise<void>
  toggleMemberStatus: (memberId: string) => Promise<void>
}

export function useTeamMembers(): UseTeamMembersReturn {
  const { currentBusiness, loading: businessLoading } = useBusinessAdminAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const businessId = currentBusiness?.business?.id

  const fetchTeamMembers = useCallback(async () => {
    if (!businessId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/team?business_id=${businessId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch team members')
      }

      const data = await response.json()
      setTeamMembers(data.data || [])
    } catch (err) {
      console.error('Error fetching team members:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch team members')
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    // Keep loading while business context is still loading
    if (businessLoading) {
      setLoading(true)
      return
    }

    // If business loading is done but no business, stop loading
    if (!businessId) {
      setTeamMembers([])
      setLoading(false)
      return
    }

    // Business is ready, fetch data
    fetchTeamMembers()
  }, [fetchTeamMembers, businessId, businessLoading])

  const addTeamMember = useCallback(
    async (data: { email: string; role: UserRole; permissions?: BusinessPermissions }) => {
      if (!businessId) return

      try {
        setError(null)

        const response = await fetch('/api/admin/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: businessId,
            ...data,
          }),
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to add team member')
        }

        await fetchTeamMembers()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add team member'
        setError(errorMessage)
        throw err
      }
    },
    [businessId, fetchTeamMembers]
  )

  const updateTeamMember = useCallback(
    async (
      memberId: string,
      data: { role?: UserRole; permissions?: BusinessPermissions; is_active?: boolean }
    ) => {
      if (!businessId) return

      try {
        setError(null)

        const response = await fetch('/api/admin/team', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            member_id: memberId,
            business_id: businessId,
            ...data,
          }),
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to update team member')
        }

        await fetchTeamMembers()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update team member'
        setError(errorMessage)
        throw err
      }
    },
    [businessId, fetchTeamMembers]
  )

  const removeTeamMember = useCallback(
    async (memberId: string) => {
      if (!businessId) return

      try {
        setError(null)

        const response = await fetch(
          `/api/admin/team?member_id=${memberId}&business_id=${businessId}`,
          {
            method: 'DELETE',
          }
        )

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to remove team member')
        }

        await fetchTeamMembers()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove team member'
        setError(errorMessage)
        throw err
      }
    },
    [businessId, fetchTeamMembers]
  )

  const toggleMemberStatus = useCallback(
    async (memberId: string) => {
      const member = teamMembers.find((m) => m.id === memberId)
      if (!member) return

      await updateTeamMember(memberId, { is_active: !member.is_active })
    },
    [teamMembers, updateTeamMember]
  )

  return {
    teamMembers,
    loading,
    error,
    refetch: fetchTeamMembers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    toggleMemberStatus,
  }
}
