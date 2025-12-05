"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from 'next/link'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const supabase = createClient()

        // Check if this is an email verification callback
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (token_hash && type === 'email') {
          // Verify the email using the token
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email'
          })

          if (error) {
            console.error('Email verification error:', error)
            setStatus('error')
            setErrorMessage(error.message || 'Failed to verify email')
          } else {
            setStatus('success')
            // Redirect to business dashboard after a short delay
            setTimeout(() => {
              router.push('/business/dashboard')
            }, 3000)
          }
        } else {
          // Check if user is already logged in and email is verified
          const { data: { user } } = await supabase.auth.getUser()

          if (user?.email_confirmed_at) {
            setStatus('success')
            setTimeout(() => {
              router.push('/business/dashboard')
            }, 2000)
          } else {
            setStatus('error')
            setErrorMessage('Invalid verification link or link has expired')
          }
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setErrorMessage('An unexpected error occurred')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'verifying' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-16 h-16 text-stone-600 animate-spin mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Verifying your email...</h3>
                <p className="text-sm text-stone-600 mt-2">
                  Please wait while we confirm your email address.
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Email Verified Successfully!</h3>
                <p className="text-sm text-stone-600 mt-2">
                  Your email has been confirmed. You will be redirected to your business dashboard shortly.
                </p>
              </div>
              <Button
                onClick={() => router.push('/business/dashboard')}
                className="w-full bg-stone-600 hover:bg-stone-700"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">Verification Failed</h3>
                <p className="text-sm text-stone-600 mt-2">
                  {errorMessage || 'We could not verify your email address.'}
                </p>
                <p className="text-xs text-stone-500 mt-2">
                  The verification link may have expired or is invalid.
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-stone-600 hover:bg-stone-700"
                >
                  Go to Login
                </Button>
                <Link href="/support" className="block">
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-stone-600 animate-spin mx-auto" />
              <p className="text-sm text-stone-600 mt-4">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
