"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  ShoppingCart,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  ArrowUpRight,
  Activity,
  MapPin
} from "lucide-react"

export default function SuperAdminDashboard() {
  const [timeRange, setTimeRange] = useState('7d')

  // Mock platform data - in real app would fetch from APIs
  const platformMetrics = {
    totalBusinesses: 1247,
    businessGrowth: 12.5,
    activeUsers: 15632,
    userGrowth: 8.3,
    monthlyRevenue: 897500, // R897,500
    revenueGrowth: 15.7,
    totalOrders: 3821,
    orderGrowth: 22.1
  }

  const businessStats = {
    pending: 3,
    active: 1184,
    suspended: 8,
    categories: [
      { name: 'Food & Restaurant', count: 542, growth: 18.2 },
      { name: 'Retail & Shopping', count: 389, growth: 15.4 },
      { name: 'Services', count: 316, growth: 9.8 }
    ]
  }

  const recentActivity = [
    {
      id: '1',
      type: 'business_application',
      business: 'Mama Zulu\'s Kitchen',
      category: 'Food',
      action: 'Applied for approval - Soweto location',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: '2', 
      type: 'dispute',
      business: 'Elite Car Wash',
      user: 'John Doe',
      action: 'Order dispute raised',
      time: '4 hours ago',
      status: 'urgent'
    },
    {
      id: '3',
      type: 'business_approved',
      business: 'African Crafts Co',
      category: 'Retail',
      action: 'Business approved and activated',
      time: '6 hours ago',
      status: 'completed'
    },
    {
      id: '4',
      type: 'large_order',
      business: 'Spice Route Restaurant',
      action: 'Large catering order placed (R24,500)',
      time: '8 hours ago',
      status: 'info'
    }
  ]

  const topBusinesses = [
    {
      name: 'Pai\'s Taste Food Special',
      category: 'Food',
      location: 'Montana, Pretoria',
      revenue: 154200, // R154,200
      orders: 234,
      rating: 4.8,
      growth: 23.5
    },
    {
      name: 'Urban Style Boutique',
      category: 'Retail',
      location: 'Sandton, Johannesburg', 
      revenue: 128300, // R128,300
      orders: 189,
      rating: 4.6,
      growth: 18.2
    },
    {
      name: 'Premium Auto Detailing',
      category: 'Services',
      location: 'Umhlanga, Durban',
      revenue: 96500, // R96,500
      orders: 156,
      rating: 4.9,
      growth: 31.8
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'business_application': return <Building2 className="w-4 h-4" />
      case 'dispute': return <AlertTriangle className="w-4 h-4" />
      case 'business_approved': return <CheckCircle className="w-4 h-4" />
      case 'large_order': return <ShoppingCart className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'info': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Platform Dashboard</h1>
          <p className="text-slate-600 mt-1">Monitor and manage the LocalHub marketplace</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Eye className="w-4 h-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center justify-between">
              Total Businesses
              <Building2 className="w-4 h-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{platformMetrics.totalBusinesses.toLocaleString()}</p>
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">+{platformMetrics.businessGrowth}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1">+{Math.round(platformMetrics.totalBusinesses * platformMetrics.businessGrowth / 100)} this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center justify-between">
              Active Users
              <Users className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{platformMetrics.activeUsers.toLocaleString()}</p>
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">+{platformMetrics.userGrowth}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1">+{Math.round(platformMetrics.activeUsers * platformMetrics.userGrowth / 100)} this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center justify-between">
              Monthly Revenue
              <DollarSign className="w-4 h-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">R{platformMetrics.monthlyRevenue.toLocaleString('en-ZA')}</p>
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">+{platformMetrics.revenueGrowth}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1">+R{Math.round(platformMetrics.monthlyRevenue * platformMetrics.revenueGrowth / 100).toLocaleString('en-ZA')} vs last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center justify-between">
              Total Orders
              <ShoppingCart className="w-4 h-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{platformMetrics.totalOrders.toLocaleString()}</p>
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">+{platformMetrics.orderGrowth}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1">+{Math.round(platformMetrics.totalOrders * platformMetrics.orderGrowth / 100)} this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Management Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Business Management
              <Button variant="outline" size="sm">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Business Status Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{businessStats.pending}</p>
                  <p className="text-sm text-yellow-700">Pending Approval</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{businessStats.active}</p>
                  <p className="text-sm text-green-700">Active</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{businessStats.suspended}</p>
                  <p className="text-sm text-red-700">Suspended</p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Categories</h4>
                {businessStats.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{category.name}</p>
                      <p className="text-sm text-slate-600">{category.count} businesses</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span className="text-sm">+{category.growth}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Activity
              <Badge variant="outline" className="text-slate-600">
                <Clock className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.business}</p>
                    <p className="text-sm text-slate-600">{activity.action}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Businesses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Top Performing Businesses
            <Button variant="outline" size="sm">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Full Analytics
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-medium text-slate-700">Business</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-700">Category</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-700">Location</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-700">Revenue</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-700">Orders</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-700">Rating</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-700">Growth</th>
                </tr>
              </thead>
              <tbody>
                {topBusinesses.map((business, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-2">
                      <div className="font-medium text-slate-900">{business.name}</div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant="outline" className="text-xs">{business.category}</Badge>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        {business.location}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right font-medium">R{business.revenue.toLocaleString('en-ZA')}</td>
                    <td className="py-4 px-2 text-right">{business.orders}</td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex items-center justify-end">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        {business.rating}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex items-center justify-end text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{business.growth}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}