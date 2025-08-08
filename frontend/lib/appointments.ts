// frontend/lib/appointments.ts
// Appointment business logic and utilities for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { createClient } from '@supabase/supabase-js'
import { 
  AppointmentRequest, 
  CustomerInfo, 
  ALBANIAN_ERRORS,
  normalizeAlbanianPhone,
  createBusinessRuleError,
  createValidationError
} from './validation'
import { AppointmentWithRelations } from '../types/database'

// ==============================================
// SUPABASE CLIENT SETUP
// ==============================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ==============================================
// RATE LIMITING
// ==============================================
interface RateLimitEntry {
  count: number
  firstRequest: number
  windowStart: number
}

// In-memory rate limiting (for development - use Redis in production)
const rateLimitMap = new Map<string, RateLimitEntry>()

/**
 * Check if request exceeds rate limit
 */
export function checkRateLimit(
  ip: string, 
  endpoint: string = 'appointment_request',
  maxRequests: number = 1, 
  windowMinutes: number = 1
): { allowed: boolean; error?: { success: boolean; error: { code: string; message: string } } } {
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  const windowMs = windowMinutes * 60 * 1000
  
  const entry = rateLimitMap.get(key)
  
  if (!entry) {
    // First request
    rateLimitMap.set(key, {
      count: 1,
      firstRequest: now,
      windowStart: now
    })
    return { allowed: true }
  }
  
  // Check if window has expired
  if (now - entry.windowStart >= windowMs) {
    // Reset window
    rateLimitMap.set(key, {
      count: 1,
      firstRequest: now,
      windowStart: now
    })
    return { allowed: true }
  }
  
  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    const timeLeft = Math.ceil((windowMs - (now - entry.windowStart)) / 1000)
    return { 
      allowed: false, 
      error: createBusinessRuleError(
        `${ALBANIAN_ERRORS.RATE_LIMIT_EXCEEDED} (${timeLeft} sekonda të mbetura)`,
        'RATE_LIMIT_EXCEEDED'
      )
    }
  }
  
  // Increment counter
  entry.count++
  rateLimitMap.set(key, entry)
  
  return { allowed: true }
}

// ==============================================
// CUSTOMER MANAGEMENT
// ==============================================

/**
 * Find or create customer by phone number
 */
export async function findOrCreateCustomer(customerInfo: CustomerInfo): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  try {
    const normalizedPhone = normalizeAlbanianPhone(customerInfo.phone)
    
    // Try to find existing customer by phone
    const { data: existingCustomer, error: findError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('phone', normalizedPhone)
      .maybeSingle()
    
    if (findError) {
      console.error('Error finding customer:', findError)
      return createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR)
    }
    
    if (existingCustomer) {
      // Update existing customer info if different
      if (existingCustomer.first_name !== customerInfo.firstName || 
          existingCustomer.last_name !== customerInfo.lastName) {
        
        const { data: updatedCustomer, error: updateError } = await supabaseAdmin
          .from('customers')
          .update({
            first_name: customerInfo.firstName,
            last_name: customerInfo.lastName,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCustomer.id)
          .select()
          .single()
        
        if (updateError) {
          console.error('Error updating customer:', updateError)
          return createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR)
        }
        
        return { success: true, data: updatedCustomer }
      }
      
      return { success: true, data: existingCustomer }
    }
    
    // Create new customer
    const { data: newCustomer, error: createError } = await supabaseAdmin
      .from('customers')
      .insert({
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        phone: normalizedPhone,
        account_type: 'guest'
      })
      .select()
      .single()
    
    if (createError) {
      console.error('Error creating customer:', createError)
      return createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR)
    }
    
    return { success: true, data: newCustomer }
    
  } catch (error) {
    console.error('Error in findOrCreateCustomer:', error)
    return createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR)
  }
}

/**
 * Check customer pending appointment limit
 */
