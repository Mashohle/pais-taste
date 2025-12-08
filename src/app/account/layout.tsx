"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCustomerAuth } from '@/lib/context/customer-auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, User, Package, History, AlertCircle, UtensilsCrossed, MessageSquare, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    // Don't protect auth pages
    if (pathname === '/auth' || pathname.startsWith('/auth/')) {
        return <>{children}</>
    }

    return (
        <ProtectedRoute redirectTo="/login">
            <AccountLayoutContent>{children}</AccountLayoutContent>
        </ProtectedRoute>
    )
}

function AccountLayoutContent({ children }: { children: React.ReactNode }) {
    const { signOut, user, getDisplayName, isProfileComplete } = useCustomerAuth()
    const router = useRouter()
    const pathname = usePathname()

    const handleSignOut = async () => {
        await signOut()
        router.push('/login')
    }

    const navItems = [
        { href: '/', label: 'Discover', icon: UtensilsCrossed },
        { href: '/account/orders', label: 'Orders & Bookings', icon: Package },
        { href: '/account/history', label: 'History', icon: History },
        { href: '/account/reviews', label: 'Reviews', icon: MessageSquare },
    ]

    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <>
        {/* Mobile: Simple layout without sidebar */}
        <div className="md:hidden">
            {children}
        </div>

        {/* Desktop: Full layout with sidebar */}
        <div className="hidden md:block min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200">
            {/* Header - Matches Admin Portal Style */}
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

                            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                                SideHusl
                            </Link>
                            <Badge variant="secondary" className="text-xs">
                                Customer Portal
                            </Badge>
                        </div>

                        {/* Right Section: Welcome + Sign Out */}
                        <div className="flex items-center space-x-4">
                            {/* Profile completion alert */}
                            {!isProfileComplete() && (
                                <div className="hidden sm:flex items-center space-x-1 text-amber-600 text-xs">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Complete profile</span>
                                </div>
                            )}

                            <p className="text-sm text-stone-600 hidden md:block">
                                Welcome, <span className="font-medium text-stone-800">{getDisplayName()}</span>
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
                        {/* User Info - Clickable Profile Link */}
                        <Link href="/account">
                            <div className={`
                                mb-6 p-4 rounded-xl cursor-pointer transition-all duration-200
                                ${pathname === '/account'
                                    ? 'bg-stone-50 border-l-4 border-stone-500'
                                    : 'bg-gradient-to-br from-stone-100 to-stone-200 hover:from-stone-150 hover:to-stone-250'
                                }
                            `}>
                                <div className="flex items-center space-x-3">
                                    <div className={`
                                        p-3 rounded-xl transition-colors
                                        ${pathname === '/account' ? 'bg-stone-600' : 'bg-stone-700'}
                                    `}>
                                        <User className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className={`
                                            font-semibold transition-colors
                                            ${pathname === '/account' ? 'text-stone-900' : 'text-stone-800'}
                                        `}>
                                            {getDisplayName()}
                                        </h3>
                                        <p className="text-xs text-stone-600">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Navigation */}
                        <nav className="space-y-2">
                            {navItems.map(({ href, label, icon: Icon }) => {
                                const isActive = pathname === href

                                return (
                                    <Link key={href} href={href}>
                                        <div className={`
                                            group flex items-start space-x-3 p-4 rounded-xl transition-all duration-200 hover:bg-stone-100 cursor-pointer
                                            ${isActive ? 'bg-stone-50 border-l-4 border-stone-500' : ''}
                                        `}>
                                            <Icon className={`
                                                w-5 h-5 mt-0.5 transition-colors
                                                ${isActive ? 'text-stone-600' : 'text-stone-500 group-hover:text-stone-700'}
                                            `} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`
                                                    text-sm font-medium transition-colors
                                                    ${isActive ? 'text-stone-700' : 'text-stone-700 group-hover:text-stone-900'}
                                                `}>
                                                    {label}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Profile Status */}
                        {!isProfileComplete() && (
                            <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                <h3 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Complete Your Profile
                                </h3>
                                <p className="text-xs text-amber-700 mb-3">
                                    Complete your profile to get the best experience
                                </p>
                                <Link href="/account">
                                    <Button size="sm" variant="outline" className="w-full text-amber-700 border-amber-300 hover:bg-amber-100">
                                        Complete Now
                                    </Button>
                                </Link>
                            </div>
                        )}
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
        </>
    )
}