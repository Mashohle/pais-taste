"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { History, Filter, Search, Calendar, MapPin, Star } from "lucide-react"
import Link from "next/link"
import UniversalOrderCard from './universal-order-card'
import { OrderHistoryItem, OrderHistoryStats } from '@/lib/hooks/use-order-history'

// Status options - Only final/ended statuses for history
const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

// Time range options
const timeRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: 'year', label: 'Last Year' }
]

interface OrderHistoryTabProps {
  orders: OrderHistoryItem[]
  ordersByType: Record<string, OrderHistoryItem[]>
  stats: OrderHistoryStats | null
  loading: boolean
  error: string | null
  hasMore: boolean
  searchTerm: string
  selectedBusinessType: string
  selectedStatus: string
  selectedBusiness: string
  selectedTimeRange: string
  uniqueBusinesses: Array<{ id: string; name: string; category: string }>
  activeFilterCount: number
  onSearchChange: (value: string) => void
  onBusinessTypeChange: (value: string) => void
  onStatusChange: (value: string) => void
  onBusinessChange: (value: string) => void
  onTimeRangeChange: (value: string) => void
  onClearFilters: () => void
  onViewDetails: (orderId: string, orderType: string) => void
  onReorder: (orderId: string, businessId: string) => void
  onRebook: (bookingId: string, businessId: string) => void
  onWriteReview: (orderId: string, businessId: string, businessName: string) => void
  onFetchMore: () => Promise<void>
  onRefetch: () => void
}

