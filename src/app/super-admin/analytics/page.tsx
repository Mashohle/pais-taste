"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  Download,
  Eye,
  ShoppingCart,
  MapPin,
  PieChart,
  Activity,
  Target,
  Calendar,
  BarChart3
} from "lucide-react"

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d')

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalRevenue: 2847650,
      revenueGrowth: 24.5,
      totalOrders: 15847,
      orderGrowth: 18.3,
      activeUsers: 23456,
      userGrowth: 12.8,
      avgOrderValue: 1860,
      aovGrowth: 5.2,
      businessesActive: 1247,
      businessGrowth: 8.7,
      userRetention: 78.3,
      retentionChange: 3.2
    },
    
    // Revenue data for charts
    revenueByMonth: [
      { month: 'Jan', revenue: 180000, orders: 980 },
      { month: 'Feb', revenue: 195000, orders: 1045 },
      { month: 'Mar', revenue: 210000, orders: 1156 },
      { month: 'Apr', revenue: 225000, orders: 1200 },
      { month: 'May', revenue: 240000, orders: 1285 },
      { month: 'Jun', revenue: 265000, orders: 1420 },
      { month: 'Jul', revenue: 280000, orders: 1502 },
      { month: 'Aug', revenue: 295000, orders: 1580 }
    ],
    
    // Category breakdown
    categoryPerformance: [
      { category: 'Food & Restaurant', revenue: 1423800, orders: 8920, businesses: 542, growth: 28.3, color: 'bg-orange-500' },
      { category: 'Retail & Shopping', revenue: 856200, orders: 4215, businesses: 389, growth: 18.7, color: 'bg-blue-500' },
      { category: 'Services', revenue: 567650, orders: 2712, businesses: 316, growth: 22.1, color: 'bg-green-500' }
    ],
    
    // Geographic data
    provinceData: [
      { province: 'Gauteng', revenue: 1125000, users: 8943, businesses: 445 },
      { province: 'Western Cape', revenue: 687500, users: 5621, businesses: 298 },
      { province: 'KwaZulu-Natal', revenue: 523400, users: 4234, businesses: 245 },
      { province: 'Eastern Cape', revenue: 234600, users: 2156, businesses: 128 },
      { province: 'Mpumalanga', revenue: 156800, users: 1563, businesses: 87 }
    ],
    
    // Top performing businesses
    topBusinesses: [
      { name: 'Pai\'s Taste Food Special', revenue: 154200, orders: 892, growth: 32.1, category: 'Food' },
      { name: 'Urban Style Boutique', revenue: 128300, orders: 634, growth: 24.6, category: 'Retail' },
      { name: 'Premium Auto Detailing', revenue: 96500, orders: 423, growth: 28.9, category: 'Services' },
      { name: 'Mama Zulu\'s Traditional Kitchen', revenue: 89200, orders: 512, growth: 35.4, category: 'Food' },
      { name: 'TechHub Electronics', revenue: 76800, orders: 298, growth: 19.3, category: 'Retail' }
    ],
    
    // User engagement metrics
    userEngagement: {
      dailyActiveUsers: 12450,
      sessionDuration: '14.5 min',
      pagesPerSession: 4.2,
      bounceRate: 23.4,
      conversionRate: 3.8,
      repeatCustomerRate: 68.2
    }
  }

  const renderKPICard = (title: string, value: string | number, growth: number, icon: React.ComponentType<{ className?: string }>, color: string) => {
    const Icon = icon
    const isPositive = growth >= 0
    
    return (
      <Card className={`${color} border-opacity-30`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">{title}</p>
              <p className="text-3xl font-bold text-slate-900">
                {typeof value === 'number' && title.includes('Revenue') 
                  ? `R${value.toLocaleString('en-ZA')}` 
                  : value.toLocaleString('en-ZA')}
              </p>
              <div className={`flex items-center mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                <span className="text-xs font-medium">{isPositive ? '+' : ''}{growth}% vs last period</span>
              </div>
            </div>
            <Icon className="w-8 h-8 text-slate-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderMockChart = (title: string, description: string, icon: React.ComponentType<{ className?: string }>) => {
    const Icon = icon
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg p-8 border-2 border-dashed border-slate-300">
        <div className="text-center">
          <Icon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="font-medium text-slate-700 mb-1">{title}</h4>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Platform Analytics</h1>
          <p className="text-slate-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Eye className="w-4 h-4 mr-2" />
            Live View
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {renderKPICard("Total Revenue", analyticsData.overview.totalRevenue, analyticsData.overview.revenueGrowth, DollarSign, "bg-green-50")}
        {renderKPICard("Total Orders", analyticsData.overview.totalOrders, analyticsData.overview.orderGrowth, ShoppingCart, "bg-blue-50")}
        {renderKPICard("Active Users", analyticsData.overview.activeUsers, analyticsData.overview.userGrowth, Users, "bg-purple-50")}
        {renderKPICard("Avg Order Value", `R${analyticsData.overview.avgOrderValue}`, analyticsData.overview.aovGrowth, Target, "bg-yellow-50")}
        {renderKPICard("Active Businesses", analyticsData.overview.businessesActive, analyticsData.overview.businessGrowth, Building2, "bg-indigo-50")}
        {renderKPICard("User Retention", `${analyticsData.overview.userRetention}%`, analyticsData.overview.retentionChange, Activity, "bg-emerald-50")}
      </div>

      {/* Revenue & Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Revenue & Orders Trend
            <Badge variant="outline">Monthly View</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderMockChart("Revenue & Orders Chart", "Interactive line chart showing revenue and order trends over time", BarChart3)}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.categoryPerformance.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <div>
                      <p className="font-medium text-slate-900">{category.category}</p>
                      <p className="text-sm text-slate-600">{category.businesses} businesses • {category.orders.toLocaleString()} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">R{category.revenue.toLocaleString('en-ZA')}</p>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span className="text-sm">+{category.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Provincial Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.provinceData.map((province, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">{province.province}</p>
                      <p className="text-sm text-slate-600">{province.users.toLocaleString()} users • {province.businesses} businesses</p>
                    </div>
                  </div>
                  <p className="font-semibold">R{province.revenue.toLocaleString('en-ZA')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{analyticsData.userEngagement.dailyActiveUsers.toLocaleString()}</p>
                <p className="text-sm text-blue-700">Daily Active Users</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{analyticsData.userEngagement.sessionDuration}</p>
                <p className="text-sm text-green-700">Avg Session Duration</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{analyticsData.userEngagement.pagesPerSession}</p>
                <p className="text-sm text-purple-700">Pages per Session</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{analyticsData.userEngagement.conversionRate}%</p>
                <p className="text-sm text-yellow-700">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Businesses */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topBusinesses.map((business, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{business.name}</p>
                      <p className="text-sm text-slate-600">{business.category} • {business.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R{business.revenue.toLocaleString('en-ZA')}</p>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span className="text-xs">+{business.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {renderMockChart("Pie Chart", "Revenue distribution by category and business type", PieChart)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            {renderMockChart("Heatmap", "Order patterns by day of week and hour", Calendar)}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}