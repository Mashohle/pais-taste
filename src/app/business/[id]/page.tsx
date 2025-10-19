"use client"

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Heart,
  Share2,
  ArrowLeft,
  Info,
  ShoppingCart,
  Calendar
} from "lucide-react"
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import FoodOrderingInterface from '@/components/business/food-ordering-interface'
import ServiceBookingInterface from '@/components/business/service-booking-interface'
import RetailOrderingInterface from '@/components/business/retail-ordering-interface'
import { ShoppingCart as ShoppingCartComponent } from '@/components/cart'
import { useBusiness } from '@/lib/hooks'

// Business data interface for backward compatibility with existing components
interface BusinessPageData {
  id: string
  name: string
  category: string
  category_name: string
  description: string
  long_description: string
  image_url: string | null
  rating?: number
  review_count?: number
  address: string
  city: string | null
  province: string | null
  coordinates?: { lat: number; lng: number }
  phone: string | null
  website: string | null
  email: string | null
  is_open: boolean
  opening_hours: Record<string, { open: string; close: string; closed: boolean }>
  features: string[]
  delivery_fee?: number
  minimum_order?: number
  estimated_delivery_time?: string
  estimated_service_time?: string
  price_range?: string
  verified: boolean
  featured: boolean
  menu_items?: any[]
}

const categories = {
  food: { icon: 'utensils', color: 'bg-orange-100 text-orange-700' },
  retail: { icon: 'shopping-bag', color: 'bg-blue-100 text-blue-700' },
  service: { icon: 'wrench', color: 'bg-green-100 text-green-700' },
  car_wash: { icon: 'car', color: 'bg-purple-100 text-purple-700' },
  salon: { icon: 'scissors', color: 'bg-pink-100 text-pink-700' }
}

export default function BusinessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const businessSlug = params.id as string
  const [isFavorited, setIsFavorited] = useState(false)
  
  // Use the custom hook for business data
  const {
    business,
    loading,
    error,
    refetch
  } = useBusiness(businessSlug)

  // Convert business data from hook to page format if needed
  const businessPageData: BusinessPageData | null = business ? {
    id: business.id,
    name: business.name,
    category: business.category?.id || 'service',
    category_name: business.category?.name || 'Service',
    description: business.description,
    long_description: business.long_description || business.description,
    image_url: business.logo_url,
    rating: business.rating,
    review_count: business.review_count,
    address: business.address,
    city: business.city,
    province: business.province,
    phone: business.phone,
    website: business.website,
    email: business.email,
    is_open: business.is_open,
    delivery_fee: business.delivery_fee || 0,
    minimum_order: business.minimum_order || 0,
    menu_items: business.menu_items || [],
    opening_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '19:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false }
    },
    features: business.features || [],
    verified: true,
    featured: false,
    price_range: business.price_range
  } : null

  const handleShare = async () => {
    if (navigator.share && businessPageData) {
      try {
        await navigator.share({
          title: businessPageData.name,
          text: businessPageData.description,
          url: window.location.href
        })
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  // Status comes from API now
  const getStatusFromBusiness = () => {
    if (!business) return { isOpen: false, text: 'Closed' }
    return {
      isOpen: business.is_open,
      text: business.status_text || (business.is_open ? 'Open' : 'Closed')
    }
  }

  const renderOrderingInterface = () => {
    if (!businessPageData) return null

    switch (businessPageData.category) {
      case 'food':
        return <FoodOrderingInterface business={businessPageData} />
      case 'retail':
        return <RetailOrderingInterface business={businessPageData} />
      case 'car_wash':
      case 'salon':
      case 'service':
        return <ServiceBookingInterface business={businessPageData} />
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
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        {/* Header Skeleton */}
        <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </nav>

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
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 mb-4">❌ Error loading business</div>
          <p className="text-stone-700 mb-4">{error}</p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Handle missing business (shouldn't happen with proper error handling, but keep as fallback)
  if (!businessPageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-xl font-bold text-stone-800 mb-4">Business Not Found</h2>
          <p className="text-stone-600 mb-4">The business you're looking for doesn't exist.</p>
          <Link href="/directory">
            <Button>Browse Businesses</Button>
          </Link>
        </div>
      </div>
    )
  }

  const status = getStatusFromBusiness()
  const categoryInfo = categories[businessPageData.category as keyof typeof categories] || {
    icon: 'building',
    color: 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Navigation Header - Like Home Page */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <div className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                  SideHusl
                </div>
              </Link>
              <Badge variant="secondary" className="text-xs">
                Customer Portal
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFavorited(!isFavorited)}
                className={isFavorited ? 'text-red-600' : ''}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Header - Matching Skeleton Layout */}
        {businessPageData && (
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Business Image */}
              <div className="lg:w-1/3">
                <div className="h-64 lg:h-80 bg-gradient-to-r from-stone-200 to-stone-300 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-lg">
                  {businessPageData.image_url ? (
                    <img
                      src={businessPageData.image_url}
                      alt={businessPageData.name}
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
                  {businessPageData.featured && (
                    <Badge className="absolute top-4 left-4 bg-yellow-500 text-white">
                      Featured
                    </Badge>
                  )}
                  {businessPageData.verified && (
                    <Badge className="absolute top-4 right-4 bg-blue-500 text-white">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Business Info */}
              <div className="lg:w-2/3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${categoryInfo.color} flex items-center justify-center`}>
                    <DynamicIcon name={categoryInfo.icon} className="w-4 h-4" />
                  </div>
                  <Badge variant="secondary">{businessPageData.category_name}</Badge>
                  <Badge variant={status.isOpen ? "default" : "secondary"}>
                    {status.text}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold text-stone-800 mb-2">{businessPageData.name}</h1>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">{businessPageData.rating || 0}</span>
                    <span className="text-stone-600">({businessPageData.review_count || 0} reviews)</span>
                  </div>
                  {businessPageData.price_range && (
                    <>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-600">{businessPageData.price_range}</span>
                    </>
                  )}
                </div>

                <p className="text-stone-700 mb-4">{businessPageData.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600 mb-6">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{businessPageData.address}</span>
                  </div>
                  {businessPageData.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{businessPageData.phone}</span>
                    </div>
                  )}
                  {businessPageData.email && (
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4">✉</span>
                      <span>{businessPageData.email}</span>
                    </div>
                  )}
                  {businessPageData.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <a href={businessPageData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Features */}
                {businessPageData.features && businessPageData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {businessPageData.features.map((feature: string, index: number) => (
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
        {businessPageData && (
          <Tabs defaultValue="order" className="space-y-6">
            <TabsList>
              <TabsTrigger value="order" className="flex items-center gap-2">
                {businessPageData.category === 'food' || businessPageData.category === 'retail' ? (
                  <ShoppingCart className="w-4 h-4" />
                ) : (
                  <Calendar className="w-4 h-4" />
                )}
                {businessPageData.category === 'food' || businessPageData.category === 'retail' ? 'Order' : 'Book Service'}
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
                <p className="text-stone-700">{businessPageData.long_description}</p>
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

      {/* Shopping Cart Sidebar */}
      <ShoppingCartComponent />
    </div>
  )
}