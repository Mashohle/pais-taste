"use client"

import { Loader2 } from "lucide-react"
import { useCustomerAuth } from '@/lib/context/customer-auth-context'
import ProfileTab from '@/components/account/profile'

export default function AccountPage() {
  const { profile, loading, user } = useCustomerAuth()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-stone-600 mx-auto mb-4" />
            <p className="text-stone-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProfileTab
        profile={profile}
        user={user}
        profileLoading={loading}
      />
    </div>
  )
}