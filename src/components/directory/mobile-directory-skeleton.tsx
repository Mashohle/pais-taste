"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function MobileDirectorySkeleton() {
  return (
    <div className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-20" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
      <div className="px-5 pt-8 pb-6">
        {/* Filter Button & Results Count Skeleton */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>
        </div>

        {/* Results Header Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Businesses Grid - 2 per row */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-24 w-full rounded-t-lg" />
              <div className="p-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
