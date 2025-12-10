import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { CartItem } from '@/lib/services/cart.service'

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

export async function POST(request: Request) {
  try {
    const orderData: OrderData = await request.json()

    // Validate required fields
    if (!orderData.customer_name || !orderData.customer_phone || !orderData.business_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create a Supabase client with service role to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get business info to determine appropriate statuses and generate order reference
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('category_id, name')
      .eq('id', orderData.business_id)
      .single()

    if (businessError) {
      return NextResponse.json(
        { error: 'Business not found', details: businessError },
        { status: 404 }
      )
    }

    const businessCategory = (business?.category_id as BusinessCategory) || 'food'
    const config = BUSINESS_ORDER_CONFIGS[businessCategory]

    // Validate payment method is allowed for this business type
    if (orderData.payment_method && !config.allowedPaymentMethods.includes(orderData.payment_method)) {
      return NextResponse.json(
        { error: `Payment method ${orderData.payment_method} not supported for ${businessCategory} businesses` },
        { status: 400 }
      )
    }

    // Determine initial statuses based on business type and payment method
    const isOnlinePayment = orderData.payment_method === 'online'
    const orderStatusCode = config.defaultOrderStatus
    const paymentStatusCode = isOnlinePayment ? 'paid' : config.defaultPaymentStatus

    // 1. Create the order with business-specific status codes
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        user_id: orderData.user_id || null,
        business_id: orderData.business_id,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        total_amount: orderData.total_amount,
        pickup_location: orderData.pickup_location,
        special_instructions: orderData.special_instructions,
        order_status: orderStatusCode,
        order_status_code: orderStatusCode,
        payment_status: paymentStatusCode,
        payment_status_code: paymentStatusCode,
        payment_method: orderData.payment_method || 'cash_on_pickup'
      }])
      .select()
      .single()

    if (orderError) {
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError },
        { status: 500 }
      )
    }

    // 2. Generate and update reference
    // Format: [FIRST_3_CHARS_OF_BUSINESS_NAME]-[LAST_5_CHARS_OF_UUID]
    const businessPrefix = business.name.substring(0, 3).toUpperCase()
    const orderSuffix = order.id.slice(-5).toUpperCase()
    const reference = `${businessPrefix}-${orderSuffix}`

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ reference })
      .eq('id', order.id)

    if (updateError) {
      console.error('Failed to update reference:', updateError)
      // Don't fail the whole order creation, just log the error
    }

    // Add reference to the returned order object
    order.reference = reference

    // 3. Get menu item IDs by matching names/prices and business_id
    const orderItemsPromises = orderData.items.map(async (item) => {
      let menuItemId = item.menu_item_id || null

      // If no menu_item_id, try to find by name, price and business_id
      if (!menuItemId) {
        const { data: menuItem } = await supabaseAdmin
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
        business_id: orderData.business_id,
        quantity: item.quantity,
        unit_price: item.price,
        with_combo: false
      }
    })

    const orderItems = await Promise.all(orderItemsPromises)

    // 3. Insert order items using service role (bypasses RLS)
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // If order items fail, try to clean up the order
      await supabaseAdmin.from('orders').delete().eq('id', order.id)

      return NextResponse.json(
        { error: 'Failed to create order items', details: itemsError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
