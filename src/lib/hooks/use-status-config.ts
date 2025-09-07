"use client"

import { useState, useEffect } from 'react'
import { useBusiness } from '@/lib/contexts/business-context'
import { supabase } from '@/lib/supabase'

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
    const { currentBusiness } = useBusiness()
    const [statuses, setStatuses] = useState<StatusConfig[]>([])
    const [transitions, setTransitions] = useState<StatusTransition[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Default status configurations by business category
    const getDefaultStatuses = (businessCategory: string, type: 'order' | 'booking' | 'payment'): Partial<StatusConfig>[] => {
        if (type === 'order') {
            switch (businessCategory) {
                case 'food':
                    return [
                        { status_value: 'pending', status_name: 'Pending', display_order: 1, color_class: 'bg-yellow-100 text-yellow-800', icon_name: 'clock', is_default: true },
                        { status_value: 'confirmed', status_name: 'Confirmed', display_order: 2, color_class: 'bg-blue-100 text-blue-800', icon_name: 'check-circle' },
                        { status_value: 'preparing', status_name: 'Preparing', display_order: 3, color_class: 'bg-orange-100 text-orange-800', icon_name: 'chef-hat' },
                        { status_value: 'ready', status_name: 'Ready for Pickup', display_order: 4, color_class: 'bg-green-100 text-green-800', icon_name: 'package' },
                        { status_value: 'completed', status_name: 'Completed', display_order: 5, color_class: 'bg-emerald-100 text-emerald-800', icon_name: 'check-circle-2', is_final: true },
                        { status_value: 'cancelled', status_name: 'Cancelled', display_order: 6, color_class: 'bg-red-100 text-red-800', icon_name: 'x-circle', is_final: true }
                    ]
                case 'retail':
                    return [
                        { status_value: 'pending', status_name: 'Pending Payment', display_order: 1, color_class: 'bg-yellow-100 text-yellow-800', icon_name: 'clock', is_default: true },
                        { status_value: 'paid', status_name: 'Paid', display_order: 2, color_class: 'bg-blue-100 text-blue-800', icon_name: 'credit-card' },
                        { status_value: 'processing', status_name: 'Processing', display_order: 3, color_class: 'bg-purple-100 text-purple-800', icon_name: 'package' },
                        { status_value: 'shipped', status_name: 'Shipped', display_order: 4, color_class: 'bg-indigo-100 text-indigo-800', icon_name: 'truck' },
                        { status_value: 'delivered', status_name: 'Delivered', display_order: 5, color_class: 'bg-green-100 text-green-800', icon_name: 'check-circle', is_final: true },
                        { status_value: 'cancelled', status_name: 'Cancelled', display_order: 6, color_class: 'bg-red-100 text-red-800', icon_name: 'x-circle', is_final: true }
                    ]
                default:
                    return [
                        { status_value: 'pending', status_name: 'Pending', display_order: 1, color_class: 'bg-yellow-100 text-yellow-800', icon_name: 'clock', is_default: true },
                        { status_value: 'completed', status_name: 'Completed', display_order: 2, color_class: 'bg-green-100 text-green-800', icon_name: 'check-circle', is_final: true },
                        { status_value: 'cancelled', status_name: 'Cancelled', display_order: 3, color_class: 'bg-red-100 text-red-800', icon_name: 'x-circle', is_final: true }
                    ]
            }
        } else if (type === 'booking') {
            return [
                { status_value: 'scheduled', status_name: 'Scheduled', display_order: 1, color_class: 'bg-blue-100 text-blue-800', icon_name: 'calendar', is_default: true },
                { status_value: 'confirmed', status_name: 'Confirmed', display_order: 2, color_class: 'bg-green-100 text-green-800', icon_name: 'check-circle' },
                { status_value: 'in_progress', status_name: 'In Progress', display_order: 3, color_class: 'bg-orange-100 text-orange-800', icon_name: 'play-circle' },
                { status_value: 'completed', status_name: 'Completed', display_order: 4, color_class: 'bg-emerald-100 text-emerald-800', icon_name: 'check-circle-2', is_final: true },
                { status_value: 'no_show', status_name: 'No Show', display_order: 5, color_class: 'bg-gray-100 text-gray-800', icon_name: 'user-x', is_final: true },
                { status_value: 'cancelled', status_name: 'Cancelled', display_order: 6, color_class: 'bg-red-100 text-red-800', icon_name: 'x-circle', is_final: true }
            ]
        } else if (type === 'payment') {
            return [
                { status_value: 'pending', status_name: 'Pending', display_order: 1, color_class: 'bg-yellow-100 text-yellow-800', icon_name: 'clock', is_default: true },
                { status_value: 'processing', status_name: 'Processing', display_order: 2, color_class: 'bg-blue-100 text-blue-800', icon_name: 'loader' },
                { status_value: 'completed', status_name: 'Completed', display_order: 3, color_class: 'bg-green-100 text-green-800', icon_name: 'check-circle', is_final: true },
                { status_value: 'failed', status_name: 'Failed', display_order: 4, color_class: 'bg-red-100 text-red-800', icon_name: 'x-circle', is_final: true },
                { status_value: 'refunded', status_name: 'Refunded', display_order: 5, color_class: 'bg-purple-100 text-purple-800', icon_name: 'rotate-ccw', is_final: true }
            ]
        }
        return []
    }

    // Load status configurations
    const loadStatuses = async () => {
        if (!currentBusiness) return

        try {
            setLoading(true)
            setError(null)

            // Try to get business-specific statuses first
            const { data: businessStatuses, error: businessError } = await supabase
                .from('status_configs')
                .select('*')
                .eq('business_id', currentBusiness.id)
                .eq('status_type', statusType)
                .order('display_order')

            if (businessError && businessError.code !== 'PGRST116') { // PGRST116 is "relation does not exist"
                if (businessError.message?.includes('infinite recursion') || 
                    businessError.message?.includes('policy') ||
                    businessError.code === '42P17') {
                    console.log('RLS policy issue with status_configs, using default statuses')
                    // Continue to use default statuses
                } else {
                    throw businessError
                }
            }

            // If no business-specific statuses or table doesn't exist, use defaults
            if (!businessStatuses || businessStatuses.length === 0) {
                const defaultStatuses = getDefaultStatuses(currentBusiness.business_categories?.id || 'service', statusType)
                const statusConfigs: StatusConfig[] = defaultStatuses.map((status, index) => ({
                    id: `default-${index}`,
                    business_id: currentBusiness.id,
                    status_type: statusType,
                    status_name: status.status_name!,
                    status_value: status.status_value!,
                    display_order: status.display_order!,
                    color_class: status.color_class!,
                    icon_name: status.icon_name!,
                    is_default: status.is_default || false,
                    is_final: status.is_final || false,
                    can_transition_to: [],
                    description: status.description
                }))
                setStatuses(statusConfigs)
            } else {
                setStatuses(businessStatuses)
            }

            // Load transitions (if table exists)
            try {
                const { data: statusTransitions } = await supabase
                    .from('status_transitions')
                    .select('*')
                    .eq('business_id', currentBusiness.id)
                    .eq('status_type', statusType)

                if (statusTransitions) {
                    setTransitions(statusTransitions.map(t => ({
                        from_status: t.from_status,
                        to_status: t.to_status,
                        allowed: t.allowed,
                        requires_permission: t.requires_permission
                    })))
                }
            } catch (transitionError) {
                // Transitions table might not exist yet, that's okay
                console.log('Status transitions not available:', transitionError)
            }

        } catch (err) {
            console.error('Error loading status configurations:', err)
            setError(err instanceof Error ? err.message : 'Failed to load status configurations')
            
            // Fallback to default statuses
            const defaultStatuses = getDefaultStatuses(currentBusiness.business_categories?.id || 'service', statusType)
            const statusConfigs: StatusConfig[] = defaultStatuses.map((status, index) => ({
                id: `default-${index}`,
                business_id: currentBusiness.id,
                status_type: statusType,
                status_name: status.status_name!,
                status_value: status.status_value!,
                display_order: status.display_order!,
                color_class: status.color_class!,
                icon_name: status.icon_name!,
                is_default: status.is_default || false,
                is_final: status.is_final || false,
                can_transition_to: [],
                description: status.description
            }))
            setStatuses(statusConfigs)
        } finally {
            setLoading(false)
        }
    }

    // Create or update a status configuration
    const upsertStatus = async (status: Partial<StatusConfig>): Promise<StatusConfig | null> => {
        if (!currentBusiness) return null

        try {
            const statusData = {
                business_id: currentBusiness.id,
                status_type: statusType,
                ...status
            }

            const { data, error } = await supabase
                .from('status_configs')
                .upsert(statusData)
                .select()
                .single()

            if (error) throw error

            // Reload statuses
            await loadStatuses()
            return data
        } catch (err) {
            console.error('Error upserting status:', err)
            return null
        }
    }

    // Delete a status configuration
    const deleteStatus = async (statusId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('status_configs')
                .delete()
                .eq('id', statusId)

            if (error) throw error

            // Reload statuses
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