"use client"

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Search, MapPin, Clock, Star, ChevronRight, Filter, Map, List, SlidersHorizontal, X, Heart, Phone, Globe, Navigation } from "lucide-react"
import Link from 'next/link'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import { useBusinessSwitching } from '@/lib/hooks'
import { useBusinessDirectory } from '@/lib/hooks'

interface Business {
  id: string
  name: string
  category: string
  category_name: string
  description: string
  image_url: string | null
  rating: number
  review_count: number
  address: string
  city: string
  province: string
  coordinates?: { lat: number; lng: number }
  is_open: boolean
  opening_hours: { [key: string]: { open: string; close: string; closed: boolean } }
  estimated_time: string
  delivery_fee: number
  minimum_order: number
  phone?: string
  website?: string
  features: string[]
  price_range: '$' | '$$' | '$$$' | '$$$$'
  distance?: number
  featured: boolean
  verified: boolean
}

// Extended mock business data
const mockBusinesses: Business[] = [
  {
    id: '1',
    name: "Pai's Taste Food Special",
    category: 'food',
    category_name: 'Food & Dining',
    description: 'Authentic South African traditional cuisine with modern twists',
    image_url: null,
    rating: 4.8,
    review_count: 127,
    address: '123 Main Street, Montana',
    city: 'Pretoria',
    province: 'Gauteng',
    coordinates: { lat: -25.7479, lng: 28.2293 },
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
    estimated_time: '25-30 min',
    delivery_fee: 25.00,
    minimum_order: 80.00,
    phone: '+27 81 454 1020',
    features: ['Delivery', 'Takeaway', 'Traditional Food', 'Family Friendly'],
    price_range: '$$',
    distance: 2.5,
    featured: true,
    verified: true
  },
  {
    id: '2',
    name: 'Elite Car Wash & Detail',
    category: 'car_wash',
    category_name: 'Car Services',
    description: 'Professional car washing and detailing services with eco-friendly products',
    image_url: null,
    rating: 4.6,
    review_count: 89,
    address: '456 Industrial Road, Woodstock',
    city: 'Cape Town',
    province: 'Western Cape',
    coordinates: { lat: -33.9249, lng: 18.4241 },
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
    estimated_time: '45-60 min',
    delivery_fee: 0,
    minimum_order: 150.00,
    phone: '+27 21 123 4567',
    website: 'https://elitecarwash.co.za',
    features: ['Mobile Service', 'Eco-Friendly', 'Premium Products', 'Warranty'],
    price_range: '$$$',
    distance: 5.2,
    featured: true,
    verified: true
  },
  {
    id: '3',
    name: 'Trendy Cuts Salon',
    category: 'salon',
    category_name: 'Beauty & Wellness',
    description: 'Modern hair styling and beauty treatments by certified professionals',
    image_url: null,
    rating: 4.9,
    review_count: 156,
    address: '789 Fashion Street, Umhlanga',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    coordinates: { lat: -29.8587, lng: 31.0218 },
    is_open: false,
    opening_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '20:00', closed: false },
      wednesday: { open: '09:00', close: '20:00', closed: false },
      thursday: { open: '09:00', close: '20:00', closed: false },
      friday: { open: '09:00', close: '21:00', closed: false },
      saturday: { open: '08:00', close: '17:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    estimated_time: '60-90 min',
    delivery_fee: 0,
    minimum_order: 200.00,
    phone: '+27 31 987 6543',
    website: 'https://trendycuts.co.za',
    features: ['Online Booking', 'Certified Staff', 'Premium Products', 'Parking'],
    price_range: '$$$',
    distance: 8.7,
    featured: false,
    verified: true
  },
  {
    id: '4',
    name: 'Fresh Market Grocers',
    category: 'retail',
    category_name: 'Shopping',
    description: 'Fresh produce, organic foods, and daily essentials',
    image_url: null,
    rating: 4.3,
    review_count: 203,
    address: '321 Market Square, Sandton',
    city: 'Johannesburg',
    province: 'Gauteng',
    coordinates: { lat: -26.2041, lng: 28.0473 },
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
    estimated_time: '15-20 min',
    delivery_fee: 35.00,
    minimum_order: 120.00,
    phone: '+27 11 234 5678',
    features: ['Fresh Produce', 'Organic Options', 'Same Day Delivery', 'Loyalty Program'],
    price_range: '$$',
    distance: 12.3,
    featured: false,
    verified: false
  }
]

