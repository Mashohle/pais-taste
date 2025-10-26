"use client"

import { useState, useEffect, useRef } from 'react'

interface LoadingOptions {
  minimumDuration?: number // Minimum time to show loading (ms)
  key: string // Unique key for this loading process
}

const globalLoadingStates = new Map<string, boolean>()
const loadingStartTimes = new Map<string, number>()
const subscribers = new Set<() => void>()

// Global loading coordinator
export function useLoadingCoordinator(isLoading: boolean, options: LoadingOptions) {
  const [coordinatedLoading, setCoordinatedLoading] = useState(isLoading)
  const { minimumDuration = 300, key } = options
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Subscribe to global loading changes
  useEffect(() => {
    const updateState = () => {
      const anyLoading = Array.from(globalLoadingStates.values()).some(Boolean)
      setCoordinatedLoading(anyLoading)
    }

    subscribers.add(updateState)
    return () => {
      subscribers.delete(updateState)
    }
  }, [])

  // Manage this specific loading state
  useEffect(() => {
    const currentTime = Date.now()

    if (isLoading) {
      // Start loading
      globalLoadingStates.set(key, true)
      loadingStartTimes.set(key, currentTime)

      // Notify subscribers
      subscribers.forEach(callback => callback())

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    } else {
      // Loading finished - but respect minimum duration
      const startTime = loadingStartTimes.get(key)
      const elapsed = startTime ? currentTime - startTime : minimumDuration

      const remainingTime = Math.max(0, minimumDuration - elapsed)

      if (remainingTime > 0) {
        // Wait for minimum duration before stopping
        timeoutRef.current = setTimeout(() => {
          globalLoadingStates.set(key, false)
          loadingStartTimes.delete(key)
          subscribers.forEach(callback => callback())
        }, remainingTime)
      } else {
        // Minimum time already elapsed
        globalLoadingStates.set(key, false)
        loadingStartTimes.delete(key)
        subscribers.forEach(callback => callback())
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isLoading, key, minimumDuration])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      globalLoadingStates.delete(key)
      loadingStartTimes.delete(key)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [key])

  return coordinatedLoading
}

// Simpler hook for pages that just want coordinated loading
export function usePageLoading(isLoading: boolean, pageName: string) {
  return useLoadingCoordinator(isLoading, {
    key: `page-${pageName}`,
    minimumDuration: 300
  })
}