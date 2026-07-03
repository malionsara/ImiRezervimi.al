// frontend/lib/availability.ts
// Core availability calculation logic and business rules
// Albanian Beauty Salon Booking Platform

import { createClient } from '@supabase/supabase-js'
import {
  TimeSlot,
  TimeSlotRow,
  DayHours,
  WorkingHours,
  AvailabilityResult,
  AvailabilityFilter,
  AvailabilitySearchResult,
  CalendarDay,
  CalendarMonth,
  DayOfWeek,
  BulkTimeSlotOperation,
  BulkOperationResult,
  AvailabilityCache,
  SalonAvailabilitySettings,
  Holiday,
  AppointmentRow
} from '../types/database'

// ==============================================
// CONSTANTS AND CONFIGURATION
// ==============================================

const CACHE_DURATION_MINUTES = 15
const DEFAULT_SLOT_DURATION = 30
const MIN_BOOKING_HOURS = 1
const MAX_ADVANCE_BOOKING_DAYS = 30

// Albanian day names
const ALBANIAN_DAY_NAMES: Record<DayOfWeek, string> = {
  monday: 'E hënë',
  tuesday: 'E martë', 
  wednesday: 'E mërkurë',
  thursday: 'E enjte',
  friday: 'E premte',
  saturday: 'E shtunë',
  sunday: 'E dielë'
}

// Albanian month names
const ALBANIAN_MONTH_NAMES = [
  'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
  'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'
]

const DAY_KEYS: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// ==============================================
// SUPABASE CLIENT
// ==============================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// In-memory cache for performance optimization
const availabilityCache = new Map<string, AvailabilityCache>()

// ==============================================
// CORE AVAILABILITY FUNCTIONS
// ==============================================

/**
 * Calculate available time slots for a specific salon and date
 */
export async function calculateAvailability(
  salonId: string,
  date: string,
  serviceDuration: number = DEFAULT_SLOT_DURATION,
  useCache: boolean = true
): Promise<AvailabilityResult> {
  try {
    // Check cache first
    const cacheKey = `${salonId}-${date}-${serviceDuration}`
    if (useCache && availabilityCache.has(cacheKey)) {
      const cached = availabilityCache.get(cacheKey)!
      if (new Date(cached.expiresAt) > new Date()) {
        console.log(`📦 Cache hit for availability: ${cacheKey}`)
        return cached.data
      } else {
        availabilityCache.delete(cacheKey)
      }
    }

    // Validate input date
    const appointmentDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (appointmentDate < today) {
      throw new Error('Data e zgjedhur është në të kaluarën')
    }

    if (appointmentDate > new Date(today.getTime() + MAX_ADVANCE_BOOKING_DAYS * 24 * 60 * 60 * 1000)) {
      throw new Error(`Rezervimet mund të bëhen maksimumi ${MAX_ADVANCE_BOOKING_DAYS} ditë para`)
    }

    // Fetch salon information
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id, name, working_hours, status')
      .eq('id', salonId)
      .eq('status', 'active')
      .single()

    if (salonError || !salon) {
      throw new Error('Salloni nuk u gjet ose nuk është aktiv')
    }

    // Check if salon is open on this day
    const dayOfWeek = DAY_KEYS[appointmentDate.getDay()]
    const dayHours = salon.working_hours[dayOfWeek] as DayHours

    if (!dayHours || dayHours.closed) {
      return {
        date,
        salonName: salon.name,
        workingHours: dayHours || { open: '09:00', close: '17:00', closed: true },
        serviceDuration,
        slots: [],
        totalSlots: 0,
        availableSlots: 0,
        blockedSlots: 0,
        bookedSlots: 0
      }
    }

    // Generate base time slots
    const baseSlots = generateTimeSlots(dayHours, serviceDuration)

    // Fetch existing appointments for this date
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('start_time, duration_minutes')
      .eq('salon_id', salonId)
      .eq('appointment_date', date)
      .in('status', ['pending', 'approved'])

    if (appointmentsError) {
      console.warn('Error fetching appointments:', appointmentsError)
    }

    // Fetch blocked time slots
    const { data: blockedSlots, error: blockedError } = await supabase
      .from('time_slots')
      .select('start_time, duration_minutes, block_reason')
      .eq('salon_id', salonId)
      .eq('date', date)
      .eq('status', 'blocked')

    if (blockedError) {
      console.warn('Error fetching blocked slots:', blockedError)
    }

    // Process slots and mark conflicts
    const processedSlots = await processTimeSlots(
      baseSlots,
      appointments || [],
      blockedSlots || [],
      salonId,
      date,
      serviceDuration
    )

    // Filter past times for today
    const finalSlots = filterPastTimes(processedSlots, date)

    // Calculate statistics
    const stats = calculateSlotStatistics(finalSlots)

    const result: AvailabilityResult = {
      date,
      salonName: salon.name,
      workingHours: dayHours,
      serviceDuration,
      slots: finalSlots,
      ...stats
    }

    // Cache the result
    if (useCache) {
      const expiresAt = new Date(Date.now() + CACHE_DURATION_MINUTES * 60 * 1000)
      availabilityCache.set(cacheKey, {
        salonId,
        date,
        data: result,
        cachedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      })
    }

    console.log(`✅ Generated availability for ${salon.name} on ${date}: ${stats.availableSlots}/${stats.totalSlots} available`)

    return result

  } catch (error) {
    console.error('Error calculating availability:', error)
    throw error
  }
}

