"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Calendar,
  AlertTriangle
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BusinessApplication {
  id: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  business_name: string
  business_category: string
  business_type?: string
  description?: string
  owner_first_name: string
  owner_last_name: string
  owner_email: string
  owner_phone?: string
  owner_id_number?: string
  street_address?: string
  suburb?: string
  city?: string
  province?: string
  postal_code?: string
  registration_number?: string
  tax_number?: string
  bank_name?: string
  account_number?: string
  branch_code?: string
  operating_hours: Record<string, any>
  documents: any[]
  agree_to_terms: boolean
  agree_to_commission: boolean
  reviewed_by?: string
  reviewed_at?: string
  approval_notes?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export default function BusinessApplicationsPage() {
  const [applications, setApplications] = useState<BusinessApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<BusinessApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<BusinessApplication | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
        setFilteredApplications(data)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    let filtered = applications

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.owner_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${app.owner_first_name} ${app.owner_last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredApplications(filtered)
  }, [applications, statusFilter, searchQuery])

  const handleApprove = async (applicationId: string) => {
    if (!approvalNotes.trim()) {
      alert('Please add approval notes')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approval_notes: approvalNotes
        })
      })

      if (response.ok) {
        await fetchApplications()
        setSelectedApplication(null)
        setApprovalNotes('')
        alert('Application approved successfully!')
      } else {
        throw new Error('Failed to approve application')
      }
    } catch (error) {
      console.error('Error approving application:', error)
      alert('Failed to approve application')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejection_reason: rejectionReason
        })
      })

      if (response.ok) {
        await fetchApplications()
        setSelectedApplication(null)
        setRejectionReason('')
        alert('Application rejected')
      } else {
        throw new Error('Failed to reject application')
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      alert('Failed to reject application')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'under_review': return <Eye className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Business Applications</h1>
          <p className="text-slate-600 mt-1">Review and manage business partnership applications</p>
        </div>
        <Badge variant="outline" className="text-slate-600">
          {filteredApplications.length} applications
        </Badge>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by business name, owner name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No applications found</h3>
              <p className="text-slate-600">
                {statusFilter !== 'all' 
                  ? `No applications with status "${statusFilter}" found.`
                  : 'There are no business applications to review at this time.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {application.business_name}
                      </h3>
                      <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{application.owner_first_name} {application.owner_last_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{application.owner_email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4" />
                        <span className="capitalize">{application.business_category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(application.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {application.city && (
                      <div className="flex items-center space-x-2 mt-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{application.city}, {application.province}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <Building2 className="w-5 h-5" />
                            <span>Review Application: {selectedApplication?.business_name}</span>
                          </DialogTitle>
                        </DialogHeader>
                        
                        {selectedApplication && (
                          <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Business Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium text-slate-700">Business Name</label>
                                    <p className="text-slate-900">{selectedApplication.business_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-700">Category</label>
                                    <p className="text-slate-900 capitalize">{selectedApplication.business_category}</p>
                                  </div>
                                  {selectedApplication.business_type && (
                                    <div>
                                      <label className="text-sm font-medium text-slate-700">Type</label>
                                      <p className="text-slate-900">{selectedApplication.business_type}</p>
                                    </div>
                                  )}
                                  {selectedApplication.description && (
                                    <div>
                                      <label className="text-sm font-medium text-slate-700">Description</label>
                                      <p className="text-slate-900">{selectedApplication.description}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Owner Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                                    <p className="text-slate-900">{selectedApplication.owner_first_name} {selectedApplication.owner_last_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-700">Email</label>
                                    <p className="text-slate-900">{selectedApplication.owner_email}</p>
                                  </div>
                                  {selectedApplication.owner_phone && (
                                    <div>
                                      <label className="text-sm font-medium text-slate-700">Phone</label>
                                      <p className="text-slate-900">{selectedApplication.owner_phone}</p>
                                    </div>
                                  )}
                                  {selectedApplication.owner_id_number && (
                                    <div>
                                      <label className="text-sm font-medium text-slate-700">ID Number</label>
                                      <p className="text-slate-900">{selectedApplication.owner_id_number}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                            
                            {/* Location and Banking */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Business Location</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  {selectedApplication.street_address && (
                                    <div>
                                      <label className="text-sm font-medium text-slate-700">Address</label>
                                      <p className="text-slate-900">
                                        {selectedApplication.street_address}
                                        {selectedApplication.suburb && `, ${selectedApplication.suburb}`}
                                      </p>
                                    </div>
                                  )}
                                  {selectedApplication.city && (
                                    <div>
                                      <label className="text-sm font-medium text-slate-700">City & Province</label>
                                      <p className="text-slate-900">{selectedApplication.city}, {selectedApplication.province}</p>
                                    </div>
                                  )}
                                  {selectedApplication.postal_code && (
                                    <div>
                                      <label className="text-sm font-medium text-slate-700">Postal Code</label>
                                      <p className="text-slate-900">{selectedApplication.postal_code}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Banking & Registration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  {selectedApplication.bank_name && (
                                    <div>
                                      <label className="text-sm font-medium text-slate-700">Bank</label>
                                      <p className="text-slate-900">{selectedApplication.bank_name}</p>
                                    </div>
                                  )}
                                  {selectedApplication.registration_number && (
                                    <div>
                                      <label className="text-sm font-medium text-slate-700">Registration Number</label>
                                      <p className="text-slate-900">{selectedApplication.registration_number}</p>
                                    </div>
                                  )}
                                  {selectedApplication.tax_number && (
                                    <div>
                                      <label className="text-sm font-medium text-slate-700">Tax Number</label>
                                      <p className="text-slate-900">{selectedApplication.tax_number}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                            
                            {/* Action Buttons */}
                            {selectedApplication.status === 'pending' && (
                              <div className="flex flex-col space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-slate-700">Approval Notes</label>
                                  <Textarea
                                    placeholder="Add notes about this approval..."
                                    value={approvalNotes}
                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                    className="min-h-20"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-slate-700">Rejection Reason (if rejecting)</label>
                                  <Textarea
                                    placeholder="Explain why this application is being rejected..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="min-h-20"
                                  />
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  <Button
                                    onClick={() => handleApprove(selectedApplication.id)}
                                    disabled={actionLoading || !approvalNotes.trim()}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {actionLoading ? 'Approving...' : 'Approve Application'}
                                  </Button>
                                  
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleReject(selectedApplication.id)}
                                    disabled={actionLoading || !rejectionReason.trim()}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {actionLoading ? 'Rejecting...' : 'Reject Application'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}