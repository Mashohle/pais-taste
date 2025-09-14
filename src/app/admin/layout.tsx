"use client"

import { BusinessAdminGuard } from '@/components/auth/business-admin-guard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useBusinessAdminAuth } from '@/lib/hooks/use-business-admin-auth'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, LayoutDashboard, UtensilsCrossed, ShoppingBag, Calendar, Users, Settings } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    console.log('📄 LAYOUT: AdminLayout called')

    return (
        <BusinessAdminGuard>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </BusinessAdminGuard>
    )
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    console.log('🔧 LAYOUT CONTENT: AdminLayoutContent called')

    const router = useRouter()
    const pathname = usePathname()

    // ALWAYS call hooks first - React rule
    const { signOut, user, userBusinesses, loading, error } = useBusinessAdminAuth()
    const [currentBusinessSlug, setCurrentBusinessSlug] = useState<string>('')

    // Set initial business when businesses load
    useEffect(() => {
        if (userBusinesses.length > 0 && !currentBusinessSlug) {
            setCurrentBusinessSlug(userBusinesses[0].slug)
        }
    }, [userBusinesses, currentBusinessSlug])

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

    const currentBusiness = userBusinesses.find(b => b.slug === currentBusinessSlug) || userBusinesses[0]

    const handleSignOut = async () => {
        await signOut()
        router.push('/admin/login')
    }

    const handleBusinessSwitch = (businessSlug: string) => {
        setCurrentBusinessSlug(businessSlug)
    }

    // Get category-specific navigation based on current business
    const getCategoryNavigation = () => {
        if (!currentBusiness?.business?.business_categories) return [
            { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' }
        ]

        const category = currentBusiness.business.business_categories.id
        const baseItems = [
            { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' }
        ]

        switch (category) {
            case 'food':
                return [
                    ...baseItems,
                    { href: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
                    { href: '/admin/orders', icon: LayoutDashboard, label: 'Orders' },
                    { href: '/admin/locations', icon: Users, label: 'Locations' }
                ]
            case 'retail':
                return [
                    ...baseItems,
                    { href: '/admin/products', icon: ShoppingBag, label: 'Products' },
                    { href: '/admin/inventory', icon: LayoutDashboard, label: 'Inventory' },
                    { href: '/admin/orders', icon: LayoutDashboard, label: 'Orders' }
                ]
            case 'service':
            case 'car_wash':
            case 'salon':
                return [
                    ...baseItems,
                    { href: '/admin/services', icon: UtensilsCrossed, label: 'Services' },
                    { href: '/admin/bookings', icon: Calendar, label: 'Bookings' },
                    { href: '/admin/staff', icon: Users, label: 'Staff' }
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
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
            {/* Navigation Bar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            {/* Logo */}
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300 rounded-full flex items-center justify-center shadow-lg">
                                    {currentBusiness?.business?.business_categories && (
                                        <DynamicIcon
                                            name={currentBusiness.business.business_categories.icon}
                                            className="h-5 w-5 text-stone-700"
                                        />
                                    )}
                                </div>

                                {/* Business Switcher */}
                                {userBusinesses.length > 1 && (
                                    <Select value={currentBusinessSlug} onValueChange={handleBusinessSwitch}>
                                        <SelectTrigger className="w-auto min-w-[200px] border-none bg-transparent hover:bg-stone-100">
                                            <SelectValue>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-stone-800">{currentBusiness.name}</span>
                                                    <Badge
                                                        variant="secondary"
                                                        className={currentBusiness.business?.business_categories?.color || 'bg-stone-200'}
                                                    >
                                                        {currentBusiness.business?.business_categories?.name}
                                                    </Badge>
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

                                {/* Single business display */}
                                {userBusinesses.length === 1 && (
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-stone-800">{currentBusiness.name}</span>
                                        <Badge
                                            variant="secondary"
                                            className={currentBusiness.business?.business_categories?.color || 'bg-stone-200'}
                                        >
                                            {currentBusiness.business?.business_categories?.name}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Category-Specific Navigation */}
                            <div className="hidden md:flex space-x-1">
                                {navigationItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href ||
                                        (item.href !== '/admin' && pathname.startsWith(item.href))

                                    return (
                                        <Link key={item.href} href={item.href}>
                                            <Button
                                                variant={isActive ? "secondary" : "ghost"}
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Icon className="w-4 h-4" />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    )
                                })}

                                {/* Settings Link */}
                                <Link href="/admin/settings">
                                    <Button
                                        variant={pathname.startsWith('/admin/settings') ? "secondary" : "ghost"}
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center space-x-4">
                            {/* Role Badge */}
                            <Badge variant="outline" className="hidden sm:flex">
                                {currentBusiness.role === 'owner' ? 'Owner' : currentBusiness.role === 'admin' ? 'Admin' : 'Staff'}
                            </Badge>

                            <span className="text-sm text-stone-600 hidden sm:block">
                                {user?.email}
                            </span>

                            <Button
                                onClick={handleSignOut}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10">
                {children}
            </main>
        </div>
    )
}