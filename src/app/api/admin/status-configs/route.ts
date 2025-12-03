import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Map status types to their respective table names
const STATUS_TABLES = {
  order: 'order_statuses',
  booking: 'booking_statuses',
  payment: 'payment_statuses',
} as const

type StatusType = keyof typeof STATUS_TABLES

// Status configuration interface
interface StatusConfig {
  id: string
  business_id: string
  status_type: 'order' | 'booking' | 'payment'
  status_name: string
  status_value: string
  display_order: number
  color_class: string
  icon_name: string
  is_default?: boolean
  is_final?: boolean
  can_transition_to?: string[]
  description?: string
  created_at?: string
  updated_at?: string
}

// Database status structure (from Supabase tables)
interface DbStatus {
  id: string
  business_id: string | null
  code: string
  name: string
  description: string | null
  color: string
  is_active: boolean
  is_default: boolean
  is_final: boolean
  sort_order: number
  can_transition_to: string[] | null
  created_at?: string
  updated_at?: string
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const searchParams = request.nextUrl.searchParams
        const businessId = searchParams.get('business_id')
        const statusType = searchParams.get('status_type') as StatusType

        if (!businessId || !statusType) {
            return NextResponse.json(
                { error: 'Missing required parameters: business_id and status_type' },
                { status: 400 }
            )
        }

        if (!STATUS_TABLES[statusType]) {
            return NextResponse.json(
                { error: 'Invalid status_type. Must be: order, booking, or payment' },
                { status: 400 }
            )
        }

        // Get user session
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify business access
        const { data: businessUser } = await supabase
            .from('business_users')
            .select('id, role, is_active')
            .eq('user_id', user.id)
            .eq('business_id', businessId)
            .eq('is_active', true)
            .single()

        if (!businessUser) {
            return NextResponse.json(
                { error: 'You do not have access to this business' },
                { status: 403 }
            )
        }

        const tableName = STATUS_TABLES[statusType]

        // First try to get business-specific statuses
        const { data: businessStatuses, error: businessError } = await supabase
            .from(tableName)
            .select('*')
            .eq('business_id', businessId)
            .order('sort_order', { ascending: true })

        if (businessError) {
            console.error('Error fetching business statuses:', businessError)
        }

        // If business has custom statuses, use those
        if (businessStatuses && businessStatuses.length > 0) {
            const normalizedStatuses = (businessStatuses as DbStatus[]).map(s => mapDbToApi(s, statusType))
            return NextResponse.json({ data: normalizedStatuses })
        }

        // Otherwise, fetch system defaults (where business_id is NULL)
        const { data: defaultStatuses, error: defaultError } = await supabase
            .from(tableName)
            .select('*')
            .is('business_id', null)
            .order('sort_order', { ascending: true })

        if (defaultError) {
            console.error('Error fetching default statuses:', defaultError)
            return NextResponse.json(
                { error: 'Failed to fetch status configurations' },
                { status: 500 }
            )
        }

