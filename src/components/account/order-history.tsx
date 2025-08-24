"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { History, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useOrders } from '@/lib/hooks/use-orders'
import { useCart } from '@/lib/contexts/cart-context'
import OrderCard from './order-card'

export default function OrderHistoryTab() {
  const router = useRouter()
  const { addReorderItems, setCartOpen } = useCart()
  const { 
    orderHistory, 
    loading, 
    error, 
    refetch,
    reorderItems 
  } = useOrders()

  const handleReorder = async (orderId: string) => {
    try {
      const items = await reorderItems(orderId)
      
      // Add items to cart
      addReorderItems(items)
      
      // Show success message
      const itemNames = items.map(item => item.name).join(', ')
      alert(`Items added to cart: ${itemNames}`)
      
      // Open cart sidebar and navigate to cart
      setCartOpen(true)
      // Or navigate to cart page: router.push('/cart')
      
    } catch (error) {
      console.error('Error reordering:', error)
      alert('Failed to reorder items. Please try again.')
    }
  }

  const handleViewDetails = (orderId: string) => {
    // Navigate to order details page
    router.push(`/account/orders/${orderId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-stone-600 mx-auto mb-4" />
          <p className="text-stone-600">Loading your order history...</p>
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
      {orderHistory && orderHistory.length > 0 ? (
        <>
          {/* Order Count Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-800">
              Order History ({orderHistory.length})
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
          {orderHistory.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              showReorder={true}
              onReorder={handleReorder}
              onTrack={handleViewDetails}
            />
          ))}

          {/* Summary Stats */}
          <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-lg">
            <CardContent className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-stone-800">{orderHistory.length}</p>
                  <p className="text-sm text-stone-600">Total Orders</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">
                    {new Intl.NumberFormat('en-ZA', {
                      style: 'currency',
                      currency: 'ZAR'
                    }).format(
                      orderHistory.reduce((sum, order) => sum + order.total_amount, 0)
                    )}
                  </p>
                  <p className="text-sm text-stone-600">Total Spent</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">
                    {orderHistory.filter(order => order.order_status === 'completed').length}
                  </p>
                  <p className="text-sm text-stone-600">Completed Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="text-center text-sm text-stone-500 mt-8">
            <p>
              Love something you ordered? Use the "Reorder" button to quickly add items to your cart.
            </p>
          </div>
        </>
      ) : (
        /* Empty State */
        <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-2xl">
          <CardContent className="text-center py-12">
            <History className="w-16 h-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-stone-800 mb-2">
              No Order History
            </h3>
            <p className="text-stone-600 mb-6">
              You haven't placed any orders yet. Start exploring our delicious traditional South African dishes!
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