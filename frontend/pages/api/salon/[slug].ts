// frontend/pages/api/salon/[slug].ts
// Get salon details and services by slug for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/appointments'
import { ALBANIAN_ERRORS, createValidationError } from '../../../lib/validation'

// ==============================================
// API RESPONSE INTERFACE
// ==============================================
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

interface SalonWithServices {
  id: string
  name: string
  slug: string
  description: string
  phone: string
  address: string
  city: string
  instagram_handle: string
  working_hours: any
  services: Array<{
    id: string
    name: string
    description: string
    price: number
    duration_minutes: number
    sort_order: number
  }>
}

// ==============================================
// MAIN SALON DETAILS HANDLER
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
    // EXTRACT SALON SLUG
    // ==============================================
    const { slug } = req.query

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json(createValidationError(
        'Slug i sallonit është i detyrueshëm'
      ))
    }

    // ==============================================
    // FETCH SALON DATA
    // ==============================================
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select(`
        id,
        name,
        slug,
        description,
        phone,
        address,
        city,
        instagram_handle,
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
    // FETCH SALON SERVICES
    // ==============================================
    const { data: services, error: servicesError } = await supabaseAdmin
      .from('services')
      .select(`
        id,
        name,
        description,
        price,
        duration_minutes,
        sort_order
      `)
      .eq('salon_id', salon.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (servicesError) {
      console.error('Error fetching services:', servicesError)
      return res.status(500).json(createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR))
    }

    // ==============================================
    // PREPARE RESPONSE DATA
    // ==============================================
    const salonWithServices: SalonWithServices = {
      id: salon.id,
      name: salon.name,
      slug: salon.slug,
      description: salon.description || '',
      phone: salon.phone,
      address: salon.address,
      city: salon.city,
      instagram_handle: salon.instagram_handle || '',
      working_hours: salon.working_hours,
      services: services || []
    }

    console.log(`✅ Salon data fetched: ${salon.name} with ${services?.length || 0} services`)

    // ==============================================
    // SUCCESS RESPONSE
    // ==============================================
    return res.status(200).json({
      success: true,
      data: salonWithServices
    })

  } catch (error) {
    console.error('❌ Internal error in salon details:', error)
    
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

// ==============================================
// AVAILABLE TIME SLOTS ENDPOINT
// ==============================================

/**
 * Get available time slots for a specific date
 * TODO: Implement this in a separate endpoint /api/salon/[slug]/availability
 */
export async function getAvailableTimeSlots(
  salonId: string,
  date: string,
  serviceDuration: number
): Promise<string[]> {
  try {
    // Get salon working hours for the day
    const { data: salon } = await supabaseAdmin
      .from('salons')
      .select('working_hours')
      .eq('id', salonId)
      .single()

    if (!salon) return []

    // Get day of week
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(date).getDay()]
    const dayHours = salon.working_hours[dayOfWeek]

    if (!dayHours || dayHours.closed) return []

    // Generate time slots
    const slots: string[] = []
    const start = new Date(`2000-01-01T${dayHours.open}:00`)
    const end = new Date(`2000-01-01T${dayHours.close}:00`)
    
    // Subtract service duration from end time to ensure service can be completed
    end.setMinutes(end.getMinutes() - serviceDuration)

    const current = new Date(start)
    while (current <= end) {
      const timeString = current.toTimeString().slice(0, 5) // HH:MM format
      slots.push(timeString)
      current.setMinutes(current.getMinutes() + 30) // 30-minute intervals
    }

    // TODO: Remove booked slots by checking appointments table
    // const { data: bookedSlots } = await supabaseAdmin
    //   .from('appointments')
    //   .select('start_time, duration_minutes')
    //   .eq('salon_id', salonId)
    //   .eq('appointment_date', date)
    //   .in('status', ['pending', 'approved'])

    return slots

  } catch (error) {
    console.error('Error getting available time slots:', error)
    return []
  }
}