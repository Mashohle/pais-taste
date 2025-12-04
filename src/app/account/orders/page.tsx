"use client"

import { useState, useMemo } from 'react'
import { useRouter } from "next/navigation"
import ActiveOrdersTab from '@/components/account/active-orders'
import { useActiveOrders } from '@/lib/hooks'

export default function OrdersPage() {
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ActiveOrdersTab
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
        uniqueBusinesses={uniqueBusinesses}
        activeFilterCount={activeFilterCount}
        onSearchChange={setSearchTerm}
        onBusinessTypeChange={setSelectedBusinessType}
        onStatusChange={setSelectedStatus}
        onBusinessChange={setSelectedBusiness}
        onClearFilters={clearFilters}
        onTrackOrder={handleTrackOrder}
        onContactBusiness={handleContactBusiness}
        onFetchMore={fetchMore}
      />
    </div>
  )
}
