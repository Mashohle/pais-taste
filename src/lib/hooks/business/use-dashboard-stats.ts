import { useState, useEffect, useCallback } from 'react'
import { useBusinessAdminAuth } from '@/lib/context/business-admin-context'

interface FoodStats {
  newOrders: number
  inKitchen: number
  ready: number
  todaySales: number
}

interface RetailStats {
  products: number
  lowStock: number
  orders: number
  revenue: number
}

interface ServiceStats {
  todayBookings: number
  activeStaff: number
  inProgress: number
  revenue: number
}

type DashboardStats = FoodStats | RetailStats | ServiceStats

interface UseDashboardStatsReturn {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Global map to track which business IDs have been fetched (persists across remounts)
const fetchedBusinessIds = new Map<string, boolean>()

export function useDashboardStats(): UseDashboardStatsReturn {
  const { currentBusiness, loading: businessLoading } = useBusinessAdminAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const businessId = currentBusiness?.business?.id

  const fetchStats = useCallback(async () => {
    if (!businessId) {
      setLoading(false)
      return
    }

    // Prevent duplicate fetches using global map
    if (fetchedBusinessIds.get(businessId)) {
      console.log('📊 Dashboard Stats: Skipping duplicate fetch (already fetched)')
      setLoading(false)
      return
    }

    console.log('📊 Dashboard Stats: Fetching stats for business:', businessId)
    fetchedBusinessIds.set(businessId, true)

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/dashboard/stats?business_id=${businessId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      fetchedBusinessIds.delete(businessId) // Reset on error to allow retry
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    // Keep loading while business context is still loading
    if (businessLoading) {
      setLoading(true)
      return
    }

    // If business loading is done but no business, stop loading
    if (!businessId) {
      setStats(null)
      setLoading(false)
      return
    }

    // Business is ready, fetch data
    fetchStats()

    // Cleanup: Clear the fetched flag when component unmounts so it can fetch again on next mount
    return () => {
      if (businessId) {
        fetchedBusinessIds.delete(businessId)
      }
    }
  }, [fetchStats, businessId, businessLoading])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
