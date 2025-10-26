"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Search, Mail, Phone, Calendar, Clock, CheckCircle, Edit2, Trash2, UserPlus } from "lucide-react"
import { useBusiness } from '@/lib/contexts/business-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Mock data - replace with real data from hooks
const mockStaff = [
    {
        id: '1',
        name: 'Mike Thompson',
        email: 'mike@business.com',
        phone: '+27 82 123 4567',
        role: 'Senior Detailer',
        specialties: ['Premium Detail', 'Paint Correction', 'Ceramic Coating'],
        availability: {
            monday: { start: '08:00', end: '17:00', available: true },
            tuesday: { start: '08:00', end: '17:00', available: true },
            wednesday: { start: '08:00', end: '17:00', available: true },
            thursday: { start: '08:00', end: '17:00', available: true },
            friday: { start: '08:00', end: '17:00', available: true },
            saturday: { start: '09:00', end: '14:00', available: true },
            sunday: { start: null, end: null, available: false }
        },
        active: true,
        hire_date: '2023-03-15',
        total_bookings: 147,
        completed_bookings: 142,
        rating: 4.8,
        profile_image: null
    },
    {
        id: '2',
        name: 'David Lee',
        email: 'david@business.com',
        phone: '+27 83 456 7890',
        role: 'Car Wash Specialist',
        specialties: ['Basic Wash', 'Interior Cleaning', 'Engine Bay'],
        availability: {
            monday: { start: '07:00', end: '16:00', available: true },
            tuesday: { start: '07:00', end: '16:00', available: true },
            wednesday: { start: '07:00', end: '16:00', available: true },
            thursday: { start: '07:00', end: '16:00', available: true },
            friday: { start: '07:00', end: '16:00', available: true },
            saturday: { start: '08:00', end: '13:00', available: true },
            sunday: { start: null, end: null, available: false }
        },
        active: true,
        hire_date: '2023-06-01',
        total_bookings: 89,
        completed_bookings: 85,
        rating: 4.6,
        profile_image: null
    },
    {
        id: '3',
        name: 'Sarah Adams',
        email: 'sarah@business.com',
        phone: '+27 84 789 0123',
        role: 'Detail Specialist',
        specialties: ['Interior Detail', 'Leather Treatment', 'Upholstery Cleaning'],
        availability: {
            monday: { start: '09:00', end: '18:00', available: true },
            tuesday: { start: '09:00', end: '18:00', available: true },
            wednesday: { start: null, end: null, available: false },
            thursday: { start: '09:00', end: '18:00', available: true },
            friday: { start: '09:00', end: '18:00', available: true },
            saturday: { start: '10:00', end: '15:00', available: true },
            sunday: { start: '10:00', end: '15:00', available: true }
        },
        active: true,
        hire_date: '2023-08-20',
        total_bookings: 56,
        completed_bookings: 54,
        rating: 4.9,
        profile_image: null
    },
    {
        id: '4',
        name: 'James Wilson',
        email: 'james@business.com',
        phone: '+27 85 234 5678',
        role: 'Junior Detailer',
        specialties: ['Basic Wash', 'Waxing'],
        availability: {
            monday: { start: '08:00', end: '17:00', available: true },
            tuesday: { start: '08:00', end: '17:00', available: true },
            wednesday: { start: '08:00', end: '17:00', available: true },
            thursday: { start: '08:00', end: '17:00', available: true },
            friday: { start: '08:00', end: '17:00', available: true },
            saturday: { start: null, end: null, available: false },
            sunday: { start: null, end: null, available: false }
        },
        active: false,
        hire_date: '2024-01-10',
        total_bookings: 23,
        completed_bookings: 21,
        rating: 4.3,
        profile_image: null
    }
]

const mockTodaySchedule = [
    { staff_id: '1', staff_name: 'Mike Thompson', booking_time: '09:00', service: 'Full Car Wash & Wax', customer: 'Sarah Johnson' },
    { staff_id: '1', staff_name: 'Mike Thompson', booking_time: '14:00', service: 'Interior Deep Clean', customer: 'Maria Garcia' },
    { staff_id: '2', staff_name: 'David Lee', booking_time: '11:30', service: 'Basic Wash', customer: 'James Wilson' },
    { staff_id: '3', staff_name: 'Sarah Adams', booking_time: '08:30', service: 'Premium Detail', customer: 'John Davis' }
]