/**
 * Generate base time slots based on working hours
 */
function generateTimeSlots(dayHours: DayHours, serviceDuration: number): TimeSlot[] {
  const slots: TimeSlot[] = []

  // Parse opening and closing times
  const [openHour, openMinute] = dayHours.open.split(':').map(Number)
  const [closeHour, closeMinute] = dayHours.close.split(':').map(Number)

  // Create time slots in 30-minute intervals
  const startTime = new Date(2000, 0, 1, openHour, openMinute)
  const endTime = new Date(2000, 0, 1, closeHour, closeMinute)

  // Subtract service duration from end time to ensure service can be completed
  endTime.setMinutes(endTime.getMinutes() - serviceDuration)

  const currentSlot = new Date(startTime)
  let slotIndex = 0

  while (currentSlot <= endTime) {
    const timeString = currentSlot.toTimeString().slice(0, 5) // HH:MM format
    const endSlotTime = new Date(currentSlot)
    endSlotTime.setMinutes(endSlotTime.getMinutes() + serviceDuration)
    const endTimeString = endSlotTime.toTimeString().slice(0, 5)

    slots.push({
      id: `temp-${slotIndex}`,
      salonId: '',
      date: '',
      startTime: timeString,
      endTime: endTimeString,
      duration: serviceDuration,
      status: 'available',
      available: true,
      createdAt: new Date().toISOString()
    })

    // Move to next 30-minute slot
    currentSlot.setMinutes(currentSlot.getMinutes() + 30)
    slotIndex++
  }

  return slots
}

/**
 * Process time slots to mark conflicts with appointments and blocked periods
 */
async function processTimeSlots(
  baseSlots: TimeSlot[],
  appointments: any[],
  blockedSlots: any[],
  salonId: string,
  date: string,
  serviceDuration: number
): Promise<TimeSlot[]> {

  return baseSlots.map((slot, index) => {
    const processedSlot: TimeSlot = {
      ...slot,
      id: `${salonId}-${date}-${slot.startTime}`,
      salonId,
      date
    }

    // Check for appointment conflicts
    for (const appointment of appointments) {
      const appointmentStart = new Date(`2000-01-01T${appointment.start_time}:00`)
      const appointmentEnd = new Date(appointmentStart)
      appointmentEnd.setMinutes(appointmentEnd.getMinutes() + appointment.duration_minutes)

      const slotStart = new Date(`2000-01-01T${slot.startTime}:00`)
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration)

      // Check for overlap
      if (
        (slotStart < appointmentEnd && slotEnd > appointmentStart) ||
        (appointmentStart < slotEnd && appointmentEnd > slotStart)
      ) {
        processedSlot.status = 'booked'
        processedSlot.available = false
        processedSlot.blockReason = 'E zënë'
        break
      }
    }

    // Check for blocked time slots (only if not already booked)
    if (processedSlot.status === 'available') {
      for (const blocked of blockedSlots) {
        const blockedStart = new Date(`2000-01-01T${blocked.start_time}:00`)
        const blockedEnd = new Date(blockedStart)
        blockedEnd.setMinutes(blockedEnd.getMinutes() + blocked.duration_minutes)

        const slotStart = new Date(`2000-01-01T${slot.startTime}:00`)
        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration)

        // Check for overlap
        if (
          (slotStart < blockedEnd && slotEnd > blockedStart) ||
          (blockedStart < slotEnd && blockedEnd > slotStart)
        ) {
          processedSlot.status = 'blocked'
          processedSlot.available = false
          processedSlot.blockReason = blocked.block_reason || 'E bllokuar'
          break
        }
      }
    }

    return processedSlot
  })
}

