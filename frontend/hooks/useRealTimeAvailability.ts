// frontend/hooks/useRealTimeAvailability.ts
// Real-time availability checking hook for ImiRezervimi.al
// Provides automatic refresh and conflict detection

import { useState, useEffect, useCallback, useRef } from 'react'

// ==============================================
// TYPES AND INTERFACES
// ==============================================
interface TimeSlot {
  time: string
  available: boolean
  reason?: string
}

interface AvailabilityData {
  date: string
  salonName: string
  workingHours: {
    open: string
    close: string
    closed: boolean
  }
  serviceDuration: number
  slots: TimeSlot[]
  totalSlots: number
  availableSlots: number
}

interface AvailabilityError {
  code: string
  message: string
  details?: unknown
}

interface UseRealTimeAvailabilityProps {
  salonSlug: string
  selectedDate: Date | null
  selectedService: { id: string; duration_minutes: number } | null
  refreshInterval?: number // in milliseconds, default 45 seconds
  enabled?: boolean
}

interface UseRealTimeAvailabilityReturn {
  availability: AvailabilityData | null
  timeSlots: TimeSlot[]
  loading: boolean
  error: AvailabilityError | null
  lastRefresh: Date | null
  refreshAvailability: () => Promise<void>
  availableSlotCount: number
  totalSlotCount: number
  isRefreshing: boolean
}

// ==============================================
// REAL-TIME AVAILABILITY HOOK
// ==============================================
export function useRealTimeAvailability({
  salonSlug,
  selectedDate,
  selectedService,
  refreshInterval = 45000, // 45 seconds
  enabled = true
}: UseRealTimeAvailabilityProps): UseRealTimeAvailabilityReturn {
  // State management
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<AvailabilityError | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Refs for managing intervals and preventing memory leaks
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isComponentMountedRef = useRef(true)

  // Format date for API call - avoid timezone issues
  const formatDateForAPI = useCallback((date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const formatted = `${year}-${month}-${day}`
    console.log(`📅 Date formatting: ${date} -> ${formatted}`)
    return formatted
  }, [])

  // Fetch availability data from API
  const fetchAvailability = useCallback(async (isRefreshCall = false): Promise<void> => {
    if (!enabled || !selectedDate || !selectedService || !salonSlug) {
      setAvailability(null)
      setError(null)
      return
    }

    try {
      if (isRefreshCall) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const dateString = formatDateForAPI(selectedDate)
      const url = `/api/salon/${salonSlug}/availability?date=${dateString}&duration=${selectedService.duration_minutes}`
      
      console.log(`🔄 Fetching availability: ${url} (refresh: ${isRefreshCall})`)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache' // Ensure fresh data
        }
      })

      if (!isComponentMountedRef.current) return

      const data = await response.json()

      if (data.success && data.data) {
        setAvailability(data.data)
        setLastRefresh(new Date())
        console.log(`✅ Availability updated: ${data.data.availableSlots}/${data.data.totalSlots} slots available`)
      } else {
        const errorData: AvailabilityError = {
          code: data.error?.code || 'FETCH_ERROR',
          message: data.error?.message || 'Gabim në marrjen e të dhënave të disponueshmërisë',
          details: data.error?.details
        }
        setError(errorData)
        console.error('❌ Availability fetch error:', errorData)
      }
    } catch (err) {
      if (!isComponentMountedRef.current) return

      const errorData: AvailabilityError = {
        code: 'NETWORK_ERROR',
        message: 'Gabim në lidhje. Kontrolloni internetin dhe provoni përsëri.',
        details: err
      }
      setError(errorData)
      console.error('❌ Network error fetching availability:', err)
    } finally {
      if (isComponentMountedRef.current) {
        if (isRefreshCall) {
          setIsRefreshing(false)
        } else {
          setLoading(false)
        }
      }
    }
  }, [enabled, selectedDate, selectedService, salonSlug, formatDateForAPI])

  // Manual refresh function
  const refreshAvailability = useCallback(async (): Promise<void> => {
    await fetchAvailability(true)
  }, [fetchAvailability])

  // Setup automatic refresh interval
  const setupRefreshInterval = useCallback(() => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // Only setup interval if we have valid data and component is enabled
    if (enabled && selectedDate && selectedService && availability) {
      refreshIntervalRef.current = setInterval(() => {
        console.log('⏰ Auto-refreshing availability...')
        fetchAvailability(true)
      }, refreshInterval)

      console.log(`⏱️ Auto-refresh set up with ${refreshInterval}ms interval`)
    }
  }, [enabled, selectedDate, selectedService, availability, refreshInterval, fetchAvailability])

  // Initial fetch when dependencies change
  useEffect(() => {
    fetchAvailability(false)
  }, [fetchAvailability])

  // Setup refresh interval when availability data is loaded
  useEffect(() => {
    setupRefreshInterval()

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [setupRefreshInterval])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])

  // Computed values
  const timeSlots = availability?.slots || []
  const availableSlotCount = timeSlots.filter(slot => slot.available).length
  const totalSlotCount = timeSlots.length

  return {
    availability,
    timeSlots,
    loading,
    error,
    lastRefresh,
    refreshAvailability,
    availableSlotCount,
    totalSlotCount,
    isRefreshing
  }
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Check if two time slots conflict with each other
 */
export function hasTimeConflict(
  slot1Start: string,
  slot1Duration: number,
  slot2Start: string,
  slot2Duration: number
): boolean {
  const start1 = new Date(`2000-01-01T${slot1Start}:00`)
  const end1 = new Date(start1.getTime() + slot1Duration * 60000)
  
  const start2 = new Date(`2000-01-01T${slot2Start}:00`)
  const end2 = new Date(start2.getTime() + slot2Duration * 60000)
  
  return start1 < end2 && end1 > start2
}

/**
 * Format last refresh time for display
 */
export function formatLastRefresh(lastRefresh: Date | null): string {
  if (!lastRefresh) return ''
  
  const now = new Date()
  const diffMs = now.getTime() - lastRefresh.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  
  if (diffSecs < 60) {
    return `Para ${diffSecs} sekondash`
  } else if (diffSecs < 3600) {
    const diffMins = Math.floor(diffSecs / 60)
    return `Para ${diffMins} minutash`
  } else {
    return lastRefresh.toLocaleTimeString('sq-AL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
}

/**
 * Get availability status message
 */
export function getAvailabilityStatusMessage(
  availableSlots: number,
  totalSlots: number,
  loading: boolean,
  error: AvailabilityError | null
): { message: string; type: 'info' | 'warning' | 'error' | 'success' } {
  if (loading) {
    return { message: 'Po kontrollon disponueshmërinë...', type: 'info' }
  }
  
  if (error) {
    return { message: error.message, type: 'error' }
  }
  
  if (totalSlots === 0) {
    return { message: 'Nuk ka orë pune për këtë datë', type: 'warning' }
  }
  
  if (availableSlots === 0) {
    return { message: 'Të gjitha orët janë të zëna për këtë datë', type: 'warning' }
  }
  
  if (availableSlots <= 2) {
    return { message: `Vetëm ${availableSlots} orë të lira`, type: 'warning' }
  }
  
  return { message: `${availableSlots} orë të disponueshme`, type: 'success' }
}