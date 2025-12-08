"use client"

import { ReactNode } from 'react'
import { MobileLayout } from './mobile-layout'
import { DesktopLayout } from './desktop-layout'

interface CustomerLayoutProps {
  children: ReactNode
  showBottomNav?: boolean
  showTopNav?: boolean
}

export function CustomerLayout({ children, showBottomNav = true, showTopNav = true }: CustomerLayoutProps) {
  return (
    <>
      {/* Mobile View - App-like with bottom navigation */}
      <div className="block md:hidden">
        <MobileLayout showBottomNav={showBottomNav}>
          {children}
        </MobileLayout>
      </div>

      {/* Desktop/Tablet View - Traditional web layout with top nav */}
      <div className="hidden md:block">
        <DesktopLayout showNav={showTopNav}>
          {children}
        </DesktopLayout>
      </div>
    </>
  )
}
