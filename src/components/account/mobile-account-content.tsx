"use client"

import { useRouter } from 'next/navigation'
import {
  User,
  Settings,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface MobileAccountContentProps {
  onSignOut: () => void
  isSigningOut: boolean
  activeOrdersCount?: number
  orderHistoryCount?: number
}

export function MobileAccountContent({
  onSignOut,
  isSigningOut,
  activeOrdersCount = 0,
  orderHistoryCount = 0
}: MobileAccountContentProps) {
  const router = useRouter()

  const menuItems = [
    {
      icon: User,
      label: 'Edit Profile',
      description: 'Update your personal information',
      href: '/account/profile',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: ShoppingBag,
      label: 'Orders & Bookings',
      description: `${activeOrdersCount} active order${activeOrdersCount !== 1 ? 's' : ''}`,
      href: '/account/orders',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Clock,
      label: 'History',
      description: `${orderHistoryCount} past order${orderHistoryCount !== 1 ? 's' : ''}`,
      href: '/account/history',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'App preferences',
      href: '/account/settings',
      color: 'text-stone-600 bg-stone-50'
    }
  ]

  return (
    <div className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-24" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
      <div className="px-5 pt-6">
        {/* Menu Items */}
        <div className="space-y-2.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="w-full"
              >
                <Card className="p-4 hover:shadow-md transition-shadow active:scale-[0.98]">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="font-semibold text-stone-900 text-sm">
                          {item.label}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>

        {/* Sign Out Button */}
        <div className="mt-6">
          <Button
            onClick={onSignOut}
            disabled={isSigningOut}
            variant="outline"
            className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-14"
          >
            {isSigningOut ? (
              <>
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
