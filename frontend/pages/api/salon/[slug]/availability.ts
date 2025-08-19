// frontend/pages/api/salon/[slug]/availability.ts
// Get available time slots for a specific salon and date
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../../lib/appointments'
import { ALBANIAN_ERRORS, createValidationError } from '../../../../lib/validation'

// ==============================================
// API RESPONSE INTERFACE
// ==============================================
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

interface TimeSlot {
  time: string
  available: boolean
  reason?: string
}

// ==============================================
// HELPER FUNCTIONS
// ==============================================
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// ==============================================
// AVAILABILITY HANDLER
// ==============================================
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Vetëm GET request-et janë të lejuara'
      }
    })
  }

  try {
    // ==============================================
    // EXTRACT PARAMETERS
    // ==============================================
    const { slug } = req.query
    const { date, duration } = req.query

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json(createValidationError(
        'Slug i sallonit është i detyrueshëm'
      ))
    }

    if (!date || typeof date !== 'string') {
      return res.status(400).json(createValidationError(
        'Data është e detyrueshme'
      ))
    }

    const serviceDuration = duration ? parseInt(duration as string) : 30

    // ==============================================
    // FETCH SALON DATA
    // ==============================================
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select(`
        id,
        name,
        working_hours,
        status
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle()

    if (salonError) {
      console.error('Error fetching salon:', salonError)
      return res.status(500).json(createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR))
    }

    if (!salon) {
      return res.status(404).json(createValidationError(ALBANIAN_ERRORS.SALON_NOT_FOUND))
    }

    // ==============================================
    // VALIDATE DATE
    // ==============================================
    // Parse the date string properly to avoid timezone issues
    // date comes as "YYYY-MM-DD" format from the frontend
    const [year, month, day] = date.split('-').map(Number)
    const appointmentDate = new Date(year, month - 1, day) // month is 0-indexed
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    console.log(`🔍 Date validation: input="${date}", parsed=${appointmentDate.toISOString()}, today=${today.toISOString()}`)

    if (appointmentDate < today) {
      return res.status(400).json(createValidationError(
        'Data e zgjedhur është në të kaluarën'
      ))
    }

    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + 10)

    if (appointmentDate > maxDate) {
      return res.status(400).json(createValidationError(
        'Rezervimet mund të bëhen maksimumi 10 ditë para'
      ))
    }

    // ==============================================
    // CHECK WORKING HOURS
    // ==============================================
    const dayOfWeek = DAY_KEYS[appointmentDate.getDay()]
    const dayHours = salon.working_hours[dayOfWeek]

    if (!dayHours || dayHours.closed) {
      return res.status(200).json({
        success: true,
        data: {
          date: date,
          slots: [],
          reason: 'Salloni është i mbyllur në këtë ditë'
        }
      })
    }

    // ==============================================
    // GENERATE TIME SLOTS
    // ==============================================
    const timeSlots: TimeSlot[] = []

    // Parse opening and closing times
    const [openHour, openMinute] = dayHours.open.split(':').map(Number)
    const [closeHour, closeMinute] = dayHours.close.split(':').map(Number)

    // Create time slots in 30-minute intervals
    const startTime = new Date(2000, 0, 1, openHour, openMinute)
    const endTime = new Date(2000, 0, 1, closeHour, closeMinute)

    // Subtract service duration from end time to ensure service can be completed
    endTime.setMinutes(endTime.getMinutes() - serviceDuration)

    const currentSlot = new Date(startTime)

    while (currentSlot <= endTime) {
      const timeString = currentSlot.toTimeString().slice(0, 5) // HH:MM format
      
      timeSlots.push({
        time: timeString,
        available: true // For now, all slots are available
      })

      // Move to next 30-minute slot
      currentSlot.setMinutes(currentSlot.getMinutes() + 30)
    }

    // ==============================================
    // CHECK EXISTING APPOINTMENTS
    // ==============================================
    const { data: existingAppointments, error: appointmentsError } = await supabaseAdmin
      .from('appointments')
      .select('start_time, duration_minutes')
      .eq('salon_id', salon.id)
      .eq('appointment_date', date)
      .in('status', ['pending', 'approved'])

    if (appointmentsError) {
      console.error('Error fetching existing appointments:', appointmentsError)
      // Continue with all slots available rather than failing
    } else if (existingAppointments && existingAppointments.length > 0) {
      // Mark conflicting slots as unavailable
      existingAppointments.forEach(appointment => {
        const appointmentStart = new Date(`2000-01-01T${appointment.start_time}:00`)
        const appointmentEnd = new Date(appointmentStart)
        appointmentEnd.setMinutes(appointmentEnd.getMinutes() + appointment.duration_minutes)

        timeSlots.forEach(slot => {
          const slotStart = new Date(`2000-01-01T${slot.time}:00`)
          const slotEnd = new Date(slotStart)
          slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration)

          // Check for overlap
          if (
            (slotStart < appointmentEnd && slotEnd > appointmentStart) ||
            (appointmentStart < slotEnd && appointmentEnd > slotStart)
          ) {
            slot.available = false
            slot.reason = 'E zënë'
          }
        })
      })
    }

    // ==============================================
    // CHECK BLOCKED TIME SLOTS
    // ==============================================
    const { data: blockedSlots, error: blockedError } = await supabaseAdmin
      .from('time_slots')
      .select('start_time, duration_minutes, block_reason')
      .eq('salon_id', salon.id)
      .eq('date', date)
      .eq('status', 'blocked')

    if (blockedError) {
      console.error('Error fetching blocked slots:', blockedError)
      // Continue without checking blocked slots
    } else if (blockedSlots && blockedSlots.length > 0) {
      // Mark blocked slots as unavailable
      blockedSlots.forEach(blocked => {
        const blockedStart = new Date(`2000-01-01T${blocked.start_time}:00`)
        const blockedEnd = new Date(blockedStart)
        blockedEnd.setMinutes(blockedEnd.getMinutes() + blocked.duration_minutes)

        timeSlots.forEach(slot => {
          const slotStart = new Date(`2000-01-01T${slot.time}:00`)
          const slotEnd = new Date(slotStart)
          slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration)

          // Check for overlap
          if (
            (slotStart < blockedEnd && slotEnd > blockedStart) ||
            (blockedStart < slotEnd && blockedEnd > slotStart)
          ) {
            slot.available = false
            slot.reason = blocked.block_reason || 'E bllokuar'
          }
        })
      })
    }

    // ==============================================
    // FILTER PAST TIMES FOR TODAY
    // ==============================================
    if (appointmentDate.toDateString() === today.toDateString()) {
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes()

      timeSlots.forEach(slot => {
        const [slotHour, slotMinute] = slot.time.split(':').map(Number)
        const slotTime = slotHour * 60 + slotMinute

        // Add 1 hour buffer for same-day bookings
        if (slotTime <= currentTime + 60) {
          slot.available = false
          slot.reason = 'Kohë e kaluar'
        }
      })
    }

    console.log(`✅ Generated ${timeSlots.length} time slots for ${salon.name} on ${date}`)

    // ==============================================
    // SUCCESS RESPONSE
    // ==============================================
    return res.status(200).json({
      success: true,
      data: {
        date: date,
        salonName: salon.name,
        workingHours: dayHours,
        serviceDuration: serviceDuration,
        slots: timeSlots,
        totalSlots: timeSlots.length,
        availableSlots: timeSlots.filter(slot => slot.available).length
      }
    })

  } catch (error) {
    console.error('❌ Internal error in availability check:', error)
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ALBANIAN_ERRORS.INTERNAL_ERROR,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }
    })
  }
}