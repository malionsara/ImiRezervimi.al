// frontend/lib/salon-dashboard.ts
// Salon dashboard utility functions and business logic
// Albanian Beauty Salon Booking Platform

import { createClient } from '@supabase/supabase-js'

// ==============================================
// TYPES AND INTERFACES
// ==============================================
export interface DashboardData {
  pendingRequests: AppointmentRequest[]
  todaySchedule: Appointment[]
  recentActivity: Appointment[]
  salon: SalonInfo
  stats: DashboardStats
}

// Raw database response interfaces
interface RawAppointmentData {
  id: string
  appointment_date: string
  start_time: string
  customer_notes?: string
  created_at: string
  customers: {
    id: string
    first_name: string
    last_name: string
    phone: string
    rating?: number
    total_visits?: number
    priority_score?: number
  }
  services: {
    id: string
    name: string
    duration: number
    price: number
  }
}

interface SupabaseError {
  code?: string
  message?: string
}

export interface AppointmentRequest {
  id: string
  customer: {
    id: string
    firstName: string
    lastName: string
    phone: string
    rating: number
    totalVisits: number
    priorityScore: number
  }
  service: {
    id: string
    name: string
    duration: number
    price: number
  }
  appointmentDate: string
  startTime: string
  customerNotes?: string
  requestedAt: string
  priorityScore: number
}

export interface Appointment {
  id: string
  customer: {
    firstName: string
    lastName: string
    phone: string
  }
  service: {
    name: string
    duration: number
  }
  appointmentDate: string
  startTime: string
  status: string
  salonNotes?: string
}

export interface SalonInfo {
  id: string
  name: string
  workingHours: { [key: string]: { open: string; close: string; closed: boolean } }
}

export interface DashboardStats {
  pendingCount: number
  todayCount: number
  weeklyBookings: number
  averageRating: number
}

export interface RealtimeUpdate {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  new?: unknown
  old?: unknown
}

// ==============================================
// SUPABASE CLIENT
// ==============================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// ==============================================
// MAIN DASHBOARD DATA FUNCTIONS
// ==============================================

/**
 * Fetch complete dashboard data for a salon
 */
export async function getSalonDashboardData(salonId: string): Promise<DashboardData> {
  try {
    // Fetch all data in parallel for better performance
    const [
      pendingRequestsResult,
      todayScheduleResult,
      recentActivityResult,
      salonInfoResult,
      statsResult
    ] = await Promise.all([
      getPendingRequests(salonId),
      getTodaySchedule(salonId),
      getRecentActivity(salonId),
      getSalonInfo(salonId),
      getDashboardStats(salonId)
    ])

    return {
      pendingRequests: pendingRequestsResult,
      todaySchedule: todayScheduleResult,
      recentActivity: recentActivityResult,
      salon: salonInfoResult,
      stats: statsResult
    }
  } catch (error) {
    console.error('Error fetching salon dashboard data:', error)
    throw new Error('Gabim në ngarkimin e të dhënave të dashboard-it')
  }
}

/**
 * Get pending appointment requests with customer priority scoring
 */
export async function getPendingRequests(salonId: string): Promise<AppointmentRequest[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        customer_notes,
        requested_at,
        priority_score,
        service_name,
        duration_minutes,
        service_price,
        customers!inner (
          id,
          first_name,
          last_name,
          phone,
          rating,
          total_visits
        ),
        services!inner (
          id,
          name,
          duration_minutes,
          price
        )
      `)
      .eq('salon_id', salonId)
      .eq('status', 'pending')
      .order('priority_score', { ascending: false })
      .order('requested_at', { ascending: true })

    if (error) {
      console.error('Supabase error fetching pending requests:', error)
      throw error
    }

    if (!data) return []

    return data.map((appointment: any) => ({
      id: appointment.id,
      customer: {
        id: appointment.customers.id,
        firstName: appointment.customers.first_name,
        lastName: appointment.customers.last_name,
        phone: appointment.customers.phone,
        rating: appointment.customers.rating || 0,
        totalVisits: appointment.customers.total_visits || 0,
        priorityScore: appointment.priority_score || 0
      },
      service: {
        id: appointment.services?.id || '',
        name: appointment.service_name,
        duration: appointment.duration_minutes || appointment.services?.duration_minutes || 30,
        price: appointment.service_price || appointment.services?.price || 0
      },
      appointmentDate: appointment.appointment_date,
      startTime: appointment.start_time,
      customerNotes: appointment.customer_notes,
      requestedAt: appointment.requested_at,
      priorityScore: appointment.priority_score || 0
    }))
  } catch (error) {
    console.error('Error fetching pending requests:', error)
    return []
  }
}

/**
 * Get today's approved appointments schedule
 */
export async function getTodaySchedule(salonId: string): Promise<Appointment[]> {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        status,
        salon_notes,
        service_name,
        duration_minutes,
        customers!inner (
          first_name,
          last_name,
          phone
        )
      `)
      .eq('salon_id', salonId)
      .eq('appointment_date', today)
      .eq('status', 'approved')
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Supabase error fetching today schedule:', error)
      throw error
    }

    if (!data) return []

    return data.map((appointment: any) => ({
      id: appointment.id,
      customer: {
        firstName: appointment.customers.first_name,
        lastName: appointment.customers.last_name,
        phone: appointment.customers.phone
      },
      service: {
        name: appointment.service_name,
        duration: appointment.duration_minutes || 30
      },
      appointmentDate: appointment.appointment_date,
      startTime: appointment.start_time,
      status: appointment.status,
      salonNotes: appointment.salon_notes
    }))
  } catch (error) {
    console.error('Error fetching today schedule:', error)
    return []
  }
}

