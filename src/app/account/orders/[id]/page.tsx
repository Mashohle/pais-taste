"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  MapPin,
  Phone,
  User,
  Receipt,
  CreditCard,
  Repeat,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useCustomerAuth } from "@/lib/context/customer-auth-context"
import { useCart } from "@/lib/context/cart-context"
import { MobilePageHeader } from "@/components/account/mobile-page-header"

interface OrderDetails {
  id: string
  business_id: string
  customer_name: string
  customer_phone: string
  total_amount: number
  order_status: 'received' | 'preparing' | 'ready' | 'collected' | 'completed'
  payment_status: 'pending' | 'paid'
  payment_method: 'online' | 'cash_on_pickup'
  pickup_location: string
  special_instructions: string | null
  created_at: string
  updated_at: string
  order_items: {
    id: string
    quantity: number
    unit_price: number
    menu_items: {
      name: string
      description?: string
    } | null
  }[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "received":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "preparing":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "ready":
      return "bg-green-100 text-green-800 border-green-200"
    case "collected":
    case "completed":
      return "bg-stone-100 text-stone-800 border-stone-200"
    default:
      return "bg-stone-100 text-stone-800 border-stone-200"
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200"
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200"
    default:
      return "bg-stone-100 text-stone-800 border-stone-200"
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount)
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useCustomerAuth()
  const { addItem } = useCart()

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reordering, setReordering] = useState(false)

  const orderId = params.id as string

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            menu_items (
              name,
              description
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user?.id) // Security: only own orders
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Order not found')
        } else {
          throw fetchError
        }
        return
      }

      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order details')
      console.error('Error fetching order:', err)
    } finally {
      setLoading(false)
    }
  }, [orderId, user])

  useEffect(() => {
    if (orderId && user) {
      fetchOrderDetails()
    }
  }, [orderId, user, fetchOrderDetails])

  const handleReorder = async () => {
    if (!order) return

    try {
      setReordering(true)

      // Convert order items to cart items format
      const cartItems = order.order_items
        .filter(item => item.menu_items) // Only include items with menu data
        .map(item => ({
          business_id: order.business_id || '', // Use business_id from order
          item_type: 'menu_item' as const,
          name: item.menu_items!.name,
          description: item.menu_items!.description,
          price: item.unit_price,
          quantity: item.quantity,
          menu_item_id: item.id,
          is_available: true
        }))

      if (cartItems.length === 0) {
        alert('No items available to reorder.')
        return
      }

      // Add all items to cart
      // Note: We don't have full business details, so just add items without business context
      cartItems.forEach(item => {
        addItem(item)
      })

      // Show success message
      const itemNames = cartItems.map(item => item.name).join(', ')
      alert(`Items added to cart: ${itemNames}`)

    } catch (error) {
      console.error('Error reordering:', error)
      alert('Failed to reorder items. Please try again.')
    } finally {
      setReordering(false)
    }
  }

  const handleCallRestaurant = () => {
    const phoneNumber = "+27 12 345 6789" // Your restaurant phone number
    window.open(`tel:${phoneNumber}`)
  }

  if (loading) {
    return (
      <>
        {/* Mobile View */}
        <div className="md:hidden min-h-screen bg-stone-50">
          <MobilePageHeader
            title="Order Details"
            subtitle="Loading order information..."
            showBackButton={true}
            onBackClick={() => router.back()}
          />
          <div className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-24" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
            <div className="px-5 pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-stone-600 mx-auto mb-4" />
                  <p className="text-stone-600">Loading order details...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block max-w-4xl mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-stone-600 mx-auto mb-4" />
              <p className="text-stone-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        {/* Mobile View */}
        <div className="md:hidden min-h-screen bg-stone-50">
          <MobilePageHeader
            title="Order Details"
            subtitle="Order not found"
            showBackButton={true}
            onBackClick={() => router.back()}
          />
          <div className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-24" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
            <div className="px-5 pt-6">
              <Card className="p-4 bg-red-50/50 border-red-200">
                <CardContent className="p-0 text-center py-12">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-red-800 mb-2">
                    {error || 'Order Not Found'}
                  </h3>
                  <p className="text-red-600 mb-6">
                    The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
                  </p>
                  <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="border-red-300 text-red-700"
                  >
                    Go Back
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block max-w-4xl mx-auto px-4 py-6 md:py-8">
          <Card className="p-4 bg-red-50/50 border-red-200">
            <CardContent className="p-0 text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-800 mb-2">
                {error || 'Order Not Found'}
              </h3>
              <p className="text-red-600 mb-6">
                The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
              </p>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="border-red-300 text-red-700"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-stone-50">
        <MobilePageHeader
          title="Order Details"
          subtitle={`Order #${order.id.slice(-8)}`}
          showBackButton={true}
          onBackClick={() => router.back()}
        />
        <div className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-24" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
          <div className="px-5 pt-6">
            {/* Status Badges */}
            <div className="flex gap-2 mb-4">
              <Badge className={`${getStatusColor(order.order_status)} text-xs`}>
                {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
              </Badge>
              <Badge className={`${getPaymentStatusColor(order.payment_status)} text-xs`}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </Badge>
            </div>

            <p className="text-sm text-stone-600 mb-4">
              Placed on {formatDate(order.created_at)}
            </p>

            <div className="space-y-2.5">
        {/* Order Items */}
        <Card className="p-4 bg-white border-stone-200 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-orange-700" />
              </div>
              <h2 className="text-lg font-semibold text-stone-800">Order Items</h2>
            </div>

            <div className="space-y-2.5">
              {order.order_items.map((item, index) => (
                <div key={index} className="p-3 bg-stone-50 rounded-lg">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-stone-800 truncate">
                        {item.menu_items?.name || 'Unknown Item'}
                      </h4>
                      {item.menu_items?.description && (
                        <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                          {item.menu_items.description}
                        </p>
                      )}
                      <p className="text-sm text-stone-500 mt-1">
                        {formatCurrency(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-stone-800">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Information */}
        <Card className="p-4 bg-white border-stone-200 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-700" />
              </div>
              <h2 className="text-lg font-semibold text-stone-800">Order Information</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Customer</p>
                  <p className="font-medium text-stone-800 truncate">{order.customer_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Phone</p>
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="font-medium text-stone-800 hover:text-blue-600 truncate block"
                  >
                    {order.customer_phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Pickup Location</p>
                  <p className="font-medium text-stone-800">{order.pickup_location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Payment Method</p>
                  <p className="font-medium text-stone-800 capitalize">
                    {order.payment_method.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Last Updated</p>
                  <p className="font-medium text-stone-800 text-sm">{formatDate(order.updated_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        {order.special_instructions && (
          <Card className="p-4 bg-amber-50 border-amber-200 shadow-sm">
            <CardContent className="p-0">
              <h3 className="font-semibold text-stone-800 mb-2">Special Instructions</h3>
              <p className="text-stone-700 text-sm">{order.special_instructions}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card className="p-4 bg-white border-stone-200 shadow-sm">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Button
                onClick={handleReorder}
                disabled={reordering}
                className="flex-1 bg-stone-700 hover:bg-stone-800 text-white"
              >
                {reordering ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Repeat className="w-4 h-4 mr-2" />
                )}
                Reorder Items
              </Button>

              <Button
                onClick={handleCallRestaurant}
                variant="outline"
                className="flex-1 border-stone-300 text-stone-700 hover:bg-stone-100"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Restaurant
              </Button>
            </div>
          </CardContent>
        </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800 mb-1">
            Order Details
          </h1>
          <p className="text-sm text-stone-500 mb-2">
            Order #{order.id.slice(-8)}
          </p>
          <p className="text-stone-600 mb-3">
            Placed on {formatDate(order.created_at)}
          </p>
          <div className="flex gap-2">
            <Badge className={`${getStatusColor(order.order_status)}`}>
              {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
            </Badge>
            <Badge className={`${getPaymentStatusColor(order.payment_status)}`}>
              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Items */}
          <Card className="p-4 bg-white border-stone-200 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-orange-700" />
                </div>
                <h2 className="text-lg font-semibold text-stone-800">Order Items</h2>
              </div>

              <div className="space-y-2.5">
                {order.order_items.map((item, index) => (
                  <div key={index} className="p-3 bg-stone-50 rounded-lg">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-stone-800 truncate">
                          {item.menu_items?.name || 'Unknown Item'}
                        </h4>
                        {item.menu_items?.description && (
                          <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                            {item.menu_items.description}
                          </p>
                        )}
                        <p className="text-sm text-stone-500 mt-1">
                          {formatCurrency(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-stone-800">
                          {formatCurrency(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card className="p-4 bg-white border-stone-200 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-700" />
                </div>
                <h2 className="text-lg font-semibold text-stone-800">Order Information</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Customer</p>
                    <p className="font-medium text-stone-800 truncate">{order.customer_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Phone</p>
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="font-medium text-stone-800 hover:text-blue-600 truncate block"
                    >
                      {order.customer_phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Pickup Location</p>
                    <p className="font-medium text-stone-800">{order.pickup_location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Payment Method</p>
                    <p className="font-medium text-stone-800 capitalize">
                      {order.payment_method.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Last Updated</p>
                    <p className="font-medium text-stone-800 text-sm">{formatDate(order.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {order.special_instructions && (
            <Card className="p-4 bg-amber-50 border-amber-200 shadow-sm">
              <CardContent className="p-0">
                <h3 className="font-semibold text-stone-800 mb-2">Special Instructions</h3>
                <p className="text-stone-700 text-sm">{order.special_instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card className="p-4 bg-white border-stone-200 shadow-sm">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button
                  onClick={handleReorder}
                  disabled={reordering}
                  className="flex-1 bg-stone-700 hover:bg-stone-800 text-white"
                >
                  {reordering ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Repeat className="w-4 h-4 mr-2" />
                  )}
                  Reorder Items
                </Button>

                <Button
                  onClick={handleCallRestaurant}
                  variant="outline"
                  className="flex-1 border-stone-300 text-stone-700 hover:bg-stone-100"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Restaurant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}