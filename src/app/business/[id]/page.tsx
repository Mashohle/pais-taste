"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  Heart,
  Share2,
  Info,
  ShoppingCart,
  Calendar
} from "lucide-react"
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import FoodOrderingInterface from '@/components/business/food-ordering-interface'
import ServiceBookingInterface from '@/components/business/service-booking-interface'
import RetailOrderingInterface from '@/components/business/retail-ordering-interface'
import { ShoppingCart as ShoppingCartComponent } from '@/components/cart'
import { useBusiness } from '@/lib/hooks'
import { CustomerLayout } from '@/components/layout/customer-layout'
import { MobileBusinessHeader } from '@/components/business/mobile-business-header'
import { MobileBusinessContent } from '@/components/business/mobile-business-content'
import { MobileBusinessSkeleton } from '@/components/business/mobile-business-skeleton'

const categories = {
  food: { icon: 'utensils', color: 'bg-orange-100 text-orange-700' },
  retail: { icon: 'shopping-bag', color: 'bg-blue-100 text-blue-700' },
  service: { icon: 'wrench', color: 'bg-green-100 text-green-700' },
  car_wash: { icon: 'car', color: 'bg-purple-100 text-purple-700' },
  salon: { icon: 'scissors', color: 'bg-pink-100 text-pink-700' }
}

