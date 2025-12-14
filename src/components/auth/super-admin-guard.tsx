"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSuperAdminAuth } from '@/lib/context/super-admin-context'

interface SuperAdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SuperAdminGuard({ children, fallback }: SuperAdminGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isSuperAdmin, loading, error } = useSuperAdminAuth()

  useEffect(() => {
    // Don't redirect from login page
    if (pathname === '/super-admin/login') return

    // Don't redirect while loading - wait for complete auth state
    if (loading) return

    // Check authentication
    if (!isAuthenticated) {
      router.push('/super-admin/login')
      return
    }

    // If authenticated but not super admin, just show error UI below
    // Don't redirect back to login to avoid error flash
    if (!isSuperAdmin) {
      return
    }
  }, [isAuthenticated, isSuperAdmin, loading, pathname, router])

  // Don't protect login page
  if (pathname === '/super-admin/login') {
    return <>{children}</>
  }

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-700">Verifying super admin access...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Access Denied</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/super-admin/login')}
            className="bg-stone-600 text-white px-6 py-2 rounded-lg hover:bg-stone-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Render children if authenticated and authorized
  if (isAuthenticated && isSuperAdmin) {
    return <>{children}</>
  }

  // Fallback
  return fallback || null
}