// Categories are now loaded from the database via the hook

const provinces = [
  'All Provinces',
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
]

export default function BusinessDirectory() {
  // Use custom hooks
  const { 
    businesses,
    categories,
    cities,
    isLoading,
    hasError,
    error,
    getFilteredBusinesses
  } = useBusinessDirectory()
  
  const { 
    switchToBusinessType,
    getBusinessTypeFromCategory,
    getBusinessTypeIcon,
    getBusinessTypeColor,
    shouldWarnAboutBusinessSwitch,
    isSwitching
  } = useBusinessSwitching()

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProvince, setSelectedProvince] = useState('All Provinces')
  const [selectedCity, setSelectedCity] = useState('')
  const [priceRange, setPriceRange] = useState<string[]>([])
  const [minRating, setMinRating] = useState([0])
  const [maxDistance, setMaxDistance] = useState([50])
  const [openNow, setOpenNow] = useState(false)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Get filtered businesses using the current filter state
  const currentFilters = {
    searchTerm,
    selectedCategory,
    selectedProvince,
    selectedCity,
    priceRange,
    minRating,
    maxDistance,
    openNow,
    featuredOnly,
    verifiedOnly,
    sortBy
  }

  
  const sortedBusinesses = getFilteredBusinesses(currentFilters)

  // All filtering and sorting is now handled by the hook

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedProvince('All Provinces')
    setSelectedCity('')
    setPriceRange([])
    setMinRating([0])
    setMaxDistance([50])
    setOpenNow(false)
    setFeaturedOnly(false)
    setVerifiedOnly(false)
    setSortBy('relevance')
  }

  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedProvince !== 'All Provinces',
    selectedCity !== '',
    priceRange.length > 0,
    minRating[0] > 0,
    maxDistance[0] < 50,
    openNow,
    featuredOnly,
    verifiedOnly
  ].filter(Boolean).length

  const getPriceRangeDisplay = (range: string) => {
    switch (range) {
      case '$': return '$'
      case '$$': return '$$'
      case '$$$': return '$$$'
      case '$$$$': return '$$$$'
      default: return range
    }
  }

  // Cities are now provided by the hook

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                LocalHub
              </Link>
              <Badge variant="secondary" className="text-xs">
                Business Directory
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Favorites
              </Button>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-stone-800 mb-2">Business Directory</h1>
              <p className="text-stone-600">Discover and connect with local businesses in your area</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Map className="w-4 h-4 mr-2" />
                Map View
              </Button>
            </div>
          </div>

          {/* Main Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search businesses, services, products..."
              className="pl-12 pr-4 py-6 text-lg rounded-2xl border-stone-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-24">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Category Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="all" value="all">
                        <div className="flex items-center gap-2">
                          <DynamicIcon name="grid-3x3" className="w-4 h-4" />
                          All Categories
                        </div>
                      </SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name?.toLowerCase() || category.id}>
                          <div className="flex items-center gap-2">
                            <DynamicIcon name={category.icon} className="w-4 h-4" />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filters */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Location</Label>
                  <div className="space-y-3">
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map(province => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Enter city..."
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Price Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['$', '$$', '$$$', '$$$$'].map(range => (
                      <label key={range} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={priceRange.includes(range)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPriceRange([...priceRange, range])
                            } else {
                              setPriceRange(priceRange.filter(r => r !== range))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{getPriceRangeDisplay(range)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Minimum Rating: {minRating[0]}★
                  </Label>
                  <Slider
                    value={minRating}
                    onValueChange={setMinRating}
                    min={0}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Distance Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Maximum Distance: {maxDistance[0]}km
                  </Label>
                  <Slider
                    value={maxDistance}
                    onValueChange={setMaxDistance}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Toggle Filters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="open-now" className="text-sm font-medium">Open Now</Label>
                    <Switch
                      id="open-now"
                      checked={openNow}
                      onCheckedChange={setOpenNow}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured" className="text-sm font-medium">Featured Only</Label>
                    <Switch
                      id="featured"
                      checked={featuredOnly}
                      onCheckedChange={setFeaturedOnly}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verified" className="text-sm font-medium">Verified Only</Label>
                    <Switch
                      id="verified"
                      checked={verifiedOnly}
                      onCheckedChange={setVerifiedOnly}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Mobile Filter Toggle & Sort */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-stone-800">
                  {sortedBusinesses.length} businesses found
                </h2>
                {searchTerm && (
                  <p className="text-sm text-stone-600">
                    Results for "{searchTerm}"
                  </p>
                )}
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="distance">Nearest First</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Business Listings */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
                  <p className="text-stone-700">Loading businesses...</p>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {sortedBusinesses.map((business) => (
                <Card key={business.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className={viewMode === 'grid' ? '' : 'flex'}>
                      {/* Business Image */}
                      <div className={`${viewMode === 'grid' ? 'h-48' : 'w-32 h-32 flex-shrink-0'} bg-gradient-to-r from-stone-200 to-stone-300 ${viewMode === 'grid' ? 'rounded-t-lg' : 'rounded-l-lg'} flex items-center justify-center relative`}>
                        <DynamicIcon 
                          name={categories.find(c => c.id === business.category)?.icon || 'building'} 
                          className="w-12 h-12 text-stone-600" 
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex gap-1">
                          {business.featured && (
                            <Badge className="text-xs bg-yellow-500 text-white">Featured</Badge>
                          )}
                          {business.verified && (
                            <Badge className="text-xs bg-blue-500 text-white">Verified</Badge>
                          )}
                        </div>
                        
                        {/* Distance */}
                        {business.distance && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs">
                              {business.distance}km
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Business Details */}
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-stone-800 mb-1">
                              {business.name}
                            </h3>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{business.rating}</span>
                                <span className="text-xs text-gray-500">({business.review_count})</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-600">{business.price_range}</span>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-stone-600 mb-3 line-clamp-2">
                          {business.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-stone-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{business.city}, {business.province}</span>
                          </div>
                        </div>
                        
                        {/* Business Type & Features */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge 
                            className={`text-xs border ${getBusinessTypeColor(getBusinessTypeFromCategory(business.category_name))}`}
                          >
                            {getBusinessTypeIcon(getBusinessTypeFromCategory(business.category_name))} {business.category_name}
                          </Badge>
                          {(business.features || []).slice(0, 2).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {(business.features || []).length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(business.features || []).length - 2} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={business.is_open ? "default" : "secondary"}>
                              {business.is_open ? 'Open' : 'Closed'}
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-stone-600">
                              <Clock className="w-3 h-3" />
                              <span>{business.hours}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {business.phone && (
                              <Button variant="ghost" size="sm">
                                <Phone className="w-4 h-4" />
                              </Button>
                            )}
                            {business.website && (
                              <Button variant="ghost" size="sm">
                                <Globe className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              disabled={isSwitching}
                              onClick={async () => {
                                const success = await switchToBusinessType(
                                  business.id,
                                  business.name,
                                  {
                                    confirmSwitch: shouldWarnAboutBusinessSwitch(business.id),
                                    redirectTo: `/business/${business.id}`,
                                    showNotification: false
                                  }
                                )
                                // If user cancelled the switch, don't navigate
                                if (!success && shouldWarnAboutBusinessSwitch(business.id)) {
                                  return
                                }
                              }}
                            >
                              {isSwitching ? (
                                <>Loading...</>
                              ) : (
                                <>
                                  View
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {(business.delivery_fee || 0) > 0 && (
                          <div className="mt-2 text-xs text-stone-500">
                            Delivery: R{business.delivery_fee || 0} • Min order: R{business.minimum_order || 0}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
            
            {!isLoading && sortedBusinesses.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-lg font-medium text-stone-800 mb-2">No businesses found</h3>
                <p className="text-stone-600 mb-4">
                  Try adjusting your search criteria or filters to find what you're looking for.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}