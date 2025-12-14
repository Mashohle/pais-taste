"use client"

import { SuperAdminGuard } from '@/components/auth/super-admin-guard'
import { useSuperAdminAuth } from '@/lib/context/super-admin-context'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/toaster'
import Link from 'next/link'
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings,
  Shield,
  Bell,
  Menu,
  X,
  LogOut,
  Crown,
  FileText
} from 'lucide-react'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0)
  const { signOut } = useSuperAdminAuth()

  // Fetch pending applications count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await fetch('/api/applications')
        if (response.ok) {
          const applications = await response.json()
          const pendingCount = applications.filter((app: { status: string }) => app.status === 'pending').length
          setPendingApplicationsCount(pendingCount)
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error)
      }
    }

    fetchPendingCount()
  }, [])

  // Don't render layout for login and forgot-password pages
  if (pathname === '/super-admin/login' || pathname === '/super-admin/forgot-password') {
    return <>{children}</>
  }

  const navItems = [
    {
      href: '/super-admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Platform overview and key metrics'
    },
    {
      href: '/super-admin/applications',
      label: 'Applications',
      icon: FileText,
      description: 'Review pending business applications',
      badge: pendingApplicationsCount > 0 ? pendingApplicationsCount.toString() : undefined
    },
    { 
      href: '/super-admin/businesses', 
      label: 'Businesses', 
      icon: Building2,
      description: 'Manage active business accounts'
    },
    { 
      href: '/super-admin/users', 
      label: 'Users', 
      icon: Users,
      description: 'Customer management and support'
    },
    { 
      href: '/super-admin/analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      description: 'Platform performance and insights'
    },
    {
      href: '/super-admin/moderation',
      label: 'Moderation',
      icon: Shield,
      description: 'Review disputes and content moderation'
    },
    { 
      href: '/super-admin/settings', 
      label: 'Platform Settings', 
      icon: Settings,
      description: 'System configuration and preferences'
    },
  ]

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <SuperAdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200">
      {/* Header - Matches Business Admin Portal Style */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section: Logo + Portal Badge */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <Link href="/super-admin" className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                SideHusl
              </Link>
              <Badge variant="secondary" className="text-xs">
                Super Admin Portal
              </Badge>
            </div>

            {/* Right Section: Notifications + Sign Out */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative hidden sm:flex">
                <Bell className="w-5 h-5" />
                {pendingApplicationsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                  >
                    {pendingApplicationsCount}
                  </Badge>
                )}
              </Button>

              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white/80 backdrop-blur-md border-r border-stone-200 transform transition-transform duration-300 ease-in-out mt-16 lg:mt-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            {/* Super Admin Info Badge */}
            <div className="mb-6 p-4 bg-gradient-to-br from-stone-100 to-stone-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-stone-600">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">Super Admin</h3>
                  <p className="text-xs text-stone-600">Platform Management</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map(({ href, label, icon: Icon, description, badge }) => (
                <Link key={href} href={href}>
                  <div className={`
                    group flex items-start space-x-3 p-4 rounded-xl transition-all duration-200 hover:bg-stone-100 cursor-pointer
                    ${pathname === href || (href !== '/super-admin' && pathname.startsWith(href)) ? 'bg-stone-50 border-l-4 border-stone-500' : ''}
                  `}>
                    <Icon className={`
                      w-5 h-5 mt-0.5 transition-colors
                      ${pathname === href || (href !== '/super-admin' && pathname.startsWith(href)) ? 'text-stone-600' : 'text-stone-500 group-hover:text-stone-700'}
                    `} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`
                          text-sm font-medium transition-colors
                          ${pathname === href || (href !== '/super-admin' && pathname.startsWith(href)) ? 'text-stone-700' : 'text-stone-700 group-hover:text-stone-900'}
                        `}>
                          {label}
                        </p>
                        {badge && (
                          <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                            {badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-1">{description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </nav>

            {/* System Status */}
            <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
              <h3 className="text-sm font-medium text-green-800 mb-2">System Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-green-700">Platform</span>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Database</span>
                  <span className="text-green-600 font-medium">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">API</span>
                  <span className="text-green-600 font-medium">99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-stone-600 bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Toaster />
      </div>
    </SuperAdminGuard>
  )
}