"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, ChefHat, Package, MapPin, Phone, MessageCircle, ArrowLeft, User, Lock, Copy, Check } from "lucide-react"
import { useState, useEffect, use, useCallback } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useCustomerAuth } from "@/lib/context/customer-auth-context"
import { Order } from "@/types/order"

const getOrderStages = (businessType: string = 'food') => {
  const stageDescriptions = {
    food: {
      received: "Your order has been confirmed",
      preparing: "Our chefs are preparing your meal",
      ready: "Your order is ready for collection",
      completed: "Order has been collected"
    },
    retail: {
      received: "Your order has been confirmed",
      preparing: "We&apos;re picking your items",
      ready: "Your order is ready for pickup",
      completed: "Order has been collected"
    },
    service: {
      received: "Your booking has been confirmed",
      preparing: "Preparing for your appointment",
      ready: "Ready for your service",
      completed: "Service completed"
    }
  }

  const descriptions = stageDescriptions[businessType as keyof typeof stageDescriptions] || stageDescriptions.food

  return [
    {
      key: "received" as const,
      label: businessType === 'service' ? "Booking Confirmed" : "Order Received",
      icon: CheckCircle,
      description: descriptions.received,
    },
    {
      key: "preparing" as const,
      label: businessType === 'service' ? "Preparing" : "Preparing",
      icon: ChefHat,
      description: descriptions.preparing,
    },
    {
      key: "ready" as const,
      label: businessType === 'service' ? "Ready for Service" : "Ready for Pickup",
      icon: Package,
      description: descriptions.ready,
    },
    {
      key: "completed" as const,
      label: "Completed",
      icon: CheckCircle,
      description: descriptions.completed,
    },
  ]
}

interface OrderTrackingPageProps {
  params: Promise<{
    id: string
  }>
}