export async function checkCustomerPendingLimit(customerId: string, maxPending: number = 2): Promise<{ allowed: boolean; error?: { success: boolean; error: { code: string; message: string } } }> {
  try {
    const { data: pendingAppointments, error } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('customer_id', customerId)
      .eq('status', 'pending')
    
    if (error) {
      console.error('Error checking pending appointments:', error)
      return { allowed: false, error: createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR) }
    }
    
    if (pendingAppointments && pendingAppointments.length >= maxPending) {
      return { 
        allowed: false, 
        error: createBusinessRuleError(ALBANIAN_ERRORS.MAX_PENDING_EXCEEDED, 'MAX_PENDING_EXCEEDED')
      }
    }
    
    return { allowed: true }
    
  } catch (error) {
    console.error('Error in checkCustomerPendingLimit:', error)
    return { allowed: false, error: createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR) }
  }
}

// ==============================================
// SALON AND SERVICE VALIDATION
// ==============================================

/**
 * Validate salon exists and is active
 */
export async function validateSalon(salonId: string): Promise<{ valid: boolean; data?: { id: string; name: string; phone: string; status: string; working_hours: unknown; max_advance_days: number }; error?: { success: boolean; error: { code: string; message: string } } }> {
  try {
    const { data: salon, error } = await supabaseAdmin
      .from('salons')
      .select('id, name, phone, status, working_hours, max_advance_days')
      .eq('id', salonId)
      .eq('status', 'active')
      .maybeSingle()
    
    if (error) {
      console.error('Error validating salon:', error)
      return { valid: false, error: createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR) }
    }
    
    if (!salon) {
      return { valid: false, error: createValidationError(ALBANIAN_ERRORS.SALON_NOT_FOUND) }
    }
    
    return { valid: true, data: salon }
    
  } catch (error) {
    console.error('Error in validateSalon:', error)
    return { valid: false, error: createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR) }
  }
}

/**
 * Validate service exists and is active
 */
export async function validateService(serviceId: string, salonId: string): Promise<{ valid: boolean; data?: { id: string; name: string; duration_minutes: number; price: number; is_active: boolean }; error?: { success: boolean; error: { code: string; message: string } } }> {
  try {
    const { data: service, error } = await supabaseAdmin
      .from('services')
      .select('id, name, duration_minutes, price, is_active')
      .eq('id', serviceId)
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .maybeSingle()
    
    if (error) {
      console.error('Error validating service:', error)
      return { valid: false, error: createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR) }
    }
    
    if (!service) {
      return { valid: false, error: createValidationError(ALBANIAN_ERRORS.SERVICE_NOT_FOUND) }
    }
    
    return { valid: true, data: service }
    
  } catch (error) {
    console.error('Error in validateService:', error)
    return { valid: false, error: createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR) }
  }
}

// ==============================================
// APPOINTMENT CONFLICT CHECKING
// ==============================================

/**
 * Check for appointment conflicts using database function
 */
export async function checkAppointmentConflict(
  salonId: string,
  appointmentDate: string,
  startTime: string,
  durationMinutes: number
): Promise<{ hasConflict: boolean; error?: { success: boolean; error: { code: string; message: string } } }> {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('check_booking_conflict', {
        p_salon_id: salonId,
        p_appointment_date: appointmentDate,
        p_start_time: startTime,
        p_duration_minutes: durationMinutes
      })
    
    if (error) {
      console.error('Error checking appointment conflict:', error)
      return { hasConflict: true, error: createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR) }
    }
    
    return { hasConflict: data === true }
    
  } catch (error) {
    console.error('Error in checkAppointmentConflict:', error)
    return { hasConflict: true, error: createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR) }
  }
}

// ==============================================
// APPOINTMENT CREATION
// ==============================================

/**
 * Create appointment request
 */
