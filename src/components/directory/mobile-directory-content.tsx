"use client"

import { BusinessCard, BusinessCardContent } from "@/components/ui/business-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import { useRouter } from 'next/navigation'

interface Business {
  id: string
  slug?: string
  name: string
  logo_url?: string | null
  category?: {
    id: string
    name: string
    icon: string
  }
  description?: string
  rating?: number | null
  review_count?: number | null
  distance?: number | null
  is_featured?: boolean
  is_open?: boolean
}

interface MobileDirectoryContentProps {
  businesses: Business[]
  onFilterClick: () => void
  activeFilterCount: number
  onClearFilters: () => void
}

export function MobileDirectoryContent({
  businesses,
  onFilterClick,
  activeFilterCount,
  onClearFilters
}: MobileDirectoryContentProps) {
  const router = useRouter()

  return (
    <div className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-20" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
      <div className="px-5 pt-8 pb-6">
        {/* Filter Button & Active Filters Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-stone-700">
              {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onFilterClick}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-1 text-xs px-1.5 py-0 h-5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-stone-500"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
            All Businesses
          </h3>
        </div>

        {/* Businesses Grid - 2 per row */}
        {businesses.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {businesses.map((business) => (
              <BusinessCard
                key={business.id}
                className="cursor-pointer active:scale-95 transition-transform"
                onClick={() => {
                  router.push(`/business/${business.slug || business.id}`)
                }}
              >
                <BusinessCardContent className="p-0">
                  {/* Business Image - Compact */}
                  <div className="h-24 bg-gradient-to-r from-stone-200 to-stone-300 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    {business.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={business.logo_url}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <DynamicIcon name={business.category?.icon || 'building'} className="w-8 h-8 text-stone-600" />
                    )}

                    {/* Badges */}
                    {business.is_featured && (
                      <Badge className="absolute top-1 left-1 text-[10px] px-1.5 py-0 h-4 bg-yellow-500 text-white">
                        Featured
                      </Badge>
                    )}
                    {business.is_open !== undefined && (
                      <Badge
                        className={`absolute top-1 right-1 text-[10px] px-1.5 py-0 h-4 ${
                          business.is_open
                            ? 'bg-green-500 text-white'
                            : 'bg-stone-500 text-white'
                        }`}
                      >
                        {business.is_open ? 'Open' : 'Closed'}
                      </Badge>
                    )}
                  </div>

                  {/* Business Info - Compact */}
                  <div className="p-2">
                    <h3 className="font-semibold text-stone-900 text-sm mb-1 line-clamp-1">
                      {business.name}
                    </h3>

                    {/* Category */}
                    {business.category && (
                      <p className="text-[10px] text-stone-500 mb-1.5 line-clamp-1">
                        {business.category.name}
                      </p>
                    )}

                    {/* Rating & Distance */}
                    <div className="flex items-center gap-2 text-[10px] text-stone-600">
                      {business.rating !== undefined && business.rating !== null && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{business.rating.toFixed(1)}</span>
                          {business.review_count !== undefined && business.review_count !== null && (
                            <span className="text-stone-400">({business.review_count})</span>
                          )}
                        </div>
                      )}
                      {business.distance !== undefined && business.distance !== null && (
                        <div className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{business.distance.toFixed(1)}km</span>
                        </div>
                      )}
                    </div>
                  </div>
                </BusinessCardContent>
              </BusinessCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-800 mb-2">No businesses found</h3>
            <p className="text-stone-600 text-sm mb-4">
              Try adjusting your filters or search term
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={onClearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
