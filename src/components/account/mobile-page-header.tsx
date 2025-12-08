"use client"

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MobilePageHeaderProps {
  title: string
  subtitle?: string
}

export function MobilePageHeader({ title, subtitle }: MobilePageHeaderProps) {
  const router = useRouter()

  return (
    <div className="bg-white pb-20 relative">
      {/* Header with Back Button */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 hover:bg-stone-100 rounded-full transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-stone-800" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
