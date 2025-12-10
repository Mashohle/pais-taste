"use client"

import { Button } from '@/components/ui/button'

interface MobileCartHeaderProps {
  itemCount: number
  hasItems: boolean
  onClearCart: () => void
}

export function MobileCartHeader({ itemCount, hasItems, onClearCart }: MobileCartHeaderProps) {
  return (
    <div className="bg-white pb-24 relative">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent mb-1">
              Your Cart
            </h1>
            {itemCount > 0 ? (
              <p className="text-xs text-stone-500">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
            ) : (
              <p className="text-xs text-stone-500">Your shopping cart is empty</p>
            )}
          </div>
          {hasItems && (
            <Button
              onClick={onClearCart}
              variant="ghost"
              size="sm"
              className="text-stone-600 hover:text-stone-800 hover:bg-stone-100 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
