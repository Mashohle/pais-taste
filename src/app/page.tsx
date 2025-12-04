"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { BusinessCard, BusinessCardContent } from "@/components/ui/business-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MapPin, Clock, Star, ChevronRight, ShoppingBag, Filter, Menu, User, Heart, Phone, Package } from "lucide-react"
import Link from 'next/link'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import { useCustomerAuth } from '@/lib/context/customer-auth-context'
import { useCustomerPortal } from '@/lib/hooks'

export default function CustomerPortalHome() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory] = useState<string | null>(null)
  const { user } = useCustomerAuth()

  // Use customer portal hook for real data
  const {
    businesses,
    categories,
    loading,
    categoriesLoading,
    error,
    searchBusinesses,
    filterByCategory
  } = useCustomerPortal()

  // Debounce search to avoid excessive API calls and reloading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchBusinesses(searchTerm)
      } else if (!selectedCategory) {
        filterByCategory(null)
      }
    }, 300) // 300ms debounce delay

    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchBusinesses, filterByCategory, selectedCategory])

  // Handle search input change (just update state, debounce effect handles API call)
  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 mb-4">❌ Error loading businesses</div>
          <p className="text-stone-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        {/* Navigation Header */}
        <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                  SideHusl
                </div>
                <Badge variant="secondary" className="text-xs">
                  Customer Portal
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <Link href="/directory">
                  <Button variant="ghost" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Directory
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites
                </Button>
                <Link href="/track-order">
                  <Button variant="ghost" size="sm">
                    <Package className="w-4 h-4 mr-2" />
                    Track Order
                  </Button>
                </Link>
                <Link href={user ? "/account" : "/login"}>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    {user ? "Account" : "Sign In"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-stone-800 mb-4">
              Discover Local Businesses
            </h1>
            <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
              Order food, book services, shop local products - all in one place
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Skeleton className="w-full h-16 rounded-2xl" />
              </div>
            </div>
          </div>

          {/* Categories Skeleton */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-6">Browse Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-4 w-20 mx-auto mb-1" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Businesses Skeleton */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-stone-800">Featured Businesses</h2>
              <Skeleton className="h-8 w-20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-48 rounded-t-lg" />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default static layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                SideHusl
              </div>
              <Badge variant="secondary" className="text-xs">
                Customer Portal
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/directory">
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Directory
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Favorites
              </Button>
              <Link href="/track-order">
                <Button variant="ghost" size="sm">
                  <Package className="w-4 h-4 mr-2" />
                  Track Order
                </Button>
              </Link>
              <Link href={user ? "/account" : "/login"}>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  {user ? "Account" : "Sign In"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-800 mb-4">
            Discover Local Businesses
          </h1>
          <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
            Order food, book services, shop local products - all in one place
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for businesses, food, services..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-stone-400 focus:border-transparent text-lg"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl">
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-stone-800 mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link href={`/directory?category=${category.id}`} key={category.id}>
                <Card className="cursor-pointer transition-all hover:shadow-md">
                  <CardContent className="px-4 text-center">
                    <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mx-auto mb-3`}>
                      <DynamicIcon name={category.icon} className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-stone-800 mb-1">{category.name}</h3>
                    <p className="text-sm text-stone-600">{category.count} businesses</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Businesses */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-stone-800">
              Featured Businesses
            </h2>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard
                key={business.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  router.push(`/business/${business.slug || business.id}`)
                }}
              >
                <BusinessCardContent className="p-0">
                  {/* Business Image */}
                  <div className="h-48 bg-gradient-to-r from-stone-200 to-stone-300 rounded-t-lg flex items-center justify-center relative overflow-hidden">
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
                            const iconDiv = document.createElement('div')
                            iconDiv.className = 'w-12 h-12 text-stone-600'
                            parent.appendChild(iconDiv)
                          }
                        }}
                      />
                    ) : (
                      <DynamicIcon name={business.category?.icon || 'building'} className="w-12 h-12 text-stone-600" />
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {business.is_featured && (
                        <Badge className="text-xs bg-yellow-500 text-white">Featured</Badge>
                      )}
                    </div>

                    {/* Heart Button */}
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-500 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Add to favorites functionality
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-stone-800 mb-2">
                        {business.name}
                      </h3>
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
                        <span className="truncate">{business.city}</span>
                      </div>
                      {business.distance && (
                        <>
                          <span>•</span>
                          <span className="text-xs">{business.distance.toFixed(1)}km</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-stone-600 mb-3">
                      <Badge variant={business.is_open ? "default" : "secondary"} className="text-xs">
                        {business.is_open ? 'Open' : 'Closed'}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs truncate">
                        <Clock className="w-3 h-3" />
                        <span>
                          {(() => {
                            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                            const today = days[new Date().getDay()]
                            const hours = business.opening_hours?.[today]
                            if (hours?.closed) return 'Closed'
                            if (hours) return `${hours.open} - ${hours.close}`
                            return 'N/A'
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${business.category?.color || 'bg-stone-200'}`}>
                        {business.category?.name}
                      </Badge>

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
                    </div>
                  </div>
                </BusinessCardContent>
              </BusinessCard>
            ))}
          </div>
          
          {businesses.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-medium text-stone-800 mb-2">No businesses found</h3>
              <p className="text-stone-600">
                {searchTerm || selectedCategory
                  ? 'Try adjusting your search or category filter.'
                  : 'Check back later for new businesses in your area.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Business Application CTA */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 mb-12">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-2">Join SideHusl as a Business Partner</h3>
            <p className="text-stone-600 mb-6 max-w-2xl mx-auto">
              Ready to grow your business? Join thousands of South African businesses already serving customers through SideHusl. 
              Get access to new customers, manage orders efficiently, and boost your revenue.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  Apply as a Business
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/business-info">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-stone-600">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>5.5% commission only</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-green-500" />
                <span>Quick 3-day approval</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Free to join</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Notice for Dynamic Content */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Menu className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Dynamic Content System</h3>
            <p className="text-stone-600 mb-4">
              This page will soon feature dynamic content screens built with our Super Admin Portal. 
              Create custom layouts, carousels, promotions, and business showcases.
            </p>
            <Badge variant="outline" className="bg-white">
              Coming in Phase 4
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}