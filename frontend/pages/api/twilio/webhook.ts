// frontend/pages/api/twilio/webhook.ts
// Twilio WhatsApp webhook for handling interactive button responses
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { validateRequest } from 'twilio';
import { 
  updateAppointmentStatus,
  getAppointmentWithDetails,
  validateSalon 
} from '../../../lib/appointments';
import { sendWhatsAppTemplate } from '../../../lib/whatsapp';
import { sendWhatsAppErrorMessage, sendWhatsAppConfirmation } from '../../../lib/whatsapp-direct-message';

interface TwilioWebhookPayload {
  From: string;           // whatsapp:+355691234567 (salon phone)
  To: string;             // whatsapp:+14155238886 (your Twilio number)
  Body: string;           // "✅ Pranoj" or "❌ Refuzoj"
  ButtonText?: string;    // Button text that was clicked
  ButtonPayload?: string; // Button ID: "approve_appointmentId" or "decline_appointmentId"
  MessageSid: string;
  AccountSid: string;
  NumMedia?: string;
  ProfileName?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  console.log('🔔 WhatsApp webhook received');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const payload: TwilioWebhookPayload = req.body;
    
    // Validate webhook authenticity (Twilio signature validation)
    const twilioSignature = req.headers['x-twilio-signature'] as string;
    const webhookUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/twilio/webhook`;
    
    if (process.env.NODE_ENV === 'production' && process.env.TWILIO_AUTH_TOKEN) {
      const isValid = validateRequest(
        process.env.TWILIO_AUTH_TOKEN,
        twilioSignature,
        webhookUrl,
        req.body
      );
      
      if (!isValid) {
        console.log('❌ Invalid Twilio signature');
        return res.status(403).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }
      console.log('✅ Twilio signature validated');
    } else {
      console.log('⚠️ Skipping signature validation (development mode)');
    }

    // Extract appointment ID from button payload or message body
    let appointmentAction: string | null = null;
    let appointmentId: string | null = null;
    
    // Try ButtonPayload first (preferred method)
    if (payload.ButtonPayload) {
      console.log('📋 Processing button payload:', payload.ButtonPayload);
      const buttonMatch = payload.ButtonPayload.match(/^(approve|decline)_(.+)$/);
      if (buttonMatch) {
        appointmentAction = buttonMatch[1];
        appointmentId = buttonMatch[2];
        console.log(`🎯 Extracted from ButtonPayload: ${appointmentAction} ${appointmentId}`);
      }
    }
    
    // Fallback: Try to extract from ButtonText or Body
    if (!appointmentAction && payload.ButtonText) {
      console.log('📋 Processing button text:', payload.ButtonText);
      if (payload.ButtonText.includes('Pranoj') || payload.ButtonText.includes('✅')) {
        appointmentAction = 'approve';
      } else if (payload.ButtonText.includes('Refuzoj') || payload.ButtonText.includes('❌')) {
        appointmentAction = 'decline';
      }
      
      // Try to extract appointment ID from message context or previous messages
      // This would require storing conversation context - for now, log and return
      if (appointmentAction && !appointmentId) {
        console.log('⚠️ Button action detected but no appointment ID found');
        const salonPhone = payload.From.replace('whatsapp:', '');
        await sendWhatsAppErrorMessage(salonPhone, 'Nuk mund të gjej rezervimin. Përdorni dashboard-in për të procesuar kërkesën.');
        return res.status(200).json({
          success: false,
          message: 'Appointment ID not found in button interaction'
        });
      }
    }
    
    // If no button interaction detected, this might be a regular message
    if (!appointmentAction || !appointmentId) {
      console.log('📝 Regular message received (not button interaction):', payload.Body);
      return res.status(200).json({
        success: true,
        message: 'Regular message processed'
      });
    }
    
    const salonPhone = payload.From.replace('whatsapp:', '');
    console.log(`🏪 Processing ${appointmentAction} for appointment ${appointmentId} from salon ${salonPhone}`);
    
    // Get appointment details and validate salon ownership
    const appointment = await getAppointmentWithDetails(appointmentId);
    if (!appointment || !appointment.salon || !appointment.customer) {
      console.log('❌ Appointment not found:', appointmentId);
      await sendWhatsAppErrorMessage(salonPhone, 'Rezervimi nuk u gjet në sistem. Kontrolloni dashboard-in tuaj.');
      return res.status(200).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Validate salon ownership
    if (appointment.salon.phone !== salonPhone) {
      console.log('❌ Salon phone mismatch:', {
        appointmentSalonPhone: appointment.salon.phone,
        requestSalonPhone: salonPhone
      });
      await sendWhatsAppErrorMessage(salonPhone, 'Ky rezervim nuk i përket salonit tuaj.');
      return res.status(200).json({
        success: false,
        message: 'Salon ownership validation failed'
      });
    }
    
    // Check if appointment is still pending
    if (appointment.status !== 'pending') {
      console.log('⚠️ Appointment already processed:', appointment.status);
      await sendWhatsAppErrorMessage(salonPhone, `Rezervimi është tashmë ${appointment.status === 'approved' ? 'aprovuar' : 'refuzuar'}.`);
      return res.status(200).json({
        success: false,
        message: `Appointment already ${appointment.status}`
      });
    }
    
    // Process the action
    if (appointmentAction === 'approve') {
      await handleApproval(appointmentId, salonPhone, appointment, payload.From);
    } else if (appointmentAction === 'decline') {
      await handleDecline(appointmentId, salonPhone, appointment, payload.From);
    }
    
    return res.status(200).json({
      success: true,
      message: `Appointment ${appointmentAction}d successfully`,
      data: {
        appointmentId,
        action: appointmentAction,
        salon: appointment.salon.name
      }
    });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    // Try to send error message to salon if we have the phone number
    if (req.body?.From) {
      const salonPhone = req.body.From.replace('whatsapp:', '');
      await sendWhatsAppErrorMessage(salonPhone, 'Gabim teknik në procesimin e kërkesës. Përdorni dashboard-in ose provoni përsëri.');
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}

/**
 * Handle appointment approval via WhatsApp
 */
async function handleApproval(appointmentId: string, salonPhone: string, appointment: any, whatsappFrom: string) {
  try {
    console.log(`✅ Processing approval for appointment ${appointmentId}`);
    
    // Update appointment status
    const updateResult = await updateAppointmentStatus(appointmentId, {
      status: 'approved',
      salonNotes: 'Aprovuar nga WhatsApp',
      approvedAt: new Date().toISOString(),
      approvalMethod: 'whatsapp'
    });
    
    if (!updateResult.success) {
      console.error('❌ Failed to update appointment status:', updateResult.error);
      const salonPhoneClean = whatsappFrom.replace('whatsapp:', '');
      await sendWhatsAppErrorMessage(salonPhoneClean, 'Gabim në aprovimin e rezervimit. Provoni përsëri ose përdorni dashboard-in.');
      return;
    }
    
    console.log('✅ Appointment status updated to approved');
    
    // Send confirmation to salon
    try {
      const salonPhone = whatsappFrom.replace('whatsapp:', '');
      const customerName = `${appointment.customer.first_name} ${appointment.customer.last_name}`;
      const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('sq-AL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      await sendWhatsAppConfirmation(
        salonPhone,
        'approved',
        customerName,
        appointmentDate,
        appointment.start_time,
        appointment.service?.name || 'Shërbim'
      );
      console.log('✅ Approval confirmation sent to salon');
    } catch (error) {
      console.error('⚠️ Failed to send salon confirmation:', error);
    }
    
    // Send approval notification to customer
    try {
      const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('sq-AL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      await sendWhatsAppTemplate(appointment.customer.phone, 'BOOKING_APPROVED', {
        salonName: appointment.salon.name,
        date: appointmentDate,
        time: appointment.start_time
      });
      
      console.log('✅ Approval notification sent to customer');
    } catch (error) {
      console.error('⚠️ Failed to send customer notification:', error);
    }
    
    console.log(`🎉 Appointment ${appointmentId} successfully approved via WhatsApp`);
    
  } catch (error) {
    console.error('❌ Error in handleApproval:', error);
    const salonPhoneClean = whatsappFrom.replace('whatsapp:', '');
    await sendWhatsAppErrorMessage(salonPhoneClean, 'Gabim në aprovimin e rezervimit. Kontaktoni mbështetjen teknike.');
  }
}

/**
 * Handle appointment decline via WhatsApp
 */
async function handleDecline(appointmentId: string, salonPhone: string, appointment: any, whatsappFrom: string) {
  try {
    console.log(`❌ Processing decline for appointment ${appointmentId}`);
    
    // Update appointment status
    const updateResult = await updateAppointmentStatus(appointmentId, {
      status: 'declined',
      salonNotes: 'Refuzuar nga WhatsApp',
      declinedAt: new Date().toISOString(),
      approvalMethod: 'whatsapp'
    });
    
    if (!updateResult.success) {
      console.error('❌ Failed to update appointment status:', updateResult.error);
      const salonPhoneClean = whatsappFrom.replace('whatsapp:', '');
      await sendWhatsAppErrorMessage(salonPhoneClean, 'Gabim në refuzimin e rezervimit. Provoni përsëri ose përdorni dashboard-in.');
      return;
    }
    
    console.log('✅ Appointment status updated to declined');
    
    // Send confirmation to salon
    try {
      const salonPhone = whatsappFrom.replace('whatsapp:', '');
      const customerName = `${appointment.customer.first_name} ${appointment.customer.last_name}`;
      const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('sq-AL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      await sendWhatsAppConfirmation(
        salonPhone,
        'declined',
        customerName,
        appointmentDate,
        appointment.start_time,
        appointment.service?.name || 'Shërbim'
      );
      console.log('✅ Decline confirmation sent to salon');
    } catch (error) {
      console.error('⚠️ Failed to send salon confirmation:', error);
    }
    
    // Send decline notification to customer
    try {
      await sendWhatsAppTemplate(appointment.customer.phone, 'BOOKING_DECLINED', {
        salonName: appointment.salon.name,
        reason: 'Saloni nuk është i disponueshëm për këtë kohë'
      });
      
      console.log('✅ Decline notification sent to customer');
    } catch (error) {
      console.error('⚠️ Failed to send customer notification:', error);
    }
    
    console.log(`❌ Appointment ${appointmentId} successfully declined via WhatsApp`);
    
  } catch (error) {
    console.error('❌ Error in handleDecline:', error);
    const salonPhoneClean = whatsappFrom.replace('whatsapp:', '');
    await sendWhatsAppErrorMessage(salonPhoneClean, 'Gabim në refuzimin e rezervimit. Kontaktoni mbështetjen teknike.');
  }
}

