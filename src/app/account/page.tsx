"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useCustomerAuth } from '@/lib/context/customer-auth-context'
import ProfileTab from '@/components/account/profile'
import SettingsTab from '@/components/account/settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AccountPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { profile, loading, user, signOut } = useCustomerAuth()

  // Note: We don't use useOrders() here because it has a design issue with conditional hooks
  // The Account Statistics will be populated from the API in the future
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
    // Scroll to top or trigger edit mode
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab
            profile={profile}
            user={user}
            profileLoading={loading}
            activeOrders={activeOrders || []}
            orderHistory={orderHistory || []}
          />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab
            profile={profile}
            activeOrders={activeOrders || []}
            orderHistory={orderHistory || []}
            onSignOut={handleSignOut}
            onEditProfile={handleEditProfile}
            isSigningOut={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
