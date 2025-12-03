"use client"

import { useState, useEffect } from 'react'
import { useBusinessAdminAuth } from '@/lib/context/business-admin-context'

export interface StatusConfig {
    id: string
    business_id: string
    status_type: 'order' | 'booking' | 'payment'
    status_name: string
    status_value: string
    display_order: number
    color_class: string
    icon_name: string
    is_default: boolean
    is_final: boolean
    can_transition_to: string[]
    description?: string
}

export interface StatusTransition {
    from_status: string
    to_status: string
    allowed: boolean
    requires_permission?: boolean
}

export function useStatusConfig(statusType: 'order' | 'booking' | 'payment') {
    const { currentBusiness } = useBusinessAdminAuth()
    const [statuses, setStatuses] = useState<StatusConfig[]>([])
    const [transitions] = useState<StatusTransition[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load status configurations using API
    const loadStatuses = async () => {
        if (!currentBusiness) return

        try {
            setLoading(true)
            setError(null)

            const response = await fetch(
                `/api/admin/status-configs?business_id=${currentBusiness.business?.id}&status_type=${statusType}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            )

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized. Please log in.')
                }
                throw new Error(`Failed to load status configurations: ${response.statusText}`)
            }

            const result = await response.json()

            if (result.data) {
                setStatuses(result.data)
            } else {
                setStatuses([])
                setError('No status configurations found')
            }

        } catch (err) {
            console.error('Error loading status configurations:', err)
            setError(err instanceof Error ? err.message : 'Failed to load status configurations')
            setStatuses([])
        } finally {
            setLoading(false)
        }
    }

    // Create or update a status configuration using API
    const upsertStatus = async (status: Partial<StatusConfig>): Promise<boolean> => {
        if (!currentBusiness) return false

        try {
            const response = await fetch('/api/admin/status-configs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    business_id: currentBusiness.business?.id,
                    status_type: statusType,
                    ...status
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                console.error('Failed to save status:', error)
                return false
            }

            // Reload statuses after successful save
            await loadStatuses()
            return true
        } catch (err) {
            console.error('Error upserting status:', err)
            return false
        }
    }

    // Delete a status configuration using API
    const deleteStatus = async (statusId: string): Promise<boolean> => {
        if (!currentBusiness) return false

        try {
            const response = await fetch(
                `/api/admin/status-configs?id=${statusId}&business_id=${currentBusiness.business?.id}&status_type=${statusType}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            )

            if (!response.ok) {
                const error = await response.json()
                console.error('Failed to delete status:', error)
                return false
            }

            // Reload statuses after successful delete
            await loadStatuses()
            return true
        } catch (err) {
            console.error('Error deleting status:', err)
            return false
        }
    }

    // Get status by value
    const getStatusByValue = (value: string): StatusConfig | undefined => {
        return statuses.find(s => s.status_value === value)
    }

    // Get allowed transitions from a status
    const getAllowedTransitions = (fromStatus: string): string[] => {
        const status = getStatusByValue(fromStatus)
        if (!status) return []

        // If we have explicit transitions defined, use those
        const explicitTransitions = transitions
            .filter(t => t.from_status === fromStatus && t.allowed)
            .map(t => t.to_status)

        if (explicitTransitions.length > 0) {
            return explicitTransitions
        }

        // Otherwise, use default logic
        const currentIndex = statuses.findIndex(s => s.status_value === fromStatus)
        if (currentIndex === -1) return []

        // Can typically move to the next status, or to cancelled
        const allowedStatuses: string[] = []

        // Next status in sequence
        if (currentIndex < statuses.length - 1) {
            const nextStatus = statuses[currentIndex + 1]
            if (!nextStatus.is_final) {
                allowedStatuses.push(nextStatus.status_value)
            }
        }

        // Can always cancel (if not already final)
        if (!status.is_final) {
            const cancelledStatus = statuses.find(s => s.status_value === 'cancelled')
            if (cancelledStatus) {
                allowedStatuses.push(cancelledStatus.status_value)
            }
        }

        return allowedStatuses
    }

    // Check if a status transition is allowed
    const canTransitionTo = (fromStatus: string, toStatus: string): boolean => {
        const allowedTransitions = getAllowedTransitions(fromStatus)
        return allowedTransitions.includes(toStatus)
    }

    useEffect(() => {
        if (currentBusiness) {
            loadStatuses()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentBusiness, statusType])

    return {
        statuses,
        transitions,
        loading,
        error,
        upsertStatus,
        deleteStatus,
        getStatusByValue,
        getAllowedTransitions,
        canTransitionTo,
        reload: loadStatuses
    }
}