import { useState, useEffect, useCallback } from 'react'
import { useBusinessAdminAuth } from '@/lib/context/business-admin-context'

export interface Location {
  id: string
  business_id: string
  name: string
  address: string
  city: string
  province: string
  postal_code: string
  phone?: string
  description?: string
  operating_hours: {
    monday?: { open: string; close: string; closed: boolean }
    tuesday?: { open: string; close: string; closed: boolean }
    wednesday?: { open: string; close: string; closed: boolean }
    thursday?: { open: string; close: string; closed: boolean }
    friday?: { open: string; close: string; closed: boolean }
    saturday?: { open: string; close: string; closed: boolean }
    sunday?: { open: string; close: string; closed: boolean }
  }
  is_active: boolean
  is_primary: boolean
  capacity?: number
  amenities: string[]
  created_at: string
  updated_at?: string
}

interface UseLocationsReturn {
  locations: Location[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createLocation: (location: Partial<Location>) => Promise<void>
  updateLocation: (id: string, location: Partial<Location>) => Promise<void>
  deleteLocation: (id: string) => Promise<void>
  toggleLocationStatus: (id: string) => Promise<void>
}

export function useLocations(): UseLocationsReturn {
  const { currentBusiness, loading: businessLoading } = useBusinessAdminAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const businessId = currentBusiness?.business?.id

  const fetchLocations = useCallback(async () => {
    if (!businessId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/locations?business_id=${businessId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch locations')
      }

      const data = await response.json()
      setLocations(data.data || [])
    } catch (err) {
      console.error('Error fetching locations:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch locations')
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
      setLocations([])
      setLoading(false)
      return
    }

    // Business is ready, fetch data
    fetchLocations()
  }, [fetchLocations, businessId, businessLoading])

  const createLocation = useCallback(
    async (location: Partial<Location>) => {
      if (!businessId) return

      try {
        setError(null)

        const response = await fetch('/api/admin/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: businessId,
            ...location,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create location')
        }

        await fetchLocations()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create location'
        setError(errorMessage)
        throw err
      }
    },
    [businessId, fetchLocations]
  )

  const updateLocation = useCallback(
    async (id: string, location: Partial<Location>) => {
      if (!businessId) return

      try {
        setError(null)

        const response = await fetch('/api/admin/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            business_id: businessId,
            ...location,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update location')
        }

        await fetchLocations()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update location'
        setError(errorMessage)
        throw err
      }
    },
    [businessId, fetchLocations]
  )

  const deleteLocation = useCallback(
    async (id: string) => {
      if (!businessId) return

      try {
        setError(null)

        const response = await fetch(
          `/api/admin/locations?id=${id}&business_id=${businessId}`,
          {
            method: 'DELETE',
          }
        )

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to delete location')
        }

        await fetchLocations()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete location'
        setError(errorMessage)
        throw err
      }
    },
    [businessId, fetchLocations]
  )

  const toggleLocationStatus = useCallback(
    async (id: string) => {
      const location = locations.find((l) => l.id === id)
      if (!location) return

      await updateLocation(id, { is_active: !location.is_active })
    },
    [locations, updateLocation]
  )

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    toggleLocationStatus,
  }
}
