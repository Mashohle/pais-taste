'use client'

import { CustomerAuthProvider } from "@/lib/context/customer-auth-context"
import { BusinessDataProvider } from "@/lib/context/business-data-context"
import { CartProvider } from "@/lib/context/cart-context"
import { NotificationProvider } from '@/lib/contexts/notification-context'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  // Admin routes have their own BusinessAdminProvider, but still need CustomerAuthProvider
  // for shared hooks like useOrders
  if (isAdminRoute) {
    return (
      <CustomerAuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </CustomerAuthProvider>
    )
  }

  // Customer-facing routes use global CustomerAuthProvider, BusinessDataProvider, and CartProvider
  return (
    <CustomerAuthProvider>
      <BusinessDataProvider>
        <CartProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </CartProvider>
      </BusinessDataProvider>
    </CustomerAuthProvider>
  )
}