/**
 * Get recent appointment activity (approved, declined, completed)
 */
export async function getRecentActivity(salonId: string): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        status,
        salon_notes,
        service_name,
        duration_minutes,
        updated_at,
        customers!inner (
          first_name,
          last_name,
          phone
        )
      `)
      .eq('salon_id', salonId)
      .in('status', ['approved', 'declined', 'completed', 'cancelled', 'no_show'])
      .order('updated_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Supabase error fetching recent activity:', error)
      throw error
    }

    if (!data) return []

    return data.map((appointment: any) => ({
      id: appointment.id,
      customer: {
        firstName: appointment.customers.first_name,
        lastName: appointment.customers.last_name,
        phone: appointment.customers.phone
      },
      service: {
        name: appointment.service_name,
        duration: appointment.duration_minutes || 30
      },
      appointmentDate: appointment.appointment_date,
      startTime: appointment.start_time,
      status: appointment.status,
      salonNotes: appointment.salon_notes
    }))
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

/**
 * Get salon information
 */
export async function getSalonInfo(salonId: string): Promise<SalonInfo> {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('id, name, working_hours')
      .eq('id', salonId)
      .single()

    if (error) {
      console.error('Supabase error fetching salon info:', error)
      throw error
    }

    if (!data) {
      throw new Error('Salloni nuk u gjet')
    }

    return {
      id: data.id,
      name: data.name,
      workingHours: data.working_hours
    }
  } catch (error) {
    console.error('Error fetching salon info:', error)
    throw new Error('Gabim në ngarkimin e informacionit të sallonit')
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(salonId: string): Promise<DashboardStats> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]

    // Get pending count
    const { count: pendingCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('status', 'pending')

    // Get today's approved count
    const { count: todayCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('appointment_date', today)
      .eq('status', 'approved')

    // Get weekly bookings count
    const { count: weeklyCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .gte('appointment_date', weekAgoStr)
      .in('status', ['approved', 'completed'])

    // Get average customer rating for this salon
    const { data: ratingData } = await supabase
      .from('appointments')
      .select('customers!inner(rating)')
      .eq('salon_id', salonId)
      .eq('status', 'completed')
      .not('customers.rating', 'is', null)

    let averageRating = 0
    if (ratingData && ratingData.length > 0) {
      const totalRating = ratingData.reduce((sum, item: any) => sum + (item.customers?.rating || 0), 0)
      averageRating = totalRating / ratingData.length
    }

    return {
      pendingCount: pendingCount || 0,
      todayCount: todayCount || 0,
      weeklyBookings: weeklyCount || 0,
      averageRating: averageRating
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      pendingCount: 0,
      todayCount: 0,
      weeklyBookings: 0,
      averageRating: 0
    }
  }
}

// ==============================================
// REAL-TIME SUBSCRIPTIONS
// ==============================================

/**
 * Subscribe to real-time updates for salon dashboard
 */
export function subscribeToRealtimeUpdates(
  salonId: string, 
  onUpdate: (update: RealtimeUpdate) => void
): () => void {
  console.log('🔄 Setting up real-time subscription for salon:', salonId)

  // Subscribe to appointments table changes
  const appointmentsSubscription = supabase
    .channel(`salon-appointments-${salonId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `salon_id=eq.${salonId}`
      },
      (payload) => {
        console.log('📱 Appointment update received:', payload)
        onUpdate({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          table: 'appointments',
          new: payload.new,
          old: payload.old
        })
      }
    )
    .subscribe()

  // Subscribe to customer updates (for priority score changes)
  const customersSubscription = supabase
    .channel(`salon-customers-${salonId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'customers'
      },
      (payload) => {
        console.log('👤 Customer update received:', payload)
        onUpdate({
          eventType: 'UPDATE',
          table: 'customers',
          new: payload.new,
          old: payload.old
        })
      }
    )
    .subscribe()

  // Return cleanup function
  return () => {
    console.log('🔌 Cleaning up real-time subscriptions')
    supabase.removeChannel(appointmentsSubscription)
    supabase.removeChannel(customersSubscription)
  }
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Format Albanian date for display
 */
export function formatAlbanianDate(dateString: string): string {
  const date = new Date(dateString)
  const days = ['E dielë', 'E hënë', 'E martë', 'E mërkurë', 'E enjte', 'E premte', 'E shtunë']
  const months = [
    'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
    'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'
  ]
  
  const dayName = days[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]
  
  return `${dayName}, ${day} ${month}`
}

/**
 * Format time for Albanian display
 */
export function formatAlbanianTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  return `${hours}:${minutes}`
}

/**
 * Get time ago in Albanian
 */
export function getAlbanianTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMilliseconds = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMilliseconds / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Tani'
  if (diffMinutes < 60) return `${diffMinutes} minutë më parë`
  if (diffHours < 24) return `${diffHours} orë më parë`
  if (diffDays === 1) return 'Dje'
  if (diffDays < 7) return `${diffDays} ditë më parë`
  
  return formatAlbanianDate(dateString)
}

/**
 * Get priority level information
 */
export function getPriorityInfo(score: number): {
  level: string
  color: string
  icon: string
  description: string
} {
  if (score >= 80) {
    return {
      level: 'VIP',
      color: 'purple',
      icon: '👑',
      description: 'Klient me prioritet të lartë'
    }
  } else if (score >= 60) {
    return {
      level: 'I lartë',
      color: 'red',
      icon: '🔥',
      description: 'Klient me prioritet të lartë'
    }
  } else if (score >= 40) {
    return {
      level: 'Mesatar',
      color: 'yellow',
      icon: '⭐',
      description: 'Klient me prioritet mesatar'
    }
  } else {
    return {
      level: 'Normal',
      color: 'gray',
      icon: '👤',
      description: 'Klient me prioritet normal'
    }
  }
}

/**
 * Get appointment status in Albanian
 */
export function getAlbanianStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Në pritje',
    'approved': 'I miratuar',
    'declined': 'I refuzuar',
    'completed': 'I përfunduar',
    'cancelled': 'I anuluar',
    'no_show': 'Nuk u paraqit'
  }
  
  return statusMap[status] || status
}

/**
 * Validate salon working hours for appointment time
 */
export function isValidAppointmentTime(
  appointmentDate: string,
  startTime: string,
  workingHours: { [key: string]: { open: string; close: string; closed: boolean } }
): boolean {
  try {
    const date = new Date(appointmentDate)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[date.getDay()]
    
    const dayHours = workingHours[dayName]
    if (!dayHours || dayHours.closed) {
      return false
    }
    
    const appointmentTime = startTime.slice(0, 5) // HH:MM format
    return appointmentTime >= dayHours.open && appointmentTime <= dayHours.close
    
  } catch (error) {
    console.error('Error validating appointment time:', error)
    return true // Default to true if validation fails
  }
}

// ==============================================
// ERROR HANDLING
// ==============================================

/**
 * Create standardized error for dashboard operations
 */
export function createDashboardError(message: string, code?: string): Error {
  const error = new Error(message)
  if (code) {
    (error as Error & { code?: string }).code = code
  }
  return error
}

/**
 * Handle Supabase errors with Albanian messages
 */
export function handleSupabaseError(error: unknown): string {
  if ((error as SupabaseError)?.code === 'PGRST116') {
    return 'Nuk ka të dhëna për të shfaqur'
  }
  
  if ((error as SupabaseError)?.code === 'PGRST301') {
    return 'Nuk keni qasje në këto të dhëna'
  }
  
  if ((error as SupabaseError)?.message?.includes('timeout')) {
    return 'Lidhja me bazën e të dhënave ka problema. Provoni përsëri.'
  }
  
  return 'Ka ndodhur një gabim. Ju lutemi provoni përsëri.'
}