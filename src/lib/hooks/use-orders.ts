import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  total_amount: number
  order_status: 'pending' | 'preparing' | 'ready' | 'collected' | 'completed'
  payment_status: 'pending' | 'paid'
  payment_method: 'online' | 'cash_on_pickup'
  pickup_location: string
  special_instructions: string | null
  created_at: string
  order_items: {
    quantity: number
    unit_price: number
    menu_items: {
      name: string
    } | null
  }[]
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    
    // Real-time subscription
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            menu_items (name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', orderId)

      if (error) throw error
      fetchOrders() // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  const updatePaymentStatus = async (orderId: string, paymentStatus: 'paid' | 'pending') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus })
        .eq('id', orderId)

      if (error) throw error
      fetchOrders() // Refresh orders
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  }

  return { orders, loading, updateOrderStatus, updatePaymentStatus }
}
