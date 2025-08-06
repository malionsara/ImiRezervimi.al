// frontend/lib/validation.ts
// Validation schemas and utilities for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { z } from 'zod'

// ==============================================
// ALBANIAN ERROR MESSAGES
// ==============================================
export const ALBANIAN_ERRORS = {
  // Required fields
  REQUIRED: 'Kjo fushë është e detyrueshme',
  
  // Phone validation
  PHONE_INVALID: 'Numri i telefonit duhet të jetë në formatin +355XXXXXXXX',
  PHONE_REQUIRED: 'Numri i telefonit është i detyrueshëm',
  
  // Name validation
  NAME_TOO_SHORT: 'Emri duhet të ketë të paktën 2 karaktere',
  NAME_TOO_LONG: 'Emri nuk mund të ketë më shumë se 50 karaktere',
  NAME_INVALID: 'Emri mund të përmbajë vetëm shkronja dhe hapësira',
  
  // Date and time validation
  DATE_INVALID: 'Data duhet të jetë në formatin YYYY-MM-DD',
  DATE_PAST: 'Data e rezervimit nuk mund të jetë në të kaluarën',
  DATE_TOO_FAR: 'Rezervimet mund të bëhen maksimumi 10 ditë para',
  TIME_INVALID: 'Koha duhet të jetë në formatin HH:MM',
  TIME_OUTSIDE_HOURS: 'Koha duhet të jetë ndërmjet 06:00 dhe 23:00',
  
  // Appointment validation
  APPOINTMENT_CONFLICT: 'Ky slot kohor nuk është i disponueshëm',
  MAX_PENDING_EXCEEDED: 'Mund të keni maksimumi 2 rezervime në pritje',
  DURATION_INVALID: 'Kohëzgjatja e shërbimit duhet të jetë ndërmjet 15 dhe 480 minuta',
  
  // Service validation
  SERVICE_NOT_FOUND: 'Shërbimi i zgjedhur nuk u gjet',
  SERVICE_INACTIVE: 'Shërbimi i zgjedhur nuk është aktiv',
  
  // Salon validation
  SALON_NOT_FOUND: 'Salloni i zgjedhur nuk u gjet',
  SALON_INACTIVE: 'Salloni i zgjedhur nuk është aktiv',
  SALON_CLOSED: 'Salloni është i mbyllur në këtë ditë',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Ju lutemi prisni së paku 1 minutë para se të bëni një rezervim tjetër',
  
  // General errors
  INTERNAL_ERROR: 'Ka ndodhur një gabim i brendshëm. Ju lutemi provoni përsëri më vonë',
  INVALID_DATA: 'Të dhënat e dërguara nuk janë të vlefshme',
  
  // Conflict detection errors
  TIME_OVERLAP: "Koha e rezervimit mbivendoset me rezervime të tjera",
  DOUBLE_BOOKING: "Ekziston një rezervim i miratuar për këtë kohë",
  APPROVAL_RACE: "Disa rezervime po përpunohen në të njëjtën kohë",
  AVAILABILITY_BLOCKED: "Koha është e bllokuar dhe nuk është e disponueshme",
  APPOINTMENT_LOCKED: "Rezervimi është duke u përpunuar nga një proces tjetër",
  APPOINTMENT_HAS_CONFLICTS: "Rezervimi ka konflikte që duhen zgjidhur para miratimit",
  CONFLICT_RESOLUTION_FAILED: "Zgjudhja e konfliktit dështoi",
  MANUAL_REVIEW_REQUIRED: "Kërkohet rishikim manual për këtë konflik",
  LOCK_ACQUISITION_FAILED: "Nuk mund të fitohet kyçja për rezervimin",
  LOCK_EXPIRED: "Kyçja e rezervimit ka skaduar",
  CONFLICTING_APPOINTMENT_STATUS: "Rezervimi në konflikt ka status të papërcaktuar",
  PRIORITY_CONFLICT: "Konflik prioriteti ndërmjet rezervimeve"
} as const

// ==============================================
// ALBANIAN PHONE NUMBER VALIDATION
// ==============================================
export const albanianPhoneSchema = z.string()
  .min(1, ALBANIAN_ERRORS.PHONE_REQUIRED)
  .regex(/^\+355[0-9]{8,9}$/, ALBANIAN_ERRORS.PHONE_INVALID)

// ==============================================
// NAME VALIDATION
// ==============================================
export const nameSchema = z.string()
  .min(2, ALBANIAN_ERRORS.NAME_TOO_SHORT)
  .max(50, ALBANIAN_ERRORS.NAME_TOO_LONG)
  .regex(/^[a-zA-ZëËçÇ\s]+$/, ALBANIAN_ERRORS.NAME_INVALID)

// ==============================================
// DATE AND TIME VALIDATION
// ==============================================
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, ALBANIAN_ERRORS.DATE_INVALID)
  .refine((date) => {
    const appointmentDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return appointmentDate >= today
  }, ALBANIAN_ERRORS.DATE_PAST)
  .refine((date) => {
    const appointmentDate = new Date(date)
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 10) // Max 10 days advance
    return appointmentDate <= maxDate
  }, ALBANIAN_ERRORS.DATE_TOO_FAR)

export const timeSchema = z.string()
  .regex(/^\d{2}:\d{2}$/, ALBANIAN_ERRORS.TIME_INVALID)
  .refine((time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours >= 6 && hours <= 23 && minutes >= 0 && minutes <= 59
  }, ALBANIAN_ERRORS.TIME_OUTSIDE_HOURS)

