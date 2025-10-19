"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MapPin, Clock, Star, ChevronRight, Filter, Map, List, SlidersHorizontal, X, Heart, Phone, Globe, Navigation } from "lucide-react"
import Link from 'next/link'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import { useBusinessSwitching } from '@/lib/hooks'
import { useBusinessDirectory } from '@/lib/hooks'

// Business interface is now defined in the hook

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
  const router = useRouter()

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
  const [minRating, setMinRating] = useState([0])
  const [maxDistance, setMaxDistance] = useState([50])
  const [openNow, setOpenNow] = useState(false)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Read category from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const category = params.get('category')
      if (category) {
        setSelectedCategory(category)
      }
    }
  }, [])

  // Get filtered businesses using the current filter state
  const currentFilters = {
    searchTerm,
    selectedCategory,
    selectedProvince,
    selectedCity,
    priceRange: [], // Removed price range filter
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
                SideHusl
              </Link>
              <Badge variant="secondary" className="text-xs">
                Business Directory
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  Back to Home
                </Button>
              </Link>
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
                variant="outline"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-stone-700 hover:bg-stone-800 text-white border-stone-700' : 'hover:bg-stone-100'}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-stone-700 hover:bg-stone-800 text-white border-stone-700' : 'hover:bg-stone-100'}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-stone-100">
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
                {isLoading ? (
                  /* Sidebar Skeleton Loaders */
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Category Filter */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem key="all" value="all">
                            <div className="flex items-center gap-2">
                              <DynamicIcon name="grid-3x3" className="w-4 h-4" />
                              All Categories
                            </div>
                          </SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
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
                  </>
                )}
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
                  {sortedBusinesses.length} {sortedBusinesses.length === 1 ? 'business' : 'businesses'}
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
              <div className="space-y-4">
                {/* Skeleton Loaders */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex gap-4">
                        {/* Image Skeleton */}
                        <div className="w-40 h-48 ml-4 my-4">
                          <Skeleton className="w-full h-full rounded-lg" />
                        </div>

                        {/* Content Skeleton */}
                        <div className="flex-1 py-6 pr-6 space-y-4">
                          {/* Title */}
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>

                          {/* Meta info */}
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-16" />
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-24" />
                            <div className="flex gap-2">
                              <Skeleton className="h-9 w-9 rounded-md" />
                              <Skeleton className="h-9 w-24 rounded-md" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedBusinesses.map((business) => (
                <Card
                  key={business.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    router.push(`/business/${business.id}`)
                  }}
                >
                  <CardContent className="p-0">
                    <div className="flex gap-4">
                      {/* Business Image */}
                      <div className="w-40 self-stretch flex-shrink-0 bg-gradient-to-r from-stone-200 to-stone-300 rounded-lg flex items-center justify-center relative overflow-hidden ml-4">
                        <DynamicIcon
                          name={categories.find(c => c.id === business.category)?.icon || 'building'}
                          className="w-12 h-12 text-stone-600"
                        />

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex gap-1">
                          {business.featured && (
                            <Badge className="text-xs bg-yellow-500 text-white">Featured</Badge>
                          )}
                        </div>
                      </div>

                      {/* Business Details */}
                      <div className="pr-4 flex-1 flex flex-col justify-between min-h-0">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-stone-800">
                              {business.name}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-500 -mt-2 -mr-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                // TODO: Add to favorites functionality
                              }}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-stone-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{(business.rating || 0).toFixed(1)}</span>
                              <span className="text-xs text-gray-500">({business.review_count || 0})</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{business.city}, {business.province}</span>
                            </div>
                            {business.distance && (
                              <>
                                <span>•</span>
                                <span>{business.distance.toFixed(1)}km</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-stone-600">
                            <Badge variant={business.is_open ? "default" : "secondary"} className="text-xs">
                              {business.is_open ? 'Open' : 'Closed'}
                            </Badge>
                            <Clock className="w-4 h-4" />
                            <span>
                              {(() => {
                                const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                                const today = days[new Date().getDay()]
                                const hours = business.opening_hours?.[today]
                                if (hours?.closed) return 'Closed today'
                                if (hours) return `${hours.open} - ${hours.close}`
                                return 'Hours unavailable'
                              })()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={`text-xs border ${getBusinessTypeColor(getBusinessTypeFromCategory(business.category_name))}`}
                            >
                              {business.category_name}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-2">
                            {business.phone && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.location.href = `tel:${business.phone}`
                                }}
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="bg-stone-700 hover:bg-stone-800 text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/business/${business.id}`)
                              }}
                            >
                              View
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
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
                <h3 className="text-lg font-medium text-stone-800 mb-2">No business found</h3>
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