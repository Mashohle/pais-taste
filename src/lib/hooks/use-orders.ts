import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/contexts/auth-context'
import { Order, ReorderItem } from '@/types/order'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchOrders()

      // Real-time subscription - filter by user
      const subscription = supabase
        .channel('user-orders')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}` // Only listen to current user's orders
          },
          () => fetchOrders()
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    } else {
      // Clear data if no user
      setOrders([])
      setActiveOrders([])
      setOrderHistory([])
      setLoading(false)
    }
  }, [user])

  const fetchOrders = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)


      const { data, error: fetchError } = await supabase
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
        .eq('user_id', user.id) // Filter by current user
        .order('created_at', { ascending: false })

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
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: paymentStatusCode, // Backward compatibility
          payment_status_code: paymentStatusCode // New configurable system
        })
        .eq('id', orderId)
        .eq('user_id', user?.id) // Security: only update own orders

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