import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface OnboardingStep {
  id: number
  name: string
  description: string | null
  component: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export function useOnboardingSteps() {
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSteps()
  }, [])

  const fetchSteps = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        if (error.message?.includes('relation "public.onboarding_steps" does not exist')) {
          console.log('Onboarding steps table does not exist, showing empty steps')
          setSteps([])
          setError(null)
          return
        }
        if (error.message?.includes('infinite recursion') || 
            error.message?.includes('policy') ||
            error.code === '42P17') {
          console.log('RLS policy issue with onboarding steps, showing empty steps')
          setSteps([])
          setError(null)
          return
        }
        throw error
      }
      setSteps(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch onboarding steps')
    } finally {
      setLoading(false)
    }
  }

  return { steps, loading, error, refetch: fetchSteps }
}