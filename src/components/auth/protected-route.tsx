"use client"

import { useEffect } from 'react'
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

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
            <p className="text-stone-700">Checking authentication...</p>
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