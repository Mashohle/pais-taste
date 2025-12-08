"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { X } from 'lucide-react'
import { DynamicIcon } from '@/lib/utils/icon-mapper'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  count: number
}

interface MobileFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (value: string) => void
  selectedProvince: string
  onProvinceChange: (value: string) => void
  minRating: number[]
  onMinRatingChange: (value: number[]) => void
  maxDistance: number[]
  onMaxDistanceChange: (value: number[]) => void
  openNow: boolean
  onOpenNowChange: (value: boolean) => void
  featuredOnly: boolean
  onFeaturedOnlyChange: (value: boolean) => void
  verifiedOnly: boolean
  onVerifiedOnlyChange: (value: boolean) => void
  sortBy: string
  onSortByChange: (value: string) => void
  onClearFilters: () => void
  activeFilterCount: number
}

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

export function MobileFilterSheet({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onCategoryChange,
  selectedProvince,
  onProvinceChange,
  minRating,
  onMinRatingChange,
  maxDistance,
  onMaxDistanceChange,
  openNow,
  onOpenNowChange,
  featuredOnly,
  onFeaturedOnlyChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  sortBy,
  onSortByChange,
  onClearFilters,
  activeFilterCount
}: MobileFilterSheetProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 md:hidden"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-hidden md:hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </h3>
            <button onClick={onClose} className="p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)] px-5 py-4">
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-700">Category</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onCategoryChange('all')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    selectedCategory === 'all'
                      ? 'border-stone-700 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center">
                    <span className="text-base">🏢</span>
                  </div>
                  <span className="text-xs font-medium">All</span>
                </button>
                {categories.slice(0, 8).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      selectedCategory === category.id
                        ? 'border-stone-700 bg-stone-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
                      <DynamicIcon name={category.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium line-clamp-1">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Province Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-700">Province</Label>
              <Select value={selectedProvince} onValueChange={onProvinceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold text-stone-700">Minimum Rating</Label>
                <span className="text-sm text-stone-500">{minRating[0]}.0+</span>
              </div>
              <Slider
                value={minRating}
                onValueChange={onMinRatingChange}
                max={5}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Distance Filter */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold text-stone-700">Maximum Distance</Label>
                <span className="text-sm text-stone-500">{maxDistance[0]}km</span>
              </div>
              <Slider
                value={maxDistance}
                onValueChange={onMaxDistanceChange}
                max={50}
                step={5}
                className="w-full"
              />
            </div>

            {/* Quick Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-700">Quick Filters</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="open-now" className="text-sm">Open Now</Label>
                  <Switch
                    id="open-now"
                    checked={openNow}
                    onCheckedChange={onOpenNowChange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="text-sm">Featured Only</Label>
                  <Switch
                    id="featured"
                    checked={featuredOnly}
                    onCheckedChange={onFeaturedOnlyChange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="verified" className="text-sm">Verified Only</Label>
                  <Switch
                    id="verified"
                    checked={verifiedOnly}
                    onCheckedChange={onVerifiedOnlyChange}
                  />
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-700">Sort By</Label>
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="distance">Nearest</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-stone-200 px-5 py-4 flex gap-3">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex-1"
          >
            Clear All
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-stone-700 hover:bg-stone-800"
          >
            Show Results
          </Button>
        </div>
      </div>
    </>
  )
}
