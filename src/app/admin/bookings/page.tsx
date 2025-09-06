"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, Phone, Mail, MapPin, Plus, Search, Filter, CheckCircle, Clock as ClockIcon, AlertTriangle, XCircle } from "lucide-react"
import { useBusiness } from '@/lib/contexts/business-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Mock data - replace with real data from hooks
const mockBookings = [
    {
        id: '1',
        customer_name: 'Sarah Johnson',
        customer_phone: '+27 82 123 4567',
        customer_email: 'sarah@email.com',
        service_name: 'Full Car Wash & Wax',
        staff_name: 'Mike Thompson',
        booking_date: '2024-01-15',
        booking_time: '09:00',
        duration_minutes: 90,
        price: 450.00,
        status: 'confirmed',
        notes: 'Customer requested extra attention to wheels',
        created_at: '2024-01-12T10:30:00Z'
    },
    {
        id: '2',
        customer_name: 'James Wilson',
        customer_phone: '+27 83 456 7890',
        customer_email: 'james@email.com',
        service_name: 'Basic Wash',
        staff_name: 'David Lee',
        booking_date: '2024-01-15',
        booking_time: '11:30',
        duration_minutes: 45,
        price: 180.00,
        status: 'in_progress',
        notes: '',
        created_at: '2024-01-14T14:15:00Z'
    },
    {
        id: '3',
        customer_name: 'Maria Garcia',
        customer_phone: '+27 84 789 0123',
        customer_email: 'maria@email.com',
        service_name: 'Interior Deep Clean',
        staff_name: 'Mike Thompson',
        booking_date: '2024-01-15',
        booking_time: '14:00',
        duration_minutes: 120,
        price: 350.00,
        status: 'scheduled',
        notes: 'Pet hair removal needed',
        created_at: '2024-01-13T16:45:00Z'
    },
    {
        id: '4',
        customer_name: 'John Davis',
        customer_phone: '+27 85 234 5678',
        customer_email: 'john@email.com',
        service_name: 'Premium Detail',
        staff_name: 'Sarah Adams',
        booking_date: '2024-01-16',
        booking_time: '08:30',
        duration_minutes: 180,
        price: 650.00,
        status: 'completed',
        notes: 'Very satisfied customer, requested regular booking',
        created_at: '2024-01-15T09:20:00Z'
    }
]

const mockServices = [
    { id: '1', name: 'Basic Wash', duration: 45, price: 180.00 },
    { id: '2', name: 'Full Car Wash & Wax', duration: 90, price: 450.00 },
    { id: '3', name: 'Interior Deep Clean', duration: 120, price: 350.00 },
    { id: '4', name: 'Premium Detail', duration: 180, price: 650.00 }
]

const mockStaff = [
    { id: '1', name: 'Mike Thompson', role: 'Senior Detailer' },
    { id: '2', name: 'David Lee', role: 'Car Wash Specialist' },
    { id: '3', name: 'Sarah Adams', role: 'Detail Specialist' }
]

