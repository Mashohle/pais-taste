import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business context from headers or query params
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

    // Fetch menu items for the business
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('business_id', businessId)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching menu items:', error)
      return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
    }

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error('Menu items API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { businessId, ...menuItemData } = body

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

    // Validate required fields
    if (!menuItemData.name || !menuItemData.price || !menuItemData.category) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 })
    }

    // Create menu item with business_id
    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .insert([{
        ...menuItemData,
        business_id: businessId
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating menu item:', error)
      return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
    }

    return NextResponse.json(menuItem, { status: 201 })
  } catch (error) {
    console.error('Menu item creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}