interface BusinessData {
  id: string
  name: string
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  business_categories?: {
    id: string
    name: string
    description?: string
    icon?: string
    color?: string
  }
  settings?: {
    food?: {
      estimated_prep_time?: string
    }
  }
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { user } = useCustomerAuth()
  const resolvedParams = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderNotFound, setOrderNotFound] = useState(false)
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [showPhoneVerification, setShowPhoneVerification] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchOrder = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }

      // Fetch order directly by ID (works for both authenticated and guest orders)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            menu_item_id,
            with_combo,
            menu_items (name, business_id)
          )
        `)
        .eq('id', resolvedParams.id)
        .single()

      if (orderError || !orderData) {
        setOrderNotFound(true)
        if (showLoading) {
          setLoading(false)
        }
        return
      }

      setOrder(orderData)
      await loadBusinessData(orderData.business_id)
      if (showLoading) {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setOrderNotFound(true)
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [resolvedParams.id])

  const checkAccessAndFetchOrder = useCallback(() => {
    // Check if we have access via session storage (just placed order)
    const accessibleOrders = JSON.parse(sessionStorage.getItem('accessibleOrders') || '[]')

    if (accessibleOrders.includes(resolvedParams.id)) {
      fetchOrder()
    } else {
      // Need phone verification
      setShowPhoneVerification(true)
      setLoading(false)
    }
  }, [resolvedParams.id, fetchOrder])

  useEffect(() => {
    if (!resolvedParams.id) {
      setOrderNotFound(true)
      setLoading(false)
      return
    }

    checkAccessAndFetchOrder()

    // Set up real-time subscription for order updates
    const channel = supabase
      .channel(`order-${resolvedParams.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${resolvedParams.id}`
        },
        () => {
          // Refetch the complete order data when an update is detected (without showing loading state)
          fetchOrder(false)
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe()
    }
  }, [resolvedParams.id, checkAccessAndFetchOrder, fetchOrder])

  const verifyPhoneNumber = async () => {
    setPhoneError('')
    setIsVerifying(true)

    try {
      // Fetch order and verify phone number
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, customer_phone')
        .eq('id', resolvedParams.id)
        .single()

      if (orderError || !orderData) {
        setPhoneError('Order not found')
        setIsVerifying(false)
        return
      }

      // Normalize phone numbers for comparison (remove spaces, dashes, etc)
      const normalizePhone = (phone: string) => phone.replace(/[\s\-\(\)]/g, '')

      if (normalizePhone(orderData.customer_phone) === normalizePhone(phoneNumber)) {
        // Phone verified! Store in session and fetch order
        const accessibleOrders = JSON.parse(sessionStorage.getItem('accessibleOrders') || '[]')
        accessibleOrders.push(resolvedParams.id)
        sessionStorage.setItem('accessibleOrders', JSON.stringify(accessibleOrders))

        setShowPhoneVerification(false)
        fetchOrder()
      } else {
        setPhoneError('Phone number does not match order')
        setIsVerifying(false)
      }
    } catch (error) {
      console.error('Error verifying phone:', error)
      setPhoneError('Verification failed. Please try again.')
      setIsVerifying(false)
    }
  }

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

  const getCurrentStageIndex = () => {
    if (!order || !businessData) return 0
    
    const stages = getOrderStages(businessData.business_categories?.name?.toLowerCase())
    
    // Map 'ready' and 'collected' to the "Ready for Pickup" stage (index 2)
    if (order.order_status === 'ready' || order.order_status === 'collected') {
      return 2
    }
    
    return stages.findIndex((stage) => stage.key === order.order_status)
  }

  const isStageCompleted = (stageIndex: number) => {
    return stageIndex <= getCurrentStageIndex()
  }

  const isCurrentStage = (stageIndex: number) => {
    return stageIndex === getCurrentStageIndex()
  }

  const getOrderDisplayId = () => {
    if (!order) return "ORD-XXX"
    // Use the reference from the database if available
    return order.reference || "ORD-XXX"
  }

  const copyOrderReference = async () => {
    const reference = getOrderDisplayId()
    try {
      await navigator.clipboard.writeText(reference)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getEstimatedReadyTime = () => {
    if (!order) return null
    
    const orderTime = new Date(order.created_at)
    const statusTimes = {
      'received': 30,
      'preparing': 15,
      'ready': 0,
      'collected': 0,
      'completed': 0
    }
    
    const minutesToAdd = statusTimes[order.order_status as keyof typeof statusTimes] || 30
    const estimatedTime = new Date(orderTime.getTime() + minutesToAdd * 60000)
    
    if (order.order_status === 'ready' || order.order_status === 'collected' || order.order_status === 'completed') {
      return 'Ready now!'
    }
    
    return estimatedTime.toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getPickupAddress = () => {
    if (!order) return ''
    
    if (businessData) {
      // Build address from business data
      const addressParts = [
        businessData.address_line1,
        businessData.address_line2,
        businessData.city,
        businessData.state
      ].filter(Boolean)
      
      return addressParts.length > 0 ? addressParts.join(', ') : order.pickup_location
    }
    
    return order.pickup_location || 'Location TBD'
  }

  const getStatusTimestamp = () => {
    if (!order) return null
    
    return new Date(order.created_at).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBackButtonPath = () => {
    // If user is logged in and this is their order, go to account
    if (user && order?.user_id === user.id) {
      return '/account/orders'
    }
    // Otherwise go to menu
    return '/'
  }

  const getBackButtonText = () => {
    if (user && order?.user_id === user.id) {
      return 'Back to My Orders'
    }
    return 'Back to Menu'
  }

  // Phone verification modal
  if (showPhoneVerification) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-stone-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800 mb-2">Verify Your Order</h1>
            <p className="text-stone-600">
              Please enter the phone number used when placing this order
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-stone-700">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27123456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && verifyPhoneNumber()}
                  className="pl-10"
                />
              </div>
              {phoneError && (
                <p className="text-red-600 text-sm mt-1">{phoneError}</p>
              )}
            </div>

            <Button
              onClick={verifyPhoneNumber}
              disabled={isVerifying || !phoneNumber}
              className="w-full bg-stone-700 hover:bg-stone-800"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Verify & Track Order'
              )}
            </Button>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-700">Loading order details...</p>
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
            We couldn&apos;t find an order with that ID. Please check your order number or contact us for assistance.
          </p>
          <div className="space-y-2">
            {user && (
              <Link href="/account/orders">
                <Button className="w-full bg-stone-700 hover:bg-stone-800">
                  <User className="w-4 h-4 mr-2" />
                  My Orders
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200">
      <div className="fixed right-0 top-0 h-full w-48 sm:w-64 lg:w-96 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <svg className="absolute top-10 right-4 sm:right-8 w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 text-stone-600 opacity-50" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.4" />
          </svg>
          <svg className="absolute top-48 right-8 sm:right-16 w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 text-stone-500 opacity-45" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="50,30 70,70 30,70" fill="currentColor" opacity="0.3" />
          </svg>
          <div className="absolute top-16 right-0 w-24 sm:w-32 lg:w-48 h-0.5 bg-gradient-to-l from-stone-600/50 to-transparent"></div>
          <div className="absolute top-32 right-4 sm:right-8 w-20 sm:w-28 lg:w-40 h-0.5 bg-gradient-to-l from-stone-500/40 to-transparent"></div>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link href={getBackButtonPath()}>
            <Button variant="outline" className="mb-4 bg-white/80 backdrop-blur-sm border-stone-300 hover:bg-stone-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {getBackButtonText()}
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">Track Your Order</h1>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <p className="text-stone-600">Order #{getOrderDisplayId()}</p>
              <button
                onClick={copyOrderReference}
                className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                title="Copy order reference"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-stone-600" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mb-2">
                Copied to clipboard!
              </p>
            )}
            <p className="text-sm text-stone-500">Customer: {order.customer_name}</p>
            {user && order.user_id === user.id && (
              <Badge className="mt-2 bg-green-100 text-green-800">Your Order</Badge>
            )}
          </div>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-stone-800">Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-stone-300"></div>
              <div
                className="absolute left-6 top-0 w-0.5 bg-emerald-500 transition-all duration-1000"
                style={{ height: `${(getCurrentStageIndex() / (getOrderStages(businessData?.business_categories?.name?.toLowerCase()).length - 1)) * 100}%` }}
              ></div>

              <div className="space-y-6">
                {getOrderStages(businessData?.business_categories?.name?.toLowerCase()).map((stage, index) => {
                  const Icon = stage.icon
                  const completed = isStageCompleted(index)
                  const current = isCurrentStage(index)

                  return (
                    <div key={stage.key} className="relative flex items-start gap-4">
                      <div
                        className={`
                        relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                        ${
                          completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : current
                              ? "bg-white border-emerald-500 text-emerald-500 animate-pulse"
                              : "bg-white border-stone-300 text-stone-400"
                        }
                      `}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${completed || current ? "text-stone-800" : "text-stone-500"}`}>
                            {stage.label}
                          </h4>
                          {current && (
                            <Badge className="text-xs bg-emerald-500 text-white animate-pulse">
                              {order.order_status === 'ready' ? 'Ready for Pickup!' :
                               order.order_status === 'collected' ? 'Ready for Pickup!' :
                               order.order_status === 'completed' ? 'Ready for Pickup!' :
                               `In Progress - ${getStatusTimestamp()}`}
                            </Badge>
                          )}
                          {completed && !current && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${completed || current ? "text-stone-600" : "text-stone-400"}`}>
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-stone-800 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-stone-800 mb-2">Items Ordered</h4>
                <div className="space-y-2">
                  {order.order_items.map((item, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-stone-700">
                        {item.menu_items?.name || 'Unknown Item'} x{item.quantity}
                      </span>
                      <span className="font-semibold text-stone-800">R{item.unit_price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-stone-300 pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold text-stone-800">
                      <span>Total</span>
                      <span>R{order.total_amount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-stone-600" />
                  <div>
                    <p className="text-xs text-stone-600">Pickup Location</p>
                    <p className="font-semibold text-stone-800">{order.pickup_location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-600" />
                  <div>
                    <p className="text-xs text-stone-600">Order Time</p>
                    <p className="font-semibold text-stone-800">
                      {new Date(order.created_at).toLocaleTimeString('en-ZA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-stone-600">Estimated Ready Time</p>
                    <p className="font-semibold text-emerald-700">{getEstimatedReadyTime()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-stone-800 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Pickup Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 font-medium mb-1">Important:</p>
                <p className="text-sm text-amber-700">
                  Please call us when you arrive for pickup. We&apos;ll bring your order to you.
                </p>
              </div>
              <div className="text-sm text-stone-600 space-y-1">
                <p><strong>Address:</strong> {getPickupAddress()}</p>
                <p><strong>Phone:</strong> {order.customer_phone}</p>
              </div>
              <div className="text-sm text-stone-600 space-y-2">
                <p>• Bring your order confirmation number</p>
                {order.payment_status === 'pending' && (
                  <p>• Payment required upon collection ({order.payment_method === 'cash_on_pickup' ? 'Cash' : 'Card'})</p>
                )}
                <p>• Free parking available on-site</p>
                <p>• Look for the &quot;{businessData?.name}&quot; signage</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-stone-800 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-stone-600" />
                  <div>
                    <p className="text-xs text-stone-600">Restaurant Phone</p>
                    <a
                      href={`tel:${businessData?.phone}`}
                      className="font-semibold text-stone-800 hover:text-emerald-600 transition-colors"
                    >
                      {businessData?.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-stone-600">WhatsApp</p>
                    <a
                      href={`https://wa.me/${businessData?.phone?.replace(/\D/g, '')}`}
                      className="font-semibold text-green-600 hover:text-green-700 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Chat with us
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200">
                <p className="text-xs text-stone-600 mb-1">Operating Hours</p>
                <p className="text-sm font-semibold text-stone-800">Mon-Sun: 10:00 - 20:00</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {businessData?.phone && (
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
              onClick={() => (window.location.href = `tel:${businessData.phone}`)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call {businessData.business_categories?.name === 'food' ? 'Restaurant' : 'Business'}
            </Button>
          )}

          {user && order.user_id === user.id ? (
            <Link href="/account/orders" className="flex-1">
              <Button variant="outline" className="w-full bg-white/80 backdrop-blur-sm border-stone-300 hover:bg-stone-50">
                <User className="w-4 h-4 mr-2" />
                My Orders
              </Button>
            </Link>
          ) : (
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full bg-white/80 backdrop-blur-sm border-stone-300 hover:bg-stone-50">
                Back to Menu
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}