"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Clock,
  Edit3,
} from "lucide-react"
import { User } from '@supabase/supabase-js'
import { useCustomerAuth, UserProfile } from '@/lib/context/customer-auth-context'
import ProfileEditForm from './profile-edit-form'

interface Order {
  total_amount: number
}

interface ProfileTabProps {
  profile: UserProfile | null
  user: User | null
  profileLoading: boolean
  activeOrders?: Order[]
  orderHistory?: Order[]
}

export default function Profile({ profile, user, profileLoading, activeOrders = [], orderHistory = [] }: ProfileTabProps) {
  const [editingProfile, setEditingProfile] = useState(false)
  // @ts-expect-error - AuthContextType missing updateProfile method
  const { updateProfile } = useCustomerAuth()

  const handleSaveProfile = async (data: Partial<UserProfile>) => {
    try {
      await updateProfile(data)
      setEditingProfile(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-stone-800">
              <UserIcon className="w-5 h-5" />
              <span>Profile Information</span>
            </CardTitle>
            {!editingProfile && (
              <Button
                onClick={() => setEditingProfile(true)}
                variant="outline"
                size="sm"
                className="border-stone-300 text-stone-700 hover:bg-stone-100"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingProfile ? (
            <ProfileEditForm
              // @ts-expect-error - UserProfile type mismatch (full_name: string | null vs string | undefined)
              profile={profile}
              onSave={handleSaveProfile}
              onCancel={() => setEditingProfile(false)}
              saving={profileLoading}
            />
          ) : (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-stone-200/40">
                  <UserIcon className="w-5 h-5 text-stone-600" />
                  <div>
                    <p className="text-sm text-stone-600">Full Name</p>
                    <p className="font-semibold text-stone-800">{profile?.full_name || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-stone-200/40">
                  <Mail className="w-5 h-5 text-stone-600" />
                  <div>
                    <p className="text-sm text-stone-600">Email Address</p>
                    <p className="font-semibold text-stone-800">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-stone-200/40">
                  <Phone className="w-5 h-5 text-stone-600" />
                  <div>
                    <p className="text-sm text-stone-600">Phone Number</p>
                    <p className="font-semibold text-stone-800">{profile?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-stone-200/40">
                  <MapPin className="w-5 h-5 text-stone-600" />
                  <div>
                    <p className="text-sm text-stone-600">Preferred Pickup Location</p>
                    <p className="font-semibold text-stone-800">{profile?.preferred_pickup_location || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(profile?.address || profile?.emergency_contact_name || profile?.dietary_preferences?.length || profile?.allergies?.length) && (
                <div className="space-y-4 pt-4 border-t border-stone-200/40">
                  {profile?.address && (
                    <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-stone-200/40">
                      <p className="text-sm text-stone-600 mb-1">Address</p>
                      <p className="font-semibold text-stone-800">{profile.address}</p>
                    </div>
                  )}

                  {profile?.emergency_contact_name && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-stone-200/40">
                        <p className="text-sm text-stone-600 mb-1">Emergency Contact</p>
                        <p className="font-semibold text-stone-800">{profile.emergency_contact_name}</p>
                      </div>
                      {profile?.emergency_contact_phone && (
                        <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-stone-200/40">
                          <p className="text-sm text-stone-600 mb-1">Emergency Phone</p>
                          <p className="font-semibold text-stone-800">{profile.emergency_contact_phone}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {(profile?.dietary_preferences?.length || profile?.allergies?.length) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile?.dietary_preferences?.length && (
                        <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-stone-200/40">
                          <p className="text-sm text-stone-600 mb-1">Dietary Preferences</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.dietary_preferences.map((pref: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {pref}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {profile?.allergies?.length && (
                        <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-stone-200/40">
                          <p className="text-sm text-stone-600 mb-1">Allergies</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.allergies.map((allergy: string, index: number) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-stone-200/40">
                <Clock className="w-5 h-5 text-stone-600" />
                <div>
                  <p className="text-sm text-stone-600">Member Since</p>
                  <p className="font-semibold text-stone-800">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-ZA", {
                      month: "long",
                      year: "numeric",
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-stone-800">Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <p className="text-2xl font-bold text-stone-800">
                {(activeOrders?.length || 0) + (orderHistory?.length || 0)}
              </p>
              <p className="text-sm text-stone-600">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <p className="text-2xl font-bold text-stone-800">
                {activeOrders?.length || 0}
              </p>
              <p className="text-sm text-stone-600">Active Orders</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <p className="text-2xl font-bold text-stone-800">
                {new Intl.NumberFormat('en-ZA', {
                  style: 'currency',
                  currency: 'ZAR'
                }).format(
                  [...(activeOrders || []), ...(orderHistory || [])].reduce((sum, order) => sum + (order.total_amount || 0), 0)
                )}
              </p>
              <p className="text-sm text-stone-600">Total Spent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}