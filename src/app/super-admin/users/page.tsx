"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  Eye,
  RefreshCw,
  User,
  Crown,
  Building2,
  UserCog
} from "lucide-react"
import { useUsers, UserProfile } from "@/lib/hooks/use-users"

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)

  const {
    users,
    loading,
    error,
    stats,
    refetch,
    getRoleBadge,
    getDisplayName,
    isProfileComplete,
    formatJoinDate
  } = useUsers({ searchTerm, roleFilter, statusFilter })

  const getRoleBadgeComponent = (role: string) => {
    const badge = getRoleBadge(role)
    const IconComponent = {
      'Crown': Crown,
      'Building2': Building2,
      'UserCog': UserCog,
      'User': User
    }[badge.icon] || User

    return (
      <Badge variant={badge.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {badge.text}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">Loading users...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">Error loading users</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-1">Manage customer accounts and user profiles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Customers</p>
                <p className="text-3xl font-bold text-green-600">{stats.customers}</p>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Business Users</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.businessAdmins + stats.businessOwners}</p>
              </div>
              <Building2 className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Complete Profiles</p>
                <p className="text-3xl font-bold text-purple-600">{stats.completeProfiles}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Super Admins</p>
                <p className="text-2xl font-bold text-red-600">{stats.superAdmins}</p>
              </div>
              <Crown className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Marketing Opt-in</p>
                <p className="text-2xl font-bold text-green-600">{stats.marketingOptIn}</p>
              </div>
              <Mail className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Notifications Enabled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.notificationsEnabled}</p>
              </div>
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="business-admin">Business Admins</SelectItem>
                <SelectItem value="business-owner">Business Owners</SelectItem>
                <SelectItem value="super-admin">Super Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete_profile">Complete Profile</SelectItem>
                <SelectItem value="incomplete_profile">Incomplete Profile</SelectItem>
                <SelectItem value="marketing_enabled">Marketing Enabled</SelectItem>
                <SelectItem value="notifications_enabled">Notifications Enabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users ({users.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No users found</p>
              <p className="text-slate-500 text-sm mt-2">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Users will appear here as they sign up"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{getDisplayName(user)}</h3>
                        {getRoleBadgeComponent(user.role_id)}
                        <Badge variant={isProfileComplete(user) ? "default" : "outline"}>
                          {isProfileComplete(user) ? "Complete" : "Incomplete"}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {user.phone}
                          </div>
                        )}
                        {user.preferred_pickup_location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {user.preferred_pickup_location}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Joined {formatJoinDate(user.created_at)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Marketing: {user.marketing_emails ? '✓ Enabled' : '○ Disabled'}</span>
                        <span>SMS: {user.sms_notifications ? '✓ Enabled' : '○ Disabled'}</span>
                        {user.dietary_preferences && (
                          <span>Dietary: {user.dietary_preferences.length} preferences</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">{getDisplayName(selectedUser)}</h4>
                                <div className="flex items-center gap-2 mb-2">
                                  {getRoleBadgeComponent(selectedUser.role_id)}
                                  <Badge variant={isProfileComplete(selectedUser) ? "default" : "outline"}>
                                    {isProfileComplete(selectedUser) ? "Profile Complete" : "Profile Incomplete"}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <label className="font-medium">Contact Information</label>
                                  <div className="mt-1 space-y-1">
                                    <div>Email: {selectedUser.email}</div>
                                    {selectedUser.phone && <div>Phone: {selectedUser.phone}</div>}
                                    {selectedUser.preferred_pickup_location && (
                                      <div>Location: {selectedUser.preferred_pickup_location}</div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <label className="font-medium">Personal Information</label>
                                  <div className="mt-1 space-y-1">
                                    {selectedUser.date_of_birth && (
                                      <div>DOB: {new Date(selectedUser.date_of_birth).toLocaleDateString()}</div>
                                    )}
                                    {selectedUser.address && <div>Address: {selectedUser.address}</div>}
                                    {selectedUser.emergency_contact_name && (
                                      <div>Emergency: {selectedUser.emergency_contact_name}</div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <label className="font-medium">Communication Preferences</label>
                                  <div className="mt-1 space-y-1">
                                    <div>Marketing Emails: {selectedUser.marketing_emails ? '✓ Enabled' : '○ Disabled'}</div>
                                    <div>SMS Notifications: {selectedUser.sms_notifications ? '✓ Enabled' : '○ Disabled'}</div>
                                  </div>
                                </div>

                                <div>
                                  <label className="font-medium">Preferences</label>
                                  <div className="mt-1 space-y-1">
                                    {selectedUser.dietary_preferences?.length ? (
                                      <div>Dietary: {selectedUser.dietary_preferences.join(', ')}</div>
                                    ) : (
                                      <div>Dietary: None specified</div>
                                    )}
                                    {selectedUser.allergies?.length ? (
                                      <div>Allergies: {selectedUser.allergies.join(', ')}</div>
                                    ) : (
                                      <div>Allergies: None specified</div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-xs text-slate-500 border-t pt-4">
                                <div>Created: {new Date(selectedUser.created_at).toLocaleString()}</div>
                                <div>Updated: {new Date(selectedUser.updated_at).toLocaleString()}</div>
                                <div>ID: {selectedUser.id}</div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}