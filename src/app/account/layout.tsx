"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, User, Package, History, Settings, AlertCircle, UtensilsCrossed, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
        <ProtectedRoute redirectTo="/auth">
            <AccountLayoutContent>{children}</AccountLayoutContent>
        </ProtectedRoute>
    )
}

function AccountLayoutContent({ children }: { children: React.ReactNode }) {
    const { signOut, user, getDisplayName, isProfileComplete } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    const navItems = [
        { href: '/', label: 'Discover', icon: UtensilsCrossed },
        { href: '/account', label: 'Profile', icon: User },
        { href: '/account/orders', label: 'Orders & Bookings', icon: Package },
        { href: '/account/history', label: 'History', icon: History },
        { href: '/account/reviews', label: 'Reviews', icon: MessageSquare },
        { href: '/account/settings', label: 'Settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200">
            {/* Traditional African decorative background patterns */}
            <div className="fixed right-0 top-0 h-full w-48 sm:w-64 lg:w-96 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-15">
                    <svg className="absolute top-10 right-4 w-16 h-16 text-stone-600" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.4" />
                    </svg>

                    <svg className="absolute top-48 right-16 w-14 h-14 text-stone-500" viewBox="0 0 100 100">
                        <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
                        <polygon points="50,30 70,70 30,70" fill="currentColor" opacity="0.3" />
                    </svg>

                    <div className="absolute top-32 right-0 w-32 h-0.5 bg-gradient-to-l from-stone-600/40 to-transparent"></div>
                    <div className="absolute top-64 right-8 w-24 h-0.5 bg-gradient-to-l from-stone-500/35 to-transparent"></div>
                    <div className="absolute top-96 right-4 w-28 h-0.5 bg-gradient-to-l from-stone-600/30 to-transparent"></div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <Link href="/" className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ring-4 ring-stone-200/50">
                                    <Image
                                        src="/logo.svg"
                                        alt="Pai's Taste Food Special"
                                        width={120}
                                        height={87}
                                        className="scale-75"
                                    />
                                </div>
                                <div className="hidden sm:block">
                                    <h2 className="text-lg font-bold text-stone-800">LocalHub Account</h2>
                                    <p className="text-xs text-stone-600">Welcome, {getDisplayName()}</p>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-4">
                            {navItems.map(({ href, label, icon: Icon }) => (
                                <Link key={href} href={href}>
                                    <Button 
                                        variant={pathname === href ? "default" : "ghost"} 
                                        size="sm" 
                                        className={`flex items-center gap-2 ${
                                            pathname === href 
                                                ? "bg-stone-700 text-white" 
                                                : ""
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </Button>
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Profile completion alert */}
                            {!isProfileComplete() && (
                                <div className="hidden sm:flex items-center space-x-1 text-amber-600 text-xs">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Complete profile</span>
                                </div>
                            )}
                            
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

            {/* Mobile Navigation */}
            <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-1 py-2 overflow-x-auto">
                        {navItems.map(({ href, label, icon: Icon }) => (
                            <Link key={href} href={href}>
                                <Button 
                                    variant={pathname === href ? "default" : "ghost"} 
                                    size="sm" 
                                    className={`flex items-center gap-2 whitespace-nowrap ${
                                        pathname === href 
                                            ? "bg-stone-700 text-white" 
                                            : ""
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="relative z-10">
                {children}
            </main>
        </div>
    )
}