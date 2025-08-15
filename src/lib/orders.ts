import { supabase } from './supabase'
import { CartItem } from './context/cart-context'

interface OrderData {
  customer_name: string
  customer_phone: string
  pickup_location: string
  special_instructions?: string
  total_amount: number
  items: CartItem[]
  payment_method?: 'online' | 'cash_on_pickup'
}

export async function createOrder(orderData: OrderData) {
  try {
    // Determine initial statuses based on payment method
    const isOnlinePayment = orderData.payment_method === 'online'
    const orderStatus = 'pending' // Always start as pending
    const paymentStatus = isOnlinePayment ? 'paid' : 'pending' // Only paid if online payment

    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
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

    // 2. Get menu item IDs by matching names/prices (since CartItem might not have menu_item_id)
    const orderItemsPromises = orderData.items.map(async (item) => {
      // Try to find the menu item by name and price
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

// Export helper function to update payment status
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
