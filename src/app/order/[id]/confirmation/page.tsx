"use client"

import { useSearchParams } from "next/navigation"
import { CheckCircle, Clock, MapPin, Hash, ArrowLeft, Truck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useOrders } from '@/lib/hooks/use-orders'
import { supabase } from '@/lib/supabase'

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")
  const { orders, loading } = useOrders()
  const [order, setOrder] = useState<any>(null)
  const [orderNotFound, setOrderNotFound] = useState(false)
  const [businessData, setBusinessData] = useState<any>(null)

  useEffect(() => {
    if (!orderId) {
      setOrderNotFound(true)
      return
    }

    if (!loading && orders.length > 0) {
      const foundOrder = orders.find(o => o.id === orderId)
      if (foundOrder) {
        setOrder(foundOrder)
        loadBusinessData(foundOrder.business_id)
      } else {
        setOrderNotFound(true)
      }
    }
  }, [orderId, orders, loading])

  const loadBusinessData = async (businessId: string) => {
    if (!businessId) return

    try {
      const { data: business, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_categories (
            id,
            name,
            description,
            icon,
            color
          )
        `)
        .eq('id', businessId)
        .single()

      if (error) throw error
      setBusinessData(business)
    } catch (error) {
      console.error('Error loading business data:', error)
    }
  }

  const getEstimatedTime = () => {
    if (!order || !businessData) return "Processing..."
    
    const statusTimes = {
      'received': businessData.settings?.food?.estimated_prep_time || '25-30 minutes',
      'preparing': '15-20 minutes',
      'ready': 'Ready now!',
      'collected': 'Completed',
      'completed': 'Completed'
    }
    
    return statusTimes[order.order_status as keyof typeof statusTimes] || '25-30 minutes'
  }

  const getPickupAddress = () => {
    if (!businessData) return order?.pickup_location || 'Location TBD'
    
    // Build address from business data
    const addressParts = [
      businessData.address_line1,
      businessData.address_line2,
      businessData.city,
      businessData.state
    ].filter(Boolean)
    
    return addressParts.length > 0 ? addressParts.join(', ') : (order?.pickup_location || 'Location TBD')
  }

  const getOrderDisplayId = () => {
    if (!order || !businessData) return "ORD-XXX"
    const prefix = businessData.name.substring(0, 3).toUpperCase()
    return `${prefix}-${order.id.slice(-3).toUpperCase()}`
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-700">Loading your order...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (orderNotFound || !order) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Order Not Found</h1>
          <p className="text-stone-600 mb-6">
            We couldn't find an order with that ID. Please check your order number or contact us for assistance.
          </p>
          <Link href="/">
            <Button className="bg-stone-700 hover:bg-stone-800">
              Back to Menu
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden">
      <div className="fixed right-0 top-0 h-full w-48 sm:w-64 lg:w-96 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <svg
            className="absolute top-10 right-4 sm:right-8 w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 text-stone-600 opacity-50"
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.4" />
            <path d="M20 50 L80 50 M50 20 L50 80" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          </svg>

          <svg
            className="absolute top-48 right-8 sm:right-16 w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 text-stone-500 opacity-45"
            viewBox="0 0 100 100"
          >
            <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="50,30 70,70 30,70" fill="currentColor" opacity="0.3" />
          </svg>

          <div className="absolute top-16 right-0 w-24 sm:w-32 lg:w-48 h-0.5 bg-gradient-to-l from-stone-600/50 to-transparent"></div>
          <div className="absolute top-32 right-4 sm:right-8 w-20 sm:w-28 lg:w-40 h-0.5 bg-gradient-to-l from-stone-500/40 to-transparent"></div>
        </div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-2xl w-full">
          <div className="relative bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-200/50 overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-2xl"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/60 to-transparent rounded-t-2xl"></div>

            <div className="relative text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <CheckCircle className="w-20 h-20 sm:w-24 sm:h-24 text-emerald-600 drop-shadow-lg" />
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20"></div>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 drop-shadow-sm">Order Placed!</h1>
                <p className="text-stone-600 text-lg">
                  {businessData 
                    ? `Your order from ${businessData.name} is being prepared with care`
                    : "Your order is being prepared with care"
                  }
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-stone-200/60">
                <Hash className="w-5 h-5 text-stone-600" />
                <span className="font-mono text-lg font-semibold text-stone-800">{getOrderDisplayId()}</span>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-200/50 overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-2xl"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/60 to-transparent rounded-t-2xl"></div>

            <div className="relative space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 text-center">Order Summary</h2>

              <div className="space-y-3">
                {order.order_items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-stone-200/60"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-stone-800">
                        {item.menu_items?.name || 'Unknown Item'}
                      </h3>
                      <p className="text-sm text-stone-600">R{item.unit_price} each</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-stone-700 border-stone-400 bg-stone-50/90 mb-1">
                        x{item.quantity}
                      </Badge>
                      <p className="font-semibold text-stone-800">R{item.unit_price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-stone-800 text-white rounded-lg p-4 text-center">
                <p className="text-sm opacity-90 mb-1">Total Amount</p>
                <p className="text-2xl sm:text-3xl font-bold">R{order.total_amount}</p>
                <div className="mt-2 flex justify-center">
                  <Badge className={`text-xs ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-yellow-600 text-white'
                  }`}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Payment on Pickup'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-200/50 overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-2xl"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/60 to-transparent rounded-t-2xl"></div>

            <div className="relative space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 text-center mb-6">Pickup Information</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-stone-200/60">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-sm text-stone-600">Estimated Time</p>
                      <p className="font-semibold text-stone-800">{getEstimatedTime()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-stone-200/60">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-sm text-stone-600">Pickup Location</p>
                      <p className="font-semibold text-stone-800">{order.pickup_location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-stone-200/60">
                <p className="text-sm text-stone-600 mb-1">Full Address</p>
                <p className="text-stone-800">{getPickupAddress()}</p>
                {businessData?.phone && (
                  <p className="text-stone-600 text-sm mt-2">📞 {businessData.phone}</p>
                )}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-emerald-800 text-sm text-center">
                  💚 We'll call you at {order.customer_phone} within 10 minutes to confirm your order
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href={`/order/track/${order.id}`} className="block">
              <Button
                size="lg"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-lg py-6"
              >
                <Truck className="w-5 h-5 mr-2" />
                Track Your Order
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-stone-300 text-stone-700 hover:bg-stone-50 py-4 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}