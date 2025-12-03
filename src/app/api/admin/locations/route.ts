import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('business_id')

    if (!businessId) {
      return NextResponse.json(
        { error: 'Missing required parameter: business_id' },
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

    // Fetch locations for this business
    const { data: locations, error: locationsError } = await supabase
      .from('business_locations')
      .select('*')
      .eq('business_id', businessId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })

    if (locationsError) {
      console.error('Error fetching locations:', locationsError)
      return NextResponse.json(
        { error: 'Failed to fetch locations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: locations || [] })
  } catch (error: unknown) {
    console.error('Locations GET error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch locations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { business_id, id, ...locationData } = body

    if (!business_id) {
      return NextResponse.json(
        { error: 'Missing required field: business_id' },
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

    // Verify business access with proper permissions
    const { data: businessUser } = await supabase
      .from('business_users')
      .select('id, role, is_active, permissions')
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

    // Check if user has permission to manage locations
    const permissions = businessUser.permissions as Record<string, boolean> | null
    if (businessUser.role !== 'owner' && !permissions?.manage_settings) {
      return NextResponse.json(
        { error: 'You do not have permission to manage locations' },
        { status: 403 }
      )
    }

    let result

    if (id) {
      // Update existing location
      const { data, error } = await supabase
        .from('business_locations')
        .update({
          ...locationData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('business_id', business_id)
        .select()
        .single()

      if (error) {
        console.error('Error updating location:', error)
        return NextResponse.json(
          { error: 'Failed to update location' },
          { status: 500 }
        )
      }

      result = data
    } else {
      // Create new location
      const { data, error } = await supabase
        .from('business_locations')
        .insert({
          business_id,
          ...locationData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating location:', error)
        return NextResponse.json(
          { error: 'Failed to create location' },
          { status: 500 }
        )
      }

      result = data
    }

    return NextResponse.json({
      data: result,
      message: id ? 'Location updated successfully' : 'Location created successfully',
    })
  } catch (error: unknown) {
    console.error('Locations POST error:', error)
    return NextResponse.json(
      {
        error: 'Failed to save location',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const businessId = searchParams.get('business_id')

    if (!id || !businessId) {
      return NextResponse.json(
        { error: 'Missing required parameters: id and business_id' },
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
      .select('id, role, is_active, permissions')
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

    // Check permissions
    const permissions = businessUser.permissions as Record<string, boolean> | null
    if (businessUser.role !== 'owner' && !permissions?.manage_settings) {
      return NextResponse.json(
        { error: 'You do not have permission to delete locations' },
        { status: 403 }
      )
    }

    // Prevent deleting primary location
    const { data: location } = await supabase
      .from('business_locations')
      .select('is_primary')
      .eq('id', id)
      .eq('business_id', businessId)
      .single()

    if (location?.is_primary) {
      return NextResponse.json(
        { error: 'Cannot delete primary location' },
        { status: 400 }
      )
    }

    // Delete the location
    const { error: deleteError } = await supabase
      .from('business_locations')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId)

    if (deleteError) {
      console.error('Error deleting location:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete location' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully',
    })
  } catch (error: unknown) {
    console.error('Locations DELETE error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete location',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
