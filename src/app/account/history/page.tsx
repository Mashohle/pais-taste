"use client"

import { useState, useMemo } from 'react'
import { useRouter } from "next/navigation"
import OrderHistoryTab from '@/components/account/order-history'
import { useOrderHistory } from '@/lib/hooks/use-order-history'

export default function HistoryPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBusinessType, setSelectedBusinessType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedBusiness, setSelectedBusiness] = useState('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState('all')

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
  )
}