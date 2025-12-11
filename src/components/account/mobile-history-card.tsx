"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Clock,
  ChevronRight,
  Star,
  RotateCcw,
  Calendar
} from "lucide-react"
import { DynamicIcon } from '@/lib/utils/icon-mapper'

interface MobileHistoryCardProps {
  order: {
    id: string
    business_id: string
    business_name: string
    business_category: string
    type: 'order' | 'booking'
    status: string
    created_at: string
    total: number
    items?: Array<{ name: string; quantity: number; price: number }>
    service_name?: string
  }
  onViewDetails: () => void
  onReorder?: () => void
  onRebook?: () => void
  onWriteReview?: () => void
}

export function MobileHistoryCard({
  order,
  onViewDetails,
  onReorder,
  onRebook,
  onWriteReview
}: MobileHistoryCardProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-emerald-100 text-emerald-800', label: 'Completed' }
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getItemsSummary = () => {
    if (order.type === 'booking' && order.service_name) {
      return order.service_name
    }
    if (order.items && order.items.length > 0) {
      const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
      return `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`
    }
    return 'No items'
  }

  const statusInfo = getStatusInfo(order.status)
  const businessIcon = getBusinessIcon(order.business_category)
  const businessColor = getBusinessColor(order.business_category)
  const showActions = order.status === 'completed'

  return (
    <Card className="p-4 hover:shadow-md transition-shadow active:scale-[0.98]">
      <CardContent className="p-0">
        {/* Main clickable area */}
        <div
          className="cursor-pointer"
          onClick={onViewDetails}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Business Icon */}
              <div className={`w-12 h-12 rounded-xl ${businessColor} flex items-center justify-center flex-shrink-0`}>
                <DynamicIcon name={businessIcon} className="w-6 h-6" />
              </div>

              {/* Business Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-800 truncate">{order.business_name}</h3>
                <div className="flex items-center space-x-2 text-sm text-stone-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-stone-400 flex-shrink-0 ml-2" />
          </div>

          {/* Items Summary & Status */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">{getItemsSummary()}</p>
            <Badge className={`${statusInfo.color} text-xs`}>
              {statusInfo.label}
            </Badge>
          </div>

          {/* Total */}
          <div className="text-lg font-semibold text-stone-800">
            R{order.total.toFixed(2)}
          </div>
        </div>

        {/* Action Buttons - Only show for completed orders */}
        {showActions && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-200">
            {/* Write Review */}
            {onWriteReview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onWriteReview()
                }}
                className="flex-1 flex items-center justify-center gap-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
              >
                <Star className="w-4 h-4" />
                <span className="text-xs font-medium">Review</span>
              </Button>
            )}

            {/* Reorder/Rebook */}
            {order.type === 'order' && onReorder && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onReorder()
                }}
                className="flex-1 flex items-center justify-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs font-medium">Reorder</span>
              </Button>
            )}
            {order.type === 'booking' && onRebook && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRebook()
                }}
                className="flex-1 flex items-center justify-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Book Again</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
