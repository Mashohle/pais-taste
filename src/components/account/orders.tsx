"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Loader2 } from "lucide-react"
import Link from "next/link"
import { useOrders } from '@/lib/hooks/use-orders'
import OrderCard from './order-card'

export default function OrdersTab() {
  const { 
    activeOrders, 
    loading, 
    error, 
    refetch 
  } = useOrders()

  const handleTrackOrder = (orderId: string) => {
    // This would navigate to order tracking page
    console.log('Tracking order:', orderId)
    // For now, just show an alert
    alert(`Order tracking for ${orderId} - this would open tracking details`)
  }

  const handleCallRestaurant = () => {
    // This would either call directly or show contact modal
    const phoneNumber = "+27 12 345 6789" // Your restaurant phone number
    window.open(`tel:${phoneNumber}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-stone-600 mx-auto mb-4" />
          <p className="text-stone-600">Loading your active orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 mb-2">{error}</p>
        <Button 
          onClick={refetch}
          variant="outline" 
          size="sm"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeOrders && activeOrders.length > 0 ? (
        <>
          {/* Order Count Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-800">
              Active Orders ({activeOrders.length})
            </h2>
            <Button
              onClick={refetch}
              variant="outline"
              size="sm"
              className="border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              Refresh
            </Button>
          </div>

          {/* Orders List */}
          {activeOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onTrack={handleTrackOrder}
              onCall={handleCallRestaurant}
            />
          ))}

          {/* Help Text */}
          <div className="text-center text-sm text-stone-500 mt-8">
            <p>Orders are automatically updated. Call us if you need immediate assistance.</p>
          </div>
        </>
      ) : (
        /* Empty State */
        <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-2xl">
          <CardContent className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-stone-800 mb-2">
              No Active Orders
            </h3>
            <p className="text-stone-600 mb-6">
              You don't have any active orders at the moment.
            </p>
            <Link href="/">
              <Button className="bg-stone-700 hover:bg-stone-800 text-white">
                Browse Menu
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}