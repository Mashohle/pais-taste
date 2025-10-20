"use client"

import { useParams } from "next/navigation"
import { CheckCircle, Clock, MapPin, Hash, ArrowLeft, Truck, Phone, Lock, Copy, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase'

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orderNotFound, setOrderNotFound] = useState(false)
  const [businessData, setBusinessData] = useState<any>(null)
  const [showPhoneVerification, setShowPhoneVerification] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!orderId) {
      setOrderNotFound(true)
      setLoading(false)
      return
    }

    checkAccessAndFetchOrder()
  }, [orderId])

  const checkAccessAndFetchOrder = () => {
    // Check if we have access via session storage (just placed order)
    const accessibleOrders = JSON.parse(sessionStorage.getItem('accessibleOrders') || '[]')

    if (accessibleOrders.includes(orderId)) {
      fetchOrder()
    } else {
      // Need phone verification
      setShowPhoneVerification(true)
      setLoading(false)
    }
  }

  const verifyPhoneNumber = async () => {
    setPhoneError('')
    setIsVerifying(true)

    try {
      // Fetch order and verify phone number
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, customer_phone')
        .eq('id', orderId)
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
        accessibleOrders.push(orderId)
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

  const fetchOrder = async () => {
    try {
      setLoading(true)

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
        .eq('id', orderId)
        .single()

      if (orderError || !orderData) {
        setOrderNotFound(true)
        setLoading(false)
        return
      }

      setOrder(orderData)
      await loadBusinessData(orderData.business_id)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching order:', error)
      setOrderNotFound(true)
      setLoading(false)
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
                'Verify & View Order'
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
                <button
                  onClick={copyOrderReference}
                  className="ml-2 p-2 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Copy order reference"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-stone-600" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 text-center mt-2">
                  Order reference copied to clipboard!
                </p>
              )}
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
            <Link href={`/order/${order.id}/track`} className="block">
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