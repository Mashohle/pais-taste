"use client"

import { ReactNode } from 'react'
import { CustomerNav } from './customer-nav'

interface DesktopLayoutProps {
  children: ReactNode
  showNav?: boolean
}

export function DesktopLayout({ children, showNav = true }: DesktopLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50">
      {showNav && <CustomerNav />}
      {children}
    </div>
  )
}