/**
 * Filter out past times for today's appointments
 */
function filterPastTimes(slots: TimeSlot[], date: string): TimeSlot[] {
  const appointmentDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Only filter if the appointment is for today
  if (appointmentDate.toDateString() !== today.toDateString()) {
    return slots
  }

  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  return slots.map(slot => {
    const [slotHour, slotMinute] = slot.startTime.split(':').map(Number)
    const slotTime = slotHour * 60 + slotMinute

    // Add minimum booking buffer
    if (slotTime <= currentTime + (MIN_BOOKING_HOURS * 60)) {
      return {
        ...slot,
        status: 'blocked' as const,
        available: false,
        blockReason: 'Kohë e kaluar'
      }
    }

    return slot
  })
}

/**
 * Calculate slot statistics
 */
function calculateSlotStatistics(slots: TimeSlot[]) {
  const stats = {
    totalSlots: slots.length,
    availableSlots: 0,
    blockedSlots: 0,
    bookedSlots: 0
  }

  slots.forEach(slot => {
    switch (slot.status) {
      case 'available':
        stats.availableSlots++
        break
      case 'blocked':
        stats.blockedSlots++
        break
      case 'booked':
        stats.bookedSlots++
        break
    }
  })

  return stats
}

// ==============================================
// CALENDAR MANAGEMENT FUNCTIONS
// ==============================================

/**
 * Generate calendar month view with availability data
 */
export async function generateCalendarMonth(
  salonId: string,
  year: number,
  month: number // 0-based (January = 0)
): Promise<CalendarMonth> {
  try {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch salon working hours
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('working_hours, name')
      .eq('id', salonId)
      .single()

    if (salonError || !salon) {
      throw new Error('Salloni nuk u gjet')
    }

    const workingHours = salon.working_hours as WorkingHours
    const days: CalendarDay[] = []

    // Batch-fetch the whole month's appointments and blocked slots in two
    // queries instead of three sequential queries per day (the old per-day
    // loop produced ~75 round trips and took 10s+ on real networks).
    const firstDateString = firstDay.toISOString().split('T')[0]
    const lastDateString = lastDay.toISOString().split('T')[0]

    const [{ data: monthAppointments, error: appointmentsError }, { data: monthBlocked, error: blockedError }] =
      await Promise.all([
        supabase
          .from('appointments')
          .select('appointment_date, start_time, duration_minutes')
          .eq('salon_id', salonId)
          .gte('appointment_date', firstDateString)
          .lte('appointment_date', lastDateString)
          .in('status', ['pending', 'approved']),
        supabase
          .from('time_slots')
          .select('date, start_time, duration_minutes, block_reason')
          .eq('salon_id', salonId)
          .gte('date', firstDateString)
          .lte('date', lastDateString)
          .eq('status', 'blocked')
      ])

    if (appointmentsError) {
      console.warn('Error fetching month appointments:', appointmentsError)
    }
    if (blockedError) {
      console.warn('Error fetching month blocked slots:', blockedError)
    }

    // Group by date for O(1) per-day lookup
    const appointmentsByDate = new Map<string, any[]>()
    for (const appointment of monthAppointments || []) {
      const list = appointmentsByDate.get(appointment.appointment_date) || []
      list.push(appointment)
      appointmentsByDate.set(appointment.appointment_date, list)
    }
    const blockedByDate = new Map<string, any[]>()
    for (const blocked of monthBlocked || []) {
      const list = blockedByDate.get(blocked.date) || []
      list.push(blocked)
      blockedByDate.set(blocked.date, list)
    }

    // Generate all days in the month
    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0]
      const dayOfWeek = DAY_KEYS[date.getDay()]
      const dayHours = workingHours[dayOfWeek]
      const isWorkingDay = dayHours && !dayHours.closed

      let calendarDay: CalendarDay = {
        date: dateString,
        dayOfWeek,
        isToday: date.getTime() === today.getTime(),
        isWorkingDay: Boolean(isWorkingDay),
        workingHours: dayHours,
        totalSlots: 0,
        availableSlots: 0,
        blockedSlots: 0,
        bookedSlots: 0,
        appointments: [],
        holidays: []
      }

      // Only calculate availability for working days that aren't in the past
      if (isWorkingDay && date >= today) {
        try {
          const baseSlots = generateTimeSlots(dayHours as DayHours, DEFAULT_SLOT_DURATION)
          const processedSlots = await processTimeSlots(
            baseSlots,
            appointmentsByDate.get(dateString) || [],
            blockedByDate.get(dateString) || [],
            salonId,
            dateString,
            DEFAULT_SLOT_DURATION
          )
          const finalSlots = filterPastTimes(processedSlots, dateString)
          const stats = calculateSlotStatistics(finalSlots)
          calendarDay = {
            ...calendarDay,
            totalSlots: stats.totalSlots,
            availableSlots: stats.availableSlots,
            blockedSlots: stats.blockedSlots,
            bookedSlots: stats.bookedSlots
          }
        } catch (error) {
          console.warn(`Error calculating availability for ${dateString}:`, error)
        }
      }

      days.push(calendarDay)
    }

    // Calculate month statistics
    const stats = {
      totalWorkingDays: days.filter(d => d.isWorkingDay).length,
      totalAvailableSlots: days.reduce((sum, d) => sum + d.availableSlots, 0),
      totalBookedSlots: days.reduce((sum, d) => sum + d.bookedSlots, 0),
      totalBlockedSlots: days.reduce((sum, d) => sum + d.blockedSlots, 0)
    }

    return {
      year,
      month,
      monthName: ALBANIAN_MONTH_NAMES[month],
      days,
      stats
    }

  } catch (error) {
    console.error('Error generating calendar month:', error)
    throw error
  }
}

