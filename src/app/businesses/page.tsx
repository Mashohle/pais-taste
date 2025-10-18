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
import { useCustomerPortal } from '@/lib/hooks/use-customer-portal'

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

        {/* Business List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-8 w-20" />
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
          <div className="space-y-4">
            {businesses.map((business) => (
              <Card key={business.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Business Logo */}
                    <div className="w-16 h-16 bg-gradient-to-r from-stone-200 to-stone-300 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {business.logo_url ? (
                        <img
                          src={business.logo_url}
                          alt={business.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                            const parent = (e.target as HTMLImageElement).parentElement
                            if (parent) {
                              parent.innerHTML = `<div class="w-8 h-8 text-stone-600">${business.category.icon}</div>`
                            }
                          }}
                        />
                      ) : (
                        <DynamicIcon name={business.category.icon || 'building'} className="w-8 h-8 text-stone-600" />
                      )}
                    </div>

                    {/* Business Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-stone-800 truncate">{business.name}</h3>
                        <div className="flex items-center space-x-1 ml-4">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{business.rating || 0}</span>
                          <span className="text-xs text-gray-500">({business.review_count || 0})</span>
                        </div>
                      </div>

                      <p className="text-sm text-stone-600 mb-2 line-clamp-2">{business.description}</p>

                      <div className="flex items-center space-x-4 text-sm text-stone-500 mb-2">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">
                            {business.address}{business.city && `, ${business.city}`}
                          </span>
                        </div>
                        {business.phone && (
                          <span className="text-xs">{business.phone}</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge variant={business.is_featured ? "default" : "secondary"} className="text-xs">
                          {business.is_featured ? 'Featured' : 'Available'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {business.category.name}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link href={`/business/${business.slug || business.id}`}>
                      <Button size="sm" className="flex-shrink-0">
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
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