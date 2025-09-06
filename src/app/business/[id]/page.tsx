"use client"

import { useState, useEffect } from 'react'
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

// Mock business data - would come from API based on route params
const mockBusinessDetails = {
  '1': {
    id: '1',
    name: "Pai's Taste Food Special",
    category: 'food',
    category_name: 'Food & Dining',
    description: 'Authentic South African traditional cuisine with modern twists. Family recipes passed down through generations.',
    long_description: 'Experience the rich flavors of South Africa with our traditional dishes made from family recipes that have been perfected over generations. We use only the finest local ingredients and traditional cooking methods to bring you an authentic taste of home.',
    image_url: null,
    gallery_images: [],
    rating: 4.8,
    review_count: 127,
    address: '123 Main Street, Montana, Pretoria',
    city: 'Pretoria',
    province: 'Gauteng',
    coordinates: { lat: -25.7479, lng: 28.2293 },
    phone: '+27 81 454 1020',
    website: 'https://paistaste.co.za',
    email: 'orders@paistaste.co.za',
    is_open: true,
    opening_hours: {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '23:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    },
    features: ['Delivery', 'Takeaway', 'Traditional Food', 'Family Friendly', 'Authentic Recipes'],
    delivery_fee: 25.00,
    minimum_order: 80.00,
    estimated_delivery_time: '25-30 min',
    price_range: '$$',
    verified: true,
    featured: true
  },
  '2': {
    id: '2',
    name: 'Elite Car Wash & Detail',
    category: 'car_wash',
    category_name: 'Car Services',
    description: 'Professional car washing and detailing services with eco-friendly products and premium care.',
    long_description: 'Transform your vehicle with our professional car care services. We use only premium eco-friendly products and state-of-the-art equipment to ensure your car receives the best possible treatment. Our experienced team takes pride in delivering exceptional results.',
    image_url: null,
    gallery_images: [],
    rating: 4.6,
    review_count: 89,
    address: '456 Industrial Road, Woodstock, Cape Town',
    city: 'Cape Town',
    province: 'Western Cape',
    coordinates: { lat: -33.9249, lng: 18.4241 },
    phone: '+27 21 123 4567',
    website: 'https://elitecarwash.co.za',
    email: 'bookings@elitecarwash.co.za',
    is_open: true,
    opening_hours: {
      monday: { open: '07:00', close: '18:00', closed: false },
      tuesday: { open: '07:00', close: '18:00', closed: false },
      wednesday: { open: '07:00', close: '18:00', closed: false },
      thursday: { open: '07:00', close: '18:00', closed: false },
      friday: { open: '07:00', close: '19:00', closed: false },
      saturday: { open: '08:00', close: '16:00', closed: false },
      sunday: { open: '09:00', close: '14:00', closed: false }
    },
    features: ['Mobile Service', 'Eco-Friendly', 'Premium Products', 'Warranty', 'Professional Staff'],
    service_fee: 0,
    minimum_booking: 150.00,
    estimated_service_time: '45-90 min',
    price_range: '$$$',
    verified: true,
    featured: true
  },
  '3': {
    id: '3',
    name: 'Trendy Cuts Salon',
    category: 'salon',
    category_name: 'Beauty & Wellness',
    description: 'Modern hair styling and beauty treatments by certified professionals in a relaxing environment.',
    long_description: 'Discover your perfect look at our modern salon. Our team of certified stylists and beauty professionals are passionate about helping you look and feel your best. We offer a full range of services in a comfortable, welcoming environment.',
    image_url: null,
    gallery_images: [],
    rating: 4.9,
    review_count: 156,
    address: '789 Fashion Street, Umhlanga, Durban',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    coordinates: { lat: -29.8587, lng: 31.0218 },
    phone: '+27 31 987 6543',
    website: 'https://trendycuts.co.za',
    email: 'bookings@trendycuts.co.za',
    is_open: false,
    opening_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '20:00', closed: false },
      wednesday: { open: '09:00', close: '20:00', closed: false },
      thursday: { open: '09:00', close: '20:00', closed: false },
      friday: { open: '09:00', close: '21:00', closed: false },
      saturday: { open: '08:00', close: '17:00', closed: false },
      sunday: { open: null, close: null, closed: true }
    },
    features: ['Online Booking', 'Certified Staff', 'Premium Products', 'Parking', 'Consultation'],
    service_fee: 0,
    minimum_booking: 200.00,
    estimated_service_time: '60-180 min',
    price_range: '$$$',
    verified: true,
    featured: false
  },
  '4': {
    id: '4',
    name: 'Fresh Market Grocers',
    category: 'retail',
    category_name: 'Shopping',
    description: 'Fresh produce, organic foods, and daily essentials delivered to your door.',
    long_description: 'Shop for the freshest produce and highest quality groceries from the comfort of your home. We partner with local farmers and suppliers to bring you the best organic and conventional products at competitive prices.',
    image_url: null,
    gallery_images: [],
    rating: 4.3,
    review_count: 203,
    address: '321 Market Square, Sandton, Johannesburg',
    city: 'Johannesburg',
    province: 'Gauteng',
    coordinates: { lat: -26.2041, lng: 28.0473 },
    phone: '+27 11 234 5678',
    website: 'https://freshmarket.co.za',
    email: 'orders@freshmarket.co.za',
    is_open: true,
    opening_hours: {
      monday: { open: '06:00', close: '20:00', closed: false },
      tuesday: { open: '06:00', close: '20:00', closed: false },
      wednesday: { open: '06:00', close: '20:00', closed: false },
      thursday: { open: '06:00', close: '20:00', closed: false },
      friday: { open: '06:00', close: '21:00', closed: false },
      saturday: { open: '06:00', close: '18:00', closed: false },
      sunday: { open: '07:00', close: '16:00', closed: false }
    },
    features: ['Fresh Produce', 'Organic Options', 'Same Day Delivery', 'Loyalty Program', 'Bulk Orders'],
    delivery_fee: 35.00,
    minimum_order: 120.00,
    estimated_delivery_time: '2-4 hours',
    price_range: '$$',
    verified: false,
    featured: false
  }
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
  const businessId = params.id as string
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    // Simulate API call to fetch business details
    const loadBusiness = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        const businessData = mockBusinessDetails[businessId as keyof typeof mockBusinessDetails]
        if (businessData) {
          setBusiness(businessData)
        } else {
          router.push('/directory')
        }
      } catch (error) {
        console.error('Error loading business:', error)
        router.push('/directory')
      } finally {
        setLoading(false)
      }
    }

    loadBusiness()
  }, [businessId, router])

  const handleShare = async () => {
    if (navigator.share && business) {
      try {
        await navigator.share({
          title: business.name,
          text: business.description,
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
    if (!business) return { isOpen: false, text: 'Closed' }

    const now = new Date()
    const dayName = now.toLocaleDateString('en', { weekday: 'long' }).toLowerCase()
    const currentTime = now.toTimeString().slice(0, 5)

    const todayHours = business.opening_hours[dayName]
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
    if (!business) return null

    switch (business.category) {
      case 'food':
        return <FoodOrderingInterface business={business} />
      case 'retail':
        return <RetailOrderingInterface business={business} />
      case 'car_wash':
      case 'salon':
      case 'service':
        return <ServiceBookingInterface business={business} />
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-700">Loading business details...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
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
  const categoryInfo = categories[business.category as keyof typeof categories]

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
                {business.featured && (
                  <Badge className="absolute top-4 left-4 bg-yellow-500 text-white">
                    Featured
                  </Badge>
                )}
                {business.verified && (
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
                <Badge variant="secondary">{business.category_name}</Badge>
                <Badge variant={status.isOpen ? "default" : "secondary"}>
                  {status.text}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-stone-800 mb-2">{business.name}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{business.rating}</span>
                  <span className="text-stone-600">({business.review_count} reviews)</span>
                </div>
                <span className="text-stone-400">•</span>
                <span className="text-stone-600">{business.price_range}</span>
              </div>

              <p className="text-stone-700 mb-4">{business.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{business.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{business.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{business.estimated_delivery_time || business.estimated_service_time}</span>
                </div>
                {business.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mt-4">
                {business.features.map((feature: string, index: number) => (
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
              {business.category === 'food' || business.category === 'retail' ? (
                <ShoppingCart className="w-4 h-4" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              {business.category === 'food' || business.category === 'retail' ? 'Order' : 'Book Service'}
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
                <p className="text-stone-700">{business.long_description}</p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Opening Hours</h3>
                <div className="space-y-2">
                  {Object.entries(business.opening_hours).map(([day, hours]: [string, any]) => (
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