export default function OrderHistoryTab({
  orders,
  ordersByType,
  stats,
  loading,
  error,
  hasMore,
  searchTerm,
  selectedBusinessType,
  selectedStatus,
  selectedBusiness,
  selectedTimeRange,
  uniqueBusinesses,
  activeFilterCount,
  onSearchChange,
  onBusinessTypeChange,
  onStatusChange,
  onBusinessChange,
  onTimeRangeChange,
  onClearFilters,
  onViewDetails,
  onReorder,
  onRebook,
  onWriteReview,
  onFetchMore,
  onRefetch
}: OrderHistoryTabProps) {

  // Show error state
  if (error) {
    return (
      <Card className="bg-red-50/50 backdrop-blur-sm border-red-200">
        <CardContent className="text-center py-12">
          <History className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading History
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={onRefetch}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show loading state
  if (loading && orders.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Order Count - Hide on mobile */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-stone-600" />
          <h2 className="text-xl font-semibold text-stone-800">
            Order & Booking History ({orders.length})
          </h2>
        </div>
        <Badge variant="outline" className="text-stone-700 border-stone-300">
          {stats?.totalOrders || 0} Total
        </Badge>
      </div>

      {/* Filters - 2 rows layout matching active-orders - Hide on mobile */}
      <Card className="hidden md:block p-4 bg-white/50 backdrop-blur-sm border-stone-200">
            <div className="flex flex-col gap-4">
              {/* Row 1: Search Bar */}
              <div className="w-full">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-stone-400" />
                  <Input
                    placeholder="Search businesses, items..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 border-stone-300 focus:border-stone-500"
                  />
                </div>
              </div>

              {/* Row 2: Filter Dropdowns - Business Type, Business, Status, Time Range */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Business Type */}
                <Select value={selectedBusinessType} onValueChange={onBusinessTypeChange}>
                  <SelectTrigger className="border-stone-300">
                    <Filter className="w-4 h-4 mr-2 text-stone-400" />
                    <SelectValue placeholder="Business Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="food">Restaurants</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>

                {/* Specific Business */}
                <Select value={selectedBusiness} onValueChange={onBusinessChange}>
                  <SelectTrigger className="border-stone-300">
                    <MapPin className="w-4 h-4 mr-2 text-stone-400" />
                    <SelectValue placeholder="Business" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Businesses</SelectItem>
                    {uniqueBusinesses.map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status */}
                <Select value={selectedStatus} onValueChange={onStatusChange}>
                  <SelectTrigger className="border-stone-300">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Time Range */}
                <Select value={selectedTimeRange} onValueChange={onTimeRangeChange}>
                  <SelectTrigger className="border-stone-300">
                    <Calendar className="w-4 h-4 mr-2 text-stone-400" />
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeRangeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                  className="flex items-center gap-2 w-full md:w-auto border-stone-300 text-stone-700 hover:bg-stone-100"
                >
                  <Filter className="w-4 h-4" />
                  Clear Filters ({activeFilterCount})
                </Button>
              )}
            </div>
          </Card>

      {/* Results or Empty State */}
      {orders.length > 0 ? (
        <div className="space-y-6">
          {/* Orders & Bookings List - with grouped display option */}
          {selectedBusinessType === 'all' && Object.keys(ordersByType).length > 0 ? (
            /* Group by business type when "all" is selected */
            Object.entries(ordersByType).map(([type, typeOrders]) => {
              if (typeOrders.length === 0) return null

              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold text-stone-800 capitalize">
                      {type === 'food' ? 'Restaurants' : type === 'retail' ? 'Retail' : 'Services'} ({typeOrders.length})
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {typeOrders.map((order) => (
                      <UniversalOrderCard
                        key={order.id}
                        // @ts-expect-error - OrderHistoryItem type missing estimated_time property
                        order={order}
                        showReorder={true}
                        onReorder={() => onReorder(order.id, order.business_id)}
                        onRebook={() => onRebook(order.id, order.business_id)}
                        onTrack={() => onViewDetails(order.id, order.type)}
                        onWriteReview={() => onWriteReview(order.id, order.business_id, order.business_name)}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            /* Show all orders in selected type */
            <div className="space-y-4">
              {orders.map((order) => (
                <UniversalOrderCard
                  key={order.id}
                  // @ts-expect-error - OrderHistoryItem type missing estimated_time property
                  order={order}
                  showReorder={true}
                  onReorder={() => onReorder(order.id, order.business_id)}
                  onRebook={() => onRebook(order.id, order.business_id)}
                  onTrack={() => onViewDetails(order.id, order.type)}
                  onWriteReview={() => onWriteReview(order.id, order.business_id, order.business_name)}
                />
              ))}
            </div>
          )}

          {/* Historical Summary Stats */}
          {stats && (
            <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-lg">
              <CardContent className="py-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Your History Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-stone-800">{stats.totalOrders}</p>
                    <p className="text-sm text-stone-600">Total Orders & Bookings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-stone-800">
                      {new Intl.NumberFormat('en-ZA', {
                        style: 'currency',
                        currency: 'ZAR'
                      }).format(stats.totalSpent)}
                    </p>
                    <p className="text-sm text-stone-600">Total Spent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-stone-800">
                      {stats.completedOrders}
                    </p>
                    <p className="text-sm text-stone-600">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-stone-800">
                      {stats.uniqueBusinesses}
                    </p>
                    <p className="text-sm text-stone-600">Businesses Used</p>
                  </div>
                </div>

                {/* Business Type Breakdown */}
                {stats.ordersByCategory && Object.keys(stats.ordersByCategory).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-stone-300/50">
                    <p className="text-sm font-medium text-stone-700 mb-3">Your Activity by Type:</p>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(stats.ordersByCategory).map(([categoryId, count]) => (
                        <div key={categoryId} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="capitalize">
                            {categoryId}: {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={onFetchMore}
                variant="outline"
                className="flex items-center gap-2 border-stone-300 text-stone-700 hover:bg-stone-100"
              >
                <History className="w-4 h-4" />
                Load More Orders
              </Button>
            </div>
          )}

          {/* Help Text */}
          <div className="text-center text-sm text-stone-500">
            <p>
              Looking to repeat a great experience? Use &quot;Reorder&quot; for food orders or &quot;Book Again&quot; for services.
            </p>
          </div>
        </div>
      ) : (
        /* Empty State */
        <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-2xl">
          <CardContent className="text-center py-12">
            <History className="w-16 h-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-stone-800 mb-2">
              No History Yet
            </h3>
            <p className="text-stone-600 mb-6">
              Start exploring local businesses to build your order and booking history!
            </p>
            <Link href="/directory">
              <Button className="bg-stone-700 hover:bg-stone-800 text-white">
                Discover Businesses
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}