// ==============================================
// CUSTOMER INFORMATION SCHEMA
// ==============================================
export const customerInfoSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: albanianPhoneSchema
})

// ==============================================
// APPOINTMENT REQUEST SCHEMA
// ==============================================
export const appointmentRequestSchema = z.object({
  // Required fields
  salonId: z.string().uuid('ID e sallonit nuk është e vlefshme'),
  serviceId: z.string().uuid('ID e shërbimit nuk është e vlefshme'),
  appointmentDate: dateSchema,
  startTime: timeSchema,
  customerInfo: customerInfoSchema,
  
  // Optional fields
  customerNotes: z.string().max(500, 'Shënimet nuk mund të kenë më shumë se 500 karaktere').optional(),
  duration: z.number()
    .min(15, ALBANIAN_ERRORS.DURATION_INVALID)
    .max(480, ALBANIAN_ERRORS.DURATION_INVALID)
    .optional()
})

// ==============================================
// APPOINTMENT STATUS UPDATE SCHEMA
// ==============================================
export const appointmentStatusSchema = z.object({
  status: z.enum(['approved', 'declined']),
  salonNotes: z.string().max(500, 'Shënimet e sallonit nuk mund të kenë më shumë se 500 karaktere').optional(),
  adminKey: z.string().min(1, 'Çelësi admin është i detyrueshëm').optional()
})

// ==============================================
// RATE LIMITING SCHEMA
// ==============================================
export const rateLimitSchema = z.object({
  ip: z.string().min(1, 'IP adresa nuk është e vlefshme'),
  endpoint: z.string().min(1, 'Endpoint është i detyrueshëm'),
  maxRequests: z.number().positive('Numri maksimal i kërkesave duhet të jetë pozitiv').default(1),
  windowMinutes: z.number().positive('Dritarja e kohës duhet të jetë pozitive').default(1)
})

// ==============================================
// VALIDATION UTILITY FUNCTIONS
// ==============================================

/**
 * Validate Albanian phone number format
 */
export function isValidAlbanianPhone(phone: string): boolean {
  return /^\+355[0-9]{8,9}$/.test(phone)
}

/**
 * Normalize Albanian phone number to standard format
 */
export function normalizeAlbanianPhone(phone: string): string {
  // Remove all spaces and dashes
  phone = phone.replace(/[\s-]/g, '')
  
  // If starts with 0, replace with +355
  if (phone.startsWith('0')) {
    return `+355${phone.substring(1)}`
  }
  
  // If starts with 355, add +
  if (phone.startsWith('355')) {
    return `+${phone}`
  }
  
  // If already starts with +355, return as is
  if (phone.startsWith('+355')) {
    return phone
  }
  
  // If just the number, add +355
  if (/^[0-9]{8,9}$/.test(phone)) {
    return `+355${phone}`
  }
  
  return phone
}

/**
 * Validate date is within business rules
 */
export function validateAppointmentDate(date: string, maxDaysAdvance: number = 10): { valid: boolean; error?: string } {
  const appointmentDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Check if date is in the past
  if (appointmentDate < today) {
    return { valid: false, error: ALBANIAN_ERRORS.DATE_PAST }
  }
  
  // Check if date is too far in the future
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + maxDaysAdvance)
  if (appointmentDate > maxDate) {
    return { valid: false, error: ALBANIAN_ERRORS.DATE_TOO_FAR }
  }
  
  return { valid: true }
}

/**
 * Validate time is within business hours
 */
export function validateBusinessTime(time: string, workingHours?: { open: string; close: string; closed: boolean }): { valid: boolean; error?: string } {
  if (!workingHours || workingHours.closed) {
    return { valid: false, error: ALBANIAN_ERRORS.SALON_CLOSED }
  }
  
  const appointmentTime = new Date(`2000-01-01T${time}:00`)
  const openTime = new Date(`2000-01-01T${workingHours.open}:00`)
  const closeTime = new Date(`2000-01-01T${workingHours.close}:00`)
  
  if (appointmentTime < openTime || appointmentTime >= closeTime) {
    return { valid: false, error: `Salloni është i hapur nga ${workingHours.open} deri në ${workingHours.close}` }
  }
  
  return { valid: true }
}

/**
 * Create a validation error response in Albanian
 */
export function createValidationError(message: string, details?: unknown) {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message,
      details
    }
  }
}

/**
 * Create a business rule error response in Albanian
 */
export function createBusinessRuleError(message: string, code: string = 'BUSINESS_RULE_VIOLATION') {
  return {
    success: false,
    error: {
      code,
      message
    }
  }
}

// ==============================================
// APPOINTMENT UPDATE VALIDATION
// ==============================================
export interface AppointmentUpdateData {
  appointmentId: string
  status: 'approved' | 'declined'
  salonNotes?: string
}

export function validateAppointmentUpdate(data: unknown): { success: boolean; data?: AppointmentUpdateData; errors?: unknown } {
  try {
    const parsed = appointmentStatusSchema.parse(data)
    return { 
      success: true, 
      data: {
        appointmentId: (data as { appointmentId: string }).appointmentId,
        status: parsed.status,
        salonNotes: parsed.salonNotes
      }
    }
  } catch (error) {
    return { success: false, errors: error }
  }
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// ==============================================
// TYPE EXPORTS
// ==============================================
export type AppointmentRequest = z.infer<typeof appointmentRequestSchema>
export type CustomerInfo = z.infer<typeof customerInfoSchema>
export type AppointmentStatusUpdate = z.infer<typeof appointmentStatusSchema>
export type RateLimitConfig = z.infer<typeof rateLimitSchema>