export default function BusinessDetailPage() {
  const params = useParams()
  const businessSlug = params.id as string
  const [isFavorited, setIsFavorited] = useState(false)

  // Use the custom hook for business data
  const {
    business,
    loading,
    error,
    refetch
  } = useBusiness(businessSlug)

  // Status comes from API now
  const getStatusFromBusiness = () => {
    if (!business) return { isOpen: false, text: 'Closed' }
    return {
      isOpen: business.is_open,
      text: business.status_text || (business.is_open ? 'Open' : 'Closed')
    }
  }

  const renderOrderingInterface = () => {
    if (!business) return null

    // Adapt BusinessData to interface component expectations
    const adaptedBusiness = {
      ...business,
      category: business.category?.id || 'service',
      image_url: business.logo_url
    }

    const categoryId = business.category?.id
    switch (categoryId) {
      case 'food':
        // @ts-expect-error - Business type mismatch between hook and component interfaces
        return <FoodOrderingInterface business={adaptedBusiness} />
      case 'retail':
        // @ts-expect-error - Business type mismatch between hook and component interfaces
        return <RetailOrderingInterface business={adaptedBusiness} />
      case 'car_wash':
      case 'salon':
      case 'service':
        // @ts-expect-error - Business type mismatch between hook and component interfaces
        return <ServiceBookingInterface business={adaptedBusiness} />
      default:
        return (
          <Card className="p-8 text-center">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Ordering/Booking Interface Coming Soon
            </h3>
            <p className="text-gray-600">
              This business type is not yet supported for online ordering.
            </p>
          </Card>
        )
    }
  }

  // Handle loading state
  if (loading) {
    return (
      <CustomerLayout>
        {/* Mobile Loading */}
        <div className="md:hidden">
          <MobileBusinessSkeleton />
        </div>

        {/* Desktop Loading */}
        <div className="hidden md:block min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Business Header Skeleton */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Business Image Skeleton */}
                <div className="lg:w-1/3">
                  <Skeleton className="h-64 lg:h-80 rounded-2xl" />
                </div>

                {/* Business Info Skeleton */}
                <div className="lg:w-2/3">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>

                  <Skeleton className="h-8 w-64 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-6" />

                  <div className="flex items-center space-x-6 mb-6">
                    <div className="flex items-center space-x-1">
                      <Skeleton className="w-5 h-5" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="mb-6">
              <div className="flex space-x-1 bg-stone-100 p-1 rounded-lg mb-6 w-fit">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>

            {/* Content Area Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <Skeleton className="w-16 h-16 rounded-lg" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-40 mb-2" />
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-28 mb-4" />
                    <div className="space-y-3">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </CustomerLayout>
    )
  }

  // Handle error state
  if (error) {
    return (
      <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 mb-4">❌ Error loading business</div>
          <p className="text-stone-700 mb-4">{error}</p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
      </CustomerLayout>
    )
  }

  // Handle missing business (shouldn't happen with proper error handling, but keep as fallback)
  if (!business) {
    return (
      <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-xl font-bold text-stone-800 mb-4">Business Not Found</h2>
          <p className="text-stone-600 mb-4">The business you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/directory">
            <Button>Browse Businesses</Button>
          </Link>
        </div>
      </div>
      </CustomerLayout>
    )
  }

  const status = getStatusFromBusiness()
  const categoryInfo = categories[(business?.category?.id || 'service') as keyof typeof categories] || {
    icon: 'building',
    color: 'bg-gray-100 text-gray-700'
  }

  return (
    <CustomerLayout>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-stone-50">
        <MobileBusinessHeader
          businessName={business.name}
          logoUrl={business.logo_url}
          categoryIcon={categoryInfo.icon}
        />
        <MobileBusinessContent
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          business={business as any}
          categoryColor={categoryInfo.color}
          isFavorited={isFavorited}
          onToggleFavorite={() => setIsFavorited(!isFavorited)}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Header - Matching Skeleton Layout */}
        {business && (
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Business Image */}
              <div className="lg:w-[22%]">
                <div className="h-48 lg:h-56 bg-gradient-to-r from-stone-200 to-stone-300 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-lg">
                  {business.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={business.logo_url}
                      alt={business.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                        const parent = (e.target as HTMLImageElement).parentElement
                        if (parent) {
                          parent.innerHTML = `<div class="w-16 h-16 text-stone-600 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg></div>`
                        }
                      }}
                    />
                  ) : (
                    <DynamicIcon name={categoryInfo.icon} className="w-16 h-16 text-stone-600" />
                  )}
                </div>
              </div>

              {/* Business Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className={`w-5 h-5 cursor-pointer ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                    onClick={() => setIsFavorited(!isFavorited)} />
                  <Share2 className="w-5 h-5 text-gray-400 cursor-pointer" />
                </div>

                <h1 className="text-3xl font-bold text-stone-800 mb-2">{business.name}</h1>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">{business.rating || 0}</span>
                    <span className="text-stone-600">({business.review_count || 0} reviews)</span>
                  </div>
                  {business.price_range && (
                    <>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-600">{business.price_range.replace(/\$/g, 'R')}</span>
                    </>
                  )}
                  {business.distance && (
                    <>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-600">{business.distance.toFixed(1)}km</span>
                    </>
                  )}
                </div>

                <p className="text-stone-700 mb-4">{business.description}</p>

                <div className="flex items-center gap-2 mb-6">
                  <Badge className={`text-xs ${categoryInfo.color}`}>{business.category?.name || 'Service'}</Badge>
                  <Badge variant={status.isOpen ? "default" : "secondary"}>
                    {status.text}
                  </Badge>
                </div>

                {/* Features */}
                {business.features && business.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {business.features.map((feature: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
          {business && (
            <Tabs defaultValue="order" className="space-y-6">
              <TabsList>
                <TabsTrigger value="order" className="flex items-center gap-2">
                  {business.category?.id === 'food' || business.category?.id === 'retail' ? (
                    <ShoppingCart className="w-4 h-4" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                  {business.category?.id === 'food' || business.category?.id === 'retail' ? 'Order' : 'Book Service'}
                </TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="order">
                {renderOrderingInterface()}
              </TabsContent>

              <TabsContent value="info">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-4">About</h3>
                  <p className="text-stone-700">{business.long_description || business.description}</p>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card className="p-6 text-center">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Reviews Coming Soon</h3>
                  <p className="text-gray-600">Customer reviews and ratings will be available soon.</p>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      <ShoppingCartComponent />
    </CustomerLayout>
  )
}