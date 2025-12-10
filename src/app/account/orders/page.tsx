"use client"

import { useState, useMemo } from 'react'
import { useRouter } from "next/navigation"
import ActiveOrdersTab from '@/components/account/active-orders'
import { useActiveOrders } from '@/lib/hooks'
import { MobilePageHeader } from '@/components/account/mobile-page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SlidersHorizontal } from 'lucide-react'
import { MobileActiveOrdersFilterSheet } from '@/components/account/mobile-active-orders-filter-sheet'
import { CustomerLayout } from '@/components/layout/customer-layout'

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

  const [showFilters, setShowFilters] = useState(false)

  return (
    <CustomerLayout>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-stone-50">
        <MobilePageHeader
          title="Orders & Bookings"
          subtitle="Track your current orders and appointments"
          showSearch={true}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search orders, businesses, items..."
        />
        <div className="bg-stone-50 rounded-t-[2.5rem] -mt-24 relative z-10 min-h-screen pb-24" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
          <div className="px-5 pt-6">

            {/* Top Bar: Count + Filter */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-stone-700">
                {stats?.totalActiveOrders || 0} active {stats?.totalActiveOrders === 1 ? 'order' : 'orders'}
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

            {/* Filter Sheet */}
            <MobileActiveOrdersFilterSheet
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              selectedBusinessType={selectedBusinessType}
              onBusinessTypeChange={setSelectedBusinessType}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedBusiness={selectedBusiness}
              onBusinessChange={setSelectedBusiness}
              uniqueBusinesses={uniqueBusinesses}
              onClearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
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
    </CustomerLayout>
  )
}
