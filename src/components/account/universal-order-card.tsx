"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Clock, 
  MapPin, 
  Phone, 
  Package, 
  Calendar,
  User,
  Car,
  Scissors,
  Utensils,
  ShoppingBag,
  Wrench,
  ExternalLink,
  Truck,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  MessageSquare,
  RotateCcw,
  Star
} from "lucide-react"
import { DynamicIcon } from '@/lib/utils/icon-mapper'

interface UniversalOrderProps {
  order: {
    id: string
    business_id: string
    business_name: string
    business_category: string
    business_phone: string
    type: 'order' | 'booking'
    status: string
    created_at: string
    estimated_time: string
    total: number
    // Order-specific fields
    items?: Array<{ name: string; quantity: number; price: number }>
    delivery_address?: string
    order_number?: string
    tracking_number?: string
    // Booking-specific fields
    service_name?: string
    appointment_date?: string
    appointment_time?: string
    vehicle_details?: string
    staff_name?: string
    booking_number?: string
  }
  showReorder?: boolean
  onTrack?: (orderId: string, businessCategory: string) => void
  onContact?: (phone: string) => void
  onReorder?: (orderId: string, businessId: string) => void
  onRebook?: (bookingId: string, businessId: string) => void
  onWriteReview?: (orderId: string, businessId: string, businessName: string) => void
}

export default function UniversalOrderCard({ 
  order, 
  showReorder = false,
  onTrack, 
  onContact, 
  onReorder, 
  onRebook,
  onWriteReview 
}: UniversalOrderProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" />, label: 'Pending' }
      case 'confirmed':
        return { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Confirmed' }
      case 'preparing':
        return { color: 'bg-orange-100 text-orange-800', icon: <PlayCircle className="w-3 h-3" />, label: 'Preparing' }
      case 'scheduled':
        return { color: 'bg-indigo-100 text-indigo-800', icon: <Calendar className="w-3 h-3" />, label: 'Scheduled' }
      case 'in_progress':
        return { color: 'bg-purple-100 text-purple-800', icon: <PlayCircle className="w-3 h-3" />, label: 'In Progress' }
      case 'ready':
        return { color: 'bg-green-100 text-green-800', icon: <Package className="w-3 h-3" />, label: 'Ready for Pickup' }
      case 'shipped':
        return { color: 'bg-cyan-100 text-cyan-800', icon: <Truck className="w-3 h-3" />, label: 'Shipped' }
      case 'completed':
        return { color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Completed' }
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-3 h-3" />, label: 'Cancelled' }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-3 h-3" />, label: status }
    }
  }

  const getBusinessIcon = (category: string) => {
    switch (category) {
      case 'food': return 'utensils'
      case 'retail': return 'shopping-bag'
      case 'car_wash': return 'car'
      case 'salon': return 'scissors'
      case 'service': return 'wrench'
      default: return 'building'
    }
  }

  const getBusinessColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-orange-100 text-orange-700'
      case 'retail': return 'bg-blue-100 text-blue-700'
      case 'car_wash': return 'bg-purple-100 text-purple-700'
      case 'salon': return 'bg-pink-100 text-pink-700'
      case 'service': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statusInfo = getStatusInfo(order.status)
  const businessIcon = getBusinessIcon(order.business_category)
  const businessColor = getBusinessColor(order.business_category)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Business Category Icon */}
            <div className={`w-10 h-10 rounded-lg ${businessColor} flex items-center justify-center`}>
              <DynamicIcon name={businessIcon} className="w-5 h-5" />
            </div>
            
            <div>
              <h3 className="font-semibold text-stone-800">{order.business_name}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-stone-600">
                  {order.order_number || order.booking_number}
                </span>
                <span className="text-stone-400">•</span>
                <span className="text-sm text-stone-500">
                  {formatDateTime(order.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={`${statusInfo.color} flex items-center space-x-1`}>
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </Badge>
          </div>
        </div>

        {/* Order/Booking Details */}
        <div className="space-y-3 mb-4">
          {/* Food Orders - Show Items */}
          {order.type === 'order' && order.items && (
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-2">Items:</h4>
              <div className="space-y-1">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-stone-600">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-stone-800 font-medium">
                      R{item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Bookings - Show Service Details */}
          {order.type === 'booking' && order.service_name && (
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-1">Service:</h4>
              <p className="text-stone-800 font-medium">{order.service_name}</p>
              
              {order.appointment_date && order.appointment_time && (
                <div className="flex items-center space-x-2 mt-2">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <span className="text-sm text-stone-600">
                    {new Date(order.appointment_date).toLocaleDateString('en-ZA', {
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric'
                    })} at {order.appointment_time}
                  </span>
                </div>
              )}

              {order.staff_name && (
                <div className="flex items-center space-x-2 mt-1">
                  <User className="w-4 h-4 text-stone-500" />
                  <span className="text-sm text-stone-600">
                    with {order.staff_name}
                  </span>
                </div>
              )}

              {order.vehicle_details && (
                <div className="flex items-center space-x-2 mt-1">
                  <Car className="w-4 h-4 text-stone-500" />
                  <span className="text-sm text-stone-600">
                    {order.vehicle_details}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Delivery/Address Information */}
          {order.delivery_address && (
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-stone-500 mt-0.5" />
              <span className="text-sm text-stone-600">
                {order.delivery_address}
              </span>
            </div>
          )}

          {/* Tracking Information */}
          {order.tracking_number && (
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-stone-500" />
              <span className="text-sm text-stone-600">
                Tracking: {order.tracking_number}
              </span>
            </div>
          )}

          {/* Estimated Time */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-stone-500" />
            <span className="text-sm text-stone-600">
              {order.estimated_time}
            </span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-stone-800">
            Total: R{order.total.toFixed(2)}
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {/* Write Review - only show for completed orders/bookings */}
            {order.status === 'completed' && onWriteReview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onWriteReview(order.id, order.business_id, order.business_name)}
                className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
              >
                <Star className="w-4 h-4" />
                Review
              </Button>
            )}

            {/* Reorder/Rebook - only show for completed orders/bookings if enabled */}
            {order.status === 'completed' && showReorder && (
              <>
                {order.type === 'order' && onReorder && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReorder(order.id, order.business_id)}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reorder
                  </Button>
                )}
                {order.type === 'booking' && onRebook && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRebook(order.id, order.business_id)}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Again
                  </Button>
                )}
              </>
            )}

            {/* Contact Business */}
            {onContact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onContact(order.business_phone)}
                className="flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call
              </Button>
            )}

            {/* Track Order/Booking */}
            {onTrack && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTrack(order.id, order.business_category)}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Track
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}