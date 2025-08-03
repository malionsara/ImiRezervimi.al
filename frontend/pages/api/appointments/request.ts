// frontend/pages/api/appointments/request.ts
// Main appointment booking endpoint for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next'
import { 
  appointmentRequestSchema,
  ALBANIAN_ERRORS,
  createValidationError,
  createBusinessRuleError
} from '../../../lib/validation'
import {
  checkRateLimit,
  findOrCreateCustomer,
  validateSalon,
  validateService,
  checkCustomerPendingLimit,
  checkAppointmentConflict,
  createAppointmentRequest,
  validateWorkingHours,
  formatAppointmentResponse,
  cleanupRateLimit
} from '../../../lib/appointments'

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

// ==============================================
// MAIN APPOINTMENT REQUEST HANDLER
// ==============================================
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Cleanup rate limit entries periodically
  if (Math.random() < 0.1) {
    cleanupRateLimit()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Vetëm POST request-et janë të lejuara'
      }
    })
  }

  try {
    // ==============================================
    // RATE LIMITING CHECK
    // ==============================================
    const clientIP = req.headers['x-forwarded-for'] as string || 
                    req.headers['x-real-ip'] as string || 
                    req.connection.remoteAddress || 
                    'unknown'
    
    const rateLimitResult = checkRateLimit(clientIP, 'appointment_request', 1, 1)
    if (!rateLimitResult.allowed) {
      console.log(`⚠️ Rate limit exceeded for IP: ${clientIP}`)
      return res.status(429).json({ success: false, error: { code: 'RATE_LIMIT', message: 'Rate limit exceeded' } })
    }

    // ==============================================
    // INPUT VALIDATION
    // ==============================================
    const validationResult = appointmentRequestSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      const errors = (validationResult.error as any).errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
      console.log(`❌ Validation failed: ${errors}`)
      
      return res.status(400).json(createValidationError(
        `${ALBANIAN_ERRORS.INVALID_DATA}: ${errors}`
      ))
    }

    const appointmentRequest = validationResult.data
    console.log(`📋 New appointment request: ${appointmentRequest.customerInfo.firstName} ${appointmentRequest.customerInfo.lastName} -> Salon ${appointmentRequest.salonId}`)

    // ==============================================
    // SALON VALIDATION
    // ==============================================
    const salonValidation = await validateSalon(appointmentRequest.salonId)
    if (!salonValidation.valid) {
      console.log(`❌ Salon validation failed: ${appointmentRequest.salonId}`)
      return res.status(400).json({ success: false, error: { code: 'SALON_INVALID', message: 'Salon validation failed' } })
    }
    
    const salon = salonValidation.data as any

    // ==============================================
    // SERVICE VALIDATION
    // ==============================================
    const serviceValidation = await validateService(appointmentRequest.serviceId, appointmentRequest.salonId)
    if (!serviceValidation.valid) {
      console.log(`❌ Service validation failed: ${appointmentRequest.serviceId}`)
      return res.status(400).json({ success: false, error: { code: 'SERVICE_INVALID', message: 'Service validation failed' } })
    }
    
    const service = serviceValidation.data as any

    // ==============================================
    // WORKING HOURS VALIDATION
    // ==============================================
    const workingHoursValidation = validateWorkingHours(
      appointmentRequest.appointmentDate,
      appointmentRequest.startTime,
      salon.working_hours
    )
    
    if (!workingHoursValidation.valid) {
      console.log(`❌ Working hours validation failed: ${appointmentRequest.appointmentDate} ${appointmentRequest.startTime}`)
      return res.status(400).json(createBusinessRuleError(
        workingHoursValidation.error!,
        'OUTSIDE_WORKING_HOURS'
      ))
    }

    // ==============================================
    // CUSTOMER MANAGEMENT
    // ==============================================
    const customerResult = await findOrCreateCustomer(appointmentRequest.customerInfo)
    if (!customerResult.success) {
      console.log(`❌ Customer creation failed: ${appointmentRequest.customerInfo.phone}`)
      return res.status(400).json({ success: false, error: { code: 'CUSTOMER_ERROR', message: 'Customer processing failed' } })
    }
    
    const customer = customerResult.data as any

    // ==============================================
    // PENDING APPOINTMENTS LIMIT CHECK
    // ==============================================
    const pendingLimitCheck = await checkCustomerPendingLimit(customer.id, 2)
    if (!pendingLimitCheck.allowed) {
      console.log(`❌ Pending limit exceeded for customer: ${customer.id}`)
      return res.status(400).json({ success: false, error: { code: 'PENDING_LIMIT', message: 'Pending limit exceeded' } })
    }

    // ==============================================
    // APPOINTMENT CONFLICT CHECK
    // ==============================================
    const duration = appointmentRequest.duration || service.duration_minutes
    const conflictCheck = await checkAppointmentConflict(
      appointmentRequest.salonId,
      appointmentRequest.appointmentDate,
      appointmentRequest.startTime,
      duration
    )
    
    if (conflictCheck.error) {
      console.log(`❌ Conflict check failed: ${appointmentRequest.appointmentDate} ${appointmentRequest.startTime}`)
      return res.status(500).json({ success: false, error: { code: 'CONFLICT_CHECK', message: 'Conflict check failed' } })
    }
    
    if (conflictCheck.hasConflict) {
      console.log(`❌ Time slot conflict: ${appointmentRequest.appointmentDate} ${appointmentRequest.startTime}`)
      return res.status(400).json(createBusinessRuleError(
        ALBANIAN_ERRORS.APPOINTMENT_CONFLICT,
        'TIME_SLOT_CONFLICT'
      ))
    }

    // ==============================================
    // CREATE APPOINTMENT
    // ==============================================
    const appointmentResult = await createAppointmentRequest(
      appointmentRequest,
      customer.id,
      service
    )
    
    if (!appointmentResult.success) {
      console.log(`❌ Appointment creation failed`)
      return res.status(500).json({ success: false, error: { code: 'APPOINTMENT_CREATE', message: 'Appointment creation failed' } })
    }

    const appointment = appointmentResult.data as any

    // ==============================================
    // SUCCESS RESPONSE
    // ==============================================
    console.log(`✅ Appointment created successfully: ${appointment.id}`)
    
    // TODO: Send WhatsApp notifications to both customer and salon
    // await sendCustomerConfirmation(appointment)
    // await sendSalonNotification(appointment)

    return res.status(201).json({
      success: true,
      data: {
        appointment: formatAppointmentResponse(appointment),
        message: `Rezervimi juaj u dërgua me sukses! ${salon.name} do t'ju kontaktojë brenda 2 orësh për të konfirmuar rezervimin.`,
        estimatedResponse: '2 orë',
        priority: appointment.priority_score
      }
    })

  } catch (error) {
    console.error('❌ Internal error in appointment request:', error)
    
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
// TODO: NOTIFICATION FUNCTIONS
// ==============================================
// Note: Notification functions will be implemented when integrating
// with the existing Twilio WhatsApp system