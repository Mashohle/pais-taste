import { supabase } from './supabase'
import { CartItem } from './context/cart-context'

interface OrderData {
  customer_name: string
  customer_phone: string
  pickup_location: string
  special_instructions?: string
  total_amount: number
  items: CartItem[]
}

export async function createOrder(orderData: OrderData) {
  try {
    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        total_amount: orderData.total_amount,
        pickup_location: orderData.pickup_location,
        special_instructions: orderData.special_instructions,
        order_status: 'paid', // Since we're not using payments yet
        payment_status: 'paid' // Assuming cash/manual payment - will later reflect properly even when its COD/COPU
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // 2. Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      menu_item_id: null, // We'll need to map this properly later
      quantity: item.quantity,
      unit_price: item.price,
      with_combo: item.type === 'combo'
    }))

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