import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business_id from query params
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('business_id')

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
    }

    // Verify user has access to this business
    const { data: businessUser } = await supabase
      .from('business_users')
      .select('id')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .single()

    if (!businessUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get business category to return relevant stats
    const { data: business } = await supabase
      .from('businesses')
      .select('category_id')
      .eq('id', businessId)
      .single()

    const category = business?.category_id || 'food'

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let stats = {}

    if (category === 'food') {
      // Food business stats
      const [
        { count: newOrders },
        { count: preparingOrders },
        { count: readyOrders },
        { data: todaySales },
      ] = await Promise.all([
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('order_status', 'received'),
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('order_status', 'preparing'),
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('order_status', 'ready'),
        supabase
          .from('orders')
          .select('total_amount')
          .eq('business_id', businessId)
          .eq('order_status', 'completed')
          .gte('completed_at', today.toISOString())
          .lt('completed_at', tomorrow.toISOString()),
      ])

      const totalSales = todaySales?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      stats = {
        newOrders: newOrders || 0,
        inKitchen: preparingOrders || 0,
        ready: readyOrders || 0,
        todaySales: totalSales,
      }
    } else if (category === 'retail') {
      // Retail business stats
      const [{ count: products }, { count: lowStock }, { count: orders }, { data: todaySales }] =
        await Promise.all([
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessId),
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessId)
            .lt('stock_quantity', 10),
          supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessId)
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString()),
          supabase
            .from('orders')
            .select('total_amount')
            .eq('business_id', businessId)
            .eq('order_status', 'completed')
            .gte('completed_at', today.toISOString())
            .lt('completed_at', tomorrow.toISOString()),
        ])

      const totalRevenue = todaySales?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      stats = {
        products: products || 0,
        lowStock: lowStock || 0,
        orders: orders || 0,
        revenue: totalRevenue,
      }
    } else {
      // Service business stats (service, car_wash, salon)
      const [{ count: todayBookings }, { count: activeStaff }, { count: inProgress }, { data: todaySales }] =
        await Promise.all([
          supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessId)
            .gte('booking_date', today.toISOString())
            .lt('booking_date', tomorrow.toISOString()),
          supabase
            .from('staff')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessId)
            .eq('is_active', true),
          supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessId)
            .eq('status', 'in_progress'),
          supabase
            .from('bookings')
            .select('total_price')
            .eq('business_id', businessId)
            .gte('booking_date', today.toISOString())
            .lt('booking_date', tomorrow.toISOString()),
        ])

      const totalRevenue = todaySales?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0

      stats = {
        todayBookings: todayBookings || 0,
        activeStaff: activeStaff || 0,
        inProgress: inProgress || 0,
        revenue: totalRevenue,
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      category,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
