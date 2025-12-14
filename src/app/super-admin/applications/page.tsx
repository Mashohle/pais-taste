"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2,
  User,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Loader2
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
import { useSuperAdminApplications, type BusinessApplication } from '@/lib/hooks/super-admin'
import { useToast } from '@/hooks/use-toast'

export default function BusinessApplicationsPage() {
  const { applications, loading, error, approveApplication, rejectApplication } = useSuperAdminApplications()
  const [selectedApplication, setSelectedApplication] = useState<BusinessApplication | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  // Filter applications
  const filteredApplications = useMemo(() => {
    let filtered = applications

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(app =>
        app.business_name.toLowerCase().includes(query) ||
        app.owner_email.toLowerCase().includes(query) ||
        `${app.owner_first_name} ${app.owner_last_name}`.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [applications, statusFilter, searchQuery])

  const handleApprove = async (applicationId: string) => {
    if (!approvalNotes.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please add approval notes before approving."
      })
      return
    }

    setActionLoading(true)
    const result = await approveApplication(applicationId, approvalNotes)

    if (result.success) {
      toast({
        title: "Application Approved",
        description: result.data?.email_sent
          ? "Business approved and welcome email sent successfully!"
          : "Business approved successfully!",
      })
      setDialogOpen(false)
      setSelectedApplication(null)
      setApprovalNotes('')
    } else {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: result.error || "Failed to approve application"
      })
    }
    setActionLoading(false)
  }

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide a rejection reason."
      })
      return
    }

    setActionLoading(true)
    const result = await rejectApplication(applicationId, rejectionReason)

    if (result.success) {
      toast({
        title: "Application Rejected",
        description: "Business application has been rejected."
      })
      setDialogOpen(false)
      setSelectedApplication(null)
      setRejectionReason('')
    } else {
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: result.error || "Failed to reject application"
      })
    }
    setActionLoading(false)
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-stone-600 mx-auto mb-4" />
          <p className="text-stone-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Failed to Load Applications</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-stone-600 hover:bg-stone-700">
            Reload Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Business Applications</h1>
          <p className="text-stone-600 mt-1">Review and manage business partnership applications</p>
        </div>
        <Badge variant="outline" className="text-stone-600">
          {filteredApplications.length} applications
        </Badge>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
                <Input
                  placeholder="Search by business name, owner name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
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
              <Building2 className="w-12 h-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">No applications found</h3>
              <p className="text-stone-600">
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
                    <div className="flex items-center flex-wrap gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-stone-900">
                        {application.business_name}
                      </h3>
                      <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-stone-600">
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
                      <div className="flex items-center space-x-2 mt-2 text-sm text-stone-600">
                        <MapPin className="w-4 h-4" />
                        <span>{application.city}, {application.province}</span>
                      </div>
                    )}
                  </div>

                  <Dialog open={dialogOpen && selectedApplication?.id === application.id} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) {
                      setSelectedApplication(null)
                      setApprovalNotes('')
                      setRejectionReason('')
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(application)
                          setDialogOpen(true)
                        }}
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
                              <CardContent className="p-4 space-y-3">
                                <h4 className="font-semibold text-stone-900 mb-3">Business Information</h4>
                                <div>
                                  <label className="text-sm font-medium text-stone-700">Business Name</label>
                                  <p className="text-stone-900">{selectedApplication.business_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-stone-700">Category</label>
                                  <p className="text-stone-900 capitalize">{selectedApplication.business_category}</p>
                                </div>
                                {selectedApplication.description && (
                                  <div>
                                    <label className="text-sm font-medium text-stone-700">Description</label>
                                    <p className="text-stone-900">{selectedApplication.description}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="p-4 space-y-3">
                                <h4 className="font-semibold text-stone-900 mb-3">Owner Details</h4>
                                <div>
                                  <label className="text-sm font-medium text-stone-700">Full Name</label>
                                  <p className="text-stone-900">{selectedApplication.owner_first_name} {selectedApplication.owner_last_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-stone-700">Email</label>
                                  <p className="text-stone-900">{selectedApplication.owner_email}</p>
                                </div>
                                {selectedApplication.owner_phone && (
                                  <div>
                                    <label className="text-sm font-medium text-stone-700">Phone</label>
                                    <p className="text-stone-900">{selectedApplication.owner_phone}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>

                          {/* Location */}
                          <Card>
                            <CardContent className="p-4 space-y-3">
                              <h4 className="font-semibold text-stone-900 mb-3">Business Location</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedApplication.street_address && (
                                  <div>
                                    <label className="text-sm font-medium text-stone-700">Address</label>
                                    <p className="text-stone-900">
                                      {selectedApplication.street_address}
                                      {selectedApplication.suburb && `, ${selectedApplication.suburb}`}
                                    </p>
                                  </div>
                                )}
                                {selectedApplication.city && (
                                  <div>
                                    <label className="text-sm font-medium text-stone-700">City & Province</label>
                                    <p className="text-stone-900">{selectedApplication.city}, {selectedApplication.province}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Action Buttons */}
                          {selectedApplication.status === 'pending' && (
                            <div className="flex flex-col space-y-4 pt-4 border-t">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-700">Approval Notes *</label>
                                <Textarea
                                  placeholder="Add notes about this approval..."
                                  value={approvalNotes}
                                  onChange={(e) => setApprovalNotes(e.target.value)}
                                  className="min-h-20"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-700">Rejection Reason (if rejecting)</label>
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
                                  {actionLoading ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Approving...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve Application
                                    </>
                                  )}
                                </Button>

                                <Button
                                  variant="destructive"
                                  onClick={() => handleReject(selectedApplication.id)}
                                  disabled={actionLoading || !rejectionReason.trim()}
                                >
                                  {actionLoading ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Rejecting...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject Application
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}

                          {selectedApplication.status !== 'pending' && (
                            <div className="pt-4 border-t">
                              <p className="text-sm text-stone-600">
                                This application has already been {selectedApplication.status}.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
