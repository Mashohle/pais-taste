"use client"

import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { DynamicIcon } from '@/lib/utils/icon-mapper'

interface MobileBusinessHeaderProps {
  businessName: string
  logoUrl?: string | null
  categoryIcon: string
}

export function MobileBusinessHeader({ businessName, logoUrl, categoryIcon }: MobileBusinessHeaderProps) {
  const router = useRouter()
  const [showTopBar, setShowTopBar] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBar(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative w-full">
      {/* Sticky Top Bar - appears on scroll */}
      <div
        className={`fixed top-0 left-0 right-0 bg-stone-50 border-b border-stone-200 z-50 transition-all duration-300 ${
          showTopBar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-stone-100/50 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-stone-800" />
          </button>

          <h1 className="flex-1 text-center text-lg font-semibold text-stone-800 line-clamp-1 px-4 pr-14">
            {businessName}
          </h1>
        </div>
      </div>

      {/* Simple header image - fixed height */}
      <div className="w-full h-48 bg-gradient-to-r from-stone-200 to-stone-300 flex items-center justify-center overflow-hidden relative">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={businessName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
              const parent = (e.target as HTMLImageElement).parentElement
              if (parent) {
                parent.innerHTML = `<div class="w-12 h-12 text-stone-600 flex items-center justify-center"></div>`
              }
            }}
          />
        ) : (
          <DynamicIcon name={categoryIcon} className="w-12 h-12 text-stone-600" />
        )}

        {/* Gradient overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

        {/* Back button - top left */}
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 bg-white/70 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white/90 transition-colors z-10"
        >
          <ChevronLeft className="w-6 h-6 text-stone-800" />
        </button>
      </div>
    </div>
  )
}
