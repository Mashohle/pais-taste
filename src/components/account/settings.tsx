"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Settings,
  Edit3,
  Phone,
  Mail,
  MapPin,
  Bell,
  Trash2,
  LogOut,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from '@/lib/contexts/auth-context'

interface SettingsTabProps {
  profile: any
  activeOrders: any[]
  orderHistory: any[]
  onSignOut: () => void
  onEditProfile: () => void
  isSigningOut: boolean
}

export default function SettingsTab({ 
  profile, 
  activeOrders, 
  orderHistory, 
  onSignOut, 
  onEditProfile,
  isSigningOut 
}: SettingsTabProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    marketing_emails: profile?.marketing_emails ?? true,
    sms_notifications: profile?.sms_notifications ?? true,
    order_updates: true,
    promotional_offers: profile?.marketing_emails ?? true,
  })
  const [updating, setUpdating] = useState(false)

  const { updateProfile } = useAuth()
  const router = useRouter()

  const handleNotificationUpdate = async (setting: string, value: boolean) => {
    try {
      setUpdating(true)
      
      const updates = {
        [setting]: value
      }
      
      await updateProfile(updates)
      
      setNotificationSettings(prev => ({
        ...prev,
        [setting]: value
      }))
    } catch (error) {
      console.error('Error updating notification settings:', error)
      alert('Failed to update settings. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    try {
      setIsDeleting(true)
      
      // In a real implementation, you'd call a delete account function
      // This would typically:
      // 1. Cancel any active orders
      // 2. Delete user data (following GDPR if applicable)
      // 3. Delete the auth user
      
      alert('Account deletion is not implemented yet. This would permanently delete your account and all data.')
      setShowDeleteConfirm(false)
      
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please contact support.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-stone-800">
            <Settings className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={onEditProfile}
            variant="outline"
            className="w-full justify-start border-stone-300 text-stone-700 hover:bg-stone-100 bg-transparent"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile Information
          </Button>

          <Button
            onClick={() => router.push('/account')}
            variant="outline"
            className="w-full justify-start border-stone-300 text-stone-700 hover:bg-stone-100 bg-transparent"
          >
            <Phone className="w-4 h-4 mr-2" />
            Update Contact Information
          </Button>

          <Button
            onClick={() => router.push('/account')}
            variant="outline"
            className="w-full justify-start border-stone-300 text-stone-700 hover:bg-stone-100 bg-transparent"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Manage Preferences & Allergies
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-stone-800">
            <Bell className="w-5 h-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <p className="text-sm text-stone-500">
                  Receive promotional offers and restaurant updates
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={notificationSettings.marketing_emails}
                onCheckedChange={(checked) => handleNotificationUpdate('marketing_emails', checked)}
                disabled={updating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-stone-500">
                  Receive order updates and important notifications via SMS
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={notificationSettings.sms_notifications}
                onCheckedChange={(checked) => handleNotificationUpdate('sms_notifications', checked)}
                disabled={updating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order-updates">Order Updates</Label>
                <p className="text-sm text-stone-500">
                  Get notified when your order status changes
                </p>
              </div>
              <Switch
                id="order-updates"
                checked={notificationSettings.order_updates}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, order_updates: checked }))}
                disabled={updating}
              />
            </div>
          </div>
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
              <p className="text-2xl font-bold text-stone-800">{activeOrders?.length || 0}</p>
              <p className="text-sm text-stone-600">Active Orders</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <p className="text-2xl font-bold text-stone-800">
                {new Intl.NumberFormat('en-ZA', {
                  style: 'currency',
                  currency: 'ZAR'
                }).format(
                  orderHistory?.reduce((sum: number, order: any) => sum + order.total_amount, 0) || 0
                )}
              </p>
              <p className="text-sm text-stone-600">Total Spent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-stone-800">Privacy & Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start border-stone-300 text-stone-700 hover:bg-stone-100 bg-transparent"
            >
              <Mail className="w-4 h-4 mr-2" />
              Download My Data
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start border-stone-300 text-stone-700 hover:bg-stone-100 bg-transparent"
            >
              <Settings className="w-4 h-4 mr-2" />
              Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-gradient-to-r from-red-50/95 via-red-25/60 to-red-50/20 backdrop-blur-md border-red-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
              onClick={onSignOut}
              variant="outline"
              disabled={isSigningOut}
              className="w-full border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
            >
              {isSigningOut ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              Sign Out
            </Button>

            {showDeleteConfirm ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600 font-medium">
                  Are you sure? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeleteAccount}
                    variant="destructive"
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Yes, Delete Account
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleDeleteAccount}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            )}
          </div>

          {activeOrders && activeOrders.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                ⚠️ You have {activeOrders.length} active order(s). Please complete or cancel them before deleting your account.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}