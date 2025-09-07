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
  business_id: string
}

// Business type specific order handling
type BusinessCategory = 'food' | 'retail' | 'service'

interface BusinessOrderConfig {
  defaultOrderStatus: string
  defaultPaymentStatus: string
  allowedPaymentMethods: ('online' | 'cash_on_pickup')[]
}

const BUSINESS_ORDER_CONFIGS: Record<BusinessCategory, BusinessOrderConfig> = {
  food: {
    defaultOrderStatus: 'received',
    defaultPaymentStatus: 'pending', 
    allowedPaymentMethods: ['cash_on_pickup', 'online']
  },
  retail: {
    defaultOrderStatus: 'received',
    defaultPaymentStatus: 'pending',
    allowedPaymentMethods: ['online', 'cash_on_pickup']
  },
  service: {
    defaultOrderStatus: 'scheduled',
    defaultPaymentStatus: 'pending',
    allowedPaymentMethods: ['online']
  }
}

export async function createOrder(orderData: OrderData) {
  try {
    // Get business category to determine appropriate statuses
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('business_categories(name)')
      .eq('id', orderData.business_id)
      .single()
    
    if (businessError) throw businessError
    
    const businessCategory = business?.business_categories?.[0]?.name?.toLowerCase() as BusinessCategory || 'food'
    const config = BUSINESS_ORDER_CONFIGS[businessCategory]
    
    // Validate payment method is allowed for this business type
    if (orderData.payment_method && !config.allowedPaymentMethods.includes(orderData.payment_method)) {
      throw new Error(`Payment method ${orderData.payment_method} not supported for ${businessCategory} businesses`)
    }
    
    // Determine initial statuses based on business type and payment method
    const isOnlinePayment = orderData.payment_method === 'online'
    const orderStatusCode = config.defaultOrderStatus
    const paymentStatusCode = isOnlinePayment ? 'paid' : config.defaultPaymentStatus

    // 1. Create the order with business-specific status codes
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: orderData.user_id || null,
        business_id: orderData.business_id,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        total_amount: orderData.total_amount,
        pickup_location: orderData.pickup_location,
        special_instructions: orderData.special_instructions,
        order_status: orderStatusCode, // Keep for backward compatibility
        order_status_code: orderStatusCode, // New configurable status system
        payment_status: paymentStatusCode, // Keep for backward compatibility 
        payment_status_code: paymentStatusCode, // New configurable status system
        payment_method: orderData.payment_method || 'cash_on_pickup'
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // 2. Get menu item IDs by matching names/prices and business_id
    const orderItemsPromises = orderData.items.map(async (item) => {
      // First try to use the menu_item_id if available
      let menuItemId = item.menu_item_id || null
      
      // If no menu_item_id, try to find by name, price and business_id
      if (!menuItemId) {
        const { data: menuItem } = await supabase
          .from('menu_items')
          .select('id')
          .eq('name', item.name)
          .eq('price', item.price)
          .eq('business_id', orderData.business_id)
          .single()
        
        menuItemId = menuItem?.id || null
      }

      return {
        order_id: order.id,
        menu_item_id: menuItemId,
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

// Helper function to update order status with business validation
export async function updateOrderStatus(orderId: string, newStatusCode: string) {
  try {
    // Get current order and business info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('business_id, order_status_code')
      .eq('id', orderId)
      .single()
    
    if (orderError) throw orderError
    
    // Validate status transition is allowed
    const { data: currentStatus, error: statusError } = await supabase
      .from('order_statuses')
      .select('can_transition_to')
      .or(`business_id.eq.${order.business_id},business_id.is.null`)
      .eq('code', order.order_status_code)
      .order('business_id', { nullsFirst: false })
      .limit(1)
      .single()
    
    if (statusError) throw statusError
    
    if (currentStatus.can_transition_to && !currentStatus.can_transition_to.includes(newStatusCode)) {
      throw new Error(`Cannot transition from ${order.order_status_code} to ${newStatusCode}`)
    }
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        order_status: newStatusCode, // Backward compatibility
        order_status_code: newStatusCode 
      })
      .eq('id', orderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

// Helper function to update payment status
export async function markOrderAsPaid(orderId: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid', // Backward compatibility
        payment_status_code: 'paid'
      })
      .eq('id', orderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error marking order as paid:', error)
    throw error
  }
}

// Helper function to get valid status transitions for an order
export async function getValidStatusTransitions(orderId: string) {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('business_id, order_status_code')
      .eq('id', orderId)
      .single()
    
    if (orderError) throw orderError
    
    const { data: statuses, error: statusError } = await supabase
      .from('order_statuses')
      .select('code, name, can_transition_to')
      .or(`business_id.eq.${order.business_id},business_id.is.null`)
      .eq('code', order.order_status_code)
      .order('business_id', { nullsFirst: false })
      .limit(1)
    
    if (statusError) throw statusError
    
    return statuses[0]?.can_transition_to || []
  } catch (error) {
    console.error('Error getting valid status transitions:', error)
    return []
  }
}
