"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, CheckCircle, AlertCircle, Phone, MapPin } from "lucide-react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Order {
    id: string
    customerName: string
    phone: string
    items: { name: string; quantity: number; price: number }[]
    total: number
    status: "pending" | "preparing" | "ready" | "completed"
    timestamp: string
    location: string
}

const sampleOrders: Order[] = [
    {
        id: "ORD-001",
        customerName: "Thabo Mthembu",
        phone: "+27 81 234 5678",
        items: [
            { name: "Traditional Skop", quantity: 2, price: 85 },
            { name: "Mogodu & Pap", quantity: 1, price: 100 },
        ],
        total: 270,
        status: "pending",
        timestamp: "14:30",
        location: "Montana",
    },
    {
        id: "ORD-002",
        customerName: "Nomsa Dlamini",
        phone: "+27 82 987 6543",
        items: [
            { name: "Hardbody & Pap", quantity: 1, price: 100 },
            { name: "Dithlakwana", quantity: 2, price: 85 },
        ],
        total: 270,
        status: "preparing",
        timestamp: "14:15",
        location: "Sinoville",
    },
    {
        id: "ORD-003",
        customerName: "Sipho Khumalo",
        phone: "+27 83 456 7890",
        items: [{ name: "Half Skop & Pap", quantity: 3, price: 100 }],
        total: 300,
        status: "ready",
        timestamp: "14:00",
        location: "Annlin",
    },
    {
        id: "ORD-004",
        customerName: "Lerato Mokoena",
        phone: "+27 84 321 0987",
        items: [
            { name: "Mogodu", quantity: 1, price: 85 },
            { name: "Hardbody", quantity: 1, price: 85 },
            { name: "Dithlakwana & Pap", quantity: 1, price: 100 },
        ],
        total: 270,
        status: "completed",
        timestamp: "13:45",
        location: "Montana",
    },
]

export default function AdminDashboard() {
    const [orders, setOrders] = useState<Order[]>(sampleOrders)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

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

    const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    }

    const getStatusColor = (status: Order["status"]) => {
        switch (status) {
            case "pending":
                return "bg-amber-100 text-amber-800 border-amber-200"
            case "preparing":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "ready":
                return "bg-green-100 text-green-800 border-green-200"
            case "completed":
                return "bg-stone-100 text-stone-600 border-stone-200"
            default:
                return "bg-stone-100 text-stone-600 border-stone-200"
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
            case "completed":
                return <CheckCircle className="w-4 h-4" />
            default:
                return <Clock className="w-4 h-4" />
        }
    }

    const stats = {
        total: orders.length,
        pending: orders.filter((o) => o.status === "pending").length,
        preparing: orders.filter((o) => o.status === "preparing").length,
        ready: orders.filter((o) => o.status === "ready").length,
        completed: orders.filter((o) => o.status === "completed").length,
    }

    const currentDate = new Date().toLocaleDateString("en-ZA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

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
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-stone-200/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-xl"></div>
                        <div className="relative text-center">
                            <div className="text-2xl font-bold text-stone-800">{stats.total}</div>
                            <div className="text-stone-600 text-sm">Total Orders</div>
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

                    <div className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-stone-200/50">
                        <div className="relative text-center">
                            <div className="text-2xl font-bold text-stone-800">{stats.completed}</div>
                            <div className="text-stone-600 text-sm">Completed</div>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-stone-800 mb-4">Live Orders</h2>

                    {orders.map((order) => (
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
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end space-y-2">
                                        <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                                            {getStatusIcon(order.status)}
                                            <span className="capitalize">{order.status}</span>
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

                                {/* Status Update Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    {order.status === "pending" && (
                                        <Button
                                            onClick={() => updateOrderStatus(order.id, "preparing")}
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            Start Preparing
                                        </Button>
                                    )}
                                    {order.status === "preparing" && (
                                        <Button
                                            onClick={() => updateOrderStatus(order.id, "ready")}
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            Mark Ready
                                        </Button>
                                    )}
                                    {order.status === "ready" && (
                                        <Button
                                            onClick={() => updateOrderStatus(order.id, "completed")}
                                            size="sm"
                                            className="bg-stone-600 hover:bg-stone-700 text-white"
                                        >
                                            Complete Order
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
