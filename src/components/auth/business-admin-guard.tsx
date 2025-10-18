"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useBusinessAdminAuth } from '@/lib/hooks'

interface BusinessAdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function BusinessAdminGuard({ children, fallback }: BusinessAdminGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, hasBusinessAccess, loading, error } = useBusinessAdminAuth()

  useEffect(() => {
    // Don't redirect from login page
    if (pathname === '/admin/login' || loading) return

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      router.push('/admin/login')
      return
    }

    if (!hasBusinessAccess) {
      console.log('Not business access, redirecting with error')
      router.push('/admin/login?error=no_business_access')
      return
    }
  }, [isAuthenticated, hasBusinessAccess, loading, pathname, router])

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Verifying business access...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !hasBusinessAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-amber-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Business Access Required</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="bg-stone-600 text-white px-6 py-2 rounded-lg hover:bg-stone-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Render children if authenticated and authorized
  if (isAuthenticated && hasBusinessAccess) {
    return <>{children}</>
  }

  // Fallback
  return fallback || null
}