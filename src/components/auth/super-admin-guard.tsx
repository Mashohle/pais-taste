"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSuperAdminAuth } from '@/lib/hooks/use-super-admin-auth'

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
    if (pathname === '/super-admin/login' || loading) return

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      router.push('/super-admin/login')
      return
    }

    if (!isSuperAdmin) {
      console.log('Not super admin, redirecting with error')
      router.push('/super-admin/login?error=insufficient_permissions')
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying super admin access...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/super-admin/login')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
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