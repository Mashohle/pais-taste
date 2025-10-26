// lib/hooks/use-menu-api.ts
import { useState, useEffect, useCallback } from 'react'
import { useBusinessAdminAuth } from '@/lib/context/business-admin-context'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  combo_with: string | null
  combo_price: number | null
  published: boolean
  available: boolean
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

export function useMenuApi(forAdmin: boolean = false) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentBusiness, loading: businessLoading } = useBusinessAdminAuth()

  const fetchMenuItems = useCallback(async () => {
    try {
      if (!currentBusiness?.business?.id) {
        setItems([])
        setLoading(false)
        return
      }

      const response = await fetch(`/api/admin/menu-items?businessId=${currentBusiness.business.id}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch menu items')
      }

      const data = await response.json()

      // Filter for customers if not admin
      const filteredItems = forAdmin
        ? data
        : data.filter((item: MenuItem) => item.published)

      setItems(filteredItems || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu items')
    } finally {
      setLoading(false)
    }
  }, [currentBusiness?.business?.id, forAdmin])

  useEffect(() => {
    // Keep loading while business context is still loading
    if (businessLoading) {
      setLoading(true)
      return
    }

    // If business loading is done but no business, stop loading
    if (!currentBusiness?.business?.id) {
      setItems([])
      setLoading(false)
      return
    }

    // Business is ready, fetch data
    setLoading(true) // Ensure loading stays true while fetching
    fetchMenuItems()
  }, [forAdmin, currentBusiness?.business?.id, businessLoading, fetchMenuItems])

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      if (!currentBusiness?.business?.id) {
        throw new Error('Business context required')
      }

      const response = await fetch(`/api/admin/menu-items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: currentBusiness.business.id,
          ...updates
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update menu item')
      }

      await fetchMenuItems() // Refresh the list
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update menu item')
      return false
    }
  }

  const deleteMenuItem = async (id: string) => {
    try {
      if (!currentBusiness?.business?.id) {
        throw new Error('Business context required')
      }

      const response = await fetch(`/api/admin/menu-items/${id}?businessId=${currentBusiness.business.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete menu item')
      }

      await fetchMenuItems() // Refresh the list
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete menu item')
      return false
    }
  }

  const createMenuItem = async (menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!currentBusiness?.business?.id) {
        throw new Error('Business context required')
      }

      const response = await fetch('/api/admin/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: currentBusiness.business.id,
          ...menuItem
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create menu item')
      }

      const data = await response.json()
      await fetchMenuItems() // Refresh the list
      return { success: true, data }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create menu item')
      return { success: false, error: err }
    }
  }

  const uploadMenuItemImage = async (file: File, menuItemId: string): Promise<string | null> => {
    try {
      if (!currentBusiness?.business?.id) {
        return null
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('menuItemId', menuItemId)
      formData.append('businessId', currentBusiness.business.id)

      const response = await fetch('/api/admin/menu-items/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await response.json()
      return data.url
    } catch {
      return null
    }
  }

  const deleteMenuItemImage = async (imageUrl: string): Promise<boolean> => {
    try {
      if (!currentBusiness?.business?.id) {
        return false
      }

      const response = await fetch('/api/admin/menu-items/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          businessId: currentBusiness.business.id
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete image')
      }

      return true
    } catch {
      return false
    }
  }

  return {
    items,
    loading,
    error,
    updateMenuItem,
    deleteMenuItem,
    createMenuItem,
    uploadMenuItemImage,
    deleteMenuItemImage,
    refreshItems: fetchMenuItems
  }
}