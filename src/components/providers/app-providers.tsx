'use client'

import { AuthProvider } from "@/lib/contexts/auth-context"
import { CartProvider } from '@/lib/contexts/cart-context'
import { NotificationProvider } from '@/lib/contexts/notification-context'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  // Admin routes have their own BusinessAdminProvider, so skip global AuthProvider and CartProvider
  if (isAdminRoute) {
    return (
      <NotificationProvider>
        {children}
      </NotificationProvider>
    )
  }

  // Customer-facing routes use global AuthProvider and CartProvider
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
}
