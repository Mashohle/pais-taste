"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'super_admin' | 'business_owner' | 'business_admin' | 'staff'
  fallback?: React.ReactNode
  loginRedirect?: string
  permissionDeniedRedirect?: string
}

export function RoleProtectedRoute({ 
  children, 
  requiredRole,
  fallback,
  loginRedirect = '/admin/login',
  permissionDeniedRedirect
}: RoleProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [authTimeout, setAuthTimeout] = useState(false)

  // Add timeout to prevent infinite loading (only for genuine loading issues)
  useEffect(() => {
    // Only set timeout if we're genuinely loading without user/profile
    if (loading && !user && !profile) {
      const timeout = setTimeout(() => {
        console.log('RoleProtectedRoute timeout reached after 5 minutes - redirecting to login')
        setAuthTimeout(true)
        router.push(loginRedirect)
      }, 300000) // 5 minute timeout (only if genuinely stuck)

      return () => clearTimeout(timeout)
    }
  }, [router, loginRedirect, loading, user, profile])

  useEffect(() => {
    if (loading) {
      console.log('RoleProtectedRoute: Auth context loading...')
      return
    }

    // Not authenticated - redirect to login
    if (!user) {
      console.log('RoleProtectedRoute: No user - redirecting to login')
      router.push(loginRedirect)
      return
    }

    // Still loading profile - set timeout
    if (!profile) {
      console.log('RoleProtectedRoute: Profile loading...')
      const profileTimeout = setTimeout(() => {
        console.log('RoleProtectedRoute: Profile timeout after 30 seconds - redirecting to login')
        router.push(loginRedirect)
      }, 30000)
      
      return () => clearTimeout(profileTimeout)
    }

    // Check role permissions
    if (requiredRole) {
      const hasPermission = checkRolePermission(profile.role, requiredRole)
      
      if (!hasPermission) {
        console.log(`RoleProtectedRoute: User role '${profile.role}' insufficient for required role '${requiredRole}'`)
        if (permissionDeniedRedirect) {
          router.push(permissionDeniedRedirect)
        } else {
          // Default behavior: redirect super-admins to their portal, others to login
          if (profile.role === 'super_admin') {
            router.push('/super-admin/login?error=wrong_portal')
          } else {
            router.push(`${loginRedirect}?error=insufficient_permissions`)
          }
        }
        return
      }
    }

    console.log('RoleProtectedRoute: Access granted')
  }, [user, profile, loading, router, requiredRole, loginRedirect, permissionDeniedRedirect])

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
            <p className="text-stone-700">
              {authTimeout ? 'Authentication timeout - redirecting...' : 'Verifying permissions...'}
            </p>
            {authTimeout && (
              <p className="text-stone-500 text-sm mt-2">
                If you're not redirected, <a href={loginRedirect} className="text-stone-600 hover:underline">click here</a>
              </p>
            )}
          </div>
        </div>
      )
    )
  }

  // Check role permission again for render
  if (requiredRole && !checkRolePermission(profile.role, requiredRole)) {
    return null // Will redirect
  }

  return <>{children}</>
}

function checkRolePermission(userRole: string, requiredRole: string): boolean {
  // Super admin can access everything except if specifically requiring non-super-admin
  if (userRole === 'super_admin') {
    return requiredRole === 'super_admin'
  }

  // Role hierarchy check
  const roleHierarchy = {
    'super_admin': 4,
    'business_owner': 3,
    'business_admin': 2,
    'staff': 1
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

  return userLevel >= requiredLevel
}