"use client"

import { Search, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MobilePageHeaderProps {
  title: string
  subtitle?: string
  showSearch?: boolean
  searchTerm?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  showBackButton?: boolean
  backHref?: string
}

export function MobilePageHeader({
  title,
  subtitle,
  showSearch = false,
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  showBackButton = false,
  backHref = '/'
}: MobilePageHeaderProps) {
  const router = useRouter()

  return (
    <div className="bg-white pb-24 relative">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        {showBackButton && (
          <div className="mb-4">
            <button
              onClick={() => router.push(backHref)}
              className="p-2 -ml-2 hover:bg-stone-100 rounded-full transition-colors flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6 text-stone-700" />
            </button>
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent mb-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-stone-500">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-400 focus:border-transparent text-sm bg-stone-50"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