// ==============================================
// TIME SLOT MANAGEMENT FUNCTIONS
// ==============================================

/**
 * Block a time slot
 */
export async function blockTimeSlot(
  salonId: string,
  date: string,
  startTime: string,
  duration: number = DEFAULT_SLOT_DURATION,
  reason: string = 'E bllokuar'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('time_slots')
      .upsert({
        salon_id: salonId,
        date,
        start_time: startTime,
        duration_minutes: duration,
        status: 'blocked',
        block_reason: reason
      }, {
        onConflict: 'salon_id,date,start_time'
      })

    if (error) throw error

    // Clear cache for this date
    clearAvailabilityCache(salonId, date)

    console.log(`✅ Blocked time slot: ${date} ${startTime} for salon ${salonId}`)

  } catch (error) {
    console.error('Error blocking time slot:', error)
    throw new Error('Gabim në bllokimin e kohës')
  }
}

/**
 * Unblock a time slot
 */
export async function unblockTimeSlot(
  salonId: string,
  date: string,
  startTime: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('time_slots')
      .delete()
      .eq('salon_id', salonId)
      .eq('date', date)
      .eq('start_time', startTime)
      .eq('status', 'blocked')

    if (error) throw error

    // Clear cache for this date
    clearAvailabilityCache(salonId, date)

    console.log(`✅ Unblocked time slot: ${date} ${startTime} for salon ${salonId}`)

  } catch (error) {
    console.error('Error unblocking time slot:', error)
    throw new Error('Gabim në çbllokimin e kohës')
  }
}

/**
 * Bulk operations for time slot management
 */
export async function bulkManageTimeSlots(
  salonId: string,
  operation: BulkTimeSlotOperation
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: true,
    processed: 0,
    failed: 0,
    errors: []
  }

  try {
    for (const slot of operation.slots) {
      try {
        switch (operation.operation) {
          case 'block':
            await blockTimeSlot(
              salonId,
              slot.date,
              slot.startTime,
              slot.duration || DEFAULT_SLOT_DURATION,
              operation.reason || 'E bllokuar në grup'
            )
            break
          case 'unblock':
            await unblockTimeSlot(salonId, slot.date, slot.startTime)
            break
          case 'delete':
            await unblockTimeSlot(salonId, slot.date, slot.startTime)
            break
        }
        result.processed++
      } catch (error) {
        result.failed++
        result.errors.push(`${slot.date} ${slot.startTime}: ${error instanceof Error ? error.message : 'Gabim i panjohur'}`)
      }
    }

    if (result.failed > 0) {
      result.success = false
    }

    console.log(`📊 Bulk operation completed: ${result.processed} processed, ${result.failed} failed`)

    return result

  } catch (error) {
    console.error('Error in bulk operation:', error)
    return {
      success: false,
      processed: 0,
      failed: operation.slots.length,
      errors: ['Gabim i përgjithshëm në operacionin në grup']
    }
  }
}

