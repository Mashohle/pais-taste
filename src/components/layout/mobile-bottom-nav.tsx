"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingBag, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/context/cart-context'
import { Badge } from '@/components/ui/badge'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { itemCount } = useCart()

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      active: pathname === '/'
    },
    {
      href: '/directory',
      label: 'Browse',
      icon: Search,
      active: pathname === '/directory' || pathname.startsWith('/business/')
    },
    {
      href: '/account/orders',
      label: 'Orders',
      icon: ShoppingBag,
      active: pathname.startsWith('/account/orders') || pathname.startsWith('/order/')
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 safe-area-bottom md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                item.active
                  ? "text-stone-900"
                  : "text-stone-400 active:text-stone-600"
              )}
            >
              <Icon className={cn("w-6 h-6", item.active && "stroke-[2.5]")} />
              <span className={cn(
                "text-xs",
                item.active ? "font-semibold" : "font-normal"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Cart Button */}
        <Link
          href="/cart"
          className={cn(
            "flex flex-col items-center justify-center gap-1 transition-colors relative",
            pathname === '/cart'
              ? "text-stone-900"
              : "text-stone-400 active:text-stone-600"
          )}
        >
          <div className="relative">
            <ShoppingCart className={cn("w-6 h-6", pathname === '/cart' && "stroke-[2.5]")} />
            {itemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {itemCount}
              </Badge>
            )}
          </div>
          <span className={cn(
            "text-xs",
            pathname === '/cart' ? "font-semibold" : "font-normal"
          )}>
            Cart
          </span>
        </Link>
      </div>
    </nav>
  )
}
