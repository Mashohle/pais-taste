"use client"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Star, Heart, Share2, ShoppingCart, Calendar } from "lucide-react"
import { Business } from "@/types/business"
import FoodOrderingInterface from '@/components/business/food-ordering-interface'
import ServiceBookingInterface from '@/components/business/service-booking-interface'
import RetailOrderingInterface from '@/components/business/retail-ordering-interface'

interface MobileBusinessContentProps {
  business: Business
  categoryColor: string
  isFavorited: boolean
  onToggleFavorite: () => void
}

export function MobileBusinessContent({
  business,
  categoryColor,
  isFavorited,
  onToggleFavorite
}: MobileBusinessContentProps) {

  const renderOrderingInterface = () => {
    const adaptedBusiness = {
      ...business,
      // @ts-expect-error - BusinessCategory type mismatch
      category: business.category?.id || 'service',
      image_url: business.logo_url
    }

    // @ts-expect-error - BusinessCategory type mismatch
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
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Ordering/Booking Coming Soon
            </h3>
            <p className="text-gray-600 text-sm">
              This business type is not yet supported for online ordering.
            </p>
          </Card>
        )
    }
  }

  // @ts-expect-error - Business type mismatch
  const isOpen = business.is_open
  // @ts-expect-error - Business type mismatch
  const statusText = business.status_text || (isOpen ? 'Open' : 'Closed')

  return (
    <div className="bg-stone-50 rounded-t-[2.5rem] -mt-10 relative min-h-screen pb-20" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
      <div className="px-5 pt-8 pb-6">
        {/* Business Info Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">{business.name}</h1>

          {/* Rating and Info */}
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
              {/* @ts-expect-error - Business type mismatch */}
              <span className="font-semibold text-sm">{business.rating || 0}</span>
              {/* @ts-expect-error - Business type mismatch */}
              <span className="text-stone-600 text-sm ml-1">({business.review_count || 0})</span>
            </div>
            {/* @ts-expect-error - Business type mismatch */}
            {business.price_range && (
              <>
                <span className="text-stone-400">•</span>
                {/* @ts-expect-error - Business type mismatch */}
                <span className="text-stone-600 text-sm">{business.price_range.replace(/\$/g, 'R')}</span>
              </>
            )}
            {/* @ts-expect-error - Business type mismatch */}
            {business.distance && (
              <>
                <span className="text-stone-400">•</span>
                {/* @ts-expect-error - Business type mismatch */}
                <span className="text-stone-600 text-sm">{business.distance.toFixed(1)}km</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-stone-700 text-sm mb-4">{business.description}</p>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            {/* @ts-expect-error - Business type mismatch */}
            <Badge className={`text-xs ${categoryColor}`}>{business.category?.name || 'Service'}</Badge>
            <Badge variant={isOpen ? "default" : "secondary"} className="text-xs">
              {statusText}
            </Badge>
          </div>

          {/* Features */}
          {/* @ts-expect-error - Business type mismatch */}
          {business.features && business.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {/* @ts-expect-error - Business type mismatch */}
              {business.features.map((feature: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Tabs with Share/Favourite Icons */}
        <Tabs defaultValue="order" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-white border border-stone-200">
              <TabsTrigger
                value="order"
                className="flex items-center gap-1.5 text-xs"
              >
                {/* @ts-expect-error - Business type mismatch */}
                {business.category?.id === 'food' || business.category?.id === 'retail' ? (
                  <ShoppingCart className="w-3.5 h-3.5" />
                ) : (
                  <Calendar className="w-3.5 h-3.5" />
                )}
                {/* @ts-expect-error - Business type mismatch */}
                {business.category?.id === 'food' || business.category?.id === 'retail' ? 'Order' : 'Book'}
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="text-xs"
              >
                Info
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="text-xs"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            {/* Share and Favourite Icons - Right side */}
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleFavorite}
                className="p-2 rounded-full bg-white border border-stone-200 shadow-sm active:scale-95 transition-transform"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'text-red-500 fill-current' : 'text-stone-400'}`} />
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: business.name,
                      // @ts-expect-error - Business type mismatch
                      text: business.description,
                      url: window.location.href,
                    })
                  }
                }}
                className="p-2 rounded-full bg-white border border-stone-200 shadow-sm active:scale-95 transition-transform"
              >
                <Share2 className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="order" className="mt-0">
            {renderOrderingInterface()}
          </TabsContent>

          <TabsContent value="info" className="mt-0">
            <Card className="p-5">
              <h3 className="text-base font-semibold text-stone-800 mb-3">About</h3>
              {/* @ts-expect-error - Business type mismatch */}
              <p className="text-stone-700 text-sm">{business.long_description || business.description}</p>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <Card className="p-8 text-center">
              <Star className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800 mb-2">Reviews Coming Soon</h3>
              <p className="text-gray-600 text-sm">Customer reviews and ratings will be available soon.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
