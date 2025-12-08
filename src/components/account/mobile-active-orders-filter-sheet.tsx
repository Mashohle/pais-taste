"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from 'lucide-react'
import { DynamicIcon } from '@/lib/utils/icon-mapper'

const businessTypes = [
  { id: 'all', name: 'All Types', icon: 'grid-3x3', color: 'bg-gray-100 text-gray-700' },
  { id: 'food', name: 'Food Orders', icon: 'utensils', color: 'bg-orange-100 text-orange-700' },
  { id: 'retail', name: 'Retail Purchases', icon: 'shopping-bag', color: 'bg-blue-100 text-blue-700' },
  { id: 'service', name: 'Service Bookings', icon: 'wrench', color: 'bg-green-100 text-green-700' },
  { id: 'car_wash', name: 'Car Services', icon: 'car', color: 'bg-purple-100 text-purple-700' },
  { id: 'salon', name: 'Beauty Services', icon: 'scissors', color: 'bg-pink-100 text-pink-700' }
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'received', label: 'Received' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'collected', label: 'Collected' }
]

interface MobileActiveOrdersFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  selectedBusinessType: string
  onBusinessTypeChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
  selectedBusiness: string
  onBusinessChange: (value: string) => void
  uniqueBusinesses: Array<{ id: string; name: string }>
  onClearFilters: () => void
  activeFilterCount: number
}

export function MobileActiveOrdersFilterSheet({
  isOpen,
  onClose,
  selectedBusinessType,
  onBusinessTypeChange,
  selectedStatus,
  onStatusChange,
  selectedBusiness,
  onBusinessChange,
  uniqueBusinesses,
  onClearFilters,
  activeFilterCount
}: MobileActiveOrdersFilterSheetProps) {
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
              <div className="grid grid-cols-3 gap-2">
                {businessTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => onBusinessTypeChange(type.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      selectedBusinessType === type.id
                        ? 'border-stone-700 bg-stone-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${type.color} flex items-center justify-center`}>
                      <DynamicIcon name={type.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium line-clamp-1">{type.name}</span>
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
                  <SelectValue placeholder="All Status" />
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
