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
            menu_items (name)
          )
        `)
        .eq('user_id', user.id) // Filter by current user
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const allOrders = data || []
      setOrders(allOrders)

      // Split into active and history
      const active = allOrders.filter(order => 
        ['received', 'preparing', 'ready'].includes(order.order_status)
      )
      const history = allOrders.filter(order => 
        ['collected', 'completed'].includes(order.order_status)
      )

      setActiveOrders(active)
      setOrderHistory(history)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', orderId)
        .eq('user_id', user?.id) // Security: only update own orders

      if (error) throw error
      
      await fetchOrders() // Refresh orders
    } catch (error) {
      setError(error.message || 'Failed to update order status')
      console.error('Error updating order status:', error)
      throw error
    }
  }

  const updatePaymentStatus = async (orderId: string, paymentStatus: 'paid' | 'pending') => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus })
        .eq('id', orderId)
        .eq('user_id', user?.id) // Security: only update own orders

      if (error) throw error
      
      await fetchOrders() // Refresh orders
    } catch (error) {
      setError(error.message || 'Failed to update payment status')
      console.error('Error updating payment status:', error)
      throw error
    }
  }

  const reorderItems = async (orderId: string): Promise<ReorderItem[]> => {
    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) throw new Error('Order not found')

      // Return order items for cart integration
      return order.order_items.map(item => ({
        name: item.menu_items?.name || 'Unknown Item',
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    } catch (error) {
      setError(error.message || 'Failed to reorder items')
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