"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
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
import { Settings, Building, Users, Bell, Clock, Save, UserPlus, Mail, Shield, Eye, EyeOff, Trash2, Edit2 } from "lucide-react"
import { useBusinessAdminAuth } from '@/lib/context/business-admin-context'
import { useTeamMembers, type TeamMember, type UserRole } from '@/lib/hooks'
import { BusinessPermissions } from '@/types/business'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

export default function SettingsPage() {
    const { currentBusiness, user } = useBusinessAdminAuth()
    const isOwner = currentBusiness?.role === 'owner'
    const isAdmin = currentBusiness?.role === 'admin' || isOwner
    const [activeTab, setActiveTab] = useState('general')
    const [saving, setSaving] = useState(false)

    // Team management
    const { teamMembers, loading: teamLoading, addTeamMember, updateTeamMember, removeTeamMember, toggleMemberStatus } = useTeamMembers()
    const [isUserModalOpen, setIsUserModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
    const [viewingMember, setViewingMember] = useState<TeamMember | null>(null)
    const [userFormData, setUserFormData] = useState({
        email: '',
        role: 'staff' as UserRole,
        permissions: {} as BusinessPermissions
    })

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

            // Load opening hours from settings if available
            const savedHours = (business.settings as { opening_hours?: typeof businessSettings.opening_hours })?.opening_hours

            // Load system settings from settings if available
            const savedSystemSettings = (business.settings as { system?: typeof systemSettings })?.system

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
                opening_hours: savedHours || prev.opening_hours, // Load saved hours or keep defaults
            }))

            // Load system settings if available
            if (savedSystemSettings) {
                setSystemSettings(savedSystemSettings)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Team management handlers
    const openAddUserModal = () => {
        setEditingMember(null)
        setUserFormData({
            email: '',
            role: 'staff',
            permissions: getDefaultPermissions('staff')
        })
        setIsUserModalOpen(true)
    }

    const openEditUserModal = (member: TeamMember) => {
        setEditingMember(member)
        setUserFormData({
            email: member.email,
            role: member.role,
            permissions: member.permissions || {}
        })
        setIsUserModalOpen(true)
    }

    const openViewUserModal = (member: TeamMember) => {
        setViewingMember(member)
        setIsViewModalOpen(true)
    }

    const closeUserModal = () => {
        setIsUserModalOpen(false)
        setEditingMember(null)
        setUserFormData({
            email: '',
            role: 'staff',
            permissions: {}
        })
    }

    const closeViewModal = () => {
        setIsViewModalOpen(false)
        setViewingMember(null)
    }

    const getDefaultPermissions = (role: UserRole): BusinessPermissions => {
        switch (role) {
            case 'owner':
                return {
                    manage_menu: true,
                    manage_inventory: true,
                    view_orders: true,
                    manage_orders: true,
                    process_payments: true,
                    manage_staff: true,
                    view_staff_schedule: true,
                    view_customers: true,
                    manage_customers: true,
                    view_analytics: true,
                    export_data: true,
                    manage_settings: true,
                    manage_integrations: true,
                    manage_appointments: true,
                    manage_services: true,
                }
            case 'admin':
                return {
                    manage_menu: true,
                    view_orders: true,
                    manage_orders: true,
                    view_analytics: true,
                    view_customers: true,
                    manage_customers: true,
                    view_staff_schedule: true,
                }
            case 'staff':
                return {
                    view_orders: true,
                    manage_orders: true,
                }
            case 'viewer':
                return {
                    view_orders: true,
                    view_analytics: true,
                }
            default:
                return {}
        }
    }

    const handleRoleChange = (newRole: UserRole) => {
        setUserFormData(prev => ({
            ...prev,
            role: newRole,
            permissions: getDefaultPermissions(newRole)
        }))
    }

    const handlePermissionToggle = (permission: keyof BusinessPermissions) => {
        if (userFormData.role === 'owner') return // Owners always have all permissions

        setUserFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permission]: !prev.permissions[permission]
            }
        }))
    }

    const handleSaveUser = async () => {
        try {
            setSaving(true)

            if (editingMember) {
                // Update existing member
                await updateTeamMember(editingMember.id, {
                    role: userFormData.role,
                    permissions: userFormData.permissions
                })
                alert('Team member updated successfully!')
            } else {
                // Add new member
                await addTeamMember({
                    email: userFormData.email,
                    role: userFormData.role,
                    permissions: userFormData.permissions
                })
                alert('Team member invited successfully!')
            }

            closeUserModal()
        } catch (error) {
            console.error('Error saving team member:', error)
            // Error is already shown by the hook
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveUser = async (member: TeamMember) => {
        if (!confirm(`Are you sure you want to remove ${member.full_name || member.email} from the team?`)) {
            return
        }

        try {
            await removeTeamMember(member.id)
            alert('Team member removed successfully!')
        } catch (error) {
            console.error('Error removing team member:', error)
        }
    }

    const handleToggleUserStatus = async (member: TeamMember) => {
        try {
            await toggleMemberStatus(member.id)
        } catch (error) {
            console.error('Error toggling member status:', error)
        }
    }

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case 'owner': return 'bg-purple-100 text-purple-800'
            case 'admin': return 'bg-blue-100 text-blue-800'
            case 'staff': return 'bg-green-100 text-green-800'
            case 'viewer': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const currentUserId = user?.id

    const handleSaveSettings = async (section: string) => {
        setSaving(true)
        try {
            if (section === 'general') {
                // Save general business information
                const response = await fetch('/api/admin/business', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        businessId: currentBusiness?.business?.id,
                        updates: {
                            name: businessSettings.name,
                            description: businessSettings.description,
                            email: businessSettings.email,
                            phone: businessSettings.phone,
                            website: businessSettings.website,
                            address_line1: businessSettings.address_line1,
                            address_line2: businessSettings.address_line2,
                            city: businessSettings.city,
                            state: businessSettings.state,
                            postal_code: businessSettings.postal_code,
                            country: businessSettings.country,
                            timezone: businessSettings.timezone,
                            currency: businessSettings.currency,
                        }
                    })
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to save settings')
                }

                const data = await response.json()
                console.log('✅ Settings saved:', data)
                alert('Settings saved successfully!')
            } else if (section === 'hours') {
                // Save opening hours in the settings field
                const currentSettings = currentBusiness?.business?.settings || {}
                const response = await fetch('/api/admin/business', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        businessId: currentBusiness?.business?.id,
                        updates: {
                            settings: {
                                ...currentSettings,
                                opening_hours: businessSettings.opening_hours
                            }
                        }
                    })
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to save hours')
                }

                const data = await response.json()
                console.log('✅ Hours saved:', data)
                alert('Opening hours saved successfully!')
            } else if (section === 'system') {
                // Save system configuration settings
                const currentSettings = currentBusiness?.business?.settings || {}
                const response = await fetch('/api/admin/business', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        businessId: currentBusiness?.business?.id,
                        updates: {
                            settings: {
                                ...currentSettings,
                                system: systemSettings
                            }
                        }
                    })
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to save system settings')
                }

                const data = await response.json()
                console.log('✅ System settings saved:', data)
                alert('System configuration saved successfully!')
            } else {
                // For other sections, use placeholder for now
                console.log(`Saving ${section} settings:`, {
                    businessSettings,
                    notificationSettings,
                    systemSettings
                })
                alert(`${section} settings will be implemented in the next phase`)
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            alert(error instanceof Error ? error.message : 'Failed to save settings. Please try again.')
        } finally {
            setSaving(false)
        }
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address_line1">Address Line 1</Label>
                                        <Input
                                            id="address_line1"
                                            value={businessSettings.address_line1}
                                            onChange={(e) => setBusinessSettings(prev => ({
                                                ...prev,
                                                address_line1: e.target.value
                                            }))}
                                            placeholder="Street address"
                                            disabled={!isAdmin}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address_line2">Address Line 2</Label>
                                        <Input
                                            id="address_line2"
                                            value={businessSettings.address_line2}
                                            onChange={(e) => setBusinessSettings(prev => ({
                                                ...prev,
                                                address_line2: e.target.value
                                            }))}
                                            placeholder="Suite, unit, etc. (optional)"
                                            disabled={!isAdmin}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={businessSettings.city}
                                            onChange={(e) => setBusinessSettings(prev => ({
                                                ...prev,
                                                city: e.target.value
                                            }))}
                                            placeholder="City"
                                            disabled={!isAdmin}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State/Province</Label>
                                        <Input
                                            id="state"
                                            value={businessSettings.state}
                                            onChange={(e) => setBusinessSettings(prev => ({
                                                ...prev,
                                                state: e.target.value
                                            }))}
                                            placeholder="State or province"
                                            disabled={!isAdmin}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Postal Code</Label>
                                        <Input
                                            id="postal_code"
                                            value={businessSettings.postal_code}
                                            onChange={(e) => setBusinessSettings(prev => ({
                                                ...prev,
                                                postal_code: e.target.value
                                            }))}
                                            placeholder="Postal code"
                                            disabled={!isAdmin}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={businessSettings.country}
                                        onChange={(e) => setBusinessSettings(prev => ({
                                            ...prev,
                                            country: e.target.value
                                        }))}
                                        placeholder="Country"
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
                                    <h4 className="font-medium mb-4">Pricing & Fees</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
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
                                                placeholder="15.0"
                                            />
                                        </div>
                                        <div className="space-y-2">
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
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
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
                                                placeholder="50.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
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
                                                placeholder="100.00"
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
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            Team Members ({teamMembers.length})
                                        </CardTitle>
                                        <CardDescription>
                                            Manage team members and their access permissions
                                        </CardDescription>
                                    </div>
                                    {(isOwner || (currentBusiness?.permissions?.manage_staff as boolean)) && (
                                        <Button onClick={openAddUserModal}>
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Invite Member
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {teamLoading ? (
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                                        <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : teamMembers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No team members yet</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Get started by inviting your first team member.
                                        </p>
                                        {(isOwner || (currentBusiness?.permissions?.manage_staff as boolean)) && (
                                            <Button onClick={openAddUserModal} className="mt-4">
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Invite Member
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {teamMembers.map((member) => {
                                            const isCurrentUser = member.user_id === currentUserId
                                            // Users cannot edit themselves at all - only other team members
                                            const canEdit = !isCurrentUser && (isOwner || (currentBusiness?.permissions?.manage_staff as boolean)) &&
                                                          !(member.role === 'owner' && !isOwner) &&
                                                          !(isAdmin && member.role === 'admin')
                                            const canRemove = canEdit // Same as edit - can't edit yourself
                                            const canToggleStatus = canEdit // Same as edit - can't toggle yourself

                                            return (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        {/* Avatar */}
                                                        <div className="relative">
                                                            {member.avatar_url ? (
                                                                <Image
                                                                    src={member.avatar_url}
                                                                    alt={member.full_name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-12 h-12 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                                                                    <span className="text-stone-600 font-semibold text-lg">
                                                                        {(member.full_name || member.email)[0].toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {member.is_active ? (
                                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                                                            ) : (
                                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-white" />
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-semibold text-stone-900">
                                                                    {member.full_name || 'Unknown User'}
                                                                    {isCurrentUser && (
                                                                        <span className="text-sm font-normal text-stone-500 ml-1">(You)</span>
                                                                    )}
                                                                </h4>
                                                                <Badge className={getRoleBadgeColor(member.role)}>
                                                                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                                                </Badge>
                                                                {!member.is_active && (
                                                                    <Badge variant="outline" className="text-red-600 border-red-300">
                                                                        Inactive
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-1 text-sm text-stone-600">
                                                                <span className="flex items-center gap-1">
                                                                    <Mail className="w-3 h-3" />
                                                                    {member.email}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Shield className="w-3 h-3" />
                                                                    {Object.values(member.permissions || {}).filter(Boolean).length} permissions
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-stone-500 mt-1">
                                                                Joined {new Date(member.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2">
                                                        {/* Show view button for current user */}
                                                        {isCurrentUser && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openViewUserModal(member)}
                                                                title="View your details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {canToggleStatus && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleToggleUserStatus(member)}
                                                                title={member.is_active ? 'Deactivate' : 'Activate'}
                                                            >
                                                                {member.is_active ? (
                                                                    <EyeOff className="w-4 h-4" />
                                                                ) : (
                                                                    <Eye className="w-4 h-4" />
                                                                )}
                                                            </Button>
                                                        )}
                                                        {canEdit && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openEditUserModal(member)}
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {canRemove && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleRemoveUser(member)}
                                                                className="text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* User Modal */}
                        <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingMember ? 'Edit Team Member' : 'Invite Team Member'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editingMember
                                            ? 'Update role and permissions for this team member'
                                            : 'Send an invitation to add a new team member'
                                        }
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6 py-4">
                                    {/* Email Input */}
                                    {!editingMember && (
                                        <div className="space-y-2">
                                            <Label htmlFor="user-email">Email Address *</Label>
                                            <Input
                                                id="user-email"
                                                type="email"
                                                placeholder="colleague@company.com"
                                                value={userFormData.email}
                                                onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                                                required
                                            />
                                            <p className="text-xs text-stone-500">
                                                User must have an account. They will be able to access the admin portal immediately.
                                            </p>
                                        </div>
                                    )}

                                    {editingMember && (
                                        <div className="p-4 bg-stone-50 rounded-lg">
                                            <p className="text-sm text-stone-600">
                                                <strong>Email:</strong> {editingMember.email}
                                            </p>
                                        </div>
                                    )}

                                    {/* Role Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="user-role">Role *</Label>
                                        <Select
                                            value={userFormData.role}
                                            onValueChange={(value) => handleRoleChange(value as UserRole)}
                                            disabled={editingMember?.role === 'owner' && !isOwner}
                                        >
                                            <SelectTrigger id="user-role">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="owner" disabled={!isOwner}>
                                                    Owner - Full control over everything
                                                </SelectItem>
                                                <SelectItem value="admin" disabled={isAdmin && !isOwner}>
                                                    Admin - Can manage most settings
                                                </SelectItem>
                                                <SelectItem value="staff">
                                                    Staff - Limited access to daily operations
                                                </SelectItem>
                                                <SelectItem value="viewer">
                                                    Viewer - Read-only access
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Permissions */}
                                    <div className="space-y-4">
                                        <Label>Permissions</Label>
                                        {userFormData.role === 'owner' && (
                                            <p className="text-sm text-stone-600 bg-purple-50 p-3 rounded">
                                                Owners automatically have all permissions enabled.
                                            </p>
                                        )}

                                        <div className="space-y-4">
                                            {/* Menu & Inventory */}
                                            <div className="border rounded-lg p-4 space-y-3">
                                                <h4 className="font-semibold text-sm">Menu & Inventory</h4>
                                                <div className="space-y-2">
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={userFormData.permissions.manage_menu || false}
                                                            onCheckedChange={() => handlePermissionToggle('manage_menu')}
                                                            disabled={userFormData.role === 'owner'}
                                                        />
                                                        <span className="text-sm">Manage menu items</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={userFormData.permissions.manage_inventory || false}
                                                            onCheckedChange={() => handlePermissionToggle('manage_inventory')}
                                                            disabled={userFormData.role === 'owner'}
                                                        />
                                                        <span className="text-sm">Manage inventory</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Orders */}
                                            <div className="border rounded-lg p-4 space-y-3">
                                                <h4 className="font-semibold text-sm">Orders</h4>
                                                <div className="space-y-2">
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={userFormData.permissions.view_orders || false}
                                                            onCheckedChange={() => handlePermissionToggle('view_orders')}
                                                            disabled={userFormData.role === 'owner'}
                                                        />
                                                        <span className="text-sm">View orders</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={userFormData.permissions.manage_orders || false}
                                                            onCheckedChange={() => handlePermissionToggle('manage_orders')}
                                                            disabled={userFormData.role === 'owner'}
                                                        />
                                                        <span className="text-sm">Update order status</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={userFormData.permissions.process_payments || false}
                                                            onCheckedChange={() => handlePermissionToggle('process_payments')}
                                                            disabled={userFormData.role === 'owner'}
                                                        />
                                                        <span className="text-sm">Process refunds</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Analytics */}
                                            <div className="border rounded-lg p-4 space-y-3">
                                                <h4 className="font-semibold text-sm">Analytics & Reports</h4>
                                                <div className="space-y-2">
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={userFormData.permissions.view_analytics || false}
                                                            onCheckedChange={() => handlePermissionToggle('view_analytics')}
                                                            disabled={userFormData.role === 'owner'}
                                                        />
                                                        <span className="text-sm">View analytics</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={userFormData.permissions.export_data || false}
                                                            onCheckedChange={() => handlePermissionToggle('export_data')}
                                                            disabled={userFormData.role === 'owner'}
                                                        />
                                                        <span className="text-sm">Export data</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Settings */}
                                            <div className="border rounded-lg p-4 space-y-3">
                                                <h4 className="font-semibold text-sm">Settings & Administration</h4>
                                                <div className="space-y-2">
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={userFormData.permissions.manage_settings || false}
                                                            onCheckedChange={() => handlePermissionToggle('manage_settings')}
                                                            disabled={userFormData.role === 'owner'}
                                                        />
                                                        <span className="text-sm">Manage business settings</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={userFormData.permissions.manage_staff || false}
                                                            onCheckedChange={() => handlePermissionToggle('manage_staff')}
                                                            disabled={userFormData.role === 'owner'}
                                                        />
                                                        <span className="text-sm">Manage team members</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={userFormData.permissions.manage_integrations || false}
                                                            onCheckedChange={() => handlePermissionToggle('manage_integrations')}
                                                            disabled={userFormData.role === 'owner'}
                                                        />
                                                        <span className="text-sm">Manage integrations</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Customers */}
                                            <div className="border rounded-lg p-4 space-y-3">
                                                <h4 className="font-semibold text-sm">Customer Management</h4>
                                                <div className="space-y-2">
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={userFormData.permissions.view_customers || false}
                                                            onCheckedChange={() => handlePermissionToggle('view_customers')}
                                                            disabled={userFormData.role === 'owner'}
                                                        />
                                                        <span className="text-sm">View customers</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={userFormData.permissions.manage_customers || false}
                                                            onCheckedChange={() => handlePermissionToggle('manage_customers')}
                                                            disabled={userFormData.role === 'owner'}
                                                        />
                                                        <span className="text-sm">Manage customers</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={closeUserModal} disabled={saving}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSaveUser}
                                        disabled={saving || (!editingMember && !userFormData.email)}
                                    >
                                        {saving ? 'Saving...' : editingMember ? 'Update Member' : 'Send Invite'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* View Details Modal (Read-Only) */}
                        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Your Profile Details</DialogTitle>
                                    <DialogDescription>
                                        View your role and permissions. Contact another team member to make changes.
                                    </DialogDescription>
                                </DialogHeader>

                                {viewingMember && (
                                    <div className="space-y-6 py-4">
                                        {/* User Info */}
                                        <div className="p-4 bg-stone-50 rounded-lg space-y-2">
                                            <div>
                                                <span className="text-sm font-medium text-stone-700">Name:</span>
                                                <span className="text-sm text-stone-900 ml-2">{viewingMember.full_name}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-stone-700">Email:</span>
                                                <span className="text-sm text-stone-900 ml-2">{viewingMember.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-stone-700">Role:</span>
                                                <Badge className={getRoleBadgeColor(viewingMember.role) + " ml-2"}>
                                                    {viewingMember.role.charAt(0).toUpperCase() + viewingMember.role.slice(1)}
                                                </Badge>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-stone-700">Status:</span>
                                                <Badge
                                                    variant={viewingMember.is_active ? "default" : "secondary"}
                                                    className={viewingMember.is_active ? "bg-green-100 text-green-800 ml-2" : "bg-stone-100 text-stone-600 ml-2"}
                                                >
                                                    {viewingMember.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-stone-700">Joined:</span>
                                                <span className="text-sm text-stone-900 ml-2">
                                                    {new Date(viewingMember.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Permissions */}
                                        <div className="space-y-4">
                                            <Label>Your Permissions</Label>
                                            {viewingMember.role === 'owner' && (
                                                <p className="text-sm text-stone-600 bg-purple-50 p-3 rounded">
                                                    As an owner, you have all permissions enabled.
                                                </p>
                                            )}

                                            <div className="space-y-4">
                                                {/* Menu & Inventory */}
                                                <div className="border rounded-lg p-4 space-y-3">
                                                    <h4 className="font-semibold text-sm">Menu & Inventory</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={viewingMember.permissions?.manage_menu || false}
                                                                disabled
                                                            />
                                                            <span className="text-sm">Manage menu items</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={viewingMember.permissions?.manage_inventory || false}
                                                                disabled
                                                            />
                                                            <span className="text-sm">Manage inventory</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Orders */}
                                                <div className="border rounded-lg p-4 space-y-3">
                                                    <h4 className="font-semibold text-sm">Orders</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={viewingMember.permissions?.view_orders || false}
                                                                disabled
                                                            />
                                                            <span className="text-sm">View orders</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={viewingMember.permissions?.manage_orders || false}
                                                                disabled
                                                            />
                                                            <span className="text-sm">Update order status</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={viewingMember.permissions?.process_payments || false}
                                                                disabled
                                                            />
                                                            <span className="text-sm">Process refunds</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Staff & Customers */}
                                                <div className="border rounded-lg p-4 space-y-3">
                                                    <h4 className="font-semibold text-sm">Staff & Customers</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={viewingMember.permissions?.manage_staff || false}
                                                                disabled
                                                            />
                                                            <span className="text-sm">Manage staff</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={viewingMember.permissions?.view_customers || false}
                                                                disabled
                                                            />
                                                            <span className="text-sm">View customers</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={viewingMember.permissions?.manage_customers || false}
                                                                disabled
                                                            />
                                                            <span className="text-sm">Manage customers</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Analytics */}
                                                <div className="border rounded-lg p-4 space-y-3">
                                                    <h4 className="font-semibold text-sm">Analytics & Reports</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={viewingMember.permissions?.view_analytics || false}
                                                                disabled
                                                            />
                                                            <span className="text-sm">View analytics</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={viewingMember.permissions?.export_data || false}
                                                                disabled
                                                            />
                                                            <span className="text-sm">Export data</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Settings */}
                                                <div className="border rounded-lg p-4 space-y-3">
                                                    <h4 className="font-semibold text-sm">Settings</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={viewingMember.permissions?.manage_settings || false}
                                                                disabled
                                                            />
                                                            <span className="text-sm">Manage business settings</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={viewingMember.permissions?.manage_integrations || false}
                                                                disabled
                                                            />
                                                            <span className="text-sm">Manage integrations</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <DialogFooter>
                                    <Button variant="outline" onClick={closeViewModal}>
                                        Close
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}