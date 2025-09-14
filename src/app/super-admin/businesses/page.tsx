"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Shield,
  FileText,
  Building2,
  RefreshCw
} from "lucide-react"
import { useBusinesses, Business } from "@/lib/hooks/use-businesses"

export default function BusinessesManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

  const {
    businesses,
    loading,
    error,
    stats,
    refetch,
    getStatusBadge,
    formatLocation,
    formatAddress
  } = useBusinesses({ searchTerm, statusFilter, categoryFilter })

  const getStatusBadgeComponent = (business: Business) => {
    const badge = getStatusBadge(business)
    const IconComponent = {
      'CheckCircle': CheckCircle,
      'XCircle': XCircle,
      'Clock': Clock
    }[badge.icon] || Clock

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
          <h1 className="text-3xl font-bold text-slate-900">Business Management</h1>
          <p className="text-slate-600 mt-1">Loading businesses...</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Business Management</h1>
          <p className="text-slate-600 mt-1">Error loading businesses</p>
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
        <h1 className="text-3xl font-bold text-slate-900">Business Management</h1>
        <p className="text-slate-600 mt-1">Manage and monitor all businesses on the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Total Businesses</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Active</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Verified</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.verified}</p>
              </div>
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Setup Complete</p>
                <p className="text-3xl font-bold text-purple-600">{stats.setupComplete}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
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
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="setup_complete">Setup Complete</SelectItem>
                <SelectItem value="setup_incomplete">Setup Incomplete</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food">Food & Restaurant</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="car_wash">Car Wash</SelectItem>
                <SelectItem value="salon">Salon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Business List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Businesses ({businesses.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {businesses.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No businesses found</p>
              <p className="text-slate-500 text-sm mt-2">
                {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Businesses will appear here once applications are approved"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {businesses.map((business) => (
                <div key={business.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{business.name}</h3>
                        {getStatusBadgeComponent(business)}
                        <Badge variant="outline">{business.category_id || 'Uncategorized'}</Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {business.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {business.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {formatLocation(business)}
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Created {new Date(business.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {business.description && (
                        <p className="text-sm text-slate-700 mb-3">{business.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Setup: {business.setup_completed ? '✓ Complete' : '○ Incomplete'}</span>
                        <span>Users: {business.business_users?.length || 0}</span>
                        <span>Slug: {business.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBusiness(business)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Business Details</DialogTitle>
                          </DialogHeader>
                          {selectedBusiness && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">{selectedBusiness.name}</h4>
                                <p className="text-sm text-slate-600">{selectedBusiness.description || 'No description provided'}</p>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <label className="font-medium">Contact Information</label>
                                  <div className="mt-1 space-y-1">
                                    <div>Email: {selectedBusiness.email}</div>
                                    <div>Phone: {selectedBusiness.phone}</div>
                                  </div>
                                </div>

                                <div>
                                  <label className="font-medium">Address</label>
                                  <div className="mt-1">
                                    <div className="text-slate-600">{formatAddress(selectedBusiness)}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <label className="font-medium">Status</label>
                                  <div className="mt-1">
                                    {getStatusBadgeComponent(selectedBusiness)}
                                  </div>
                                </div>
                                <div>
                                  <label className="font-medium">Category</label>
                                  <div className="mt-1">{selectedBusiness.category_id || 'Uncategorized'}</div>
                                </div>
                                <div>
                                  <label className="font-medium">Setup</label>
                                  <div className="mt-1">{selectedBusiness.setup_completed ? 'Complete' : 'Incomplete'}</div>
                                </div>
                              </div>

                              <div>
                                <label className="font-medium">Business Users</label>
                                <div className="mt-2">
                                  {selectedBusiness.business_users?.length ? (
                                    <div className="space-y-1">
                                      {selectedBusiness.business_users.map((user, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                                          <span>User ID: {user.user_id}</span>
                                          <div className="flex gap-2">
                                            <Badge variant="outline">{user.role}</Badge>
                                            <Badge variant={user.is_active ? "default" : "secondary"}>
                                              {user.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-slate-500 text-sm">No users assigned</p>
                                  )}
                                </div>
                              </div>

                              <div className="text-xs text-slate-500 border-t pt-4">
                                <div>Created: {new Date(selectedBusiness.created_at).toLocaleString()}</div>
                                <div>Updated: {new Date(selectedBusiness.updated_at).toLocaleString()}</div>
                                <div>ID: {selectedBusiness.id}</div>
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