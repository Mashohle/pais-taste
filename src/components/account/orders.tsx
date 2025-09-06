"use client"

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, Loader2, Search, Filter, Calendar, Package } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import UniversalOrderCard from './universal-order-card'

// Mock data representing orders/bookings from different business types
const mockUniversalOrders = [
  {
    id: '1',
    business_id: '1',
    business_name: "Pai's Taste Food Special",
    business_category: 'food',
    business_phone: '+27 81 454 1020',
    type: 'order' as const,
    status: 'preparing',
    created_at: '2024-01-15T10:30:00Z',
    estimated_time: '25-30 min',
    total: 245.00,
    items: [
      { name: 'Traditional Potjiekos', quantity: 1, price: 165.00 },
      { name: 'Pap and Vleis', quantity: 1, price: 80.00 }
    ],
    delivery_address: '123 Main Street, Montana',
    order_number: 'PAI-001'
  },
  {
    id: '2',
    business_id: '2', 
    business_name: 'Elite Car Wash & Detail',
    business_category: 'car_wash',
    business_phone: '+27 21 123 4567',
    type: 'booking' as const,
    status: 'confirmed',
    created_at: '2024-01-15T14:00:00Z',
    estimated_time: '45-60 min',
    total: 350.00,
    service_name: 'Premium Car Detail',
    appointment_date: '2024-01-16',
    appointment_time: '09:00',
    vehicle_details: '2018 BMW 320i - White',
    booking_number: 'ECW-045'
  },
  {
    id: '3',
    business_id: '3',
    business_name: 'Trendy Cuts Salon',
    business_category: 'salon',
    business_phone: '+27 31 987 6543',
    type: 'booking' as const,
    status: 'scheduled',
    created_at: '2024-01-14T16:20:00Z',
    estimated_time: '90 min',
    total: 280.00,
    service_name: 'Cut & Color Treatment',
    appointment_date: '2024-01-17',
    appointment_time: '14:00',
    staff_name: 'Sarah Johnson',
    booking_number: 'TC-892'
  },
  {
    id: '4',
    business_id: '4',
    business_name: 'Fresh Market Grocers',
    business_category: 'retail',
    business_phone: '+27 11 234 5678',
    type: 'order' as const,
    status: 'shipped',
    created_at: '2024-01-14T09:15:00Z',
    estimated_time: 'Tomorrow',
    total: 186.50,
    items: [
      { name: 'Organic Vegetables Box', quantity: 1, price: 120.00 },
      { name: 'Free Range Eggs (12)', quantity: 1, price: 35.00 },
      { name: 'Fresh Bread', quantity: 2, price: 15.75 }
    ],
    delivery_address: '456 Oak Avenue, Sandton',
    order_number: 'FMG-234',
    tracking_number: 'TRK-789456123'
  }
]

const businessTypes = [
  { id: 'all', name: 'All Types', icon: 'grid-3x3', color: 'bg-gray-100 text-gray-700' },
  { id: 'food', name: 'Food Orders', icon: 'utensils', color: 'bg-orange-100 text-orange-700' },
  { id: 'retail', name: 'Retail Purchases', icon: 'shopping-bag', color: 'bg-blue-100 text-blue-700' },
  { id: 'service', name: 'Service Bookings', icon: 'wrench', color: 'bg-green-100 text-green-700' },
  { id: 'car_wash', name: 'Car Services', icon: 'car', color: 'bg-purple-100 text-purple-700' },
  { id: 'salon', name: 'Beauty Services', icon: 'scissors', color: 'bg-pink-100 text-pink-700' }
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready', label: 'Ready' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

export default function OrdersTab() {
  const router = useRouter()
  const [loading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBusinessType, setSelectedBusinessType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedBusiness, setSelectedBusiness] = useState('all')
  const [activeTab, setActiveTab] = useState('active')

  // Filter orders based on active tab and filters
  const filteredOrders = useMemo(() => {
    return mockUniversalOrders.filter(order => {
      // Filter by active/completed status
      const isActive = ['pending', 'confirmed', 'preparing', 'scheduled', 'in_progress', 'ready', 'shipped'].includes(order.status)
      const matchesTab = activeTab === 'active' ? isActive : !isActive

      // Filter by search term
      const matchesSearch = !searchTerm || 
        order.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.booking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.items && order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        order.service_name?.toLowerCase().includes(searchTerm.toLowerCase())

      // Filter by business type
      const matchesBusinessType = selectedBusinessType === 'all' || order.business_category === selectedBusinessType

      // Filter by status
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus

      // Filter by specific business
      const matchesBusiness = selectedBusiness === 'all' || order.business_id === selectedBusiness

      return matchesTab && matchesSearch && matchesBusinessType && matchesStatus && matchesBusiness
    })
  }, [searchTerm, selectedBusinessType, selectedStatus, selectedBusiness, activeTab])

  // Get unique businesses for filter dropdown
  const uniqueBusinesses = useMemo(() => {
    const businesses = Array.from(new Set(mockUniversalOrders.map(order => 
      JSON.stringify({ id: order.business_id, name: order.business_name })
    ))).map(str => JSON.parse(str))
    return businesses
  }, [])

  // Group orders by business type for display
  const ordersByType = useMemo(() => {
    const grouped = filteredOrders.reduce((acc, order) => {
      const type = order.business_category
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(order)
      return acc
    }, {} as Record<string, typeof mockUniversalOrders>)
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
          <h2 className="text-2xl font-bold text-stone-800">My Orders & Bookings</h2>
          <p className="text-stone-600 text-sm">Manage all your orders and appointments in one place</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Active ({mockUniversalOrders.filter(o => ['pending', 'confirmed', 'preparing', 'scheduled', 'in_progress', 'ready', 'shipped'].includes(o.status)).length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Completed ({mockUniversalOrders.filter(o => ['completed', 'cancelled'].includes(o.status)).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
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
                  {activeTab === 'active' ? 'No Active Orders' : 'No Order History'}
                </h3>
                <p className="text-stone-600 mb-6">
                  {activeFilterCount > 0
                    ? 'No orders match your current filters. Try adjusting your search criteria.'
                    : activeTab === 'active'
                    ? "You don't have any active orders at the moment."
                    : "You haven't completed any orders yet."
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
        </TabsContent>
      </Tabs>
    </div>
  )
}