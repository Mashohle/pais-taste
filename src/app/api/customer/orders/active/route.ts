import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') // 'all', 'received', 'preparing', 'ready'
    const businessId = searchParams.get('business_id')
    const categoryId = searchParams.get('category_id')

    // Create authenticated Supabase client
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Build query - Only show orders with active/in-progress statuses (received, preparing, ready, collected)
    // These are orders that are still being processed or recently collected
    let query = supabase
      .from('orders')
      .select(`
        *,
        businesses (
          id,
          name,
          slug,
          category_id,
          phone,
          business_categories (
            id,
            name,
            icon,
            color
          )
        ),
        order_items (
          quantity,
          unit_price,
          menu_item_id,
          menu_items (
            name,
            description,
            image_url
          )
        )
      `)
      .eq('user_id', user.id)
      .in('order_status_code', ['received', 'preparing', 'ready', 'collected']) // Only active/in-progress statuses
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter (for specific active status)
    if (status && status !== 'all') {
      query = query.eq('order_status_code', status)
    }

    // Apply business filter
    if (businessId && businessId !== 'all') {
      query = query.eq('business_id', businessId)
    }

    // Apply category filter (need to filter by business category)
    if (categoryId && categoryId !== 'all') {
      // We'll filter this after getting the results since we need to check businesses.category_id
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching active orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch active orders', details: error },
        { status: 500 }
      )
    }

    // Filter by category if specified (post-query filter)
    let filteredOrders = orders || []
    if (categoryId && categoryId !== 'all') {
      filteredOrders = filteredOrders.filter(order =>
        order.businesses?.category_id === categoryId
      )
    }

    // Get total count for pagination - only active orders
    let countQuery = supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('order_status_code', ['received', 'preparing', 'ready', 'collected'])

    if (status && status !== 'all') {
      countQuery = countQuery.eq('order_status_code', status)
    }

    if (businessId && businessId !== 'all') {
      countQuery = countQuery.eq('business_id', businessId)
    }

    const { count } = await countQuery

    // Calculate summary statistics - only for active orders
    const allOrdersQuery = supabase
      .from('orders')
      .select('id, total_amount, order_status_code, business_id, businesses(id, category_id)')
      .eq('user_id', user.id)
      .in('order_status_code', ['received', 'preparing', 'ready', 'collected'])

    const { data: allOrders } = await allOrdersQuery

    const stats = {
      totalActiveOrders: allOrders?.length || 0,
      totalValue: allOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
      ordersByStatus: allOrders?.reduce((acc, order) => {
        const status = order.order_status_code
        if (status) {
          acc[status] = (acc[status] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>),
      uniqueBusinesses: new Set(allOrders?.map(order => order.business_id)).size,
      ordersByCategory: allOrders?.reduce((acc, order) => {
        const categoryId = order.businesses?.category_id
        if (categoryId) {
          acc[categoryId] = (acc[categoryId] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      },
      stats
    })
  } catch (error) {
    console.error('Error in active orders route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
