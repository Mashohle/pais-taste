"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MapPin, Star, ChevronRight, Filter, ArrowLeft } from "lucide-react"
import Link from 'next/link'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import { useCustomerPortal } from '@/lib/hooks'

export default function BusinessesListingPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')

  const [searchTerm, setSearchTerm] = useState('')
  const [currentCategory, setCurrentCategory] = useState<string | null>(categoryParam)

  const {
    businesses,
    categories,
    loading,
    error,
    searchBusinesses,
    filterByCategory
  } = useCustomerPortal()

  // Get current category details
  const categoryDetails = categories.find(c => c.id === currentCategory)

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.trim()) {
      searchBusinesses(term, currentCategory || undefined)
    } else if (currentCategory) {
      filterByCategory(currentCategory)
    } else {
      filterByCategory(null)
    }
  }

  // Load businesses based on category filter when page loads
  useEffect(() => {
    if (currentCategory) {
      filterByCategory(currentCategory)
    }
  }, [currentCategory, filterByCategory])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                SideHusl
              </div>
              <Badge variant="secondary" className="text-xs">
                Business Directory
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {categoryDetails && (
              <>
                <div className={`w-12 h-12 rounded-full ${categoryDetails.color} flex items-center justify-center`}>
                  <DynamicIcon name={categoryDetails.icon} className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-stone-800">{categoryDetails.name}</h1>
                  <p className="text-stone-600">{categoryDetails.description}</p>
                </div>
              </>
            )}
            {!categoryDetails && (
              <div>
                <h1 className="text-3xl font-bold text-stone-800">All Businesses</h1>
                <p className="text-stone-600">Discover local businesses in your area</p>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search businesses..."
                className="pl-10 pr-4 py-3 rounded-xl"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={!currentCategory ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCurrentCategory(null)
              filterByCategory(null)
            }}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={currentCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCurrentCategory(category.id)
                filterByCategory(category.id)
              }}
            >
              <DynamicIcon name={category.icon} className="w-4 h-4 mr-2" />
              {category.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-stone-600">
            {loading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `${businesses.length} business${businesses.length !== 1 ? 'es' : ''} found`
            )}
          </p>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Business Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-800 mb-2">No businesses found</h3>
            <p className="text-stone-600 mb-4">
              {searchTerm || currentCategory
                ? 'Try adjusting your search or category filter.'
                : 'Check back later for new businesses in your area.'
              }
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setCurrentCategory(null)
                filterByCategory(null)
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Link key={business.id} href={`/business/${business.slug || business.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="h-48 bg-gradient-to-r from-stone-200 to-stone-300 flex items-center justify-center overflow-hidden">
                    {business.logo_url ? (
                      <img
                        src={business.logo_url}
                        alt={business.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                          const parent = (e.target as HTMLImageElement).parentElement
                          if (parent) {
                            parent.innerHTML = `<div class="w-12 h-12 text-stone-600 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg></div>`
                          }
                        }}
                      />
                    ) : (
                      <DynamicIcon name={business.category.icon || 'building'} className="w-12 h-12 text-stone-600" />
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-stone-800 line-clamp-1">{business.name}</h3>
                      <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{business.rating || 0}</span>
                      </div>
                    </div>

                    <p className="text-sm text-stone-600 mb-3 line-clamp-2">{business.description}</p>

                    <div className="flex items-center space-x-2 text-sm text-stone-500 mb-3">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        {business.city || business.address}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {business.category.name}
                      </Badge>
                      {business.is_featured && (
                        <Badge variant="default" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button (for future pagination) */}
        {businesses.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" disabled>
              Load More Businesses
              <span className="text-xs ml-2">(Coming Soon)</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}