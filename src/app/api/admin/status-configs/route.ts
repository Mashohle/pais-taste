import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// In-memory storage for status configs (until database table is created)
const memoryStorage = new Map<string, any[]>()

// Default status configurations by business category
const getDefaultStatuses = (businessCategory: string, statusType: 'order' | 'booking' | 'payment') => {
    if (statusType === 'order') {
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
    } else if (statusType === 'booking') {
        return [
            { status_value: 'scheduled', status_name: 'Scheduled', display_order: 1, color_class: 'bg-blue-100 text-blue-800', icon_name: 'calendar', is_default: true },
            { status_value: 'confirmed', status_name: 'Confirmed', display_order: 2, color_class: 'bg-green-100 text-green-800', icon_name: 'check-circle' },
            { status_value: 'in_progress', status_name: 'In Progress', display_order: 3, color_class: 'bg-orange-100 text-orange-800', icon_name: 'play-circle' },
            { status_value: 'completed', status_name: 'Completed', display_order: 4, color_class: 'bg-emerald-100 text-emerald-800', icon_name: 'check-circle-2', is_final: true },
            { status_value: 'no_show', status_name: 'No Show', display_order: 5, color_class: 'bg-gray-100 text-gray-800', icon_name: 'user-x', is_final: true },
            { status_value: 'cancelled', status_name: 'Cancelled', display_order: 6, color_class: 'bg-red-100 text-red-800', icon_name: 'x-circle', is_final: true }
        ]
    } else if (statusType === 'payment') {
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

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const businessId = searchParams.get('business_id')
        const statusType = searchParams.get('status_type') as 'order' | 'booking' | 'payment'

        console.log('Status config API called:', { businessId, statusType, userId: session.user.id })

        if (!businessId || !statusType) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        // Since user_businesses table doesn't exist yet, we'll skip the access check
        // In production, you'd want to verify the user has access to this business
        console.log('Skipping business access check - table not available')

        // For now, just use default business category
        const userBusiness = { business_categories: { id: 'food' } }

        // Try to get from database first (when table exists)
        try {
            const { data: dbStatuses, error: dbError } = await supabase
                .from('status_configs')
                .select('*')
                .eq('business_id', businessId)
                .eq('status_type', statusType)
                .order('display_order')

            if (!dbError && dbStatuses && dbStatuses.length > 0) {
                return NextResponse.json({ data: dbStatuses })
            }
        } catch (e) {
            console.log('Database table not available, using defaults')
        }

        // Check in-memory storage
        const memoryKey = `${businessId}-${statusType}`
        let statuses = memoryStorage.get(memoryKey)

        if (!statuses || statuses.length === 0) {
            // Use default statuses
            const businessCategory = userBusiness?.business_categories?.id || 'food'
            const defaultStatuses = getDefaultStatuses(businessCategory, statusType)

            statuses = defaultStatuses.map((status, index) => ({
                id: `default-${businessId}-${statusType}-${index}`,
                business_id: businessId,
                status_type: statusType,
                status_name: status.status_name,
                status_value: status.status_value,
                display_order: status.display_order,
                color_class: status.color_class,
                icon_name: status.icon_name,
                is_default: status.is_default || false,
                is_final: status.is_final || false,
                can_transition_to: [],
                description: status.description
            }))

            // Store in memory
            memoryStorage.set(memoryKey, statuses)
        }

        return NextResponse.json({ data: statuses })
    } catch (error) {
        console.error('Error fetching status configs:', error)
        return NextResponse.json({
            error: 'Failed to fetch status configurations',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { business_id, status_type, ...statusData } = body

        if (!business_id || !status_type) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        // Since user_businesses table doesn't exist yet, we'll skip the role check
        // In production, you'd want to verify the user has admin/owner access
        console.log('Skipping role check - table not available')

        // Try to save to database first (when table exists)
        try {
            const { data: dbStatus, error: dbError } = await supabase
                .from('status_configs')
                .upsert({
                    business_id,
                    status_type,
                    ...statusData
                })
                .select()
                .single()

            if (!dbError && dbStatus) {
                return NextResponse.json({ data: dbStatus })
            }
        } catch (e) {
            console.log('Database table not available, using in-memory storage')
        }

        // Use in-memory storage
        const memoryKey = `${business_id}-${status_type}`
        let statuses = memoryStorage.get(memoryKey) || []

        const newStatus = {
            id: statusData.id || `custom-${Date.now()}`,
            business_id,
            status_type,
            ...statusData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        // Update or add
        const existingIndex = statuses.findIndex((s: any) => s.id === newStatus.id)
        if (existingIndex >= 0) {
            statuses[existingIndex] = { ...statuses[existingIndex], ...newStatus }
        } else {
            statuses.push(newStatus)
        }

        // Sort by display_order
        statuses.sort((a: any, b: any) => a.display_order - b.display_order)

        // Store back in memory
        memoryStorage.set(memoryKey, statuses)

        return NextResponse.json({ data: newStatus })
    } catch (error) {
        console.error('Error creating/updating status config:', error)
        return NextResponse.json({
            error: 'Failed to save status configuration',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const statusId = searchParams.get('id')
        const businessId = searchParams.get('business_id')
        const statusType = searchParams.get('status_type')

        if (!statusId || !businessId || !statusType) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        // Since user_businesses table doesn't exist yet, we'll skip the role check
        // In production, you'd want to verify the user has admin/owner access
        console.log('Skipping role check for delete - table not available')

        // Try to delete from database first (when table exists)
        try {
            const { error: dbError } = await supabase
                .from('status_configs')
                .delete()
                .eq('id', statusId)
                .eq('business_id', businessId)

            if (!dbError) {
                return NextResponse.json({ success: true })
            }
        } catch (e) {
            console.log('Database table not available, using in-memory storage')
        }

        // Delete from in-memory storage
        const memoryKey = `${businessId}-${statusType}`
        let statuses = memoryStorage.get(memoryKey) || []

        statuses = statuses.filter((s: any) => s.id !== statusId)

        // Store back in memory
        memoryStorage.set(memoryKey, statuses)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting status config:', error)
        return NextResponse.json({
            error: 'Failed to delete status configuration',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}