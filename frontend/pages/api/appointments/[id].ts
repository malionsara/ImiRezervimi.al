// frontend/pages/api/appointments/[id].ts
// Appointment details and status management endpoint
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next'
import { 
  appointmentStatusSchema,
  ALBANIAN_ERRORS,
  createValidationError,
  createBusinessRuleError
} from '../../../lib/validation'
import {
  getAppointmentById,
  updateAppointmentStatus
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
// APPOINTMENT DETAILS AND STATUS HANDLER
// ==============================================
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { id } = req.query
  
  // Validate appointment ID
  if (!id || typeof id !== 'string') {
    return res.status(400).json(createValidationError('ID e rezervimit është e detyrueshme'))
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetAppointment(req, res, id)
      case 'PUT':
        return await handleUpdateAppointmentStatus(req, res, id)
      default:
        return res.status(405).json({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Vetëm GET dhe PUT request-et janë të lejuara'
          }
        })
    }
  } catch (error) {
    console.error(`❌ Internal error in appointment ${req.method}:`, error)
    
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
// GET APPOINTMENT DETAILS
// ==============================================
async function handleGetAppointment(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  appointmentId: string
) {
  console.log(`📖 Fetching appointment details: ${appointmentId}`)
  
  const result = await getAppointmentById(appointmentId)
  
  if (!result.success) {
    console.log(`❌ Appointment not found: ${appointmentId}`)
    return res.status(404).json(result.error as ApiResponse<unknown>)
  }
  
  const appointment = result.data as any
  
  // Format response with Albanian labels
  const formattedAppointment = {
    id: appointment.id,
    salon: {
      id: appointment.salon.id,
      name: appointment.salon.name,
      phone: appointment.salon.phone,
      address: appointment.salon.address,
      city: appointment.salon.city,
      workingHours: appointment.salon.working_hours
    },
    customer: {
      id: appointment.customer.id,
      firstName: appointment.customer.first_name,
      lastName: appointment.customer.last_name,
      phone: appointment.customer.phone,
      rating: appointment.customer.rating,
      totalVisits: appointment.customer.total_visits
    },
    service: {
      id: appointment.service?.id,
      name: appointment.service_name,
      duration: appointment.duration_minutes,
      price: appointment.service_price
    },
    appointment: {
      date: appointment.appointment_date,
      startTime: appointment.start_time,
      status: appointment.status,
      priorityScore: appointment.priority_score,
      customerNotes: appointment.customer_notes,
      salonNotes: appointment.salon_notes
    },
    timestamps: {
      requestedAt: appointment.requested_at,
      respondedAt: appointment.responded_at,
      completedAt: appointment.completed_at,
      createdAt: appointment.created_at,
      updatedAt: appointment.updated_at
    }
  }
  
  console.log(`✅ Appointment details retrieved: ${appointmentId}`)
  
  return res.status(200).json({
    success: true,
    data: formattedAppointment
  })
}

// ==============================================
// UPDATE APPOINTMENT STATUS
// ==============================================
async function handleUpdateAppointmentStatus(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  appointmentId: string
) {
  console.log(`🔄 Updating appointment status: ${appointmentId}`)
  
  // Validate request body
  const validationResult = appointmentStatusSchema.safeParse(req.body)
  
  if (!validationResult.success) {
    const errors = (validationResult.error as any).errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
    console.log(`❌ Status update validation failed: ${errors}`)
    
    return res.status(400).json(createValidationError(
      `${ALBANIAN_ERRORS.INVALID_DATA}: ${errors}`
    ))
  }
  
  const { status, salonNotes, adminKey } = validationResult.data
  
  // Check if appointment exists and is pending
  const appointmentResult = await getAppointmentById(appointmentId)
  if (!appointmentResult.success) {
    console.log(`❌ Appointment not found for status update: ${appointmentId}`)
    return res.status(404).json(appointmentResult.error)
  }
  
  const appointment = appointmentResult.data
  
  // Check if appointment is still pending
  if (appointment.status !== 'pending') {
    console.log(`❌ Appointment not pending: ${appointmentId} (status: ${appointment.status})`)
    return res.status(400).json(createBusinessRuleError(
      `Rezervimi nuk është më në pritje. Statusi aktual: ${appointment.status}`,
      'APPOINTMENT_NOT_PENDING'
    ))
  }
  
  // TODO: Add proper authorization check
  // For now, we'll allow the update if it's from admin or salon owner
  if (adminKey) {
    const configuredAdminKey = process.env.ADMIN_SECRET_KEY
    if (!configuredAdminKey || adminKey !== configuredAdminKey) {
      console.log(`❌ Invalid admin key for appointment update: ${appointmentId}`)
      return res.status(403).json(createValidationError('Çelësi admin nuk është i vlefshëm'))
    }
  }
  
  // Update appointment status
  const updateResult = await updateAppointmentStatus(appointmentId, status, salonNotes)
  
  if (!updateResult.success) {
    console.log(`❌ Failed to update appointment status: ${appointmentId}`)
    return res.status(500).json(updateResult.error)
  }
  
  const updatedAppointment = updateResult.data
  
  // Prepare response message in Albanian
  const statusMessage = status === 'approved' 
    ? `Rezervimi u miratua me sukses!` 
    : `Rezervimi u refuzua.`
  
  const responseData = {
    appointment: {
      id: updatedAppointment.id,
      status: updatedAppointment.status,
      appointmentDate: updatedAppointment.appointment_date,
      startTime: updatedAppointment.start_time,
      serviceName: updatedAppointment.service_name,
      salonNotes: updatedAppointment.salon_notes
    },
    salon: {
      name: updatedAppointment.salon.name,
      phone: updatedAppointment.salon.phone
    },
    customer: {
      firstName: updatedAppointment.customer.first_name,
      lastName: updatedAppointment.customer.last_name,
      phone: updatedAppointment.customer.phone
    },
    message: statusMessage,
    updatedAt: new Date().toISOString()
  }
  
  console.log(`✅ Appointment status updated: ${appointmentId} -> ${status}`)
  
  // TODO: Send notification to customer about status change
  // await sendStatusChangeNotification(updatedAppointment, status)
  
  return res.status(200).json({
    success: true,
    data: responseData
  })
}

// ==============================================
// TODO: NOTIFICATION FUNCTIONS
// ==============================================
// Note: Status change notifications will be implemented when integrating
// with the existing Twilio WhatsApp system