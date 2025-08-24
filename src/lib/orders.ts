import { supabase } from './supabase'
import { CartItem } from './contexts/cart-context'

interface OrderData {
  customer_name: string
  customer_phone: string
  pickup_location: string
  special_instructions?: string
  total_amount: number
  items: CartItem[]
  payment_method?: 'online' | 'cash_on_pickup'
  user_id?: string
}

export async function createOrder(orderData: OrderData) {
  try {
    // Determine initial statuses based on payment method
    const isOnlinePayment = orderData.payment_method === 'online'
    const orderStatus = 'received' // Always start as received
    const paymentStatus = isOnlinePayment ? 'paid' : 'pending'

    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: orderData.user_id || null,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        total_amount: orderData.total_amount,
        pickup_location: orderData.pickup_location,
        special_instructions: orderData.special_instructions,
        order_status: orderStatus,
        payment_status: paymentStatus,
        payment_method: orderData.payment_method || 'cash_on_pickup'
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // 2. Rest of your existing order items logic...
    const orderItemsPromises = orderData.items.map(async (item) => {
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('id')
        .eq('name', item.name)
        .eq('price', item.price)
        .single()

      return {
        order_id: order.id,
        menu_item_id: menuItem?.id || null,
        quantity: item.quantity,
        unit_price: item.price,
        with_combo: item.type === 'combo'
      }
    })

    const orderItems = await Promise.all(orderItemsPromises)

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

// Helper function to update payment status
export async function markOrderAsPaid(orderId: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', orderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error marking order as paid:', error)
    throw error
  }
}
