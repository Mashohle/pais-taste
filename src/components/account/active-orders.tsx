"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Loader2, Search, Filter, Package, AlertCircle } from "lucide-react"
import Link from "next/link"
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import UniversalOrderCard from './universal-order-card'
import { ActiveOrderItem, ActiveOrderStats } from '@/lib/hooks/use-active-orders'

const businessTypes = [
  { id: 'all', name: 'All Types', icon: 'grid-3x3', color: 'bg-gray-100 text-gray-700' },
  { id: 'food', name: 'Food Orders', icon: 'utensils', color: 'bg-orange-100 text-orange-700' },
  { id: 'retail', name: 'Retail Purchases', icon: 'shopping-bag', color: 'bg-blue-100 text-blue-700' },
  { id: 'service', name: 'Service Bookings', icon: 'wrench', color: 'bg-green-100 text-green-700' },
  { id: 'car_wash', name: 'Car Services', icon: 'car', color: 'bg-purple-100 text-purple-700' },
  { id: 'salon', name: 'Beauty Services', icon: 'scissors', color: 'bg-pink-100 text-pink-700' }
]

// Status options - Only active/in-progress statuses
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'received', label: 'Received' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'collected', label: 'Collected' }
]

interface ActiveOrdersTabProps {
  orders: ActiveOrderItem[]
  ordersByType: Record<string, ActiveOrderItem[]>
  stats: ActiveOrderStats | null
  loading: boolean
  error: string | null
  hasMore: boolean
  searchTerm: string
  selectedBusinessType: string
  selectedStatus: string
  selectedBusiness: string
  uniqueBusinesses: Array<{ id: string; name: string }>
  activeFilterCount: number
  onSearchChange: (value: string) => void
  onBusinessTypeChange: (value: string) => void
  onStatusChange: (value: string) => void
  onBusinessChange: (value: string) => void
  onClearFilters: () => void
  onTrackOrder: (orderId: string, businessCategory: string) => void
  onContactBusiness: (phone: string) => void
  onFetchMore: () => Promise<void>
}

export default function ActiveOrdersTab({
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
  uniqueBusinesses,
  activeFilterCount,
  onSearchChange,
  onBusinessTypeChange,
  onStatusChange,
  onBusinessChange,
  onClearFilters,
  onTrackOrder,
  onContactBusiness,
  onFetchMore
}: ActiveOrdersTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-stone-600 mx-auto mb-4" />
          <p className="text-stone-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Active Orders</h2>
          <p className="text-stone-600 text-sm">Track your current orders and appointments</p>
          {stats && stats.totalActiveOrders > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Package className="w-4 h-4 text-stone-500" />
              <span className="text-sm text-stone-600">
                {stats.totalActiveOrders} active {stats.totalActiveOrders === 1 ? 'order' : 'orders'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Error loading orders</p>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col gap-4">
              {/* Row 1: Search Bar */}
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders, businesses, items..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Row 2: Filter Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Business Type Filter */}
                <Select value={selectedBusinessType} onValueChange={onBusinessTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <DynamicIcon name={type.icon} className="w-4 h-4" />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Business Filter */}
                <Select value={selectedBusiness} onValueChange={onBusinessChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Businesses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Businesses</SelectItem>
                    {uniqueBusinesses.map(business => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={onStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {activeFilterCount > 0 && (
                <Button variant="outline" onClick={onClearFilters} className="flex items-center gap-2 w-full md:w-auto">
                  <Filter className="w-4 h-4" />
                  Clear Filters ({activeFilterCount})
                </Button>
              )}
            </div>
          </Card>

          {/* Results */}
          {orders.length > 0 ? (
            <div className="space-y-6">
              {/* Group by business type if no specific type is selected */}
              {selectedBusinessType === 'all' ? (
                Object.entries(ordersByType).map(([type, typeOrders]) => {
                  const businessType = businessTypes.find(bt => bt.id === type)
                  if (!businessType || typeOrders.length === 0) return null

                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`w-8 h-8 rounded-lg ${businessType.color} flex items-center justify-center`}>
                          <DynamicIcon name={businessType.icon} className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-semibold text-stone-800">
                          {businessType.name} ({typeOrders.length})
                        </h3>
                      </div>
                      <div className="space-y-4 ml-10">
                        {typeOrders.map((order) => (
                          <UniversalOrderCard
                            key={order.id}
                            order={order}
                            onTrack={onTrackOrder}
                            onContact={onContactBusiness}
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
                      order={order}
                      onTrack={onTrackOrder}
                      onContact={onContactBusiness}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-2xl">
              <CardContent className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-stone-800 mb-2">
                  No Active Orders
                </h3>
                <p className="text-stone-600 mb-6">
                  {activeFilterCount > 0
                    ? 'No orders match your current filters. Try adjusting your search criteria.'
                    : "You don't have any active orders at the moment."
                  }
                </p>
                {activeFilterCount > 0 ? (
                  <Button variant="outline" onClick={onClearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Link href="/">
                    <Button className="bg-stone-700 hover:bg-stone-800 text-white">
                      Discover Businesses
                    </Button>
                  </Link>
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
                className="flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Load More Orders
              </Button>
            </div>
          )}
        </div>
      </div>
  )
}