export async function createAppointmentRequest(
  request: AppointmentRequest,
  customerId: string,
  service: { id: string; name: string; price: number; duration_minutes: number }
): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  try {
    const appointmentData = {
      salon_id: request.salonId,
      customer_id: customerId,
      service_id: request.serviceId,
      appointment_date: request.appointmentDate,
      start_time: request.startTime,
      duration_minutes: request.duration || service.duration_minutes,
      service_name: service.name,
      service_price: service.price,
      customer_notes: request.customerNotes || null,
      status: 'pending'
    }
    
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .insert(appointmentData)
      .select(`
        id,
        appointment_date,
        start_time,
        duration_minutes,
        service_name,
        service_price,
        customer_notes,
        status,
        priority_score,
        requested_at,
        salon:salons!salon_id(id, name, phone),
        customer:customers!customer_id(id, first_name, last_name, phone)
      `)
      .single()
    
    if (error) {
      console.error('Error creating appointment:', error)
      return createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR)
    }
    
    console.log(`✅ Appointment created: ${appointment.id} for customer`)
    
    return { success: true, data: appointment }
    
  } catch (error) {
    console.error('Error in createAppointmentRequest:', error)
    return createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR)
  }
}

// ==============================================
// APPOINTMENT RETRIEVAL
// ==============================================

/**
 * Get appointment by ID with full details
 */
