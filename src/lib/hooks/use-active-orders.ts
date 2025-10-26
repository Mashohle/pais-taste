import { useState, useEffect, useCallback } from 'react'

// API response types from database
interface OrderItemFromAPI {
  id: string
  order_id: string
  menu_item_id?: string
  quantity: number
  unit_price: number
  total_price: number
  special_instructions?: string | null
  menu_items?: {
    name: string
    image_url?: string | null
  }
}

interface BusinessFromAPI {
  id: string
  name: string
  slug: string
  phone?: string | null
  business_categories?: {
    id: string
    name: string
  } | null
}

interface OrderFromAPI {
  id: string
  reference?: string
  business_id: string
  order_status: string
  order_status_code?: string
  created_at: string
  estimated_ready_time?: string | null
  total_amount: number
  pickup_location?: string | null
  special_instructions?: string | null
  businesses?: BusinessFromAPI
  order_items?: OrderItemFromAPI[]
}

export interface ActiveOrderItem {
  id: string
  reference?: string
  business_id: string
  business_name: string
  business_category: string
  business_phone?: string
  type: 'order'
  status: string
  created_at: string
  estimated_time: string
  estimated_ready_time?: string
  total: number
  items: Array<{
    name: string
    price: number
    quantity: number
    image_url?: string
  }>
  pickup_location: string
  special_instructions?: string
  order_number?: string
}

export interface ActiveOrderStats {
  totalActiveOrders: number
  totalValue: number
  ordersByStatus: Record<string, number>
  uniqueBusinesses: number
  ordersByCategory: Record<string, number>
}

export interface ActiveOrderFilters {
  status?: string
  businessId?: string
  categoryId?: string
}

interface UseActiveOrdersReturn {
  orders: ActiveOrderItem[]
  stats: ActiveOrderStats | null
  loading: boolean
  error: string | null
  hasMore: boolean
  fetchMore: () => Promise<void>
  refetch: () => Promise<void>
}

export function useActiveOrders(filters: ActiveOrderFilters = {}): UseActiveOrdersReturn {
  const [orders, setOrders] = useState<ActiveOrderItem[]>([])
  const [stats, setStats] = useState<ActiveOrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const limit = 20

  const fetchOrders = useCallback(async (
    newOffset: number = 0,
    append: boolean = false
  ) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: newOffset.toString(),
      })

      if (filters.status) params.append('status', filters.status)
      if (filters.businessId) params.append('business_id', filters.businessId)
      if (filters.categoryId) params.append('category_id', filters.categoryId)

      const response = await fetch(`/api/customer/orders/active?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch active orders')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch active orders')
      }

      // Transform API data to match component interface
      const transformedOrders: ActiveOrderItem[] = (data.orders || []).map((order: OrderFromAPI) => ({
        id: order.id,
        reference: order.reference,
        business_id: order.business_id,
        business_name: order.businesses?.name || 'Unknown Business',
        business_category: order.businesses?.business_categories?.id || 'food',
        business_phone: order.businesses?.phone,
        type: 'order' as const,
        status: order.order_status_code || order.order_status || 'pending',
        created_at: order.created_at,
        estimated_time: order.estimated_ready_time || 'Pending',
        estimated_ready_time: order.estimated_ready_time,
        total: order.total_amount || 0,
        items: (order.order_items || []).map((item: OrderItemFromAPI) => ({
          name: item.menu_items?.name || 'Unknown Item',
          price: item.unit_price || 0,
          quantity: item.quantity || 1,
          image_url: item.menu_items?.image_url
        })),
        pickup_location: order.pickup_location || '',
        special_instructions: order.special_instructions,
        order_number: order.reference
      }))

      if (append) {
        setOrders(prev => [...prev, ...transformedOrders])
      } else {
        setOrders(transformedOrders)
      }

      setStats(data.stats)
      setHasMore(data.pagination.hasMore)
      setOffset(newOffset)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching active orders:', err)
    } finally {
      setLoading(false)
    }
  }, [filters.status, filters.businessId, filters.categoryId, limit])

  const fetchMore = useCallback(async () => {
    if (!hasMore || loading) return
    await fetchOrders(offset + limit, true)
  }, [hasMore, loading, offset, limit, fetchOrders])

  const refetch = useCallback(async () => {
    setOffset(0)
    await fetchOrders(0, false)
  }, [fetchOrders])

  // Fetch orders when component mounts or filters change
  useEffect(() => {
    setOffset(0)
    fetchOrders(0, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.businessId, filters.categoryId])

  return {
    orders,
    stats,
    loading,
    error,
    hasMore,
    fetchMore,
    refetch
  }
}