export default function StaffPage() {
    const { currentBusiness } = useBusiness()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [staff] = useState(mockStaff)
    const [activeTab, setActiveTab] = useState('list')

    // Only show this page for service businesses
    useEffect(() => {
        const categoryId = currentBusiness?.business_categories?.id
        if (currentBusiness && categoryId && !['service', 'car_wash', 'salon'].includes(categoryId)) {
            router.push('/admin')
        }
    }, [currentBusiness, router])

    const categoryId = currentBusiness?.business_categories?.id
    if (!currentBusiness || !categoryId || !['service', 'car_wash', 'salon'].includes(categoryId)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-stone-800 mb-4">Staff Management for Services Only</h2>
                    <p className="text-stone-600">This page is only available for service businesses.</p>
                </div>
            </div>
        )
    }

    // Filter staff based on search and filters
    const filteredStaff = staff.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.role.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = selectedRole === 'all' || member.role.toLowerCase().includes(selectedRole.toLowerCase())
        const matchesStatus = statusFilter === 'all' ||
                            (statusFilter === 'active' && member.active) ||
                            (statusFilter === 'inactive' && !member.active)
        
        return matchesSearch && matchesRole && matchesStatus
    })

    // Calculate stats
    const stats = {
        total: staff.length,
        active: staff.filter(s => s.active).length,
        on_shift: staff.filter(s => s.active && getTodayAvailability(s)).length,
        total_bookings_today: mockTodaySchedule.length,
        average_rating: (staff.reduce((sum, s) => sum + s.rating, 0) / staff.length).toFixed(1)
    }

    function getTodayAvailability(staffMember: typeof mockStaff[0]) {
        const today = new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase() as keyof typeof staffMember.availability
        return staffMember.availability[today]?.available || false
    }

    function getInitials(name: string) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const formatTime = (time: string) => {
        return new Date(`2024-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-stone-200/50 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
                                {currentBusiness.name} - Staff Management
                            </h1>
                            <p className="text-stone-600 text-sm">Manage your team members and their schedules</p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex gap-3">
                            <Link href="/admin/staff/schedule">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    View Schedule
                                </Button>
                            </Link>
                            <Link href="/admin/staff/add">
                                <Button className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    Add Staff Member
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-blue-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Total Staff</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Active</p>
                                    <p className="text-2xl font-bold">{stats.active}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <Clock className="h-8 w-8 text-amber-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">On Shift Today</p>
                                    <p className="text-2xl font-bold">{stats.on_shift}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <Calendar className="h-8 w-8 text-purple-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Today&apos;s Bookings</p>
                                    <p className="text-2xl font-bold">{stats.total_bookings_today}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                                    <p className="text-2xl font-bold">{stats.average_rating}★</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="list">Staff List</TabsTrigger>
                        <TabsTrigger value="schedule">Today&apos;s Schedule</TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-6">
                        {/* Filters */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <Label htmlFor="search">Search Staff</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                id="search"
                                                placeholder="Search by name, email, or role..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="role">Role</Label>
                                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                                            <SelectTrigger className="w-[160px]">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Roles</SelectItem>
                                                <SelectItem value="senior">Senior</SelectItem>
                                                <SelectItem value="specialist">Specialist</SelectItem>
                                                <SelectItem value="junior">Junior</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Staff List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
                                <CardDescription>
                                    Manage your team members and their information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {filteredStaff.map((member) => {
                                        const isAvailableToday = getTodayAvailability(member)
                                        const todayBookings = mockTodaySchedule.filter(b => b.staff_id === member.id)
                                        
                                        return (
                                            <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        {/* Avatar */}
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage src={member.profile_image || undefined} />
                                                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                                        </Avatar>
                                                        
                                                        {/* Staff Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <h3 className="text-lg font-semibold text-gray-900">
                                                                    {member.name}
                                                                </h3>
                                                                <Badge variant={member.active ? "default" : "secondary"}>
                                                                    {member.active ? "Active" : "Inactive"}
                                                                </Badge>
                                                                {isAvailableToday && member.active && (
                                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                        On Shift
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-600 mb-1">
                                                                {member.role} • Hired {new Date(member.hire_date).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                                <div className="flex items-center space-x-1">
                                                                    <Mail className="w-3 h-3" />
                                                                    <span>{member.email}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <Phone className="w-3 h-3" />
                                                                    <span>{member.phone}</span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                {member.specialties.map((specialty, index) => (
                                                                    <Badge key={index} variant="outline" className="text-xs">
                                                                        {specialty}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Stats & Actions */}
                                                    <div className="flex items-center space-x-6">
                                                        <div className="text-center">
                                                            <div className="text-lg font-semibold">{member.completed_bookings}</div>
                                                            <div className="text-xs text-gray-500">Completed</div>
                                                        </div>
                                                        
                                                        <div className="text-center">
                                                            <div className="text-lg font-semibold">{member.rating}★</div>
                                                            <div className="text-xs text-gray-500">Rating</div>
                                                        </div>
                                                        
                                                        <div className="text-center">
                                                            <div className="text-lg font-semibold">{todayBookings.length}</div>
                                                            <div className="text-xs text-gray-500">Today</div>
                                                        </div>
                                                        
                                                        <div className="flex items-center space-x-2">
                                                            <Link href={`/admin/staff/${member.id}`}>
                                                                <Button variant="outline" size="sm">
                                                                    <Edit2 className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    
                                    {filteredStaff.length === 0 && (
                                        <div className="text-center py-12">
                                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {searchTerm || selectedRole !== 'all' || statusFilter !== 'all'
                                                    ? 'Try adjusting your search or filters.'
                                                    : 'Get started by adding your first staff member.'
                                                }
                                            </p>
                                            {(!searchTerm && selectedRole === 'all' && statusFilter === 'all') && (
                                                <div className="mt-6">
                                                    <Link href="/admin/staff/add">
                                                        <Button>
                                                            <UserPlus className="w-4 h-4 mr-2" />
                                                            Add Staff Member
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="schedule" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Today&apos;s Schedule</CardTitle>
                                <CardDescription>
                                    View today&apos;s staff assignments and bookings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockTodaySchedule.map((booking, index) => (
                                        <div key={index} className="flex items-center justify-between border rounded-lg p-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-center min-w-[60px]">
                                                    <div className="text-lg font-semibold">
                                                        {formatTime(booking.booking_time)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{booking.staff_name}</h3>
                                                    <p className="text-sm text-gray-600">{booking.service}</p>
                                                    <p className="text-xs text-gray-500">Customer: {booking.customer}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline">
                                                Scheduled
                                            </Badge>
                                        </div>
                                    ))}
                                    
                                    {mockTodaySchedule.length === 0 && (
                                        <div className="text-center py-8">
                                            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings scheduled for today</h3>
                                            <p className="mt-1 text-sm text-gray-500">Staff members are available for walk-ins or new bookings.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}