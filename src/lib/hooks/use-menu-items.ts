import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  combo_with: string | null
  combo_price: number | null
  available: boolean
}

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true)
          .order('category', { ascending: true })
          .order('name', { ascending: true })

        if (error) throw error
        setItems(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch menu items')
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  return { items, loading, error }
}