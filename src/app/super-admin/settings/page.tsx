"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Globe, Shield, Bell, DollarSign, Users, Building2, MapPin, Truck, Clock, AlertTriangle, Save, RotateCcw } from "lucide-react"

export default function PlatformSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-600 mt-1">Configure system-wide settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>General Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Platform Name</label>
              <Input defaultValue="LocalHub" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Platform URL</label>
              <Input defaultValue="https://localhub.co.za" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Support Email</label>
              <Input defaultValue="support@localhub.co.za" className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Maintenance Mode</p>
                <p className="text-xs text-slate-500">Enable to temporarily disable the platform</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Business Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Auto-approve businesses</p>
                <p className="text-xs text-slate-500">Automatically approve verified businesses</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Require document verification</p>
                <p className="text-xs text-slate-500">Mandate business license uploads</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Maximum businesses per category</label>
              <Input type="number" defaultValue="1000" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Business approval timeout (days)</label>
              <Input type="number" defaultValue="7" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Financial Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Platform Commission (%)</label>
              <Input type="number" defaultValue="5.5" step="0.1" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Payment Processing Fee (%)</label>
              <Input type="number" defaultValue="2.9" step="0.1" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Minimum Payout Amount (ZAR)</label>
              <Input type="number" defaultValue="100" className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Automatic payouts</p>
                <p className="text-xs text-slate-500">Process payouts automatically weekly</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>User Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Allow user registration</p>
                <p className="text-xs text-slate-500">Enable new user signups</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Email verification required</p>
                <p className="text-xs text-slate-500">Require email verification for new accounts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Maximum orders per user per day</label>
              <Input type="number" defaultValue="10" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Account inactivity period (days)</label>
              <Input type="number" defaultValue="365" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notification Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Email notifications</p>
                <p className="text-xs text-slate-500">Send system email notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">SMS notifications</p>
                <p className="text-xs text-slate-500">Send SMS for critical updates</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Push notifications</p>
                <p className="text-xs text-slate-500">Enable browser push notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Admin notification email</label>
              <Input defaultValue="admin@localhub.co.za" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Two-factor authentication</p>
                <p className="text-xs text-slate-500">Require 2FA for admin accounts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">IP whitelist for admins</p>
                <p className="text-xs text-slate-500">Restrict admin access by IP</p>
              </div>
              <Switch />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Session timeout (minutes)</label>
              <Input type="number" defaultValue="30" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Maximum login attempts</label>
              <Input type="number" defaultValue="5" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location & Delivery</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Default Country</label>
              <Input defaultValue="South Africa" className="mt-1" disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Default Currency</label>
              <Input defaultValue="ZAR (South African Rand)" className="mt-1" disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Maximum delivery distance (km)</label>
              <Input type="number" defaultValue="50" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Default delivery fee (ZAR)</label>
              <Input type="number" defaultValue="25" className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Enable location-based services</p>
                <p className="text-xs text-slate-500">Use GPS for delivery tracking</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Order Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Order processing timeout (hours)</label>
              <Input type="number" defaultValue="2" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Automatic cancellation after (hours)</label>
              <Input type="number" defaultValue="24" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Minimum order value (ZAR)</label>
              <Input type="number" defaultValue="50" className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Allow cash on delivery</p>
                <p className="text-xs text-slate-500">Enable COD payment option</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Require order confirmation</p>
                <p className="text-xs text-slate-500">Business must confirm orders</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Business Hours & Scheduling</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Platform operating hours</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input type="time" defaultValue="06:00" />
                <Input type="time" defaultValue="23:00" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Timezone</label>
              <Input defaultValue="Africa/Johannesburg (SAST)" className="mt-1" disabled />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Allow 24/7 operations</p>
                <p className="text-xs text-slate-500">Businesses can operate round the clock</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Holiday mode</p>
                <p className="text-xs text-slate-500">Automatically disable orders on public holidays</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Content Moderation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Auto-moderate reviews</p>
                <p className="text-xs text-slate-500">Automatically flag inappropriate content</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Require business photo approval</p>
                <p className="text-xs text-slate-500">Admin must approve uploaded images</p>
              </div>
              <Switch />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Minimum review rating for display</label>
              <Input type="number" min="1" max="5" step="0.1" defaultValue="1.0" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Maximum character limit for reviews</label>
              <Input type="number" defaultValue="500" className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Profanity filter</p>
                <p className="text-xs text-slate-500">Filter inappropriate language</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">System Status</h3>
              <p className="text-sm text-slate-600 mt-1">Platform is operational • Last backup: 2 hours ago</p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Database: Healthy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Storage: 78% available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Cache: Optimizing</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}