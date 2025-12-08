"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"

export function MobileBusinessSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header Image Skeleton */}
      <div className="relative w-full">
        <Skeleton className="h-48 w-full rounded-none" />

        {/* Back button */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
          <ChevronLeft className="w-5 h-5 text-stone-800" />
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-stone-50 rounded-t-[2.5rem] -mt-10 relative min-h-screen pb-20" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
        <div className="px-5 pt-8 pb-6">
          {/* Business Name */}
          <Skeleton className="h-7 w-48 mb-3" />

          {/* Rating and Info */}
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Description */}
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />

          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>

          {/* Features */}
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>

          {/* Tabs and Action Icons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-16 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>

          {/* Content Cards */}
          <div className="space-y-4">
            <Card className="p-5">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
