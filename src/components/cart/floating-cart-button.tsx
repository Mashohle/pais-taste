"use client"

import { ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCart } from '@/lib/hooks/customer/use-cart'

export function FloatingCartButton() {
  const { itemCount, setCartOpen, total } = useCart()

  // Don't show if cart is empty
  if (itemCount === 0) return null

  return (
    <button
      onClick={() => setCartOpen(true)}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-stone-700 hover:bg-stone-800 text-white rounded-full shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 z-[90] flex items-center gap-2 md:gap-3 px-4 py-3 md:p-4"
      aria-label={`View cart with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
    >
      {/* Cart Icon with Badge */}
      <div className="relative">
        <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-2 border-white min-w-[1.25rem] h-5 flex items-center justify-center px-1 text-[10px] md:text-xs">
          {itemCount}
        </Badge>
      </div>

      {/* Cart Details - Hidden on very small screens */}
      <div className="hidden xs:flex flex-col items-start">
        <span className="text-[10px] md:text-xs font-medium leading-tight">View Cart</span>
        <span className="text-xs md:text-sm font-bold leading-tight">R{total.toFixed(2)}</span>
      </div>

      {/* Mobile: Just show total on small screens */}
      <span className="xs:hidden text-sm font-bold">
        R{total.toFixed(2)}
      </span>
    </button>
  )
}
