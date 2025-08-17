"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, LayoutDashboard, UtensilsCrossed, Plus } from 'lucide-react'
import Link from 'next/link'

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
                            <h1 className="text-xl font-bold text-stone-800">Pai's Taste Admin</h1>
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