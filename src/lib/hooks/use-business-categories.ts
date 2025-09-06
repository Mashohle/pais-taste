import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface BusinessCategory {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export function useBusinessCategories() {
  const [categories, setCategories] = useState<BusinessCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  return { categories, loading, error, refetch: fetchCategories }
}