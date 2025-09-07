"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
  Calendar,
  ShoppingCart,
  Plus,
  Minus,
  Info
} from "lucide-react"
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import FoodOrderingInterface from '@/components/business/food-ordering-interface'
import ServiceBookingInterface from '@/components/business/service-booking-interface'
import RetailOrderingInterface from '@/components/business/retail-ordering-interface'
import { useBusiness as useBusinessContext, Business } from '@/lib/contexts/business-context'
import { useBusiness } from '@/lib/hooks/use-business'
import { BusinessErrorDisplay } from '@/components/business/business-error-boundary'

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
    isLoading,
    hasError,
    error,
    refetch
  } = useBusiness(businessSlug)

  // Convert business data from hook to page format if needed
  const businessPageData: BusinessPageData | null = business ? {
    ...business,
    image_url: business.logo_url,
    long_description: business.long_description || business.description,
    opening_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '19:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false }
    },
    estimated_delivery_time: '30-45 min',
    estimated_service_time: '45-60 min',
    verified: true,
    featured: false,
    features: business.features || []
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

  const getCurrentStatus = () => {
    if (!businessPageData) return { isOpen: false, text: 'Closed' }

    const now = new Date()
    const dayName = now.toLocaleDateString('en', { weekday: 'long' }).toLowerCase()
    const currentTime = now.toTimeString().slice(0, 5)

    const todayHours = businessPageData.opening_hours[dayName]
    if (!todayHours || todayHours.closed) {
      return { isOpen: false, text: 'Closed Today' }
    }

    const isCurrentlyOpen = currentTime >= todayHours.open && currentTime <= todayHours.close
    if (isCurrentlyOpen) {
      return { isOpen: true, text: `Open until ${todayHours.close}` }
    } else {
      return { isOpen: false, text: `Opens at ${todayHours.open}` }
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
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-700">Loading business details...</p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (hasError && error) {
    return <BusinessErrorDisplay error={error} />
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

  const status = getCurrentStatus()
  const categoryInfo = categories[businessPageData.category as keyof typeof categories]

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
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
              <Link href="/customer/auth">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Business Image */}
            <div className="lg:w-1/3">
              <div className="h-64 lg:h-80 bg-gradient-to-r from-stone-200 to-stone-300 rounded-2xl flex items-center justify-center relative">
                <DynamicIcon name={categoryInfo.icon} className="w-16 h-16 text-stone-600" />
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
                  <span className="font-semibold">{businessPageData.rating}</span>
                  <span className="text-stone-600">({businessPageData.review_count} reviews)</span>
                </div>
                <span className="text-stone-400">•</span>
                <span className="text-stone-600">{businessPageData.price_range}</span>
              </div>

              <p className="text-stone-700 mb-4">{businessPageData.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{businessPageData.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{businessPageData.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{businessPageData.estimated_delivery_time || businessPageData.estimated_service_time}</span>
                </div>
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
              <div className="flex flex-wrap gap-2 mt-4">
                {businessPageData.features.map((feature: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">About</h3>
                <p className="text-stone-700">{businessPageData.long_description}</p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Opening Hours</h3>
                <div className="space-y-2">
                  {Object.entries(businessPageData.opening_hours).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize font-medium">{day}</span>
                      <span className="text-stone-600">
                        {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="p-6 text-center">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Reviews Coming Soon</h3>
              <p className="text-gray-600">Customer reviews and ratings will be available soon.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}