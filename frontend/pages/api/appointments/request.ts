// frontend/pages/api/appointments/request.ts
// Main appointment booking endpoint for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next'
import { ZodError } from 'zod'
import { 
  appointmentRequestSchema,
  ALBANIAN_ERRORS,
  createValidationError,
  createBusinessRuleError
} from '../../../lib/validation'
import { sendWhatsAppTemplate } from '../../../lib/whatsapp'
import {
  checkRateLimit,
  findOrCreateCustomer,
  validateSalon,
  validateService,
  checkCustomerPendingLimit,
  checkAppointmentConflict,
  createAppointmentRequest,
  validateWorkingHours,
  cleanupRateLimit
} from '../../../lib/appointments'
import { SalonRow, ServiceRow, CustomerRow, AppointmentRow } from '../../../types/database'

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
    
    const rateLimitResult = checkRateLimit(clientIP, 'appointment_request', 3, 2)
    if (!rateLimitResult.allowed) {
      console.log(`⚠️ Rate limit exceeded for IP: ${clientIP}`)
      return res.status(429).json(rateLimitResult.error || {
        success: false,
        error: { code: 'RATE_LIMIT', message: 'Rate limit exceeded' }
      })
    }

    // ==============================================
    // INPUT VALIDATION
    // ==============================================
    const validationResult = appointmentRequestSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      const errors = (validationResult.error as ZodError).issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
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
    
    const salon = salonValidation.data as SalonRow

    // ==============================================
    // SERVICE VALIDATION
    // ==============================================
    const serviceValidation = await validateService(appointmentRequest.serviceId, appointmentRequest.salonId)
    if (!serviceValidation.valid) {
      console.log(`❌ Service validation failed: ${appointmentRequest.serviceId}`)
      return res.status(400).json({ success: false, error: { code: 'SERVICE_INVALID', message: 'Service validation failed' } })
    }
    
    const service = serviceValidation.data as ServiceRow

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
    
    const customer = customerResult.data as CustomerRow

    // ==============================================
    // PENDING APPOINTMENTS LIMIT CHECK (PER SALON)
    // ==============================================
    const pendingLimitCheck = await checkCustomerPendingLimit(customer.id, appointmentRequest.salonId, 2)
    if (!pendingLimitCheck.allowed) {
      console.log(`❌ Pending limit exceeded for customer: ${customer.id} at salon: ${appointmentRequest.salonId}`)
      return res.status(400).json(pendingLimitCheck.error || {
        success: false,
        error: { code: 'PENDING_LIMIT', message: 'Pending limit exceeded for salon' }
      })
    }

    // ==============================================
    // REAL-TIME AVAILABILITY CHECK (Final Validation)
    // ==============================================
    // Double-check availability at submission time to prevent race conditions
    const duration = appointmentRequest.duration || service.duration_minutes
    
    try {
      // Check real-time availability from the API endpoint
      const availabilityResponse = await fetch(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/salon/${salon.slug}/availability?date=${appointmentRequest.appointmentDate}&duration=${duration}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      )
      
      if (availabilityResponse.ok) {
        const availabilityData = await availabilityResponse.json()
        
        if (availabilityData.success && availabilityData.data.slots) {
          const requestedSlot = availabilityData.data.slots.find(
            (slot: any) => slot.time === appointmentRequest.startTime
          )
          
          if (!requestedSlot || !requestedSlot.available) {
            console.log(`❌ Selected time slot is no longer available: ${appointmentRequest.startTime}`)
            return res.status(400).json(createBusinessRuleError(
              'Koha e zgjedhur nuk është më e disponueshme. Ju lutemi zgjidhni një orë tjetër.',
              'TIME_SLOT_UNAVAILABLE'
            ))
          }
        }
      }
    } catch (availabilityError) {
      console.warn('⚠️ Could not verify real-time availability, proceeding with legacy conflict check:', availabilityError)
    }

    // ==============================================
    // LEGACY APPOINTMENT CONFLICT CHECK (Backup)
    // ==============================================
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

    const appointment = appointmentResult.data as AppointmentRow

    // ==============================================
    // SUCCESS RESPONSE
    // ==============================================
    console.log(`✅ Appointment created successfully: ${appointment.id}`)
    
    // Send WhatsApp notifications
    try {
      // Send customer confirmation
      await sendCustomerConfirmation(
        { ...appointment, customer: { phone: customer.phone } },
        salon,
        service
      )
      
      // Send salon notification using the new notification service
      const { sendNewAppointmentRequestNotification } = await import('../../../lib/appointment-notifications')
      
      // We need to convert the appointment data to the expected format
      const appointmentWithRelations = {
        ...appointment,
        salons: salon,
        customers: customer,
        services: service,
        service_name: service.name
      }
      
      const notificationResult = await sendNewAppointmentRequestNotification(appointmentWithRelations as any)
      if (notificationResult.success) {
        console.log(`✅ New appointment request notification sent to salon. SID: ${notificationResult.messageSid}`)
      } else {
        console.error(`❌ Failed to send new appointment request notification to salon: ${notificationResult.error}`)
      }
    } catch (notificationError) {
      console.error('❌ Failed to send notifications:', notificationError)
      // Don't fail the request if notifications fail
    }

    return res.status(201).json({
      success: true,
      data: {
        appointment: {
          id: appointment.id,
          status: appointment.status,
          appointmentDate: appointment.appointment_date,
          startTime: appointment.start_time,
          priorityScore: appointment.priority_score
        },
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
// WHATSAPP NOTIFICATION FUNCTIONS
// ==============================================

/**
 * Send booking confirmation to customer
 */
async function sendCustomerConfirmation(
  appointment: AppointmentRow & { customer: { phone: string } },
  salon: SalonRow,
  service: ServiceRow
): Promise<void> {
  try {
    const customerPhone = appointment.customer.phone
    const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('sq-AL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    
    await sendWhatsAppTemplate(customerPhone, 'BOOKING_CONFIRMATION', {
      salonName: salon.name,
      date: appointmentDate,
      time: appointment.start_time,
      service: service.name
    })
    
    console.log(`✅ Customer confirmation sent to ${customerPhone}`)
  } catch (error) {
    console.error('❌ Failed to send customer confirmation:', error)
    // Don't throw - notification failure shouldn't break the booking flow
  }
}

