// frontend/lib/salon.ts
// Salon utility functions for registration and management

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for admin operations (salon registration)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export interface SalonRegistrationData {
  // Basic Info
  name: string
  slug: string
  description?: string
  phone: string
  email?: string
  
  // Location
  address: string
  city: string
  
  // Social Media
  instagramHandle?: string
  facebookPage?: string
  websiteUrl?: string
  
  // Settings
  autoApproveVips: boolean
  maxAdvanceDays: number
  minCancellationMinutes: number
  
  // Working Hours
  workingHours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  
  // Services
  services: ServiceData[]
  
  // WhatsApp
  whatsappNumber?: string
  whatsappEnabled: boolean
}

export interface ServiceData {
  name: string
  description?: string
  duration: number
  price?: number
  requiresApproval: boolean
}

/**
 * Validates Albanian phone number format
 */
export function validateAlbanianPhone(phone: string): boolean {
  const albanianPhoneRegex = /^\+355[6-9][0-9]{8}$/
  return albanianPhoneRegex.test(phone)
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  if (!email) return true // Email is optional
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Validates URL slug format
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9_-]+$/
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50
}

/**
 * Generates URL-friendly slug from salon name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/-+/g, '_') // Replace hyphens with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
}

/**
 * Formats phone number to Albanian standard
 */
export function formatAlbanianPhone(phone: string): string {
  let formattedPhone = phone.replace(/\D/g, '') // Remove non-digits
  
  if (formattedPhone.startsWith('355')) {
    formattedPhone = '+' + formattedPhone
  } else if (formattedPhone.startsWith('0')) {
    formattedPhone = '+355' + formattedPhone.substring(1)
  } else if (!formattedPhone.startsWith('+355') && formattedPhone.length > 0) {
    formattedPhone = '+355' + formattedPhone
  }
  
  return formattedPhone
}

/**
 * Validates salon registration data
 */
export function validateSalonRegistration(data: SalonRegistrationData): { [key: string]: string } {
  const errors: { [key: string]: string } = {}

  // Required fields
  if (!data.name.trim()) {
    errors.name = 'Emri i sallonit është i detyrueshëm'
  }

  if (!data.slug.trim()) {
    errors.slug = 'URL slug është i detyrueshëm'
  } else if (!validateSlug(data.slug)) {
    errors.slug = 'URL slug duhet të përmbajë vetëm shkronja të vogla, numra, - dhe _'
  }

  if (!data.phone.trim()) {
    errors.phone = 'Numri i telefonit është i detyrueshëm'
  } else if (!validateAlbanianPhone(data.phone)) {
    errors.phone = 'Numri i telefonit duhet të jetë në formatin +355 XX XXX XXXX'
  }

  if (!data.address.trim()) {
    errors.address = 'Adresa është e detyrueshme'
  }

  // Optional field validations
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Formati i email-it nuk është i saktë'
  }

  if (data.websiteUrl && !data.websiteUrl.match(/^https?:\/\/.+/)) {
    errors.websiteUrl = 'Website URL duhet të fillojë me http:// ose https://'
  }

  return errors
}

/**
 * Checks if salon slug is available
 */
export async function checkSlugAvailability(slug: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (error && error.code === 'PGRST116') {
      // No rows returned, slug is available
      return true
    }

    if (data) {
      // Slug already exists
      return false
    }

    // Default to unavailable if we can't determine
    return false
  } catch (error) {
    console.error('Error checking slug availability:', error)
    return false
  }
}

/**
 * Registers a new salon in the database
 */
