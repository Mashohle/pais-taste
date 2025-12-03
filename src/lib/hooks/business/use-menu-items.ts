// lib/hooks/use-menu-items.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
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

export function useMenuItems(forAdmin: boolean = false) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentBusiness } = useBusinessAdminAuth()

  const fetchMenuItems = useCallback(async () => {
    try {
      // SECURITY FIX: Always filter by current business to prevent cross-tenant access
      if (!currentBusiness?.business?.id) {
        setItems([])
        return
      }

      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('business_id', currentBusiness.id) // CRITICAL: Filter by business

      if (!forAdmin) {
        // For customers: only show published items
        query = query.eq('published', true)
      }
      // For admin: show all items regardless of published/available status

      const { data, error } = await query
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setItems(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu items')
    } finally {
      setLoading(false)
    }
  }, [forAdmin, currentBusiness])

  useEffect(() => {
    // Only fetch if we have a business context
    if (!currentBusiness?.business?.id) {
      setItems([])
      setLoading(false)
      return
    }

    fetchMenuItems()

    // Set up real-time subscription
    const subscription = supabase
      .channel('menu_items')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => fetchMenuItems()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [forAdmin, currentBusiness?.business?.id, fetchMenuItems])

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required')
      }

      // SECURITY FIX: Only allow updating items from current business
      if (!currentBusiness?.business?.id) {
        throw new Error('Business context required')
      }

      const { error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .eq('business_id', currentBusiness.id) // CRITICAL: Prevent cross-tenant updates

      if (error) throw error
      fetchMenuItems() // Refresh the list
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update menu item')
      return false
    }
  }

  const deleteMenuItem = async (id: string) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required')
      }

      // SECURITY FIX: Only allow deleting items from current business
      if (!currentBusiness?.business?.id) {
        throw new Error('Business context required')
      }

      // First, delete the image from storage if it exists
      const item = items.find(i => i.id === id)
      if (item?.image_url) {
        await deleteMenuItemImage(item.image_url)
      }

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
        .eq('business_id', currentBusiness.id) // CRITICAL: Prevent cross-tenant deletes

      if (error) throw error
      fetchMenuItems() // Refresh the list
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete menu item')
      return false
    }
  }

  const createMenuItem = async (menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required')
      }

      // SECURITY FIX: Ensure new items are created with current business_id
      if (!currentBusiness?.business?.id) {
        throw new Error('Business context required')
      }

      const menuItemWithBusiness = {
        ...menuItem,
        business_id: currentBusiness.id // CRITICAL: Always set business_id
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert([menuItemWithBusiness])
        .select()
        .single()

      if (error) throw error
      fetchMenuItems() // Refresh the list
      return { success: true, data }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create menu item')
      return { success: false, error: err }
    }
  }

  // Image upload function with auth check
  const uploadMenuItemImage = async (file: File, menuItemId: string): Promise<string | null> => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No active session for upload')
        return null
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${menuItemId}-${Date.now()}.${fileExt}`
      const filePath = `menu-items/${fileName}`

      const { error } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  // Image deletion function with auth check
  const deleteMenuItemImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No active session for deletion')
        return false
      }

      // Extract the file path from the URL
      const urlParts = imageUrl.split('/storage/v1/object/public/menu-images/')
      if (urlParts.length !== 2) return false
      
      const filePath = urlParts[1]

      const { error } = await supabase.storage
        .from('menu-images')
        .remove([filePath])

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting image:', error)
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