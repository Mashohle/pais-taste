"use client"

import { BusinessCard, BusinessCardContent } from "@/components/ui/business-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, ShoppingBag, Menu, ChevronRight, Clock, Heart } from 'lucide-react'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

interface Category {
  id: string
  name: string
  icon: string
  color: string
  count: number
}

interface MobileBusinessGridProps {
  businesses: Business[]
  categories: Category[]
}

export function MobileBusinessGrid({ businesses, categories }: MobileBusinessGridProps) {
  const router = useRouter()

  return (
    <div className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-20" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
      <div className="px-5 pt-10 pb-6">
        {/* Categories - 4 per row */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent mb-4">Categories</h3>
          <div className="grid grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link href={`/directory?category=${category.id}`} key={category.id}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center shadow-sm`}>
                    <DynamicIcon name={category.icon} className="w-8 h-8" />
                  </div>
                  <p className="text-xs text-center text-stone-700 font-medium line-clamp-1">
                    {category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>


      {/* Featured Businesses */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">Featured Businesses</h3>
      </div>

      {/* 2 per row grid */}
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

        {/* Business Application CTA */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 mt-8">
          <CardContent className="p-5 text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-stone-800 mb-2">Join SideHusl as a Business Partner</h3>
            <p className="text-xs text-stone-600 mb-4">
              Ready to grow your business? Join thousands of South African businesses already serving customers through SideHusl.
            </p>
            <div className="flex flex-col gap-2 mb-4">
              <Link href="/business/apply">
                <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Apply as a Business
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/business-info">
                <Button variant="outline" size="sm" className="w-full">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-2 text-xs text-stone-600">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>5.5% commission only</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-green-500" />
                <span>Quick 3-day approval</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 text-red-500" />
                <span>Free to join</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Notice for Dynamic Content */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mt-4">
          <CardContent className="p-5 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Menu className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-stone-800 mb-2">Dynamic Content System</h3>
            <p className="text-xs text-stone-600 mb-3">
              This page will soon feature dynamic content screens built with our Super Admin Portal.
            </p>
            <Badge variant="outline" className="bg-white text-xs">
              Coming in Phase 4
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
