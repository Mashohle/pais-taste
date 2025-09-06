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
  Filter, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  TrendingUp,
  AlertTriangle,
  MoreHorizontal,
  Building2,
  Users,
  DollarSign,
  MessageSquare,
  Shield,
  FileText,
  Calendar,
  Ban,
  RefreshCw
} from "lucide-react"

export default function BusinessesManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedBusiness, setSelectedBusiness] = useState<typeof businesses[0] | null>(null)
  const [showDisputes, setShowDisputes] = useState(false)
  const [showAuditLog, setShowAuditLog] = useState(false)

  // Mock business data - in real app would fetch from API
  const businesses = [
    {
      id: 'bus_1',
      name: 'Mama Zulu&apos;s Kitchen',
      category: 'Food & Restaurant',
      owner: 'Sarah Zulu',
      email: 'sarah@mamazulu.co.za',
      phone: '+27 83 123 4567',
      location: 'Soweto, Johannesburg',
      status: 'pending',
      appliedDate: '2024-09-05',
      description: 'Authentic traditional South African cuisine with modern presentation',
      revenue: 0,
      orders: 0,
      rating: 0,
      documents: ['business_license.pdf', 'tax_clearance.pdf', 'id_document.pdf'],
      verificationStatus: {
        businessLicense: 'verified',
        taxClearance: 'verified', 
        identityDocument: 'verified',
        bankDetails: 'pending'
      }
    },
    {
      id: 'bus_2',
      name: 'Tech Repair Hub',
      category: 'Services',
      owner: 'Michael Chen',
      email: 'mike@techrepair.co.za',
      phone: '+27 84 987 6543',
      location: 'Cape Town Central',
      status: 'pending',
      appliedDate: '2024-09-04',
      description: 'Professional electronics and smartphone repair services',
      revenue: 0,
      orders: 0,
      rating: 0,
      documents: ['business_license.pdf', 'certifications.pdf'],
      verificationStatus: {
        businessLicense: 'verified',
        taxClearance: 'pending',
        identityDocument: 'verified',
        bankDetails: 'verified'
      }
    },
    {
      id: 'bus_3',
      name: 'Artisan Coffee Co',
      category: 'Food & Restaurant',
      owner: 'Emma Williams',
      email: 'emma@artisancoffee.co.za',
      phone: '+27 82 555 7890',
      location: 'Durban North',
      status: 'pending',
      appliedDate: '2024-09-03',
      description: 'Specialty coffee roastery and cafe with locally sourced beans',
      revenue: 0,
      orders: 0,
      rating: 0,
      documents: ['business_license.pdf', 'food_safety_cert.pdf'],
      verificationStatus: {
        businessLicense: 'verified',
        taxClearance: 'verified',
        identityDocument: 'verified',
        bankDetails: 'pending'
      }
    },
    {
      id: 'bus_4',
      name: 'Pai&apos;s Taste Food Special',
      category: 'Food & Restaurant',
      owner: 'Patience Mthembu',
      email: 'info@paistaste.co.za',
      phone: '+27 81 454 1020',
      location: 'Montana, Pretoria',
      status: 'active',
      appliedDate: '2024-08-15',
      approvedDate: '2024-08-18',
      description: 'Traditional South African food with authentic flavors',
      revenue: 154200,
      orders: 234,
      rating: 4.8,
      documents: ['business_license.pdf', 'tax_clearance.pdf', 'food_safety_cert.pdf'],
      verificationStatus: {
        businessLicense: 'verified',
        taxClearance: 'verified',
        identityDocument: 'verified',
        bankDetails: 'verified'
      }
    },
    {
      id: 'bus_5',
      name: 'Urban Streetwear',
      category: 'Retail',
      owner: 'David Ndaba',
      email: 'david@urbanwear.co.za',
      phone: '+27 85 321 9876',
      location: 'Sandton, Johannesburg',
      status: 'active',
      appliedDate: '2024-07-20',
      approvedDate: '2024-07-22',
      description: 'Trendy urban fashion and streetwear for young professionals',
      revenue: 128300,
      orders: 189,
      rating: 4.6,
      documents: ['business_license.pdf', 'tax_clearance.pdf'],
      verificationStatus: {
        businessLicense: 'verified',
        taxClearance: 'verified',
        identityDocument: 'verified',
        bankDetails: 'verified'
      }
    },
    {
      id: 'bus_6',
      name: 'Quick Fix Auto',
      category: 'Services',
      owner: 'James Morrison',
      email: 'james@quickfix.co.za',
      phone: '+27 86 654 3210',
      location: 'East London',
      status: 'suspended',
      appliedDate: '2024-06-10',
      approvedDate: '2024-06-15',
      suspendedDate: '2024-09-01',
      suspensionReason: 'Multiple customer complaints regarding service quality',
      description: 'Automotive repair and maintenance services',
      revenue: 84500,
      orders: 156,
      rating: 3.2,
      documents: ['business_license.pdf', 'insurance_cert.pdf'],
      verificationStatus: {
        businessLicense: 'verified',
        taxClearance: 'verified',
        identityDocument: 'verified',
        bankDetails: 'verified'
      }
    }
  ]

  // Mock dispute data
  const disputes = [
    {
      id: 'disp_1',
      businessId: 'bus_4',
      businessName: 'Pai&apos;s Taste Food Special',
      customer: 'John Doe',
      orderId: 'ORD-2024-001',
      type: 'refund_request',
      reason: 'Food delivered cold and incorrect order items',
      amount: 'R285.50',
      status: 'open',
      createdDate: '2024-09-05',
      priority: 'medium'
    },
    {
      id: 'disp_2',
      businessId: 'bus_6',
      businessName: 'Quick Fix Auto',
      customer: 'Sarah Wilson',
      orderId: 'ORD-2024-002',
      type: 'service_complaint',
      reason: 'Car developed additional problems after service',
      amount: 'R1,250.00',
      status: 'escalated',
      createdDate: '2024-09-03',
      priority: 'high'
    },
    {
      id: 'disp_3',
      businessId: 'bus_5',
      businessName: 'Urban Streetwear',
      customer: 'Mike Chen',
      orderId: 'ORD-2024-003',
      type: 'product_issue',
      reason: 'Received damaged merchandise, wrong size',
      amount: 'R580.00',
      status: 'resolved',
      createdDate: '2024-09-01',
      resolvedDate: '2024-09-02',
      priority: 'low'
    }
  ]

  // Mock audit log
  const auditLog = [
    {
      id: 'audit_1',
      action: 'business_suspended',
      businessName: 'Quick Fix Auto',
      performedBy: 'Admin Sarah Johnson',
      reason: 'Multiple customer complaints',
      timestamp: '2024-09-01 14:30:22',
      details: 'Suspended due to repeated service quality issues'
    },
    {
      id: 'audit_2',
      action: 'business_approved',
      businessName: 'Pai&apos;s Taste Food Special',
      performedBy: 'Admin Mike Roberts',
      reason: 'All documents verified',
      timestamp: '2024-08-18 09:15:10',
      details: 'Business approved after successful document verification'
    },
    {
      id: 'audit_3',
      action: 'dispute_resolved',
      businessName: 'Urban Streetwear',
      performedBy: 'Admin Lisa Parker',
      reason: 'Refund processed',
      timestamp: '2024-09-02 16:45:33',
      details: 'Dispute resolved in favor of customer, full refund issued'
    },
    {
      id: 'audit_4',
      action: 'business_warning_issued',
      businessName: 'Tech Repair Hub',
      performedBy: 'Admin David Kim',
      reason: 'Late order fulfillment',
      timestamp: '2024-09-04 11:20:15',
      details: 'Warning issued for consistently late order deliveries'
    }
  ]

  const filteredBusinesses = businesses.filter(business => {
    if (searchTerm && !business.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !business.owner.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !business.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (statusFilter !== "all" && business.status !== statusFilter) return false
    if (categoryFilter !== "all" && business.category !== categoryFilter) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'rejected': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const handleApprove = (businessId: string) => {
    // In real app, would call API to approve business
    console.log('Approving business:', businessId)
    alert('Business approved successfully!')
  }

  const handleReject = (businessId: string) => {
    // In real app, would call API to reject business
    console.log('Rejecting business:', businessId)
    alert('Business rejected. Notification sent to owner.')
  }

  const handleSuspend = (businessId: string) => {
    // In real app, would call API to suspend business
    console.log('Suspending business:', businessId)
    alert('Business suspended. Access revoked.')
  }

  const handleReactivate = (businessId: string) => {
    // In real app, would call API to reactivate business
    console.log('Reactivating business:', businessId)
    alert('Business reactivated successfully!')
  }

  const handleResolveDispute = (disputeId: string, resolution: string) => {
    // In real app, would call API to resolve dispute
    console.log('Resolving dispute:', disputeId, resolution)
    alert(`Dispute resolved: ${resolution}`)
  }

  const getDisputeStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800'
      case 'escalated': return 'bg-red-100 text-red-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'business_approved': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'business_suspended': return <Ban className="w-4 h-4 text-red-600" />
      case 'dispute_resolved': return <MessageSquare className="w-4 h-4 text-blue-600" />
      case 'business_warning_issued': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const pendingCount = businesses.filter(b => b.status === 'pending').length
  const activeCount = businesses.filter(b => b.status === 'active').length
  const suspendedCount = businesses.filter(b => b.status === 'suspended').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Business Management</h1>
          <p className="text-slate-600 mt-1">Approve, manage, and monitor business accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant={showDisputes ? "default" : "outline"}
            onClick={() => {
              setShowDisputes(!showDisputes)
              setShowAuditLog(false)
            }}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Disputes ({disputes.filter(d => d.status !== 'resolved').length})
          </Button>
          <Button 
            variant={showAuditLog ? "default" : "outline"}
            onClick={() => {
              setShowAuditLog(!showAuditLog)
              setShowDisputes(false)
            }}
          >
            <Shield className="w-4 h-4 mr-2" />
            Audit Log
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Active Businesses</p>
                <p className="text-3xl font-bold text-green-600">{activeCount}</p>
              </div>
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Suspended</p>
                <p className="text-3xl font-bold text-red-600">{suspendedCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Businesses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <Input
                placeholder="Search businesses, owners, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Food & Restaurant">Food & Restaurant</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
              setCategoryFilter("all")
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Business List */}
      <Card>
        <CardHeader>
          <CardTitle>Businesses ({filteredBusinesses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBusinesses.map((business) => (
              <div key={business.id} className="p-6 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    {/* Basic Info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-slate-900">{business.name}</h3>
                          <Badge className={getStatusColor(business.status)}>
                            {business.status}
                          </Badge>
                          <Badge variant="outline">{business.category}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{business.description}</p>
                      </div>
                    </div>

                    {/* Owner & Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Users className="w-4 h-4" />
                        <span>{business.owner}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span>{business.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{business.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{business.location}</span>
                      </div>
                      {business.status === 'active' && (
                        <>
                          <div className="flex items-center space-x-2 text-slate-600">
                            <DollarSign className="w-4 h-4" />
                            <span>R{business.revenue?.toLocaleString('en-ZA')} revenue</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-600">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{business.rating} ({business.orders} orders)</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Verification Status for Pending Applications */}
                    {business.status === 'pending' && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-medium text-slate-900 mb-3">Document Verification</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center space-x-2">
                            {getVerificationIcon(business.verificationStatus.businessLicense)}
                            <span className="text-sm text-slate-700">Business License</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getVerificationIcon(business.verificationStatus.taxClearance)}
                            <span className="text-sm text-slate-700">Tax Clearance</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getVerificationIcon(business.verificationStatus.identityDocument)}
                            <span className="text-sm text-slate-700">ID Document</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getVerificationIcon(business.verificationStatus.bankDetails)}
                            <span className="text-sm text-slate-700">Bank Details</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Suspension Info */}
                    {business.status === 'suspended' && business.suspensionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-800">Suspended on {business.suspendedDate}</p>
                            <p className="text-sm text-red-700 mt-1">{business.suspensionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedBusiness(business)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{selectedBusiness?.name} - Details</DialogTitle>
                        </DialogHeader>
                        {selectedBusiness && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-slate-900">Business Information</h4>
                                <div className="space-y-2 mt-2 text-sm">
                                  <p><strong>Owner:</strong> {selectedBusiness.owner}</p>
                                  <p><strong>Email:</strong> {selectedBusiness.email}</p>
                                  <p><strong>Phone:</strong> {selectedBusiness.phone}</p>
                                  <p><strong>Location:</strong> {selectedBusiness.location}</p>
                                  <p><strong>Category:</strong> {selectedBusiness.category}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900">Performance</h4>
                                <div className="space-y-2 mt-2 text-sm">
                                  <p><strong>Status:</strong> <Badge className={getStatusColor(selectedBusiness.status)}>{selectedBusiness.status}</Badge></p>
                                  <p><strong>Applied:</strong> {selectedBusiness.appliedDate}</p>
                                  {selectedBusiness.approvedDate && <p><strong>Approved:</strong> {selectedBusiness.approvedDate}</p>}
                                  {selectedBusiness.status === 'active' && (
                                    <>
                                      <p><strong>Revenue:</strong> R{selectedBusiness.revenue?.toLocaleString('en-ZA')}</p>
                                      <p><strong>Orders:</strong> {selectedBusiness.orders}</p>
                                      <p><strong>Rating:</strong> {selectedBusiness.rating}/5</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">Description</h4>
                              <p className="text-sm text-slate-600 mt-2">{selectedBusiness.description}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">Documents</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {selectedBusiness.documents.map((doc, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {doc}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {business.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleApprove(business.id)} className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleReject(business.id)}>
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {business.status === 'active' && (
                      <Button variant="outline" size="sm" onClick={() => handleSuspend(business.id)} className="text-red-600 hover:text-red-700">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Suspend
                      </Button>
                    )}

                    {business.status === 'suspended' && (
                      <Button size="sm" onClick={() => handleReactivate(business.id)} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disputes Management */}
      {showDisputes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Active Disputes & Reports
              <Badge variant="outline" className="text-red-600">
                {disputes.filter(d => d.status !== 'resolved').length} Open
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {disputes.map((dispute) => (
                <div key={dispute.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-slate-900">{dispute.businessName}</h4>
                        <Badge className={getDisputeStatusColor(dispute.status)}>
                          {dispute.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(dispute.priority)}>
                          {dispute.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{dispute.type.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-slate-700">{dispute.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">{dispute.amount}</p>
                      <p className="text-xs text-slate-500">Order: {dispute.orderId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-slate-600">
                      <span>Customer: {dispute.customer}</span>
                      <span>•</span>
                      <span>Created: {dispute.createdDate}</span>
                      {dispute.resolvedDate && (
                        <>
                          <span>•</span>
                          <span>Resolved: {dispute.resolvedDate}</span>
                        </>
                      )}
                    </div>
                    
                    {dispute.status !== 'resolved' && (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Contact Business
                        </Button>
                        <Button size="sm" onClick={() => handleResolveDispute(dispute.id, 'refund_approved')}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log */}
      {showAuditLog && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              System Audit Log
              <Badge variant="outline" className="text-slate-600">
                <RefreshCw className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLog.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-slate-900">
                          {entry.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-sm text-slate-600">{entry.businessName}</p>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        <p>{entry.performedBy}</p>
                        <p>{entry.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-700 mb-1">
                        <strong>Reason:</strong> {entry.reason}
                      </p>
                      <p className="text-slate-600">
                        <strong>Details:</strong> {entry.details}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}