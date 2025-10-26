"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Phone, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function TrackOrderPage() {
  const router = useRouter()
  const [orderId, setOrderId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleTrackOrder = async () => {
    setError('')

    if (!orderId.trim()) {
      setError('Please enter an order reference')
      return
    }

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number')
      return
    }

    setIsSearching(true)

    try {
      // Clean up the reference input (convert to uppercase for matching)
      const referenceInput = orderId.trim().toUpperCase()

      // Search by reference (e.g., PAI-9B825)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, customer_phone, reference')
        .eq('reference', referenceInput)
        .single()

      if (orderError || !orderData) {
        setError('Order not found. Please check your order reference.')
        setIsSearching(false)
        return
      }

      // Verify phone number matches
      const normalizePhone = (phone: string) => phone.replace(/[\s\-\(\)]/g, '')

      if (normalizePhone(orderData.customer_phone) === normalizePhone(phoneNumber)) {
        // Phone verified! Store in session and redirect
        const accessibleOrders = JSON.parse(sessionStorage.getItem('accessibleOrders') || '[]')
        if (!accessibleOrders.includes(orderData.id)) {
          accessibleOrders.push(orderData.id)
          sessionStorage.setItem('accessibleOrders', JSON.stringify(accessibleOrders))
        }

        // Redirect to track page
        router.push(`/order/${orderData.id}/track`)
      } else {
        setError('Phone number does not match this order')
        setIsSearching(false)
      }
    } catch (error) {
      console.error('Error tracking order:', error)
      setError('Failed to track order. Please try again.')
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200">
      {/* Decorative background */}
      <div className="fixed right-0 top-0 h-full w-48 sm:w-64 lg:w-96 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <svg className="absolute top-10 right-4 w-16 h-16 text-stone-600" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.4" />
          </svg>
          <svg className="absolute top-48 right-8 w-14 h-14 text-stone-500" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="50,30 70,70 30,70" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-stone-300 hover:bg-stone-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </Link>
        </div>

        <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-stone-200">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="bg-stone-100 p-4 rounded-full">
                <Package className="w-10 h-10 text-stone-700" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-stone-800">Track Your Order</CardTitle>
            <CardDescription className="text-base">
              Enter your order details to check the status of your order
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="orderId" className="text-stone-700 font-medium">
                  Order Reference
                </Label>
                <div className="relative mt-1">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="orderId"
                    type="text"
                    placeholder="e.g., PAI-9B825"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                    className="pl-10 uppercase"
                  />
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  You can find your order reference on the confirmation page
                </p>
              </div>

              <div>
                <Label htmlFor="phone" className="text-stone-700 font-medium">
                  Phone Number
                </Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+27123456789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Enter the phone number you used when placing the order
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>

            <Button
              onClick={handleTrackOrder}
              disabled={isSearching}
              className="w-full bg-stone-700 hover:bg-stone-800 text-white py-6 text-lg"
              size="lg"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Track Order
                </>
              )}
            </Button>

            <div className="pt-4 border-t border-stone-200">
              <p className="text-sm text-stone-600 text-center">
                Need help? Contact us at{' '}
                <a href="tel:+27123456789" className="text-stone-800 font-medium hover:underline">
                  +27 12 345 6789
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 bg-stone-100/80 backdrop-blur-sm rounded-xl p-6 border border-stone-200">
          <h3 className="font-semibold text-stone-800 mb-3">How to find your Order Reference:</h3>
          <ul className="space-y-2 text-sm text-stone-600">
            <li className="flex items-start gap-2">
              <span className="text-stone-800 font-bold">1.</span>
              <span>Check your confirmation page (shown as Order #PAI-9B825)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-stone-800 font-bold">2.</span>
              <span>Look for your confirmation email or SMS with the order reference</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-stone-800 font-bold">3.</span>
              <span>Contact support with your phone number if you can&apos;t find it</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
