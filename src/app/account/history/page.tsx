"use client"

import { useState, useMemo } from 'react'
import { useRouter } from "next/navigation"
import OrderHistoryTab from '@/components/account/order-history'
import { useOrderHistory } from '@/lib/hooks/use-order-history'
import { MobilePageHeader } from '@/components/account/mobile-page-header'
import { MobileHistoryCard } from '@/components/account/mobile-history-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SlidersHorizontal, History } from 'lucide-react'
import { MobileHistoryFilterSheet } from '@/components/account/mobile-history-filter-sheet'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function HistoryPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBusinessType, setSelectedBusinessType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedBusiness, setSelectedBusiness] = useState('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Memoize filters to prevent infinite loop
  const filters = useMemo(() => ({
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    businessId: selectedBusiness !== 'all' ? selectedBusiness : undefined,
    timeRange: selectedTimeRange !== 'all' ? selectedTimeRange : undefined
  }), [selectedStatus, selectedBusiness, selectedTimeRange])

  // Fetch real order history from API (automatically refetches when filters change)
  const { orders: apiOrders, stats, loading, error, hasMore, fetchMore, refetch } = useOrderHistory(filters)

  // Filter orders based on search term and business type (client-side)
  const filteredOrders = useMemo(() => {
    if (!searchTerm && selectedBusinessType === 'all') return apiOrders

    return apiOrders.filter(order => {
      // Filter by search term
      const matchesSearch = !searchTerm ||
        order.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filter by business type
      const matchesType = selectedBusinessType === 'all' || order.business_category === selectedBusinessType

      return matchesSearch && matchesType
    })
  }, [apiOrders, searchTerm, selectedBusinessType])

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

  const handleViewDetails = (orderId: string, orderType: string) => {
    if (orderType === 'booking') {
      router.push(`/account/bookings/${orderId}`)
    } else {
      router.push(`/account/orders/${orderId}`)
    }
  }

  const handleReorder = (orderId: string, businessId: string) => {
    router.push(`/business/${businessId}?reorder=${orderId}`)
  }

  const handleRebook = (bookingId: string, businessId: string) => {
    router.push(`/business/${businessId}?rebook=${bookingId}`)
  }

  const handleWriteReview = (orderId: string, businessId: string, businessName: string) => {
    router.push(`/account/reviews/write?order=${orderId}&business=${businessId}&name=${encodeURIComponent(businessName)}`)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedBusinessType('all')
    setSelectedStatus('all')
    setSelectedBusiness('all')
    setSelectedTimeRange('all')
  }

  const activeFilterCount = [
    searchTerm !== '',
    selectedBusinessType !== 'all',
    selectedStatus !== 'all',
    selectedBusiness !== 'all',
    selectedTimeRange !== 'all'
  ].filter(Boolean).length

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-stone-50">
        <MobilePageHeader
          title="History"
          subtitle="View all your past orders and bookings"
          showSearch={true}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search businesses, items..."
          showBackButton={true}
          backHref="/account"
        />
        <div className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-24" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
          <div className="px-5 pt-6">
            {/* Top Bar: Count + Filter */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-stone-700">
                {stats?.totalOrders || 0} past {stats?.totalOrders === 1 ? 'order' : 'orders'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-1 text-xs px-1.5 py-0 h-5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Mobile Order Cards */}
            {loading && filteredOrders.length === 0 ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="h-32 animate-pulse bg-stone-100" />
                ))}
              </div>
            ) : error ? (
              <Card className="bg-red-50/50 backdrop-blur-sm border-red-200">
                <CardContent className="text-center py-12">
                  <History className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Error Loading History
                  </h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button
                    variant="outline"
                    onClick={refetch}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : filteredOrders.length > 0 ? (
              <div className="space-y-2.5">
                {filteredOrders.map((order) => (
                  <MobileHistoryCard
                    key={order.id}
                    order={order}
                    onViewDetails={() => handleViewDetails(order.id, order.type)}
                    onReorder={() => handleReorder(order.id, order.business_id)}
                    onRebook={() => handleRebook(order.id, order.business_id)}
                    onWriteReview={() => handleWriteReview(order.id, order.business_id, order.business_name)}
                  />
                ))}

                {/* Load More Button */}
                {hasMore && !loading && (
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={fetchMore}
                      variant="outline"
                      className="flex items-center gap-2 border-stone-300 text-stone-700 hover:bg-stone-100"
                    >
                      <History className="w-4 h-4" />
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-2xl">
                <CardContent className="text-center py-12">
                  <History className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-stone-800 mb-2">
                    No History Yet
                  </h3>
                  <p className="text-stone-600 mb-6">
                    Start exploring local businesses!
                  </p>
                  <Link href="/directory">
                    <Button className="bg-stone-700 hover:bg-stone-800 text-white">
                      Discover Businesses
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Filter Sheet */}
            <MobileHistoryFilterSheet
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              selectedBusinessType={selectedBusinessType}
              onBusinessTypeChange={setSelectedBusinessType}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedBusiness={selectedBusiness}
              onBusinessChange={setSelectedBusiness}
              selectedTimeRange={selectedTimeRange}
              onTimeRangeChange={setSelectedTimeRange}
              uniqueBusinesses={uniqueBusinesses}
              onClearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <OrderHistoryTab
          orders={filteredOrders}
          ordersByType={ordersByType}
          stats={stats}
          loading={loading}
          error={error}
          hasMore={hasMore}
          searchTerm={searchTerm}
          selectedBusinessType={selectedBusinessType}
          selectedStatus={selectedStatus}
          selectedBusiness={selectedBusiness}
          selectedTimeRange={selectedTimeRange}
          uniqueBusinesses={uniqueBusinesses}
          activeFilterCount={activeFilterCount}
          onSearchChange={setSearchTerm}
          onBusinessTypeChange={setSelectedBusinessType}
          onStatusChange={setSelectedStatus}
          onBusinessChange={setSelectedBusiness}
          onTimeRangeChange={setSelectedTimeRange}
          onClearFilters={clearFilters}
          onViewDetails={handleViewDetails}
          onReorder={handleReorder}
          onRebook={handleRebook}
          onWriteReview={handleWriteReview}
          onFetchMore={fetchMore}
          onRefetch={refetch}
        />
      </div>
    </>
  )
}