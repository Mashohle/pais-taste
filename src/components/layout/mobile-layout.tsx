"use client"

import { ReactNode } from 'react'
import { MobileBottomNav } from './mobile-bottom-nav'

interface MobileLayoutProps {
  children: ReactNode
  showBottomNav?: boolean
}

export function MobileLayout({ children, showBottomNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      {/* Main Content */}
      <div className="min-h-screen">
        {children}
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && <MobileBottomNav />}
    </div>
  )
}
