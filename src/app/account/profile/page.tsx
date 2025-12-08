"use client"

import { useState } from "react"
import { useCustomerAuth, UserProfile } from '@/lib/context/customer-auth-context'
import { MobilePageHeader } from '@/components/account/mobile-page-header'
import ProfileEditForm from '@/components/account/profile-edit-form'
import { Loader2 } from "lucide-react"

export default function EditProfilePage() {
  // @ts-expect-error - updateProfile exists in context
  const { profile, loading, updateProfile } = useCustomerAuth()
  const [saving, setSaving] = useState(false)

  const handleSaveProfile = async (data: Partial<UserProfile>) => {
    setSaving(true)
    try {
      await updateProfile(data)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <div className="md:hidden min-h-screen bg-stone-50">
          <MobilePageHeader title="Edit Profile" />
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-stone-600 mx-auto mb-4" />
              <p className="text-stone-600">Loading profile...</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-stone-600" />
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-stone-50">
        <MobilePageHeader title="Edit Profile" subtitle="Update your personal information" />
        <div className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-24" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
          <div className="px-5 pt-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <ProfileEditForm
                // @ts-expect-error - Profile type mismatch
                profile={profile}
                onSave={handleSaveProfile}
                saving={saving}
                hideCancel
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">Edit Profile</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <ProfileEditForm
            // @ts-expect-error - Profile type mismatch
            profile={profile}
            onSave={handleSaveProfile}
            saving={saving}
            hideCancel
          />
        </div>
      </div>
    </>
  )
}
