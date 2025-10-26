"use client"

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Loader2, Search, Filter, Package, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import UniversalOrderCard from './universal-order-card'
import { useActiveOrders } from '@/lib/hooks'

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

export default function ActiveOrdersTab() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBusinessType, setSelectedBusinessType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedBusiness, setSelectedBusiness] = useState('all')

  // Memoize filters to prevent infinite loop
  const filters = useMemo(() => ({
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    businessId: selectedBusiness !== 'all' ? selectedBusiness : undefined,
    categoryId: selectedBusinessType !== 'all' ? selectedBusinessType : undefined
  }), [selectedStatus, selectedBusiness, selectedBusinessType])

  // Fetch real active orders from API (automatically refetches when filters change)
  const { orders: apiOrders, stats, loading, error, hasMore, fetchMore } = useActiveOrders(filters)

  // Filter orders based on search term (client-side)
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return apiOrders

    return apiOrders.filter(order => {
      // Filter by search term
      const matchesSearch =
        order.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

      return matchesSearch
    })
  }, [apiOrders, searchTerm])

  // Get unique businesses for filter dropdown from API data
  const uniqueBusinesses = useMemo(() => {
    const businesses = Array.from(new Set(apiOrders.map(order =>
      JSON.stringify({ id: order.business_id, name: order.business_name })
    ))).map(str => JSON.parse(str))
    return businesses
  }, [apiOrders])

  // Group orders by business type for display
  const ordersByType = useMemo(() => {
    const grouped = filteredOrders.reduce((acc, order) => {
      const type = order.business_category
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(order)
      return acc
    }, {} as Record<string, typeof filteredOrders>)
    return grouped
  }, [filteredOrders])

  const handleTrackOrder = (orderId: string, businessCategory: string) => {
    // Different tracking routes based on business type
    if (businessCategory === 'food') {
      router.push(`/order/${orderId}/track`)
    } else if (['car_wash', 'salon', 'service'].includes(businessCategory)) {
      router.push(`/booking/${orderId}/track`)
    } else {
      router.push(`/order/${orderId}/track`)
    }
  }

  const handleContactBusiness = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedBusinessType('all')
    setSelectedStatus('all')
    setSelectedBusiness('all')
  }

  const activeFilterCount = [
    searchTerm !== '',
    selectedBusinessType !== 'all',
    selectedStatus !== 'all', 
    selectedBusiness !== 'all'
  ].filter(Boolean).length

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
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders, businesses, items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Business Type Filter */}
              <Select value={selectedBusinessType} onValueChange={setSelectedBusinessType}>
                <SelectTrigger className="w-[180px]">
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
              <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                <SelectTrigger className="w-[180px]">
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
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
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

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Clear ({activeFilterCount})
                </Button>
              )}
            </div>
          </Card>

          {/* Results */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-6">
              {/* Group by business type if no specific type is selected */}
              {selectedBusinessType === 'all' ? (
                Object.entries(ordersByType).map(([type, orders]) => {
                  const businessType = businessTypes.find(bt => bt.id === type)
                  if (!businessType || orders.length === 0) return null

                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`w-8 h-8 rounded-lg ${businessType.color} flex items-center justify-center`}>
                          <DynamicIcon name={businessType.icon} className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-semibold text-stone-800">
                          {businessType.name} ({orders.length})
                        </h3>
                      </div>
                      <div className="space-y-4 ml-10">
                        {orders.map((order) => (
                          <UniversalOrderCard
                            key={order.id}
                            order={order}
                            onTrack={handleTrackOrder}
                            onContact={handleContactBusiness}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                /* Show all orders in selected type */
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <UniversalOrderCard
                      key={order.id}
                      order={order}
                      onTrack={handleTrackOrder}
                      onContact={handleContactBusiness}
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
                  <Button variant="outline" onClick={clearFilters}>
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
                onClick={fetchMore}
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
