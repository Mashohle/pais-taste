"use client"

import { useState, useEffect } from 'react'

interface PlatformMetrics {
  totalBusinesses: number
  businessGrowth: number
  activeUsers: number
  userGrowth: number
  monthlyRevenue: number
  revenueGrowth: number
  totalOrders: number
  orderGrowth: number
}

interface BusinessStats {
  pending: number
  active: number
  suspended: number
  categories: {
    name: string
    count: number
    growth: number
  }[]
}

interface Activity {
  id: string
  type: string
  business: string
  category?: string
  user?: string
  action: string
  time: string
  status: string
}

interface TopBusiness {
  name: string
  category: string
  location: string
  revenue: number
  orders: number
  rating: number
  growth: number
}

interface DashboardData {
  platformMetrics: PlatformMetrics
  businessStats: BusinessStats
  recentActivity: Activity[]
  topBusinesses: TopBusiness[]
}

export function useSuperAdminDashboard(timeRange: string = '7d') {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // For now, return mock data
        // TODO: Replace with actual API calls when endpoints are ready
        const mockData: DashboardData = {
          platformMetrics: {
            totalBusinesses: 1247,
            businessGrowth: 12.5,
            activeUsers: 15632,
            userGrowth: 8.3,
            monthlyRevenue: 897500,
            revenueGrowth: 15.7,
            totalOrders: 3821,
            orderGrowth: 22.1
          },
          businessStats: {
            pending: 3,
            active: 1184,
            suspended: 8,
            categories: [
              { name: 'Food & Restaurant', count: 542, growth: 18.2 },
              { name: 'Retail & Shopping', count: 389, growth: 15.4 },
              { name: 'Services', count: 316, growth: 9.8 }
            ]
          },
          recentActivity: [
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
          ],
          topBusinesses: [
            {
              name: 'Pai\'s Taste Food Special',
              category: 'Food',
              location: 'Montana, Pretoria',
              revenue: 154200,
              orders: 234,
              rating: 4.8,
              growth: 23.5
            },
            {
              name: 'Urban Style Boutique',
              category: 'Retail',
              location: 'Sandton, Johannesburg',
              revenue: 128300,
              orders: 189,
              rating: 4.6,
              growth: 18.2
            },
            {
              name: 'Premium Auto Detailing',
              category: 'Services',
              location: 'Umhlanga, Durban',
              revenue: 96500,
              orders: 156,
              rating: 4.9,
              growth: 31.8
            }
          ]
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))

        setData(mockData)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [timeRange])

  return {
    data,
    loading,
    error,
    refetch: () => {
      setLoading(true)
      // Trigger re-fetch by updating a dependency
    }
  }
}
