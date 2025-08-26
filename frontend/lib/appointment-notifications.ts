// frontend/lib/appointment-notifications.ts
// Appointment notification service for WhatsApp messaging
// Albanian Beauty Salon Booking Platform

import { AppointmentWithRelations } from '../types/database'
import { 
  sendWhatsAppTemplate,
  type WhatsAppVerificationResult
} from './whatsapp'
import { 
  getBookingApprovedTemplate,
  getBookingDeclinedTemplate,
  getSalonNewRequestTemplate
} from './whatsapp-templates'

// ==============================================
// TYPES
// ==============================================
export interface NotificationResult {
  success: boolean
  error?: string
  messageSid?: string
}

// ==============================================
// APPOINTMENT STATUS NOTIFICATIONS
// ==============================================

/**
 * Send WhatsApp notification to customer when appointment is approved
 */
export async function sendAppointmentApprovedNotification(
  appointment: AppointmentWithRelations
): Promise<NotificationResult> {
  try {
    console.log(`📱 Sending appointment approved notification to customer: ${appointment.customers.phone}`)
    
    // Format date and time for Albanian display
    const date = formatDate(appointment.appointment_date)
    const time = appointment.start_time
    const salonName = appointment.salons.name
    
    const template = getBookingApprovedTemplate(salonName, date, time)
    
    const result = await sendWhatsAppTemplate(
      appointment.customers.phone,
      template.templateKey,
      template.variables
    )
    
    if (result.success) {
      console.log(`✅ Appointment approved notification sent successfully. SID: ${result.messageSid}`)
      return {
        success: true,
        messageSid: result.messageSid
      }
    } else {
      console.error(`❌ Failed to send appointment approved notification: ${result.error}`)
      return {
        success: false,
        error: result.error
      }
    }
    
  } catch (error) {
    console.error('❌ Error sending appointment approved notification:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send WhatsApp notification to customer when appointment is declined
 */
export async function sendAppointmentDeclinedNotification(
  appointment: AppointmentWithRelations,
  reason?: string
): Promise<NotificationResult> {
  try {
    console.log(`📱 Sending appointment declined notification to customer: ${appointment.customers.phone}`)
    
    const salonName = appointment.salons.name
    const declineReason = reason || appointment.salon_notes || 'Nuk është specifikuar arsyeja'
    
    const template = getBookingDeclinedTemplate(salonName, declineReason)
    
    const result = await sendWhatsAppTemplate(
      appointment.customers.phone,
      template.templateKey,
      template.variables
    )
    
    if (result.success) {
      console.log(`✅ Appointment declined notification sent successfully. SID: ${result.messageSid}`)
      return {
        success: true,
        messageSid: result.messageSid
      }
    } else {
      console.error(`❌ Failed to send appointment declined notification: ${result.error}`)
      return {
        success: false,
        error: result.error
      }
    }
    
  } catch (error) {
    console.error('❌ Error sending appointment declined notification:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send WhatsApp notification to salon when appointment is cancelled by customer
 */
export async function sendAppointmentCancelledNotification(
  appointment: AppointmentWithRelations
): Promise<NotificationResult> {
  try {
    console.log(`📱 Sending appointment cancelled notification to salon: ${appointment.salons.phone}`)
    
    // Format the cancellation message for salon
    const customerName = `${appointment.customers.first_name} ${appointment.customers.last_name}`
    const date = formatDate(appointment.appointment_date)
    const time = appointment.start_time
    const serviceName = appointment.service_name || 'Shërbim i papërcaktuar'
    
    // For cancellation, we can use a simple text message or create a new template
    // For now, let's send a direct message about the cancellation
    const message = `🚫 REZERVIM I ANULLUAR\n\nKlienti: ${customerName}\nData: ${date}\nOra: ${time}\nShërbimi: ${serviceName}\nTelefoni: ${appointment.customers.phone}\n\nRezervimi është anulluar nga klienti.`
    
    // We need to use direct messaging since there's no cancellation template
    // This will be implemented using the direct message function
    const result = await sendDirectWhatsAppMessage(
      appointment.salons.phone,
      message
    )
    
    if (result.success) {
      console.log(`✅ Appointment cancelled notification sent to salon. SID: ${result.messageSid}`)
      return {
        success: true,
        messageSid: result.messageSid
      }
    } else {
      console.error(`❌ Failed to send appointment cancelled notification to salon: ${result.error}`)
      return {
        success: false,
        error: result.error
      }
    }
    
  } catch (error) {
    console.error('❌ Error sending appointment cancelled notification to salon:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send WhatsApp notification to salon when new appointment is requested
 */
export async function sendNewAppointmentRequestNotification(
  appointment: AppointmentWithRelations
): Promise<NotificationResult> {
  try {
    console.log(`📱 Sending new appointment request notification to salon: ${appointment.salons.phone}`)
    
    const customerName = `${appointment.customers.first_name} ${appointment.customers.last_name}`
    const service = appointment.service_name || 'Shërbim i papërcaktuar'
    const date = formatDate(appointment.appointment_date)
    const time = appointment.start_time
    const phone = appointment.customers.phone
    const appointmentId = appointment.id
    
    const template = getSalonNewRequestTemplate(
      customerName,
      service,
      date,
      time,
      phone,
      appointmentId
    )
    
    const result = await sendWhatsAppTemplate(
      appointment.salons.phone,
      template.templateKey,
      template.variables
    )
    
    if (result.success) {
      console.log(`✅ New appointment request notification sent to salon. SID: ${result.messageSid}`)
      return {
        success: true,
        messageSid: result.messageSid
      }
    } else {
      console.error(`❌ Failed to send new appointment request notification to salon: ${result.error}`)
      return {
        success: false,
        error: result.error
      }
    }
    
  } catch (error) {
    console.error('❌ Error sending new appointment request notification to salon:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ==============================================
// MAIN NOTIFICATION DISPATCHER
// ==============================================

/**
 * Send appropriate notification based on appointment status change
 */
export async function sendAppointmentStatusChangeNotification(
  appointment: AppointmentWithRelations,
  newStatus: 'approved' | 'declined' | 'cancelled',
  reason?: string
): Promise<NotificationResult> {
  try {
    console.log(`🔔 Dispatching ${newStatus} notification for appointment ${appointment.id}`)
    
    switch (newStatus) {
      case 'approved':
        return await sendAppointmentApprovedNotification(appointment)
      
      case 'declined':
        return await sendAppointmentDeclinedNotification(appointment, reason)
      
      case 'cancelled':
        return await sendAppointmentCancelledNotification(appointment)
      
      default:
        console.error(`❌ Unknown status for notification: ${newStatus}`)
        return {
          success: false,
          error: `Unknown status: ${newStatus}`
        }
    }
    
  } catch (error) {
    console.error('❌ Error in sendAppointmentStatusChangeNotification:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Format date for Albanian display
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return dateString
  }
}

/**
 * Send direct WhatsApp message (for messages without templates)
 * This is a placeholder - we'll need to implement this using Twilio's basic message sending
 */
async function sendDirectWhatsAppMessage(
  phone: string,
  message: string
): Promise<WhatsAppVerificationResult> {
  // TODO: Implement direct WhatsApp message sending
  // For now, return a successful result to prevent blocking
  console.log(`📱 Direct WhatsApp message to ${phone}: ${message}`)
  
  try {
    // We can use the existing Twilio client from whatsapp.ts
    // But we need to import and initialize it properly
    const { Twilio } = await import('twilio')
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN  
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER
    
    if (!accountSid || !authToken || !whatsappNumber) {
      throw new Error('Twilio configuration missing')
    }
    
    const client = new Twilio(accountSid, authToken)
    
    const result = await client.messages.create({
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${phone}`,
      body: message
    })
    
    console.log(`✅ Direct WhatsApp message sent successfully. SID: ${result.sid}`)
    
    return {
      success: true,
      messageSid: result.sid
    }
    
  } catch (error) {
    console.error('❌ Failed to send direct WhatsApp message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message'
    }
  }
}