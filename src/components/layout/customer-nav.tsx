"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Package, Heart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCustomerAuth } from '@/lib/context/customer-auth-context'

export function CustomerNav() {
  const { user } = useCustomerAuth()
  const pathname = usePathname()

  const isDirectoryActive = pathname === '/directory' || pathname.startsWith('/business/')

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                SideHusl
              </div>
              <Badge variant="secondary" className="text-xs">
                Customer Portal
              </Badge>
            </Link>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/directory">
              <Button variant={isDirectoryActive ? "default" : "ghost"} size="sm">
                <Search className="w-4 h-4 mr-2" />
                Directory
              </Button>
            </Link>
            <Link href="/track-order">
              <Button variant="ghost" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Track Order
              </Button>
            </Link>
            {user && (
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Favorites
              </Button>
            )}
            <Link href={user ? "/account" : "/login"}>
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                {user ? "Account" : "Sign In"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