        const normalizedStatuses = (defaultStatuses || []).map((s: DbStatus) => mapDbToApi(s, statusType))
        return NextResponse.json({ data: normalizedStatuses })
    } catch (error: unknown) {
        console.error('Status configs GET error:', error)
        return NextResponse.json({
            error: 'Failed to fetch status configurations',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const { business_id, status_type, id, ...statusData } = body

        if (!business_id || !status_type) {
            return NextResponse.json(
                { error: 'Missing required fields: business_id and status_type' },
                { status: 400 }
            )
        }

        if (!STATUS_TABLES[status_type as StatusType]) {
            return NextResponse.json(
                { error: 'Invalid status_type. Must be: order, booking, or payment' },
                { status: 400 }
            )
        }

        // Get user session
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify business access
        const { data: businessUser } = await supabase
            .from('business_users')
            .select('id, role, is_active')
            .eq('user_id', user.id)
            .eq('business_id', business_id)
            .eq('is_active', true)
            .single()

        if (!businessUser) {
            return NextResponse.json(
                { error: 'You do not have access to this business' },
                { status: 403 }
            )
        }

        const tableName = STATUS_TABLES[status_type as StatusType]

        // Map from API format to database format
        const dbData = {
            business_id,
            code: statusData.status_value,
            name: statusData.status_name,
            description: statusData.description || null,
            color: extractColorHex(statusData.color_class),
            is_active: true,
            is_default: statusData.is_default || false,
            is_final: statusData.is_final || false,
            sort_order: statusData.display_order || 0,
            can_transition_to: statusData.can_transition_to || null,
            updated_at: new Date().toISOString(),
        }

        let result

        if (id) {
            // Update existing status
            const { data, error } = await supabase
                .from(tableName)
                .update(dbData)
                .eq('id', id)
                .eq('business_id', business_id)
                .select()
                .single()

            if (error) {
                console.error('Error updating status:', error)
                return NextResponse.json(
                    { error: 'Failed to update status configuration' },
                    { status: 500 }
                )
            }

            result = data as DbStatus
        } else {
            // Create new status
            const { data, error } = await supabase
                .from(tableName)
                .insert({
                    ...dbData,
                    created_at: new Date().toISOString(),
                })
                .select()
                .single()

            if (error) {
                console.error('Error creating status:', error)
                return NextResponse.json(
                    { error: 'Failed to create status configuration' },
                    { status: 500 }
                )
            }

            result = data as DbStatus
        }

        return NextResponse.json({
            data: mapDbToApi(result, status_type as StatusType),
            message: id ? 'Status updated successfully' : 'Status created successfully',
        })
    } catch (error: unknown) {
        console.error('Status configs POST error:', error)
        return NextResponse.json({
            error: 'Failed to save status configuration',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')
        const businessId = searchParams.get('business_id')
        const statusType = searchParams.get('status_type') as StatusType

        if (!id || !businessId || !statusType) {
            return NextResponse.json(
                { error: 'Missing required parameters: id, business_id, and status_type' },
                { status: 400 }
            )
        }

        if (!STATUS_TABLES[statusType]) {
            return NextResponse.json(
                { error: 'Invalid status_type. Must be: order, booking, or payment' },
                { status: 400 }
            )
        }

        // Get user session
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify business access
        const { data: businessUser } = await supabase
            .from('business_users')
            .select('id, role, is_active')
            .eq('user_id', user.id)
            .eq('business_id', businessId)
            .eq('is_active', true)
            .single()

        if (!businessUser) {
            return NextResponse.json(
                { error: 'You do not have access to this business' },
                { status: 403 }
            )
        }

        const tableName = STATUS_TABLES[statusType]

        // Prevent deleting default statuses
        const { data: status } = await supabase
            .from(tableName)
            .select('is_default')
            .eq('id', id)
            .eq('business_id', businessId)
            .single()

        if (status?.is_default) {
            return NextResponse.json(
                { error: 'Cannot delete default status' },
                { status: 400 }
            )
        }

        // Delete the status
        const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id)
            .eq('business_id', businessId)

        if (deleteError) {
            console.error('Error deleting status:', deleteError)
            return NextResponse.json(
                { error: 'Failed to delete status configuration' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Status deleted successfully',
        })
    } catch (error: unknown) {
        console.error('Status configs DELETE error:', error)
        return NextResponse.json({
            error: 'Failed to delete status configuration',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

// Helper function to map database format to API format
function mapDbToApi(dbStatus: DbStatus, statusType: StatusType): StatusConfig {
    return {
        id: dbStatus.id,
        business_id: dbStatus.business_id || '',
        status_type: statusType,
        status_name: dbStatus.name,
        status_value: dbStatus.code,
        display_order: dbStatus.sort_order,
        color_class: colorToClass(dbStatus.color),
        icon_name: 'circle', // Default icon
        is_default: dbStatus.is_default,
        is_final: dbStatus.is_final,
        can_transition_to: dbStatus.can_transition_to || [],
        description: dbStatus.description || '',
        created_at: dbStatus.created_at,
        updated_at: dbStatus.updated_at,
    }
}

// Helper to convert hex color to Tailwind class
function colorToClass(hexColor: string): string {
    const colorMap: Record<string, string> = {
        '#3B82F6': 'bg-blue-100 text-blue-800',
        '#10B981': 'bg-green-100 text-green-800',
        '#059669': 'bg-emerald-100 text-emerald-800',
        '#F59E0B': 'bg-yellow-100 text-yellow-800',
        '#EF4444': 'bg-red-100 text-red-800',
        '#6B7280': 'bg-gray-100 text-gray-800',
        '#8B5CF6': 'bg-purple-100 text-purple-800',
        '#6366F1': 'bg-indigo-100 text-indigo-800',
        '#F97316': 'bg-orange-100 text-orange-800',
    }
    return colorMap[hexColor] || 'bg-gray-100 text-gray-800'
}

// Helper to extract hex color from Tailwind class
function extractColorHex(colorClass: string): string {
    const classToHex: Record<string, string> = {
        'bg-blue-100 text-blue-800': '#3B82F6',
        'bg-green-100 text-green-800': '#10B981',
        'bg-emerald-100 text-emerald-800': '#059669',
        'bg-yellow-100 text-yellow-800': '#F59E0B',
        'bg-orange-100 text-orange-800': '#F97316',
        'bg-red-100 text-red-800': '#EF4444',
        'bg-gray-100 text-gray-800': '#6B7280',
        'bg-purple-100 text-purple-800': '#8B5CF6',
        'bg-indigo-100 text-indigo-800': '#6366F1',
    }
    return classToHex[colorClass] || '#6B7280'
}