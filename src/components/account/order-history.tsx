"use client"

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { History, Filter, Search, Calendar, MapPin, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import UniversalOrderCard from './universal-order-card'

// Mock data representing complete order/booking history across all business types
const mockHistoricalOrders = [
  // Food orders (completed)
  {
    id: "order_1",
    business_id: "bus_1",
    business_name: "Mama Africa Kitchen",
    business_category: "food",
    business_phone: "+27 21 123 4567",
    type: "order" as const,
    status: "completed",
    created_at: "2024-08-15T18:30:00Z",
    estimated_time: "45 minutes",
    total: 245.50,
    items: [
      { name: "Bobotie with Yellow Rice", price: 120.00, quantity: 1 },
      { name: "Boerewors Roll", price: 85.00, quantity: 1 },
      { name: "Malva Pudding", price: 40.50, quantity: 1 }
    ],
    delivery_address: "123 Main Street, Cape Town",
    order_number: "MA001",
    tracking_number: "TRK001"
  },
  // Service booking (completed)
  {
    id: "booking_1",
    business_id: "bus_5", 
    business_name: "Shine & Wash Car Care",
    business_category: "services",
    business_phone: "+27 11 456 7890",
    type: "booking" as const,
    status: "completed",
    created_at: "2024-08-10T09:00:00Z",
    estimated_time: "2 hours",
    total: 180.00,
    service_name: "Full Detail Wash",
    appointment_date: "2024-08-10",
    appointment_time: "09:00",
    vehicle_details: "2019 Toyota Corolla - CA 123 GP",
    staff_name: "Mike Johnson",
    booking_number: "SW001"
  },
  // Retail order (completed)
  {
    id: "order_2",
    business_id: "bus_6",
    business_name: "African Craft Co",
    business_category: "retail",
    business_phone: "+27 12 789 0123",
    type: "order" as const,
    status: "completed",
    created_at: "2024-08-05T14:20:00Z",
    estimated_time: "3-5 days shipping",
    total: 450.00,
    items: [
      { name: "Handwoven Ndebele Basket", price: 280.00, quantity: 1 },
      { name: "Carved Wooden Giraffe", price: 120.00, quantity: 1 },
      { name: "Traditional Beadwork Necklace", price: 50.00, quantity: 1 }
    ],
    delivery_address: "789 Heritage Lane, Pretoria",
    order_number: "AC001",
    tracking_number: "TRK002"
  },
  // More historical orders...
  {
    id: "booking_2",
    business_id: "bus_7",
    business_name: "Serenity Spa & Wellness", 
    business_category: "services",
    business_phone: "+27 11 234 5678",
    type: "booking" as const,
    status: "completed",
    created_at: "2024-07-25T15:30:00Z",
    estimated_time: "90 minutes",
    total: 320.00,
    service_name: "Traditional African Hot Stone Massage",
    appointment_date: "2024-07-25",
    appointment_time: "15:30",
    staff_name: "Sarah Ndlovu",
    booking_number: "SS001"
  },
  {
    id: "order_3",
    business_id: "bus_1",
    business_name: "Mama Africa Kitchen",
    business_category: "food",
    business_phone: "+27 21 123 4567",
    type: "order" as const,
    status: "completed",
    created_at: "2024-07-20T19:45:00Z",
    estimated_time: "35 minutes",
    total: 195.00,
    items: [
      { name: "Potjiekos (Traditional Stew)", price: 140.00, quantity: 1 },
      { name: "Mealie Bread", price: 30.00, quantity: 2 },
      { name: "Rooibos Tea", price: 25.00, quantity: 1 }
    ],
    delivery_address: "123 Main Street, Cape Town",
    order_number: "MA002",
    tracking_number: "TRK003"
  }
]

export default function OrderHistoryTab() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>("all")
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all")

  // Get unique businesses for filter dropdown
  const uniqueBusinesses = useMemo(() => {
    const businesses = mockHistoricalOrders.map(order => ({
      id: order.business_id,
      name: order.business_name,
      category: order.business_category
    }))
    return Array.from(new Map(businesses.map(b => [b.id, b])).values())
  }, [])

  // Filter historical orders
  const filteredOrders = useMemo(() => {
    return mockHistoricalOrders.filter(order => {
      // Search filter
      if (searchTerm && !order.business_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !(order.type === 'order' && order.items?.some(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )) &&
          !(order.type === 'booking' && order.service_name?.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false
      }

      // Business type filter
      if (selectedBusinessType !== "all" && order.business_category !== selectedBusinessType) {
        return false
      }

      // Specific business filter
      if (selectedBusiness !== "all" && order.business_id !== selectedBusiness) {
        return false
      }

      // Status filter
      if (selectedStatus !== "all" && order.status !== selectedStatus) {
        return false
      }

      // Time range filter
      if (selectedTimeRange !== "all") {
        const orderDate = new Date(order.created_at)
        const now = new Date()
        const diffInDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (selectedTimeRange) {
          case "week":
            if (diffInDays > 7) return false
            break
          case "month":
            if (diffInDays > 30) return false
            break
          case "3months":
            if (diffInDays > 90) return false
            break
          case "year":
            if (diffInDays > 365) return false
            break
        }
      }

      return true
    })
  }, [searchTerm, selectedBusinessType, selectedBusiness, selectedStatus, selectedTimeRange])

  const handleViewDetails = (orderId: string, orderType: string) => {
    if (orderType === 'booking') {
      router.push(`/account/bookings/${orderId}`)
    } else {
      router.push(`/account/orders/${orderId}`)
    }
  }

  const handleReorder = (orderId: string, businessId: string) => {
    // Navigate to business page for reordering
    router.push(`/business/${businessId}?reorder=${orderId}`)
  }

  const handleRebook = (bookingId: string, businessId: string) => {
    // Navigate to business page for rebooking
    router.push(`/business/${businessId}?rebook=${bookingId}`)
  }

  const handleWriteReview = (orderId: string, businessId: string, businessName: string) => {
    // Navigate to a write review dialog or page
    router.push(`/account/reviews/write?order=${orderId}&business=${businessId}&name=${encodeURIComponent(businessName)}`)
  }

  return (
    <div className="space-y-6">
      {/* Header with Order Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-stone-600" />
          <h2 className="text-xl font-semibold text-stone-800">
            Order & Booking History ({filteredOrders.length})
          </h2>
        </div>
        <Badge variant="outline" className="text-stone-700 border-stone-300">
          {mockHistoricalOrders.length} Total
        </Badge>
      </div>

      {mockHistoricalOrders.length > 0 ? (
        <>
          {/* Filters */}
          <Card className="p-6 bg-white/50 backdrop-blur-sm border-stone-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-stone-400" />
                <Input
                  placeholder="Search businesses, items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-stone-300 focus:border-stone-500"
                />
              </div>

              {/* Business Type */}
              <Select value={selectedBusinessType} onValueChange={setSelectedBusinessType}>
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
              <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
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
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="border-stone-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              {/* Time Range */}
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="border-stone-300">
                  <Calendar className="w-4 h-4 mr-2 text-stone-400" />
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Summary */}
            {(searchTerm || selectedBusinessType !== "all" || selectedBusiness !== "all" || 
              selectedStatus !== "all" || selectedTimeRange !== "all") && (
              <div className="mt-4 pt-4 border-t border-stone-200">
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {selectedBusinessType !== "all" && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      Type: {selectedBusinessType}
                    </Badge>
                  )}
                  {selectedBusiness !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Business: {uniqueBusinesses.find(b => b.id === selectedBusiness)?.name}
                    </Badge>
                  )}
                  {selectedStatus !== "all" && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      Status: {selectedStatus}
                    </Badge>
                  )}
                  {selectedTimeRange !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Time: {selectedTimeRange === "week" ? "Last Week" : 
                             selectedTimeRange === "month" ? "Last Month" :
                             selectedTimeRange === "3months" ? "Last 3 Months" : 
                             "Last Year"}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedBusinessType("all")
                      setSelectedBusiness("all")
                      setSelectedStatus("all")
                      setSelectedTimeRange("all")
                    }}
                    className="h-6 px-2 text-xs text-stone-600 hover:text-stone-800"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {filteredOrders.length > 0 ? (
            <>
              {/* Orders & Bookings List */}
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <UniversalOrderCard
                    key={order.id}
                    order={order}
                    showReorder={true}
                    onReorder={() => handleReorder(order.id, order.business_id)}
                    onRebook={() => handleRebook(order.id, order.business_id)}
                    onTrack={() => handleViewDetails(order.id, order.type)}
                    onWriteReview={() => handleWriteReview(order.id, order.business_id, order.business_name)}
                  />
                ))}
              </div>

              {/* Historical Summary Stats */}
              <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-lg">
                <CardContent className="py-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Your History Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-stone-800">{mockHistoricalOrders.length}</p>
                      <p className="text-sm text-stone-600">Total Orders & Bookings</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-800">
                        {new Intl.NumberFormat('en-ZA', {
                          style: 'currency',
                          currency: 'ZAR'
                        }).format(
                          mockHistoricalOrders.reduce((sum, order) => sum + order.total, 0)
                        )}
                      </p>
                      <p className="text-sm text-stone-600">Total Spent</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-800">
                        {mockHistoricalOrders.filter(order => order.status === 'completed').length}
                      </p>
                      <p className="text-sm text-stone-600">Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-800">
                        {uniqueBusinesses.length}
                      </p>
                      <p className="text-sm text-stone-600">Businesses Used</p>
                    </div>
                  </div>
                  
                  {/* Business Type Breakdown */}
                  <div className="mt-6 pt-6 border-t border-stone-300/50">
                    <p className="text-sm font-medium text-stone-700 mb-3">Your Activity by Type:</p>
                    <div className="flex flex-wrap gap-3">
                      {['food', 'retail', 'services'].map(type => {
                        const count = mockHistoricalOrders.filter(order => order.business_category === type).length
                        if (count === 0) return null
                        return (
                          <div key={type} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="capitalize">
                              {type}: {count}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help Text */}
              <div className="text-center text-sm text-stone-500">
                <p>
                  Looking to repeat a great experience? Use "Reorder" for food orders or "Book Again" for services.
                </p>
              </div>
            </>
          ) : (
            /* No Results */
            <Card className="bg-stone-50/50 backdrop-blur-sm border-stone-200">
              <CardContent className="text-center py-12">
                <Filter className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-800 mb-2">
                  No History Found
                </h3>
                <p className="text-stone-600 mb-4">
                  No orders or bookings match your current filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedBusinessType("all")
                    setSelectedBusiness("all")
                    setSelectedStatus("all")
                    setSelectedTimeRange("all")
                  }}
                  className="border-stone-300 text-stone-700 hover:bg-stone-100"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </>
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