export async function registerSalon(data: SalonRegistrationData): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    // Use admin client for registration if available, otherwise use regular client
    const client = supabaseAdmin || supabase

    // Check if slug is available
    const isSlugAvailable = await checkSlugAvailability(data.slug)
    if (!isSlugAvailable) {
      return {
        success: false,
        error: 'Ky URL slug është në përdorim. Ju lutemi zgjidhni një tjetër.'
      }
    }

    // Prepare salon data
    const salonData = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      phone: data.phone,
      email: data.email || null,
      address: data.address,
      city: data.city,
      instagram_handle: data.instagramHandle || null,
      facebook_page: data.facebookPage || null,
      website_url: data.websiteUrl || null,
      auto_approve_vips: data.autoApproveVips,
      max_advance_days: data.maxAdvanceDays,
      min_cancellation_minutes: data.minCancellationMinutes,
      working_hours: data.workingHours,
      whatsapp_number: data.whatsappNumber || data.phone, // Default to main phone
      whatsapp_enabled: data.whatsappEnabled,
      status: 'pending' // All new salons start as pending
    }

    // Insert salon
    const { data: salon, error: salonError } = await client
      .from('salons')
      .insert(salonData)
      .select()
      .single()

    if (salonError) {
      console.error('Error inserting salon:', salonError)
      return {
        success: false,
        error: 'Gabim në regjistrimin e sallonit. Ju lutemi provoni përsëri.'
      }
    }

    // Insert services if any
    if (data.services && data.services.length > 0) {
      const servicesData = data.services.map((service, index) => ({
        salon_id: salon.id,
        name: service.name,
        description: service.description || null,
        duration_minutes: service.duration,
        price: service.price || null,
        requires_approval: service.requiresApproval,
        sort_order: index,
        is_active: true
      }))

      const { error: servicesError } = await client
        .from('services')
        .insert(servicesData)

      if (servicesError) {
        console.error('Error inserting services:', servicesError)
        // Don't fail the whole registration for services error
        // The salon is already created, services can be added later
      }
    }

    return {
      success: true,
      data: salon
    }

  } catch (error) {
    console.error('Unexpected error during salon registration:', error)
    return {
      success: false,
      error: 'Ka ndodhur një gabim i papritur. Ju lutemi provoni përsëri.'
    }
  }
}

/**
 * Gets salon by slug
 */
export async function getSalonBySlug(slug: string): Promise<{ salon?: unknown; services?: unknown[]; error?: string }> {
  try {
    // Get salon
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('*')
      .eq('slug', slug)
      .single()

    if (salonError) {
      return { error: 'Salloni nuk u gjet' }
    }

    // Get services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salon.id)
      .eq('is_active', true)
      .order('sort_order')

    if (servicesError) {
      console.error('Error fetching services:', servicesError)
    }

    return {
      salon,
      services: services || []
    }

  } catch (error) {
    console.error('Error getting salon by slug:', error)
    return { error: 'Gabim në marrjen e të dhënave' }
  }
}

/**
 * Gets all active salons with pagination
 */
export async function getActiveSalons(page: number = 1, limit: number = 12): Promise<{ salons: unknown[]; total: number; error?: string }> {
  try {
    const offset = (page - 1) * limit

    // Get count
    const { count, error: countError } = await supabase
      .from('salons')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (countError) {
      console.error('Error getting salon count:', countError)
      return { salons: [], total: 0, error: 'Gabim në marrjen e të dhënave' }
    }

    // Get salons
    const { data: salons, error: salonsError } = await supabase
      .from('salons')
      .select(`
        id,
        name,
        slug,
        description,
        city,
        instagram_handle,
        created_at
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (salonsError) {
      console.error('Error fetching salons:', salonsError)
      return { salons: [], total: 0, error: 'Gabim në marrjen e të dhënave' }
    }

    return {
      salons: salons || [],
      total: count || 0
    }

  } catch (error) {
    console.error('Error getting active salons:', error)
    return { salons: [], total: 0, error: 'Gabim në marrjen e të dhënave' }
  }
}

/**
 * Common Albanian cities
 */
export const ALBANIAN_CITIES = [
  'Tirana',
  'Durrës', 
  'Vlorë',
  'Shkodër',
  'Elbasan',
  'Korçë',
  'Fier',
  'Berat',
  'Gjirokastër',
  'Kukës',
  'Lezhë',
  'Dibër'
]

/**
 * Common beauty services in Albanian
 */
export const COMMON_BEAUTY_SERVICES = [
  { name: 'Manikyr klasik', duration: 30, price: 15 },
  { name: 'Nail Art', duration: 45, price: 25 },
  { name: 'Gel Polish', duration: 40, price: 20 },
  { name: 'Pedikyr', duration: 45, price: 20 },
  { name: 'Ngjyrosje flokësh', duration: 90, price: 35 },
  { name: 'Pre flokësh', duration: 120, price: 45 },
  { name: 'Stilim flokësh', duration: 60, price: 25 },
  { name: 'Trajtim flokësh', duration: 75, price: 30 },
  { name: 'Makyazh', duration: 45, price: 30 },
  { name: 'Depilim me dylbi', duration: 30, price: 18 },
  { name: 'Masazh relaksues', duration: 60, price: 40 },
  { name: 'Trajtim fytyre', duration: 90, price: 35 }
]