"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from 'lucide-react'

const businessTypes = [
  { id: 'all', name: 'All Types' },
  { id: 'food', name: 'Restaurants' },
  { id: 'retail', name: 'Retail' },
  { id: 'services', name: 'Services' }
]

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

const timeRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: 'year', label: 'Last Year' }
]

interface MobileHistoryFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  selectedBusinessType: string
  onBusinessTypeChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
  selectedBusiness: string
  onBusinessChange: (value: string) => void
  selectedTimeRange: string
  onTimeRangeChange: (value: string) => void
  uniqueBusinesses: Array<{ id: string; name: string }>
  onClearFilters: () => void
  activeFilterCount: number
}

export function MobileHistoryFilterSheet({
  isOpen,
  onClose,
  selectedBusinessType,
  onBusinessTypeChange,
  selectedStatus,
  onStatusChange,
  selectedBusiness,
  onBusinessChange,
  selectedTimeRange,
  onTimeRangeChange,
  uniqueBusinesses,
  onClearFilters,
  activeFilterCount
}: MobileHistoryFilterSheetProps) {
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
            {/* Business Type Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-700">Business Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {businessTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => onBusinessTypeChange(type.id)}
                    className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      selectedBusinessType === type.id
                        ? 'border-stone-700 bg-stone-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Business Filter */}
            {uniqueBusinesses.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-stone-700">Business</Label>
                <Select value={selectedBusiness} onValueChange={onBusinessChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Businesses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Businesses</SelectItem>
                    {uniqueBusinesses.map(business => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-700">Status</Label>
              <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-700">Time Range</Label>
              <Select value={selectedTimeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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