// ==============================================
// WORKING HOURS MANAGEMENT
// ==============================================

/**
 * Update salon working hours
 */
export async function updateWorkingHours(
  salonId: string,
  workingHours: WorkingHours
): Promise<void> {
  try {
    const { error } = await supabase
      .from('salons')
      .update({ working_hours: workingHours })
      .eq('id', salonId)

    if (error) throw error

    // Clear all cache for this salon
    clearSalonCache(salonId)

    console.log(`✅ Updated working hours for salon ${salonId}`)

  } catch (error) {
    console.error('Error updating working hours:', error)
    throw new Error('Gabim në përditësimin e orëve të punës')
  }
}

// ==============================================
// CACHE MANAGEMENT
// ==============================================

/**
 * Clear availability cache for a specific date
 */
function clearAvailabilityCache(salonId: string, date: string): void {
  const keysToDelete: string[] = []
  
  for (const [key, cached] of availabilityCache.entries()) {
    if (cached.salonId === salonId && cached.date === date) {
      keysToDelete.push(key)
    }
  }

  keysToDelete.forEach(key => availabilityCache.delete(key))
  
  if (keysToDelete.length > 0) {
    console.log(`🗑️ Cleared ${keysToDelete.length} cache entries for ${salonId} on ${date}`)
  }
}

/**
 * Clear all cache entries for a salon
 */
function clearSalonCache(salonId: string): void {
  const keysToDelete: string[] = []
  
  for (const [key, cached] of availabilityCache.entries()) {
    if (cached.salonId === salonId) {
      keysToDelete.push(key)
    }
  }

  keysToDelete.forEach(key => availabilityCache.delete(key))
  
  if (keysToDelete.length > 0) {
    console.log(`🗑️ Cleared ${keysToDelete.length} cache entries for salon ${salonId}`)
  }
}

/**
 * Clear expired cache entries
 */
export function cleanupExpiredCache(): void {
  const now = new Date()
  const keysToDelete: string[] = []

  for (const [key, cached] of availabilityCache.entries()) {
    if (new Date(cached.expiresAt) <= now) {
      keysToDelete.push(key)
    }
  }

  keysToDelete.forEach(key => availabilityCache.delete(key))
  
  if (keysToDelete.length > 0) {
    console.log(`🗑️ Cleaned up ${keysToDelete.length} expired cache entries`)
  }
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Format Albanian date
 */
export function formatAlbanianDate(dateString: string): string {
  const date = new Date(dateString)
  const dayName = ALBANIAN_DAY_NAMES[DAY_KEYS[date.getDay()]]
  const day = date.getDate()
  const month = ALBANIAN_MONTH_NAMES[date.getMonth()]
  const year = date.getFullYear()
  
  return `${dayName}, ${day} ${month} ${year}`
}

/**
 * Get Albanian day name
 */
export function getAlbanianDayName(dayOfWeek: DayOfWeek): string {
  return ALBANIAN_DAY_NAMES[dayOfWeek]
}

/**
 * Validate time slot format
 */
export function validateTimeSlot(startTime: string, duration: number): boolean {
  // Check time format (HH:MM)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(startTime)) {
    return false
  }

  // Check duration is positive and reasonable
  if (duration <= 0 || duration > 480) { // Max 8 hours
    return false
  }

  return true
}

/**
 * Check if a time slot conflicts with working hours
 */
export function isTimeSlotInWorkingHours(
  startTime: string,
  duration: number,
  workingHours: DayHours
): boolean {
  if (workingHours.closed) {
    return false
  }

  const slotStart = startTime
  const [hours, minutes] = startTime.split(':').map(Number)
  const endDate = new Date(2000, 0, 1, hours, minutes + duration)
  const slotEnd = endDate.toTimeString().slice(0, 5)

  return slotStart >= workingHours.open && slotEnd <= workingHours.close
}

// Run cache cleanup every 30 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredCache, 30 * 60 * 1000)
}