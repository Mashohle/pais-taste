"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, LayoutDashboard, UtensilsCrossed, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    // Don't protect the login page
    if (pathname === '/admin/login') {
        return <>{children}</>
    }

    return (
        <ProtectedRoute>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </ProtectedRoute>
    )
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { signOut, user } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut()
        router.push('/admin/login')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
            {/* Navigation Bar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <div className="flex justify-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ring-4 ring-stone-200/50">
                                    <Image
                                        src="/logo.svg"
                                        alt="Pai's Taste Food Special"
                                        width={150}
                                        height={100}
                                        className="mb-1"
                                    />
                                </div>
                            </div>
                            <div className="hidden md:flex space-x-4">
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Button>
                                </Link>
                                <Link href="/admin/menu">
                                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                        <UtensilsCrossed className="w-4 h-4" />
                                        Menu
                                    </Button>
                                </Link>
                                <Link href="/admin/menu/add">
                                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Add Item
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
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