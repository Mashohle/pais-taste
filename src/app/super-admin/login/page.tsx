"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Crown, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  AlertTriangle,
  Loader2 
} from "lucide-react"
import Link from "next/link"
import { useSuperAdminLogin } from '@/lib/hooks/use-super-admin-login'

export default function SuperAdminLogin() {
  const {
    formData,
    showPassword,
    isLoading,
    error,
    updateFormData,
    togglePasswordVisibility,
    handleSubmit,
    canSubmit
  } = useSuperAdminLogin()

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-stone-600 to-stone-800 rounded-2xl flex items-center justify-center shadow-xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
            SideHusl
          </h1>
          <p className="text-stone-600 mt-2">Super Admin Portal</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-stone-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-stone-900">
              Super Admin Access
            </CardTitle>
            <p className="text-sm text-stone-600 text-center">
              Restricted access for platform administrators
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <Input
                    type="email"
                    placeholder="admin@sidehusl.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="pl-10 border-stone-300 focus:border-stone-500 focus:ring-stone-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className="pl-10 pr-10 border-stone-300 focus:border-stone-500 focus:ring-stone-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 h-4 w-4 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-stone-600 hover:bg-stone-700 focus:ring-stone-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Access Super Admin Portal
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-stone-200">
              <p className="text-xs text-stone-500">
                Need different access?{' '}
                <Link href="/admin/login" className="text-stone-600 hover:text-stone-800 font-medium">
                  Business Admin Portal
                </Link>
                {' • '}
                <Link href="/" className="text-stone-600 hover:text-stone-800 font-medium">
                  Customer Portal
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-stone-500 bg-stone-100 px-3 py-2 rounded-full">
            <Shield className="w-3 h-3" />
            <span>Secure authentication required</span>
          </div>
        </div>
      </div>
    </div>
  )
}