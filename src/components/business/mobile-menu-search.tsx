"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileMenuSearchProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  categories: string[]
  resultsCount?: number
}

export function MobileMenuSearch({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  resultsCount
}: MobileMenuSearchProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div
        className={cn(
          "relative transition-all duration-200",
          isSearchFocused && "transform scale-[1.02]"
        )}
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5 pointer-events-none" />
        <Input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className={cn(
            "pl-12 pr-12 py-6 rounded-2xl border-2 bg-white text-base transition-all duration-200",
            isSearchFocused
              ? "border-stone-400 shadow-lg"
              : "border-stone-200 shadow-sm"
          )}
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-stone-50 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-stone-50 to-transparent pointer-events-none z-10" />

          {categories.map((category) => {
            const isActive = selectedCategory === category
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={cn(
                  "flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border-2",
                  isActive
                    ? "bg-stone-700 text-white border-stone-700 shadow-lg scale-105"
                    : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:shadow-md active:scale-95"
                )}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results Counter */}
      {resultsCount !== undefined && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-600">
            {resultsCount} {resultsCount === 1 ? 'item' : 'items'} found
            {selectedCategory !== 'All' && (
              <span className="text-stone-400"> in {selectedCategory}</span>
            )}
          </p>
          {(searchTerm || selectedCategory !== 'All') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSearchChange('')
                onCategoryChange('All')
              }}
              className="text-xs text-stone-500 hover:text-stone-700"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
