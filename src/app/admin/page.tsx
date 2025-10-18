"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, CheckCircle, AlertCircle, ChevronRight, Calendar, ShoppingBag, TrendingUp, Plus, Activity } from "lucide-react"
import { useBusinessAdminAuth } from '@/lib/hooks'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import Link from 'next/link'

export default function AdminDashboard() {
    const { user, userBusinesses } = useBusinessAdminAuth()
    const currentBusiness = userBusinesses[0] // Get the first/primary business

    if (!currentBusiness) {
        return null // Loading handled by layout
    }

    const businessCategory = currentBusiness.business.business_categories

    // Get current date for display
    const currentDate = new Date().toLocaleDateString("en-ZA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    // Category-specific dashboard components
    const getFoodDashboard = () => (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-8 w-8 text-amber-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">New Orders</p>
                                <p className="text-2xl font-bold">12</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">In Kitchen</p>
                                <p className="text-2xl font-bold">8</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Ready</p>
                                <p className="text-2xl font-bold">5</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Today&apos;s Sales</p>
                                <p className="text-2xl font-bold">R2,450</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/orders">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">View Orders</h3>
                                    <p className="text-sm text-gray-600">Manage incoming orders</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                
                <Link href="/admin/menu">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Menu Items</h3>
                                    <p className="text-sm text-gray-600">Update menu and pricing</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                
                <Link href="/admin/menu/add">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Add Menu Item</h3>
                                    <p className="text-sm text-gray-600">Create new menu items</p>
                                </div>
                                <Plus className="h-4 w-4 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )

    const getRetailDashboard = () => (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <ShoppingBag className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Products</p>
                                <p className="text-2xl font-bold">156</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                <p className="text-2xl font-bold">8</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Orders</p>
                                <p className="text-2xl font-bold">23</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Revenue</p>
                                <p className="text-2xl font-bold">R12,580</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/products">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Manage Products</h3>
                                    <p className="text-sm text-gray-600">View and edit products</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                
                <Link href="/admin/inventory">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Inventory</h3>
                                    <p className="text-sm text-gray-600">Track stock levels</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                
                <Link href="/admin/orders">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Orders</h3>
                                    <p className="text-sm text-gray-600">Process customer orders</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )

    const getServiceDashboard = () => (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Today&apos;s Bookings</p>
                                <p className="text-2xl font-bold">18</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                                <p className="text-2xl font-bold">5</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-amber-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold">7</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Revenue</p>
                                <p className="text-2xl font-bold">R8,920</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/bookings">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">View Bookings</h3>
                                    <p className="text-sm text-gray-600">Manage appointments</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                
                <Link href="/admin/staff">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Staff Schedule</h3>
                                    <p className="text-sm text-gray-600">Manage team availability</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                
                <Link href="/admin/services">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Services</h3>
                                    <p className="text-sm text-gray-600">Manage service offerings</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )

    // Render category-specific dashboard
    const renderCategoryDashboard = () => {
        switch (businessCategory?.id) {
            case 'food':
                return getFoodDashboard()
            case 'retail':
                return getRetailDashboard()
            case 'service':
            case 'car_wash':
            case 'salon':
                return getServiceDashboard()
            default:
                return getFoodDashboard() // Default fallback
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-stone-200/50 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-2xl"></div>
                    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${businessCategory?.color || 'bg-stone-200'}`}>
                                {businessCategory && (
                                    <DynamicIcon name={businessCategory.icon} className="h-8 w-8 text-white" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-1">
                                    {currentBusiness.name}
                                </h1>
                                <div className="text-stone-600 text-sm flex items-center">
                                    <Badge variant="secondary" className={businessCategory?.color || 'bg-stone-200'}>
                                        {businessCategory?.name}
                                    </Badge>
                                    <span className="ml-2">Business Dashboard</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 text-right">
                            <p className="text-stone-700 font-semibold">{currentDate}</p>
                            <p className="text-stone-500 text-xs mt-1">Welcome, {user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Category-Specific Dashboard Content */}
                {renderCategoryDashboard()}

                {/* Recent Activity */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="h-5 w-5 mr-2" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>
                            Latest updates from your business
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-600">New order received - #ORD-123</span>
                                <span className="text-gray-400">2 minutes ago</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-600">Menu item updated - Chicken Curry</span>
                                <span className="text-gray-400">15 minutes ago</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span className="text-gray-600">Payment received - R450.00</span>
                                <span className="text-gray-400">1 hour ago</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}