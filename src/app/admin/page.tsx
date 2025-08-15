"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, CheckCircle, AlertCircle, Phone, MapPin, CreditCard, Banknote } from "lucide-react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrders } from '@/lib/hooks/use-orders'

// Interface to match your existing UI structure
interface Order {
    id: string
    customerName: string
    phone: string
    items: { name: string; quantity: number; price: number }[]
    total: number
    status: "pending" | "preparing" | "ready" | "collected" | "completed"
    paymentStatus: "pending" | "paid"
    paymentMethod: "online" | "cash_on_pickup"
    timestamp: string
    location: string
}

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const { orders: dbOrders, loading, updateOrderStatus, updatePaymentStatus } = useOrders()
    const router = useRouter()

    useEffect(() => {
        const session = localStorage.getItem('admin-session')
        if (session === 'true') {
            setIsAuthenticated(true)
        } else {
            router.push('/admin/login')
        }
    }, [router])

    if (!isAuthenticated) {
        return <div>Checking access...</div>
    }

    // Transform database orders to match your UI interface
    const transformedOrders: Order[] = dbOrders.map(dbOrder => ({
        id: `ORD-${dbOrder.id.slice(-3).toUpperCase()}`, // Show last 3 chars of ID
        customerName: dbOrder.customer_name,
        phone: dbOrder.customer_phone,
        items: dbOrder.order_items.map(item => ({
            name: item.menu_items?.name || 'Unknown Item',
            quantity: item.quantity,
            price: item.unit_price
        })),
        total: dbOrder.total_amount,
        status: dbOrder.order_status as "pending" | "preparing" | "ready" | "collected" | "completed",
        paymentStatus: dbOrder.payment_status as "pending" | "paid",
        paymentMethod: dbOrder.payment_method as "online" | "cash_on_pickup",
        timestamp: new Date(dbOrder.created_at).toLocaleTimeString('en-ZA', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }),
        location: dbOrder.pickup_location
    }))

    const handleUpdateStatus = async (orderId: string, newStatus: Order["status"]) => {
        const dbOrder = dbOrders.find(order => 
            `ORD-${order.id.slice(-3).toUpperCase()}` === orderId
        )
        
        if (dbOrder) {
            await updateOrderStatus(dbOrder.id, newStatus)
        }
    }

    const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: "paid" | "pending") => {
        const dbOrder = dbOrders.find(order => 
            `ORD-${order.id.slice(-3).toUpperCase()}` === orderId
        )
        
        if (dbOrder) {
            await updatePaymentStatus(dbOrder.id, newPaymentStatus)
        }
    }

    const getStatusColor = (status: Order["status"]) => {
        switch (status) {
            case "pending":
                return "bg-amber-100 text-amber-800 border-amber-200"
            case "preparing":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "ready":
                return "bg-green-100 text-green-800 border-green-200"
            case "collected":
                return "bg-purple-100 text-purple-800 border-purple-200"
            case "completed":
                return "bg-stone-100 text-stone-600 border-stone-200"
            default:
                return "bg-stone-100 text-stone-600 border-stone-200"
        }
    }

    const getPaymentStatusColor = (paymentStatus: Order["paymentStatus"]) => {
        switch (paymentStatus) {
            case "pending":
                return "bg-red-100 text-red-800 border-red-200"
            case "paid":
                return "bg-green-100 text-green-800 border-green-200"
            default:
                return "bg-gray-100 text-gray-600 border-gray-200"
        }
    }

    const getStatusIcon = (status: Order["status"]) => {
        switch (status) {
            case "pending":
                return <AlertCircle className="w-4 h-4" />
            case "preparing":
                return <Clock className="w-4 h-4" />
            case "ready":
                return <CheckCircle className="w-4 h-4" />
            case "collected":
                return <CheckCircle className="w-4 h-4" />
            case "completed":
                return <CheckCircle className="w-4 h-4" />
            default:
                return <Clock className="w-4 h-4" />
        }
    }

    // Get available actions for each order based on status and payment
    const getAvailableActions = (order: Order) => {
        const actions = []

        // Payment actions
        if (order.paymentStatus === 'pending' && order.paymentMethod === 'cash_on_pickup') {
            actions.push({
                label: 'Mark as Paid',
                onClick: () => handleUpdatePaymentStatus(order.id, 'paid'),
                variant: 'default' as const,
                icon: <Banknote className="w-4 h-4" />
            })
        }

        // Status actions
        if (order.status === 'pending') {
            actions.push({
                label: 'Start Preparing',
                onClick: () => handleUpdateStatus(order.id, 'preparing'),
                variant: 'default' as const,
                icon: <Clock className="w-4 h-4" />
            })
        }

        if (order.status === 'preparing') {
            actions.push({
                label: 'Mark Ready',
                onClick: () => handleUpdateStatus(order.id, 'ready'),
                variant: 'default' as const,
                icon: <CheckCircle className="w-4 h-4" />
            })
        }

        if (order.status === 'ready' && order.paymentStatus === 'paid') {
            actions.push({
                label: 'Mark Collected',
                onClick: () => handleUpdateStatus(order.id, 'collected'),
                variant: 'default' as const,
                icon: <CheckCircle className="w-4 h-4" />
            })
        }

        if (order.status === 'collected') {
            actions.push({
                label: 'Mark Completed',
                onClick: () => handleUpdateStatus(order.id, 'completed'),
                variant: 'default' as const,
                icon: <CheckCircle className="w-4 h-4" />
            })
        }

        return actions
    }

    // Calculate stats from transformed orders
    const stats = {
        total: transformedOrders.length,
        pending: transformedOrders.filter((o) => o.status === "pending").length,
        preparing: transformedOrders.filter((o) => o.status === "preparing").length,
        ready: transformedOrders.filter((o) => o.status === "ready").length,
        collected: transformedOrders.filter((o) => o.status === "collected").length,
        completed: transformedOrders.filter((o) => o.status === "completed").length,
        unpaid: transformedOrders.filter((o) => o.paymentStatus === "pending").length,
    }

    const currentDate = new Date().toLocaleDateString("en-ZA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
                    <p className="text-stone-700">Loading orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 relative overflow-hidden">
            {/* Decorative background patterns */}
            <div className="fixed right-0 top-0 h-full w-48 sm:w-64 lg:w-96 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-15">
                    <svg className="absolute top-10 right-8 w-16 h-16 text-stone-600" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.4" />
                    </svg>
                    <svg className="absolute top-48 right-16 w-14 h-14 text-stone-500" viewBox="0 0 100 100">
                        <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
                        <polygon points="50,30 70,70 30,70" fill="currentColor" opacity="0.3" />
                    </svg>
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-stone-200/50 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-2xl"></div>
                    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">Pai's Taste Admin</h1>
                            <p className="text-stone-600 text-sm sm:text-base">Traditional South African Cuisine</p>
                        </div>
                        <div className="mt-4 sm:mt-0 text-right">
                            <p className="text-stone-700 font-semibold">{currentDate}</p>
                            <p className="text-stone-600 text-sm">Kitchen Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-stone-200/50">
                        <div className="relative text-center">
                            <div className="text-2xl font-bold text-stone-800">{stats.total}</div>
                            <div className="text-stone-600 text-sm">Total</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-100/95 via-amber-50/60 to-amber-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-amber-200/50">
                        <div className="relative text-center">
                            <div className="text-2xl font-bold text-amber-800">{stats.pending}</div>
                            <div className="text-amber-700 text-sm">Pending</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-100/95 via-blue-50/60 to-blue-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-blue-200/50">
                        <div className="relative text-center">
                            <div className="text-2xl font-bold text-blue-800">{stats.preparing}</div>
                            <div className="text-blue-700 text-sm">Preparing</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-100/95 via-green-50/60 to-green-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-green-200/50">
                        <div className="relative text-center">
                            <div className="text-2xl font-bold text-green-800">{stats.ready}</div>
                            <div className="text-green-700 text-sm">Ready</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-100/95 via-purple-50/60 to-purple-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-purple-200/50">
                        <div className="relative text-center">
                            <div className="text-2xl font-bold text-purple-800">{stats.collected}</div>
                            <div className="text-purple-700 text-sm">Collected</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-red-100/95 via-red-50/60 to-red-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-red-200/50">
                        <div className="relative text-center">
                            <div className="text-2xl font-bold text-red-800">{stats.unpaid}</div>
                            <div className="text-red-700 text-sm">Unpaid</div>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-stone-800 mb-4">Live Orders</h2>

                    {/* No orders state */}
                    {transformedOrders.length === 0 && (
                        <div className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-stone-200/50 text-center">
                            <div className="relative">
                                <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-stone-700 mb-2">No orders yet</h3>
                                <p className="text-stone-600">New orders will appear here automatically</p>
                            </div>
                        </div>
                    )}

                    {transformedOrders.map((order) => {
                        const availableActions = getAvailableActions(order)
                        
                        return (
                            <div
                                key={order.id}
                                className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-stone-200/50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-2xl"></div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/60 to-transparent rounded-t-2xl"></div>

                                <div className="relative">
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                                        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                                            <div>
                                                <h3 className="text-lg font-bold text-stone-800">{order.id}</h3>
                                                <div className="flex items-center space-x-2 text-stone-600 text-sm">
                                                    <Users className="w-4 h-4" />
                                                    <span>{order.customerName}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-stone-600 text-sm">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{order.phone}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-stone-600 text-sm">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{order.location}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-stone-600 text-sm">
                                                    {order.paymentMethod === 'online' ? 
                                                        <CreditCard className="w-4 h-4" /> : 
                                                        <Banknote className="w-4 h-4" />
                                                    }
                                                    <span>{order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Pickup'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end space-y-2">
                                            <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                                                {getStatusIcon(order.status)}
                                                <span className="capitalize">{order.status}</span>
                                            </Badge>
                                            <Badge className={`${getPaymentStatusColor(order.paymentStatus)} flex items-center space-x-1`}>
                                                <span className="capitalize">{order.paymentStatus}</span>
                                            </Badge>
                                            <div className="text-stone-600 text-sm">{order.timestamp}</div>
                                            <div className="text-xl font-bold text-stone-800">R{order.total}</div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="bg-white/85 backdrop-blur-sm rounded-xl p-4 mb-4 border border-stone-200/60">
                                        <h4 className="font-semibold text-stone-800 mb-3">Order Items:</h4>
                                        <div className="space-y-2">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center text-sm">
                                                    <span className="text-stone-700">
                                                        {item.name} x{item.quantity}
                                                    </span>
                                                    <span className="font-semibold text-stone-800">R{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        {availableActions.map((action, index) => (
                                            <Button
                                                key={index}
                                                onClick={action.onClick}
                                                size="sm"
                                                variant={action.variant}
                                                className="flex items-center gap-2"
                                            >
                                                {action.icon}
                                                {action.label}
                                            </Button>
                                        ))}
                                        
                                        {/* Show warning if order is ready but not paid */}
                                        {order.status === 'ready' && order.paymentStatus === 'pending' && (
                                            <div className="w-full mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                                                <p className="text-yellow-800 text-sm font-medium">
                                                    ⚠️ Payment required before collection
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
