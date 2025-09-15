import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const menuItemId = params.id
    const businessId = request.nextUrl.searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
    }

    // Verify user has access to this business
    const { data: businessUser } = await supabase
      .from('business_users')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single()

    if (!businessUser) {
      return NextResponse.json({ error: 'Access denied to business' }, { status: 403 })
    }

    // Fetch specific menu item
    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', menuItemId)
      .eq('business_id', businessId)
      .single()

    if (error) {
      console.error('Error fetching menu item:', error)
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error('Menu item API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const menuItemId = params.id
    const body = await request.json()
    const { businessId, ...updateData } = body

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
    }

    // Verify user has admin access to this business
    const { data: businessUser } = await supabase
      .from('business_users')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single()

    if (!businessUser || !['owner', 'admin', 'staff'].includes(businessUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update menu item (ensure it belongs to the business)
    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', menuItemId)
      .eq('business_id', businessId)
      .select()
      .single()

    if (error) {
      console.error('Error updating menu item:', error)
      return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
    }

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error('Menu item update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const menuItemId = params.id
    const businessId = request.nextUrl.searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
    }

    // Verify user has admin access to this business
    const { data: businessUser } = await supabase
      .from('business_users')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single()

    if (!businessUser || !['owner', 'admin'].includes(businessUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get menu item first to check if it has an image to delete
    const { data: menuItem } = await supabase
      .from('menu_items')
      .select('image_url')
      .eq('id', menuItemId)
      .eq('business_id', businessId)
      .single()

    // Delete image from storage if it exists
    if (menuItem?.image_url) {
      const urlParts = menuItem.image_url.split('/storage/v1/object/public/menu-images/')
      if (urlParts.length === 2) {
        const filePath = urlParts[1]
        await supabase.storage
          .from('menu-images')
          .remove([filePath])
      }
    }

    // Delete menu item (ensure it belongs to the business)
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', menuItemId)
      .eq('business_id', businessId)

    if (error) {
      console.error('Error deleting menu item:', error)
      return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Menu item deletion API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}