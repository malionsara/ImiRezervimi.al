// frontend/lib/admin.ts
// Admin utility functions

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!

// Admin client with service role
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export interface PendingSalon {
  id: string
  name: string
  slug: string
  phone: string
  email?: string
  address: string
  city: string
  instagram_handle?: string
  description?: string
  status: string
  created_at: string
  working_hours: Record<string, { open: string; close: string; closed: boolean }>
  services?: { id: string; name: string; duration_minutes: number; price?: number }[]
}

/**
 * Get all pending salon registrations
 */
export async function getPendingSalons(): Promise<PendingSalon[]> {
  if (!supabaseAdmin) {
    throw new Error('Admin access not configured')
  }

  const { data, error } = await supabaseAdmin
    .from('salons')
    .select(`
      id,
      name,
      slug,
      phone,
      email,
      address,
      city,
      instagram_handle,
      description,
      status,
      created_at,
      working_hours,
      services:services(id, name, duration_minutes, price)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending salons:', error)
    throw new Error('Failed to fetch pending salons')
  }

  return data || []
}

/**
 * Get salon statistics
 */
export async function getSalonStats() {
  if (!supabaseAdmin) {
    throw new Error('Admin access not configured')
  }

  try {
    // Get counts for each status
    const { data: pending } = await supabaseAdmin
      .from('salons')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { data: active } = await supabaseAdmin
      .from('salons')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    const { data: suspended } = await supabaseAdmin
      .from('salons')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'suspended')

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recent } = await supabaseAdmin
      .from('salons')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    return {
      pending: pending?.length || 0,
      active: active?.length || 0,
      suspended: suspended?.length || 0,
      recent: recent?.length || 0,
      total: (pending?.length || 0) + (active?.length || 0) + (suspended?.length || 0)
    }
  } catch (error) {
    console.error('Error fetching salon stats:', error)
    return {
      pending: 0,
      active: 0,
      suspended: 0,
      recent: 0,
      total: 0
    }
  }
}

/**
 * Simple admin authentication check
 * Replace this with your actual admin authentication system
 */
export function isAdmin(request: { headers?: { authorization?: string }; query?: { admin_key?: string } }): boolean {
  // TODO: Implement proper admin authentication
  // For now, check for a simple admin key in headers or query params
  
  const adminKey = process.env.ADMIN_SECRET_KEY
  if (!adminKey) {
    console.warn('ADMIN_SECRET_KEY not configured - admin access is open!')
    return true // Allow access if no key is configured (development)
  }

  // Check Authorization header
  const authHeader = request.headers?.authorization
  if (authHeader && authHeader === `Bearer ${adminKey}`) {
    return true
  }

  // Check query parameter (for easy access during development)
  const queryKey = request.query?.admin_key
  if (queryKey && queryKey === adminKey) {
    return true
  }

  return false
}

/**
 * Get admin access URL with secret key
 */
export function getAdminUrl(): string {
  const adminKey = process.env.ADMIN_SECRET_KEY
  if (!adminKey) {
    return '/admin/salons'
  }
  return `/admin/salons?admin_key=${adminKey}`
}

/**
 * Send notification to salon owner (placeholder)
 */
export async function notifySalonOwner(
  salon: PendingSalon, 
  type: 'approved' | 'rejected', 
  reason?: string
) {
  // TODO: Implement actual notification system
  // This could use email, SMS, or WhatsApp
  
  console.log(`=== SALON NOTIFICATION ===`)
  console.log(`Type: ${type}`)
  console.log(`Salon: ${salon.name}`)
  console.log(`Phone: ${salon.phone}`)
  if (salon.email) console.log(`Email: ${salon.email}`)
  if (reason) console.log(`Reason: ${reason}`)
  console.log(`========================`)

  // Example notification messages in Albanian:
  if (type === 'approved') {
    const message = `Përgëzime! Salloni juaj "${salon.name}" u miratua në ImiRezervimi.al. Tani mund të merrni rezervime online. Link: https://imirezervimi.al/${salon.slug}`
    console.log(`WhatsApp message: ${message}`)
  } else {
    const message = `Regjistrimi i sallonit "${salon.name}" në ImiRezervimi.al nuk u miratua.${reason ? ` Arsyeja: ${reason}` : ''} Ju lutemi na kontaktoni për më shumë informacion.`
    console.log(`WhatsApp message: ${message}`)
  }
}

/**
 * Validate admin environment
 */
export function validateAdminSetup(): { valid: boolean; issues: string[] } {
  const issues: string[] = []

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is not configured')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) {
    issues.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY is not configured - admin operations will fail')
  }

  if (!process.env.ADMIN_SECRET_KEY) {
    issues.push('ADMIN_SECRET_KEY is not configured - admin panel is unsecured')
  }

  return {
    valid: issues.length === 0,
    issues
  }
}