"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string // Allow custom redirect path
}

export function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = '/admin/login' // Default to admin login for backward compatibility
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [authTimeout, setAuthTimeout] = useState(false)

  // Add timeout to prevent infinite loading (only for genuine loading issues)
  useEffect(() => {
    // Only set timeout if we're genuinely loading and don't have user
    if (loading && !user) {
      const timeout = setTimeout(() => {
        console.log('ProtectedRoute timeout reached after 5 minutes - redirecting to login')
        setAuthTimeout(true)
        router.push(redirectTo)
      }, 300000) // 5 minute timeout (only if genuinely stuck)

      return () => clearTimeout(timeout)
    }
  }, [router, redirectTo, loading, user])

  useEffect(() => {
    if (!loading && !user) {
      console.log('ProtectedRoute: No user - redirecting to', redirectTo)
      router.push(redirectTo)
    } else if (!loading && user) {
      console.log('ProtectedRoute: User authenticated')
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
            <p className="text-stone-700">
              {authTimeout ? 'Authentication timeout - redirecting...' : 'Checking authentication...'}
            </p>
            {authTimeout && (
              <p className="text-stone-500 text-sm mt-2">
                If you're not redirected, <a href={redirectTo} className="text-stone-600 hover:underline">click here</a>
              </p>
            )}
          </div>
        </div>
      )
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return <>{children}</>
}