"use client"

import { useState, useMemo } from 'react'
import { useRouter } from "next/navigation"
import OrderHistoryTab from '@/components/account/order-history'
import { useOrderHistory } from '@/lib/hooks/use-order-history'
import { MobilePageHeader } from '@/components/account/mobile-page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { SlidersHorizontal, Search } from 'lucide-react'
import { MobileHistoryFilterSheet } from '@/components/account/mobile-history-filter-sheet'

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
        />
        <div className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-24" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
          <div className="px-5 pt-6">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                <Input
                  placeholder="Search businesses, items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>

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