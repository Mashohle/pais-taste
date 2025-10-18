"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@/lib/contexts/auth-context'
import { useOrders } from '@/lib/hooks'
import SettingsTab from '@/components/account/settings'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { profile, signOut } = useAuth()
  const { activeOrders, orderHistory } = useOrders()

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SettingsTab
        profile={profile}
        activeOrders={activeOrders || []}
        orderHistory={orderHistory || []}
        onSignOut={handleSignOut}
        onEditProfile={handleEditProfile}
        isSigningOut={isLoading}
      />
    </div>
  )
}