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
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
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
      return res.status(429).json(rateLimitResult.error)
    }

    // ==============================================
    // INPUT VALIDATION
    // ==============================================
    const validationResult = appointmentRequestSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
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
      return res.status(400).json(salonValidation.error)
    }
    
    const salon = salonValidation.data

    // ==============================================
    // SERVICE VALIDATION
    // ==============================================
    const serviceValidation = await validateService(appointmentRequest.serviceId, appointmentRequest.salonId)
    if (!serviceValidation.valid) {
      console.log(`❌ Service validation failed: ${appointmentRequest.serviceId}`)
      return res.status(400).json(serviceValidation.error)
    }
    
    const service = serviceValidation.data

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
      return res.status(400).json(customerResult.error)
    }
    
    const customer = customerResult.data

    // ==============================================
    // PENDING APPOINTMENTS LIMIT CHECK
    // ==============================================
    const pendingLimitCheck = await checkCustomerPendingLimit(customer.id, 2)
    if (!pendingLimitCheck.allowed) {
      console.log(`❌ Pending limit exceeded for customer: ${customer.id}`)
      return res.status(400).json(pendingLimitCheck.error)
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
      return res.status(500).json(conflictCheck.error)
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
      return res.status(500).json(appointmentResult.error)
    }

    const appointment = appointmentResult.data

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

/**
 * Send confirmation to customer via WhatsApp
 * TODO: Implement with existing Twilio integration
 */
async function sendCustomerConfirmation(appointment: any) {
  try {
    const message = `Përshëndetje ${appointment.customer.first_name}! 

Rezervimi juaj u dërgua me sukses:

🏪 Salloni: ${appointment.salon.name}
💅 Shërbimi: ${appointment.service_name}
📅 Data: ${appointment.appointment_date}
🕐 Ora: ${appointment.start_time}

${appointment.salon.name} do t'ju kontaktojë brenda 2 orësh për të konfirmuar rezervimin.

📱 ImiRezervimi.al`

    // TODO: Call existing WhatsApp API
    // await sendWhatsAppMessage(appointment.customer.phone, message)
    
    console.log(`📱 Customer confirmation message prepared for: ${appointment.customer.phone}`)
    
  } catch (error) {
    console.error('Error sending customer confirmation:', error)
  }
}

/**
 * Send new request notification to salon via WhatsApp
 * TODO: Implement with existing Twilio integration
 */
async function sendSalonNotification(appointment: any) {
  try {
    const message = `📋 Kërkesë e re për rezervim!

👤 Klienti: ${appointment.customer.first_name} ${appointment.customer.last_name}
📞 Telefoni: ${appointment.customer.phone}
💅 Shërbimi: ${appointment.service_name}
📅 Data: ${appointment.appointment_date}
🕐 Ora: ${appointment.start_time}
⭐ Prioriteti: ${Math.round(appointment.priority_score)}/100

${appointment.customer_notes ? `💬 Shënim: ${appointment.customer_notes}` : ''}

Përgjigjuni "PO" për të miratuar ose "JO" për të refuzuar.

💼 ImiRezervimi.al`

    // TODO: Call existing WhatsApp API
    // await sendWhatsAppMessage(appointment.salon.phone, message)
    
    console.log(`📱 Salon notification message prepared for: ${appointment.salon.phone}`)
    
  } catch (error) {
    console.error('Error sending salon notification:', error)
  }
}