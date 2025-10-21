"use client"

import { BusinessAdminGuard } from '@/components/auth/business-admin-guard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BusinessAdminProvider, useBusinessAdminAuth } from '@/lib/context/business-admin-context'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, LayoutDashboard, UtensilsCrossed, ShoppingBag, Calendar, Users, Settings, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    console.log('📄 LAYOUT: AdminLayout called')

    return (
        <BusinessAdminProvider>
            <BusinessAdminGuard>
                <AdminLayoutContent>{children}</AdminLayoutContent>
            </BusinessAdminGuard>
        </BusinessAdminProvider>
    )
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    console.log('🔧 LAYOUT CONTENT: AdminLayoutContent called')

    const router = useRouter()
    const pathname = usePathname()

    // ALWAYS call hooks first - React rule
    const { signOut, user, userBusinesses, currentBusiness, setCurrentBusiness, loading, error } = useBusinessAdminAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // CRITICAL: If we're on login page, just return children without any auth logic
    if (pathname === '/admin/login') {
        console.log('🔧 LAYOUT CONTENT: Login page detected, returning children without auth')
        return <>{children}</>
    }

    console.log('🔧 LAYOUT CONTENT: Auth state:', {
        userCount: userBusinesses.length,
        loading,
        hasUser: !!user,
        pathname
    })

    const handleSignOut = async () => {
        await signOut()
        router.push('/admin/login')
    }

    const handleBusinessSwitch = (businessSlug: string) => {
        const business = userBusinesses.find(b => b.slug === businessSlug)
        if (business) {
            setCurrentBusiness(business)
        }
    }

    // Get category-specific navigation based on current business
    const getCategoryNavigation = () => {
        if (!currentBusiness?.business?.business_categories) return [
            {
                href: '/admin',
                icon: LayoutDashboard,
                label: 'Dashboard',
                description: 'Business overview and metrics'
            }
        ]

        const category = currentBusiness.business.business_categories.id
        const baseItems = [
            {
                href: '/admin',
                icon: LayoutDashboard,
                label: 'Dashboard',
                description: 'Business overview and metrics'
            }
        ]

        switch (category) {
            case 'food':
                return [
                    ...baseItems,
                    {
                        href: '/admin/menu',
                        icon: UtensilsCrossed,
                        label: 'Menu Management',
                        description: 'Manage your food menu and pricing'
                    },
                    {
                        href: '/admin/orders',
                        icon: ShoppingBag,
                        label: 'Orders',
                        description: 'Track and manage customer orders'
                    },
                    {
                        href: '/admin/locations',
                        icon: Users,
                        label: 'Locations',
                        description: 'Manage business locations'
                    }
                ]
            case 'retail':
                return [
                    ...baseItems,
                    {
                        href: '/admin/products',
                        icon: ShoppingBag,
                        label: 'Products',
                        description: 'Manage your product catalog'
                    },
                    {
                        href: '/admin/inventory',
                        icon: LayoutDashboard,
                        label: 'Inventory',
                        description: 'Track stock levels and movements'
                    },
                    {
                        href: '/admin/orders',
                        icon: ShoppingBag,
                        label: 'Orders',
                        description: 'Process customer orders'
                    }
                ]
            case 'service':
            case 'car_wash':
            case 'salon':
                return [
                    ...baseItems,
                    {
                        href: '/admin/services',
                        icon: UtensilsCrossed,
                        label: 'Services',
                        description: 'Manage your service offerings'
                    },
                    {
                        href: '/admin/bookings',
                        icon: Calendar,
                        label: 'Bookings',
                        description: 'Schedule and manage appointments'
                    },
                    {
                        href: '/admin/staff',
                        icon: Users,
                        label: 'Staff Management',
                        description: 'Manage your team and schedules'
                    }
                ]
            default:
                return baseItems
        }
    }

    const navigationItems = getCategoryNavigation()

    // Show loading state while business auth is loading OR when we have user but no businesses yet
    if (loading || (user && userBusinesses.length === 0 && !error)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
                    <p className="text-stone-700">Loading business access...</p>
                    <p className="text-stone-500 text-sm mt-2">Fetching your business permissions</p>
                </div>
            </div>
        )
    }

    // Show no business access message only if we're not loading and have confirmed no businesses
    if (!loading && userBusinesses.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-stone-800 mb-4">No Business Access</h2>
                    <p className="text-stone-600 mb-4">You don&apos;t have access to any businesses.</p>
                    <Button onClick={() => router.push('/admin/login')} variant="outline">
                        Back to Login
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200">
            {/* Header - Matches Customer Portal Style */}
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

                            <Link href="/admin" className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                                SideHusl
                            </Link>
                            <Badge variant="secondary" className="text-xs">
                                Business Portal
                            </Badge>

                            {/* Business Switcher for Multi-Business Users */}
                            {userBusinesses.length > 1 && currentBusiness && (
                                <Select value={currentBusiness.slug} onValueChange={handleBusinessSwitch}>
                                    <SelectTrigger className="w-auto border-none bg-transparent hover:bg-stone-100 h-8">
                                        <SelectValue>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-medium text-stone-700">{currentBusiness.name}</span>
                                            </div>
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {userBusinesses.map((business) => (
                                            <SelectItem key={business.id} value={business.slug}>
                                                <div className="flex items-center space-x-2">
                                                    {business.business?.business_categories && (
                                                        <DynamicIcon
                                                            name={business.business.business_categories.icon}
                                                            className="h-4 w-4"
                                                        />
                                                    )}
                                                    <span>{business.name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {business.business?.business_categories?.name}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Right Section: Welcome + Sign Out */}
                        <div className="flex items-center space-x-4">
                            <p className="text-sm text-stone-600 hidden md:block">
                                Welcome, <span className="font-medium text-stone-800">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                            </p>
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
                        {/* Business Info */}
                        <div className="mb-6 p-4 bg-gradient-to-br from-stone-100 to-stone-200 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className={`p-3 rounded-xl ${currentBusiness.business?.business_categories?.color || 'bg-stone-200'}`}>
                                    {currentBusiness.business?.business_categories && (
                                        <DynamicIcon
                                            name={currentBusiness.business.business_categories.icon}
                                            className="h-6 w-6 text-white"
                                        />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-stone-800">{currentBusiness.name}</h3>
                                    <p className="text-xs text-stone-600">{currentBusiness.business?.business_categories?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-2">
                            {navigationItems.map(({ href, label, icon: Icon, description }) => (
                                <Link key={href} href={href}>
                                    <div className={`
                                        group flex items-start space-x-3 p-4 rounded-xl transition-all duration-200 hover:bg-stone-100 cursor-pointer
                                        ${pathname === href || (href !== '/admin' && pathname.startsWith(href)) ? 'bg-stone-50 border-l-4 border-stone-500' : ''}
                                    `}>
                                        <Icon className={`
                                            w-5 h-5 mt-0.5 transition-colors
                                            ${pathname === href || (href !== '/admin' && pathname.startsWith(href)) ? 'text-stone-600' : 'text-stone-500 group-hover:text-stone-700'}
                                        `} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`
                                                text-sm font-medium transition-colors
                                                ${pathname === href || (href !== '/admin' && pathname.startsWith(href)) ? 'text-stone-700' : 'text-stone-700 group-hover:text-stone-900'}
                                            `}>
                                                {label}
                                            </p>
                                            <p className="text-xs text-stone-500 mt-1">{description}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* Settings Link */}
                            <Link href="/admin/settings">
                                <div className={`
                                    group flex items-start space-x-3 p-4 rounded-xl transition-all duration-200 hover:bg-stone-100 cursor-pointer
                                    ${pathname.startsWith('/admin/settings') ? 'bg-stone-50 border-l-4 border-stone-500' : ''}
                                `}>
                                    <Settings className={`
                                        w-5 h-5 mt-0.5 transition-colors
                                        ${pathname.startsWith('/admin/settings') ? 'text-stone-600' : 'text-stone-500 group-hover:text-stone-700'}
                                    `} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`
                                            text-sm font-medium transition-colors
                                            ${pathname.startsWith('/admin/settings') ? 'text-stone-700' : 'text-stone-700 group-hover:text-stone-900'}
                                        `}>
                                            Settings
                                        </p>
                                        <p className="text-xs text-stone-500 mt-1">Business configuration and preferences</p>
                                    </div>
                                </div>
                            </Link>
                        </nav>

                        {/* Business Status */}
                        <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
                            <h3 className="text-sm font-medium text-green-800 mb-2">Business Status</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-green-700">Status</span>
                                    <span className="text-green-600 font-medium">
                                        {currentBusiness.business?.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-700">Plan</span>
                                    <span className="text-green-600 font-medium">Standard</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-700">Role</span>
                                    <span className="text-green-600 font-medium">
                                        {currentBusiness.role === 'owner' ? 'Owner' : currentBusiness.role === 'admin' ? 'Admin' : 'Staff'}
                                    </span>
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
        </div>
    )
}