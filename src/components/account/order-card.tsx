"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  MapPin,
  Eye,
  Phone,
  Repeat,
} from "lucide-react"
import { Order } from "@/types/order"

interface OrderCardProps {
  order: Order
  showReorder?: boolean
  onReorder?: (orderId: string) => void
  onTrack?: (orderId: string) => void
  onCall?: () => void
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
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

export default function OrderCard({ 
  order, 
  showReorder = false, 
  onReorder, 
  onTrack, 
  onCall 
}: OrderCardProps) {
  const handleReorder = () => {
    if (onReorder) {
      onReorder(order.id)
    }
  }

  const handleTrack = () => {
    if (onTrack) {
      onTrack(order.id)
    }
  }

  const handleCall = () => {
    if (onCall) {
      onCall()
    }
  }

  return (
    <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-2xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-stone-800">
            Order #{order.id.slice(-8)}
          </CardTitle>
          <Badge className={`w-fit ${getStatusColor(order.order_status)}`}>
            {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Order Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-stone-600">
            <Clock className="w-4 h-4" />
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-stone-600">
            <MapPin className="w-4 h-4" />
            <span>{order.pickup_location}</span>
          </div>
        </div>

        {/* Order Items */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="space-y-2">
            {order.order_items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-white/60 backdrop-blur-sm rounded-lg"
              >
                <span className="text-stone-800">
                  {item.menu_items?.name || 'Unknown Item'} x{item.quantity}
                </span>
                <span className="font-semibold text-stone-800">
                  {formatCurrency(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-2 border-t border-stone-200/60">
          <span className="font-semibold text-stone-800">Total</span>
          <span className="font-bold text-lg text-stone-800">
            {formatCurrency(order.total_amount)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {showReorder ? (
            <>
              <Button 
                onClick={handleReorder}
                className="flex-1 bg-stone-700 hover:bg-stone-800 text-white"
              >
                <Repeat className="w-4 h-4 mr-2" />
                Reorder
              </Button>
              <Button
                onClick={handleTrack}
                variant="outline"
                className="flex-1 border-stone-300 text-stone-700 hover:bg-stone-100 bg-transparent"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleTrack}
                className="flex-1 bg-stone-700 hover:bg-stone-800 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                Track Order
              </Button>
              <Button
                onClick={handleCall}
                variant="outline"
                className="flex-1 border-stone-300 text-stone-700 hover:bg-stone-100 bg-transparent"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Restaurant
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}