"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  User,
  Receipt,
  CreditCard,
  Repeat,
  Loader2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/contexts/auth-context"
import { useCart } from "@/lib/contexts/cart-context"

interface OrderDetails {
  id: string
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
  const { user } = useAuth()
  const { addReorderItems, setCartOpen } = useCart()
  
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

      const reorderItems = order.order_items.map(item => ({
        name: item.menu_items?.name || 'Unknown Item',
        quantity: item.quantity,
        unit_price: item.unit_price
      }))

      addReorderItems(reorderItems)
      setCartOpen(true)

      // Show success message
      const itemNames = reorderItems.map(item => item.name).join(', ')
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-stone-600 mx-auto mb-4" />
            <p className="text-stone-600">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/account/orders"
            className="inline-flex items-center text-stone-600 hover:text-stone-800 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </div>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-800 mb-2">
              {error || 'Order Not Found'}
            </h3>
            <p className="text-red-600 mb-6">
              The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <Link href="/account/orders">
              <Button variant="outline" className="border-red-300 text-red-700">
                Back to Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center text-stone-600 hover:text-stone-800 transition-colors text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">
              Order #{order.id.slice(-8)}
            </h1>
            <p className="text-stone-600">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Badge className={`${getStatusColor(order.order_status)}`}>
              {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
            </Badge>
            <Badge className={`${getPaymentStatusColor(order.payment_status)}`}>
              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="w-5 h-5" />
                <span>Order Items</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-3 bg-white/60 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-stone-800">
                      {item.menu_items?.name || 'Unknown Item'}
                    </h4>
                    {item.menu_items?.description && (
                      <p className="text-sm text-stone-600 mt-1">
                        {item.menu_items.description}
                      </p>
                    )}
                    <p className="text-sm text-stone-500 mt-1">
                      {formatCurrency(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-stone-800">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              <Separator className="my-4" />

              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {order.special_instructions && (
            <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-lg">
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone-700">{order.special_instructions}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info */}
          <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-lg">
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-stone-500" />
                <div>
                  <p className="text-sm text-stone-600">Customer</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-stone-500" />
                <div>
                  <p className="text-sm text-stone-600">Phone</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-stone-500" />
                <div>
                  <p className="text-sm text-stone-600">Pickup Location</p>
                  <p className="font-medium">{order.pickup_location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CreditCard className="w-4 h-4 text-stone-500" />
                <div>
                  <p className="text-sm text-stone-600">Payment Method</p>
                  <p className="font-medium capitalize">
                    {order.payment_method.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-stone-500" />
                <div>
                  <p className="text-sm text-stone-600">Last Updated</p>
                  <p className="font-medium">{formatDate(order.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-lg">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleReorder}
                disabled={reordering}
                className="w-full bg-stone-700 hover:bg-stone-800 text-white"
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
                className="w-full border-stone-300 text-stone-700 hover:bg-stone-100"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Restaurant
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}