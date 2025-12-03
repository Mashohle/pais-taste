"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Users, CheckCircle, AlertCircle, ChevronRight, Calendar, ShoppingBag, TrendingUp, Plus } from "lucide-react"
import { useBusinessAdminAuth } from '@/lib/context/business-admin-context'
import { useDashboardStats } from '@/lib/hooks'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import Link from 'next/link'

export default function AdminDashboard() {
    const { currentBusiness } = useBusinessAdminAuth()
    const { stats, loading: statsLoading } = useDashboardStats()

    if (!currentBusiness) {
        return null // Loading handled by layout
    }

    const businessCategory = currentBusiness.business.business_categories

    // Type-safe stats accessors
    const foodStats = stats as { newOrders?: number; inKitchen?: number; ready?: number; todaySales?: number }
    const retailStats = stats as { products?: number; lowStock?: number; orders?: number; revenue?: number }
    const serviceStats = stats as { todayBookings?: number; activeStaff?: number; inProgress?: number; revenue?: number }

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
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-12 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">{foodStats?.newOrders || 0}</p>
                                )}
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
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-12 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">{foodStats?.inKitchen || 0}</p>
                                )}
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
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-12 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">{foodStats?.ready || 0}</p>
                                )}
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
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-20 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">R{(foodStats?.todaySales || 0).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                                )}
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
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-16 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">{retailStats?.products || 0}</p>
                                )}
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
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-12 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">{retailStats?.lowStock || 0}</p>
                                )}
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
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-12 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">{retailStats?.orders || 0}</p>
                                )}
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
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-20 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">R{(retailStats?.revenue || 0).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                                )}
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
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-12 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">{serviceStats?.todayBookings || 0}</p>
                                )}
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
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-12 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">{serviceStats?.activeStaff || 0}</p>
                                )}
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
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-12 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">{serviceStats?.inProgress || 0}</p>
                                )}
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
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-20 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">R{(serviceStats?.revenue || 0).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                                )}
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
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 text-right">
                            <p className="text-stone-700 font-semibold">{currentDate}</p>
                        </div>
                    </div>
                </div>

                {/* Category-Specific Dashboard Content */}
                {renderCategoryDashboard()}

            </div>
        </div>
    )
}