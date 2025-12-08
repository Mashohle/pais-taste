"use client"

import { MapPin, Search, User } from 'lucide-react'
import Link from 'next/link'
import { useCustomerAuth } from '@/lib/context/customer-auth-context'

interface MobileHomeHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export function MobileHomeHeader({ searchTerm, onSearchChange }: MobileHomeHeaderProps) {
  const { user } = useCustomerAuth()

  return (
    <div className="bg-white pb-24 relative">
      {/* Location Bar with Account Avatar */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between gap-3 text-stone-700">
          <div className="flex items-center gap-2.5 flex-1">
            <MapPin className="w-5 h-5 text-stone-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Deliver to</p>
              <p className="text-xs text-stone-500 mt-0.5">Current Location</p>
            </div>
          </div>

          {/* Account Avatar */}
          <Link href={user ? "/account" : "/login"}>
            <div className="w-11 h-11 rounded-full bg-stone-200 flex items-center justify-center hover:bg-stone-300 transition-colors">
              {user ? (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center text-white text-sm font-semibold">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              ) : (
                <User className="w-5 h-5 text-stone-600" />
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search businesses, food, services..."
            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-400 focus:border-transparent text-sm bg-stone-50"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
