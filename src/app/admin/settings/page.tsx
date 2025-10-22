"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { StatusManager } from "@/components/admin/status-manager"
import { Settings, Building, Users, Bell, Palette, CreditCard, Clock, Shield, Save, Upload, MapPin } from "lucide-react"
import { useBusinessAdminAuth } from '@/lib/context/business-admin-context'

export default function SettingsPage() {
    const { currentBusiness } = useBusinessAdminAuth()
    const isOwner = currentBusiness?.role === 'owner'
    const isAdmin = currentBusiness?.role === 'admin' || isOwner
    const [activeTab, setActiveTab] = useState('general')
    const [saving, setSaving] = useState(false)

    // Business settings state - will be populated from currentBusiness
    const [businessSettings, setBusinessSettings] = useState({
        name: '',
        description: '',
        phone: '',
        email: '',
        address: '', // Combined address for display in textarea
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        website: '',
        logo_url: '',
        primary_color: '',
        accent_color: '',
        opening_hours: {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '14:00', closed: false },
            sunday: { open: '10:00', close: '14:00', closed: true }
        },
        timezone: 'Africa/Johannesburg',
        currency: 'ZAR'
    })

    // Load real business data when currentBusiness is available
    useEffect(() => {
        if (currentBusiness?.business) {
            const business = currentBusiness.business
            console.log('📋 Settings: Loading business data:', {
                name: currentBusiness.name,
                description: business.description,
                email: business.email,
                phone: business.phone,
                website: business.website,
                address_line1: business.address_line1,
                city: business.city,
                state: business.state
            })

            // Combine address fields into a single string for display
            const addressParts = [
                business.address_line1,
                business.address_line2,
                business.city,
                business.state,
                business.postal_code
            ].filter(Boolean) // Remove null/undefined/empty values
            const combinedAddress = addressParts.join(', ')

            setBusinessSettings(prev => ({
                ...prev,
                name: currentBusiness.name || '',
                description: business.description || '',
                phone: business.phone || '',
                email: business.email || '',
                address: combinedAddress || '', // Combined address for display
                address_line1: business.address_line1 || '',
                address_line2: business.address_line2 || '',
                city: business.city || '',
                state: business.state || '',
                postal_code: business.postal_code || '',
                country: business.country || 'South Africa',
                website: business.website || '',
                logo_url: business.logo_url || '',
                primary_color: business.primary_color || '#000000',
                accent_color: business.accent_color || '#0066CC',
                timezone: business.timezone || 'Africa/Johannesburg',
                currency: business.currency || 'ZAR',
            }))
        }
    }, [currentBusiness])

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        order_notifications: true,
        booking_notifications: true,
        inventory_alerts: true,
        payment_notifications: true,
        marketing_emails: false
    })

    // System settings
    const [systemSettings, setSystemSettings] = useState({
        auto_accept_orders: false,
        require_order_confirmation: true,
        allow_online_payments: true,
        tax_rate: 15.0,
        service_fee: 0.0,
        delivery_fee: 50.0,
        minimum_order_value: 100.0,
        max_advance_booking_days: 30,
        booking_buffer_minutes: 15
    })

    const handleSaveSettings = async (section: string) => {
        setSaving(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // In real implementation, save to Supabase
            console.log(`Saving ${section} settings:`, {
                businessSettings,
                notificationSettings,
                systemSettings
            })
            
            alert('Settings saved successfully!')
        } catch (error) {
            console.error('Error saving settings:', error)
            alert('Failed to save settings. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: businessSettings.currency
        }).format(value)
    }

    const daysOfWeek = [
        { key: 'monday', label: 'Monday' },
        { key: 'tuesday', label: 'Tuesday' },
        { key: 'wednesday', label: 'Wednesday' },
        { key: 'thursday', label: 'Thursday' },
        { key: 'friday', label: 'Friday' },
        { key: 'saturday', label: 'Saturday' },
        { key: 'sunday', label: 'Sunday' }
    ]

    return (
        <div className="space-y-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">Business Settings</h1>
                        <p className="text-stone-600 mt-1">
                            Configure your business preferences and system settings
                        </p>
                    </div>
                    <Badge variant={isOwner ? "default" : "secondary"}>
                        {isOwner ? 'Owner Access' : isAdmin ? 'Admin Access' : 'Limited Access'}
                    </Badge>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="hours">Hours</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                        <TabsTrigger value="statuses">Statuses</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Business Information
                                </CardTitle>
                                <CardDescription>
                                    Update your business details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="business_name">Business Name</Label>
                                        <Input
                                            id="business_name"
                                            value={businessSettings.name}
                                            onChange={(e) => setBusinessSettings(prev => ({
                                                ...prev,
                                                name: e.target.value
                                            }))}
                                            disabled={!isOwner}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="business_email">Business Email</Label>
                                        <Input
                                            id="business_email"
                                            type="email"
                                            value={businessSettings.email}
                                            onChange={(e) => setBusinessSettings(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))}
                                            disabled={!isAdmin}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="business_phone">Phone Number</Label>
                                        <Input
                                            id="business_phone"
                                            value={businessSettings.phone}
                                            onChange={(e) => setBusinessSettings(prev => ({
                                                ...prev,
                                                phone: e.target.value
                                            }))}
                                            disabled={!isAdmin}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            value={businessSettings.website}
                                            onChange={(e) => setBusinessSettings(prev => ({
                                                ...prev,
                                                website: e.target.value
                                            }))}
                                            placeholder="https://your-website.com"
                                            disabled={!isAdmin}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Business Description</Label>
                                    <Textarea
                                        id="description"
                                        value={businessSettings.description}
                                        onChange={(e) => setBusinessSettings(prev => ({
                                            ...prev,
                                            description: e.target.value
                                        }))}
                                        placeholder="Describe your business..."
                                        rows={3}
                                        disabled={!isAdmin}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={businessSettings.address}
                                        onChange={(e) => setBusinessSettings(prev => ({
                                            ...prev,
                                            address: e.target.value
                                        }))}
                                        placeholder="Full business address..."
                                        rows={2}
                                        disabled={!isAdmin}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Select
                                            value={businessSettings.timezone}
                                            onValueChange={(value) => setBusinessSettings(prev => ({
                                                ...prev,
                                                timezone: value
                                            }))}
                                            disabled={!isAdmin}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Africa/Johannesburg">South Africa Standard Time</SelectItem>
                                                <SelectItem value="Africa/Cairo">Central Africa Time</SelectItem>
                                                <SelectItem value="UTC">UTC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Currency</Label>
                                        <Select
                                            value={businessSettings.currency}
                                            onValueChange={(value) => setBusinessSettings(prev => ({
                                                ...prev,
                                                currency: value
                                            }))}
                                            disabled={!isOwner}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ZAR">South African Rand (R)</SelectItem>
                                                <SelectItem value="USD">US Dollar ($)</SelectItem>
                                                <SelectItem value="EUR">Euro (€)</SelectItem>
                                                <SelectItem value="GBP">British Pound (£)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="flex justify-end">
                                        <Button onClick={() => handleSaveSettings('general')} disabled={saving}>
                                            <Save className="w-4 h-4 mr-2" />
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Opening Hours */}
                    <TabsContent value="hours" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Opening Hours
                                </CardTitle>
                                <CardDescription>
                                    Set your business operating hours for each day of the week
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {daysOfWeek.map((day) => {
                                    const hours = businessSettings.opening_hours[day.key as keyof typeof businessSettings.opening_hours]
                                    return (
                                        <div key={day.key} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-20 font-medium">{day.label}</div>
                                                <Switch
                                                    checked={!hours.closed}
                                                    onCheckedChange={(checked) => {
                                                        setBusinessSettings(prev => ({
                                                            ...prev,
                                                            opening_hours: {
                                                                ...prev.opening_hours,
                                                                [day.key]: {
                                                                    ...hours,
                                                                    closed: !checked
                                                                }
                                                            }
                                                        }))
                                                    }}
                                                    disabled={!isAdmin}
                                                />
                                                <span className="text-sm text-gray-600">
                                                    {hours.closed ? 'Closed' : 'Open'}
                                                </span>
                                            </div>
                                            
                                            {!hours.closed && (
                                                <div className="flex items-center space-x-2">
                                                    <Input
                                                        type="time"
                                                        value={hours.open}
                                                        onChange={(e) => {
                                                            setBusinessSettings(prev => ({
                                                                ...prev,
                                                                opening_hours: {
                                                                    ...prev.opening_hours,
                                                                    [day.key]: {
                                                                        ...hours,
                                                                        open: e.target.value
                                                                    }
                                                                }
                                                            }))
                                                        }}
                                                        className="w-24"
                                                        disabled={!isAdmin}
                                                    />
                                                    <span>to</span>
                                                    <Input
                                                        type="time"
                                                        value={hours.close}
                                                        onChange={(e) => {
                                                            setBusinessSettings(prev => ({
                                                                ...prev,
                                                                opening_hours: {
                                                                    ...prev.opening_hours,
                                                                    [day.key]: {
                                                                        ...hours,
                                                                        close: e.target.value
                                                                    }
                                                                }
                                                            }))
                                                        }}
                                                        className="w-24"
                                                        disabled={!isAdmin}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {isAdmin && (
                                    <div className="flex justify-end">
                                        <Button onClick={() => handleSaveSettings('hours')} disabled={saving}>
                                            <Save className="w-4 h-4 mr-2" />
                                            {saving ? 'Saving...' : 'Save Hours'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notification Settings */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    Notification Preferences
                                </CardTitle>
                                <CardDescription>
                                    Configure how you receive business notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="font-medium mb-3">Notification Channels</h4>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                                            { key: 'push_notifications', label: 'Push Notifications', description: 'Browser and mobile push notifications' },
                                            { key: 'sms_notifications', label: 'SMS Notifications', description: 'Text message notifications (charges apply)' }
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <div className="font-medium">{item.label}</div>
                                                    <div className="text-sm text-gray-600">{item.description}</div>
                                                </div>
                                                <Switch
                                                    checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                                    onCheckedChange={(checked) => {
                                                        setNotificationSettings(prev => ({
                                                            ...prev,
                                                            [item.key]: checked
                                                        }))
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-medium mb-3">Notification Types</h4>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'order_notifications', label: 'Order Updates', description: 'New orders, status changes, cancellations' },
                                            { key: 'booking_notifications', label: 'Booking Updates', description: 'New bookings, changes, reminders' },
                                            { key: 'inventory_alerts', label: 'Inventory Alerts', description: 'Low stock and out-of-stock alerts' },
                                            { key: 'payment_notifications', label: 'Payment Updates', description: 'Payment confirmations and failures' },
                                            { key: 'marketing_emails', label: 'Marketing Emails', description: 'Product updates and promotional content' }
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <div className="font-medium">{item.label}</div>
                                                    <div className="text-sm text-gray-600">{item.description}</div>
                                                </div>
                                                <Switch
                                                    checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                                    onCheckedChange={(checked) => {
                                                        setNotificationSettings(prev => ({
                                                            ...prev,
                                                            [item.key]: checked
                                                        }))
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={() => handleSaveSettings('notifications')} disabled={saving}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {saving ? 'Saving...' : 'Save Preferences'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* System Settings */}
                    <TabsContent value="system" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    System Configuration
                                </CardTitle>
                                <CardDescription>
                                    Configure business operations and system behavior
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="font-medium mb-3">Order Management</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">Auto-accept Orders</div>
                                                <div className="text-sm text-gray-600">Automatically accept incoming orders</div>
                                            </div>
                                            <Switch
                                                checked={systemSettings.auto_accept_orders}
                                                onCheckedChange={(checked) => {
                                                    setSystemSettings(prev => ({
                                                        ...prev,
                                                        auto_accept_orders: checked
                                                    }))
                                                }}
                                                disabled={!isAdmin}
                                            />
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">Require Order Confirmation</div>
                                                <div className="text-sm text-gray-600">Customers must confirm orders before processing</div>
                                            </div>
                                            <Switch
                                                checked={systemSettings.require_order_confirmation}
                                                onCheckedChange={(checked) => {
                                                    setSystemSettings(prev => ({
                                                        ...prev,
                                                        require_order_confirmation: checked
                                                    }))
                                                }}
                                                disabled={!isAdmin}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-medium mb-3">Pricing & Fees</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                                            <Input
                                                id="tax_rate"
                                                type="number"
                                                step="0.1"
                                                value={systemSettings.tax_rate}
                                                onChange={(e) => setSystemSettings(prev => ({
                                                    ...prev,
                                                    tax_rate: parseFloat(e.target.value) || 0
                                                }))}
                                                disabled={!isAdmin}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="service_fee">Service Fee ({businessSettings.currency})</Label>
                                            <Input
                                                id="service_fee"
                                                type="number"
                                                step="0.01"
                                                value={systemSettings.service_fee}
                                                onChange={(e) => setSystemSettings(prev => ({
                                                    ...prev,
                                                    service_fee: parseFloat(e.target.value) || 0
                                                }))}
                                                disabled={!isAdmin}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="delivery_fee">Delivery Fee ({businessSettings.currency})</Label>
                                            <Input
                                                id="delivery_fee"
                                                type="number"
                                                step="0.01"
                                                value={systemSettings.delivery_fee}
                                                onChange={(e) => setSystemSettings(prev => ({
                                                    ...prev,
                                                    delivery_fee: parseFloat(e.target.value) || 0
                                                }))}
                                                disabled={!isAdmin}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="minimum_order">Minimum Order Value ({businessSettings.currency})</Label>
                                            <Input
                                                id="minimum_order"
                                                type="number"
                                                step="0.01"
                                                value={systemSettings.minimum_order_value}
                                                onChange={(e) => setSystemSettings(prev => ({
                                                    ...prev,
                                                    minimum_order_value: parseFloat(e.target.value) || 0
                                                }))}
                                                disabled={!isAdmin}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {currentBusiness?.business?.business_categories?.id !== 'food' && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h4 className="font-medium mb-3">Booking Settings</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="advance_booking">Max Advance Booking (Days)</Label>
                                                    <Input
                                                        id="advance_booking"
                                                        type="number"
                                                        value={systemSettings.max_advance_booking_days}
                                                        onChange={(e) => setSystemSettings(prev => ({
                                                            ...prev,
                                                            max_advance_booking_days: parseInt(e.target.value) || 0
                                                        }))}
                                                        disabled={!isAdmin}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="buffer_time">Booking Buffer Time (Minutes)</Label>
                                                    <Input
                                                        id="buffer_time"
                                                        type="number"
                                                        value={systemSettings.booking_buffer_minutes}
                                                        onChange={(e) => setSystemSettings(prev => ({
                                                            ...prev,
                                                            booking_buffer_minutes: parseInt(e.target.value) || 0
                                                        }))}
                                                        disabled={!isAdmin}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isAdmin && (
                                    <div className="flex justify-end">
                                        <Button onClick={() => handleSaveSettings('system')} disabled={saving}>
                                            <Save className="w-4 h-4 mr-2" />
                                            {saving ? 'Saving...' : 'Save Configuration'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Status Management */}
                    <TabsContent value="statuses" className="space-y-6">
                        {currentBusiness?.business?.business_categories?.id === 'food' && (
                            <StatusManager 
                                statusType="order" 
                                title="Order Status Configuration"
                                description="Customize your order workflow statuses"
                            />
                        )}
                        
                        {currentBusiness?.business?.business_categories?.id === 'retail' && (
                            <StatusManager 
                                statusType="order" 
                                title="Order Status Configuration"
                                description="Customize your retail order workflow statuses"
                            />
                        )}
                        
                        {['service', 'car_wash', 'salon'].includes(currentBusiness?.business?.business_categories?.id || '') && (
                            <StatusManager 
                                statusType="booking" 
                                title="Booking Status Configuration"
                                description="Customize your service booking workflow statuses"
                            />
                        )}
                        
                        <StatusManager 
                            statusType="payment" 
                            title="Payment Status Configuration"
                            description="Customize your payment processing statuses"
                        />
                    </TabsContent>

                    {/* User Management */}
                    <TabsContent value="users" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    User Management
                                </CardTitle>
                                <CardDescription>
                                    Manage team members and their access permissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">User management coming soon</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Team member invitations and role management will be available in Phase 4.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}