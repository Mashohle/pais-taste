import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') // 'all', 'completed', 'cancelled', etc.
    const businessId = searchParams.get('business_id')
    const timeRange = searchParams.get('time_range') // 'week', 'month', '3months', 'year', 'all'

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

    // Build query - Only show orders with final/ended statuses (completed, cancelled)
    // These are orders that are no longer active
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
      .in('order_status_code', ['completed', 'cancelled']) // Only final/ended statuses
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('order_status_code', status)
    }

    // Apply business filter
    if (businessId && businessId !== 'all') {
      query = query.eq('business_id', businessId)
    }

    // Apply time range filter
    if (timeRange && timeRange !== 'all') {
      const now = new Date()
      let fromDate = new Date()

      switch (timeRange) {
        case 'week':
          fromDate.setDate(now.getDate() - 7)
          break
        case 'month':
          fromDate.setMonth(now.getMonth() - 1)
          break
        case '3months':
          fromDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          fromDate.setFullYear(now.getFullYear() - 1)
          break
      }

      query = query.gte('created_at', fromDate.toISOString())
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching order history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch order history', details: error },
        { status: 500 }
      )
    }

    // Get total count for pagination - only final/ended orders
    let countQuery = supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('order_status_code', ['completed', 'cancelled'])

    if (status && status !== 'all') {
      countQuery = countQuery.eq('order_status_code', status)
    }

    if (businessId && businessId !== 'all') {
      countQuery = countQuery.eq('business_id', businessId)
    }

    const { count } = await countQuery

    // Calculate summary statistics - only for final/ended orders
    const allOrdersQuery = supabase
      .from('orders')
      .select('id, total_amount, order_status_code, business_id, businesses(id, category_id)')
      .eq('user_id', user.id)
      .in('order_status_code', ['completed', 'cancelled'])

    const { data: allOrders } = await allOrdersQuery

    const stats = {
      totalOrders: allOrders?.length || 0,
      totalSpent: allOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
      completedOrders: allOrders?.filter(order =>
        order.order_status_code === 'completed' || order.order_status_code === 'collected'
      ).length || 0,
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
      orders,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      },
      stats
    })
  } catch (error) {
    console.error('Error in order history route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
