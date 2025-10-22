import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Order, ReorderItem } from '@/types/order'

interface UseOrdersOptions {
  businessId?: string // For admin view - filter by business instead of user
  userId?: string // For customer view - filter by user
}

export function useOrders(options?: UseOrdersOptions) {
  const [orders, setOrders] = useState<Order[]>([])
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use provided options or get from auth context (for backward compatibility)
  const businessId = options?.businessId
  const userId = options?.userId

  useEffect(() => {
    // Fetch orders if we have either businessId or userId
    if (businessId || userId) {
      fetchOrders()

      // Real-time subscription
      const filter = businessId
        ? `business_id=eq.${businessId}`
        : userId
        ? `user_id=eq.${userId}`
        : null

      if (filter) {
        const subscription = supabase
          .channel(businessId ? 'business-orders' : 'user-orders')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
              filter
            },
            () => fetchOrders()
          )
          .subscribe()

        return () => {
          subscription.unsubscribe()
        }
      }
    } else {
      // Clear data if no filter
      setOrders([])
      setActiveOrders([])
      setOrderHistory([])
      setLoading(false)
    }
  }, [businessId, userId])

  const fetchOrders = async () => {
    if (!businessId && !userId) return

    try {
      setLoading(true)
      setError(null)

      // Build query with appropriate filter
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            menu_item_id,
            with_combo,
            menu_items (name, business_id)
          ),
          businesses (
            id,
            name,
            business_categories (name)
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filter based on what's provided
      if (businessId) {
        query = query.eq('business_id', businessId)
      } else if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        if (fetchError.message?.includes('relation "public.orders" does not exist')) {
          // Orders table doesn't exist - this is normal for empty database
          console.log('Orders table does not exist, showing empty order history')
          setOrders([])
          setActiveOrders([])
          setOrderHistory([])
          return
        }
        if (fetchError.message?.includes('infinite recursion') || 
            fetchError.message?.includes('policy') ||
            fetchError.code === '42P17') {
          // RLS policy issues - gracefully handle by showing empty orders
          console.log('RLS policy issue with orders, showing empty order history')
          setOrders([])
          setActiveOrders([])
          setOrderHistory([])
          return
        }
        throw fetchError
      }

      const allOrders = data || []
      setOrders(allOrders)

      // Split into active and history using configurable statuses
      const active = allOrders.filter(order => {
        const statusCode = order.order_status_code || order.order_status
        return !['collected', 'completed', 'cancelled'].includes(statusCode)
      })
      const history = allOrders.filter(order => {
        const statusCode = order.order_status_code || order.order_status
        return ['collected', 'completed', 'cancelled'].includes(statusCode)
      })

      setActiveOrders(active)
      setOrderHistory(history)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, statusCode: string) => {
    try {
      setError(null)
      
      // Use the new updateOrderStatus from orders.ts which handles validation
      const { updateOrderStatus: updateStatus } = await import('@/lib/orders')
      await updateStatus(orderId, statusCode)
      
      await fetchOrders() // Refresh orders
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status'
      setError(errorMessage)
      console.error('Error updating order status:', error)
      throw error
    }
  }

  const updatePaymentStatus = async (orderId: string, paymentStatusCode: string) => {
    try {
      setError(null)

      // Build update query
      let query = supabase
        .from('orders')
        .update({
          payment_status: paymentStatusCode, // Backward compatibility
          payment_status_code: paymentStatusCode // New configurable system
        })
        .eq('id', orderId)

      // Add security filter based on context
      if (businessId) {
        query = query.eq('business_id', businessId) // Business admin: only update own business orders
      } else if (userId) {
        query = query.eq('user_id', userId) // Customer: only update own orders
      }

      const { error } = await query

      if (error) throw error

      await fetchOrders() // Refresh orders
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update payment status'
      setError(errorMessage)
      console.error('Error updating payment status:', error)
      throw error
    }
  }

  const reorderItems = async (orderId: string): Promise<ReorderItem[]> => {
    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) throw new Error('Order not found')
      if (!order.business_id) throw new Error('Order missing business information')

      // Return order items for cart integration with business_id
      return order.order_items.map(item => ({
        name: item.menu_items?.name || 'Unknown Item',
        quantity: item.quantity,
        unit_price: item.unit_price,
        menu_item_id: item.menu_item_id,
        business_id: order.business_id
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder items'
      setError(errorMessage)
      throw error
    }
  }

  const refetch = fetchOrders

  return { 
    orders, 
    activeOrders, 
    orderHistory, 
    loading, 
    error,
    updateOrderStatus, 
    updatePaymentStatus,
    reorderItems,
    refetch
  }
}