export default function BookingsPage() {
    const { currentBusiness } = useBusiness()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedStaff, setSelectedStaff] = useState('all')
    const [bookings, setBookings] = useState(mockBookings)
    const [activeTab, setActiveTab] = useState('calendar')

    // Only show this page for service businesses
    useEffect(() => {
        if (currentBusiness && !['service', 'car_wash', 'salon'].includes(currentBusiness.business_categories?.id)) {
            router.push('/admin')
        }
    }, [currentBusiness, router])

    if (!currentBusiness || !['service', 'car_wash', 'salon'].includes(currentBusiness.business_categories?.id)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-stone-800 mb-4">Service Bookings Only</h2>
                    <p className="text-stone-600">This page is only available for service businesses.</p>
                </div>
            </div>
        )
    }

    // Filter bookings based on search and filters
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            booking.customer_phone.includes(searchTerm) ||
                            booking.service_name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus
        const matchesDate = !selectedDate || booking.booking_date === selectedDate
        const matchesStaff = selectedStaff === 'all' || booking.staff_name === selectedStaff
        
        return matchesSearch && matchesStatus && matchesDate && matchesStaff
    })

    // Calculate stats
    const today = new Date().toISOString().split('T')[0]
    const todayBookings = bookings.filter(b => b.booking_date === today)
    const stats = {
        total: bookings.length,
        today: todayBookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        in_progress: bookings.filter(b => b.status === 'in_progress').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        revenue_today: todayBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.price, 0)
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'confirmed':
                return { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Confirmed' }
            case 'in_progress':
                return { color: 'bg-amber-100 text-amber-800', icon: <ClockIcon className="w-3 h-3" />, label: 'In Progress' }
            case 'completed':
                return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Completed' }
            case 'cancelled':
                return { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" />, label: 'Cancelled' }
            case 'scheduled':
            default:
                return { color: 'bg-gray-100 text-gray-800', icon: <Calendar className="w-3 h-3" />, label: 'Scheduled' }
        }
    }

    const formatTime = (time: string) => {
        return new Date(`2024-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-ZA', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-stone-200/50 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
                                {currentBusiness.name} - Bookings
                            </h1>
                            <p className="text-stone-600 text-sm">Manage appointments and service bookings</p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex gap-3">
                            <Link href="/admin/bookings/calendar">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Calendar View
                                </Button>
                            </Link>
                            <Link href="/admin/bookings/add">
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    New Booking
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <Calendar className="h-8 w-8 text-blue-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <Clock className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Today</p>
                                    <p className="text-2xl font-bold">{stats.today}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-blue-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Confirmed</p>
                                    <p className="text-2xl font-bold">{stats.confirmed}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <ClockIcon className="h-8 w-8 text-amber-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                                    <p className="text-2xl font-bold">{stats.in_progress}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold">{stats.completed}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <AlertTriangle className="h-8 w-8 text-purple-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                                    <p className="text-2xl font-bold">R{stats.revenue_today.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Label htmlFor="search">Search Bookings</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="search"
                                        placeholder="Search by customer, phone, or service..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-[160px]"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="staff">Staff Member</Label>
                                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Select staff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Staff</SelectItem>
                                        {mockStaff.map(staff => (
                                            <SelectItem key={staff.id} value={staff.name}>
                                                {staff.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bookings List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
                        <CardDescription>
                            Manage your service appointments and bookings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredBookings.map((booking) => {
                                const statusInfo = getStatusInfo(booking.status)
                                
                                return (
                                    <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                {/* Time & Date */}
                                                <div className="text-center min-w-[80px]">
                                                    <div className="text-lg font-semibold text-gray-900">
                                                        {formatTime(booking.booking_time)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(booking.booking_date).toLocaleDateString('en-ZA', { 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                    </div>
                                                </div>
                                                
                                                {/* Booking Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {booking.customer_name}
                                                        </h3>
                                                        <Badge className={`${statusInfo.color} flex items-center space-x-1`}>
                                                            {statusInfo.icon}
                                                            <span>{statusInfo.label}</span>
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-gray-600 mb-1">
                                                        {booking.service_name} • {booking.duration_minutes} minutes • {booking.staff_name}
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{booking.customer_phone}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Mail className="w-3 h-3" />
                                                            <span>{booking.customer_email}</span>
                                                        </div>
                                                    </div>
                                                    {booking.notes && (
                                                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                            <strong>Notes:</strong> {booking.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Price & Actions */}
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="text-lg font-semibold">R{booking.price}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {booking.duration_minutes}min
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                    <Link href={`/admin/bookings/${booking.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            View
                                                        </Button>
                                                    </Link>
                                                    {booking.status === 'scheduled' && (
                                                        <Button size="sm">
                                                            Start
                                                        </Button>
                                                    )}
                                                    {booking.status === 'in_progress' && (
                                                        <Button size="sm" variant="secondary">
                                                            Complete
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            
                            {filteredBookings.length === 0 && (
                                <div className="text-center py-12">
                                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm || selectedDate || selectedStatus !== 'all' || selectedStaff !== 'all'
                                            ? 'Try adjusting your search or filters.'
                                            : 'Get started by creating your first booking.'
                                        }
                                    </p>
                                    {(!searchTerm && !selectedDate && selectedStatus === 'all' && selectedStaff === 'all') && (
                                        <div className="mt-6">
                                            <Link href="/admin/bookings/add">
                                                <Button>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Booking
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}