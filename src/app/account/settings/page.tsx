"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCustomerAuth } from '@/lib/context/customer-auth-context'
import SettingsTab from '@/components/account/settings'
import { MobilePageHeader } from '@/components/account/mobile-page-header'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { profile, signOut } = useCustomerAuth()

  // Note: We don't use useOrders() here because it has a design issue with conditional hooks
  const activeOrders: never[] = []
  const orderHistory: never[] = []

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProfile = () => {
    router.push('/account?edit=true') // Or however you want to trigger edit mode
  }

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-stone-50">
        <MobilePageHeader title="Settings" subtitle="App preferences & account" />
        <div className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-24" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
          <div className="px-5 pt-8">
            <SettingsTab
              profile={profile}
              activeOrders={activeOrders || []}
              orderHistory={orderHistory || []}
              onSignOut={handleSignOut}
              onEditProfile={handleEditProfile}
              isSigningOut={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <SettingsTab
          profile={profile}
          activeOrders={activeOrders || []}
          orderHistory={orderHistory || []}
          onSignOut={handleSignOut}
          onEditProfile={handleEditProfile}
          isSigningOut={isLoading}
        />
      </div>
    </>
  )
}