export async function getAppointmentById(appointmentId: string): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  try {
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        duration_minutes,
        service_name,
        service_price,
        customer_notes,
        salon_notes,
        status,
        priority_score,
        requested_at,
        responded_at,
        completed_at,
        created_at,
        updated_at,
        salon:salons!salon_id(
          id, 
          name, 
          phone, 
          address, 
          city,
          working_hours
        ),
        customer:customers!customer_id(
          id, 
          first_name, 
          last_name, 
          phone,
          rating,
          total_visits
        ),
        service:services!service_id(
          id,
          name,
          duration_minutes,
          price
        )
      `)
      .eq('id', appointmentId)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching appointment:', error)
      return createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR)
    }
    
    if (!appointment) {
      return createValidationError('Rezervimi nuk u gjet')
    }
    
    return { success: true, data: appointment }
    
  } catch (error) {
    console.error('Error in getAppointmentById:', error)
    return createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR)
  }
}

/**
 * Update appointment status (overloaded function)
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  statusOrData: 'approved' | 'declined' | 'cancelled' | {
    status: 'approved' | 'declined' | 'cancelled';
    salonNotes?: string;
    approvedAt?: string;
    declinedAt?: string;
    approvalMethod?: string;
  },
  salonNotes?: string
): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  try {
    // Handle both calling patterns: (id, status, notes) and (id, dataObject)
    let status: 'approved' | 'declined' | 'cancelled';
    let notes: string | undefined;
    let additionalData: Record<string, unknown> = {};
    
    if (typeof statusOrData === 'string') {
      // Traditional call: updateAppointmentStatus(id, 'approved', 'notes')
      status = statusOrData;
      notes = salonNotes;
    } else {
      // Object call: updateAppointmentStatus(id, { status: 'approved', salonNotes: 'notes', ... })
      status = statusOrData.status;
      notes = statusOrData.salonNotes;
      
      // Add additional fields for webhook calls
      if (statusOrData.approvedAt) additionalData.approved_at = statusOrData.approvedAt;
      if (statusOrData.declinedAt) additionalData.declined_at = statusOrData.declinedAt;
      if (statusOrData.approvalMethod) additionalData.approval_method = statusOrData.approvalMethod;
    }
    
    const updateData: Record<string, unknown> = {
      status,
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...additionalData
    }
    
    if (notes) {
      updateData.salon_notes = notes
    }
    
    if (status === 'approved') {
      // Additional logic for approved appointments
      updateData.completed_at = null // Will be set when appointment is completed
    }
    
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select(`
        id,
        appointment_date,
        start_time,
        service_name,
        status,
        salon_notes,
        salon:salons!salon_id(name, phone),
        customer:customers!customer_id(first_name, last_name, phone)
      `)
      .single()
    
    if (error) {
      console.error('Error updating appointment status:', error)
      return createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR)
    }
    
    console.log(`✅ Appointment ${appointmentId} status updated to: ${status}`)
    
    return { success: true, data: appointment }
    
  } catch (error) {
    console.error('Error in updateAppointmentStatus:', error)
    return createValidationError(ALBANIAN_ERRORS.INTERNAL_ERROR)
  }
}

// ==============================================
// BUSINESS HOURS VALIDATION
// ==============================================

/**
 * Get day of week from date
 */
function getDayOfWeek(date: string): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayIndex = new Date(date).getDay()
  return days[dayIndex]
}

/**
 * Validate appointment time against salon working hours
 */
export function validateWorkingHours(
  appointmentDate: string,
  startTime: string,
  workingHours: { [key: string]: { open: string; close: string; closed: boolean } }
): { valid: boolean; error?: string } {
  const dayOfWeek = getDayOfWeek(appointmentDate)
  const dayHours = workingHours[dayOfWeek]
  
  if (!dayHours || dayHours.closed) {
    return { valid: false, error: ALBANIAN_ERRORS.SALON_CLOSED }
  }
  
  const appointmentTime = new Date(`2000-01-01T${startTime}:00`)
  const openTime = new Date(`2000-01-01T${dayHours.open}:00`)
  const closeTime = new Date(`2000-01-01T${dayHours.close}:00`)
  
  if (appointmentTime < openTime || appointmentTime >= closeTime) {
    return { 
      valid: false, 
      error: `Salloni është i hapur nga ${dayHours.open} deri në ${dayHours.close} të ${dayOfWeek}` 
    }
  }
  
  return { valid: true }
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Format appointment for client response
 */
export function formatAppointmentResponse(appointment: AppointmentWithRelations) {
  return {
    id: appointment.id,
    salonName: appointment.salons.name,
    serviceName: appointment.services?.name,
    appointmentDate: appointment.appointment_date,
    startTime: appointment.start_time,
    duration: appointment.services?.duration_minutes,
    status: appointment.status,
    customerNotes: appointment.customer_notes,
    salonNotes: appointment.salon_notes,
    priorityScore: appointment.priority_score,
    requestedAt: appointment.requested_at,
    respondedAt: appointment.responded_at
  }
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimit() {
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.firstRequest > oneHour) {
      rateLimitMap.delete(key)
    }
  }
}

// ==============================================
// ALBANIAN APPOINTMENT ERROR MESSAGES
// ==============================================
export const ALBANIAN_APPOINTMENT_ERRORS = {
  APPOINTMENT_NOT_FOUND: 'Takimi nuk u gjet',
  INVALID_STATUS_TRANSITION: 'Tranzicioni i statusit nuk është i vlefshëm',
  SALON_NOT_AUTHORIZED: 'Salloni nuk është i autorizuar për këtë takim'
} as const

/**
 * Get appointment with detailed relations (salon, customer, service)
 */
export async function getAppointmentWithDetails(appointmentId: string) {
  try {
    console.log('🔍 Fetching appointment details for ID:', appointmentId);
    
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        salon:salons!appointments_salon_id_fkey (
          id,
          name,
          phone,
          address
        ),
        customer:customers!appointments_customer_id_fkey (
          id,
          first_name,
          last_name,
          phone
        ),
        service:services!appointments_service_id_fkey (
          id,
          name,
          duration_minutes
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (error) {
      console.error('❌ Error fetching appointment:', error);
      return null;
    }

    if (!appointment) {
      console.log('❌ Appointment not found:', appointmentId);
      return null;
    }

    console.log('✅ Appointment details fetched successfully');
    return appointment;
    
  } catch (error) {
    console.error('❌ Exception in getAppointmentWithDetails:', error);
    return null;
  }
}

// Note: updateAppointmentStatus function is defined above