"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, Clock, FileText, MapPin, Loader2, Copy, Check } from "lucide-react"
import Link from 'next/link'

function ApplicationSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const id = searchParams.get('application_id')
    if (!id) {
      // Redirect to home if no application ID
      router.push('/')
    } else {
      setApplicationId(id)
    }
  }, [searchParams, router])

  const handleCopyId = async () => {
    if (applicationId) {
      await navigator.clipboard.writeText(applicationId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!applicationId) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                SideHusl
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            Application Submitted Successfully!
          </h1>
          <p className="text-lg text-stone-600">
            Thank you for applying to join SideHusl
          </p>
        </div>

        {/* Application ID Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
              <p className="text-sm text-stone-600 mb-2 text-center">Your Application ID</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-mono font-bold text-stone-900">{applicationId}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyId}
                  className="h-8 w-8 p-0"
                  title={copied ? "Copied!" : "Copy ID"}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-stone-500 mt-2 text-center">
                Save this ID for future reference
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>What Happens Next?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-stone-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-stone-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Application Review</h3>
                <p className="text-sm text-stone-600">
                  Our team will review your application within 3-5 business days. We&apos;ll check all submitted documents and business information.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-stone-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-stone-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Email Verification</h3>
                <p className="text-sm text-stone-600">
                  Once approved, you&apos;ll receive an email with a verification link. Click the link to verify your email address and activate your account.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-stone-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-stone-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Account Setup</h3>
                <p className="text-sm text-stone-600">
                  After verification, you can log in to your business dashboard and complete your profile setup, add menu items, and configure your services.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-stone-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Go Live!</h3>
                <p className="text-sm text-stone-600">
                  Once your profile is complete, your business will be visible to customers and you can start receiving orders!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Important Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-stone-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-stone-600">
                <strong>Check your email:</strong> We&apos;ll send you a confirmation email shortly with your application details and next steps.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-stone-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-stone-600">
                <strong>Additional documents:</strong> If we need any additional information or documents, we&apos;ll contact you via email.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-stone-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-stone-600">
                <strong>Email verification:</strong> Make sure to check your spam/junk folder if you don&apos;t see our emails in your inbox.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
          <Link href="/support" className="flex-1">
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </Link>
        </div>

        {/* Support Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-stone-600">
            Have questions? Contact us at{' '}
            <a href="mailto:support@sidehusl.com" className="text-stone-900 font-medium hover:underline">
              support@sidehusl.com
            </a>
            {' '}or call{' '}
            <a href={`tel:${process.env.NEXT_PUBLIC_PHONE}`} className="text-stone-900 font-medium hover:underline">
              {process.env.NEXT_PUBLIC_PHONE}
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

export default function ApplicationSuccessPage() {
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
      <ApplicationSuccessContent />
    </Suspense>
  )
}
