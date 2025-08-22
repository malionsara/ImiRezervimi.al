// frontend/pages/api/twilio/webhook.ts
// Twilio WhatsApp webhook for handling interactive button responses
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { validateRequest } from 'twilio';
import { 
  updateAppointmentStatus,
  getAppointmentWithDetails,
  validateSalon as validateSalonForAppointment
} from '../../../lib/appointments';
import { sendWhatsAppTemplate } from '../../../lib/whatsapp';
import { sendWhatsAppErrorMessage, sendWhatsAppConfirmation } from '../../../lib/whatsapp-direct-message';
import { getWhatsAppTemplate } from '../../../lib/whatsapp-templates';
import {
  parseCommand,
  validateSalon,
  checkRateLimit,
  logCommand,
  getTodayAppointments,
  getPendingAppointments,
  getTomorrowAppointments,
  processApproval,
  processDecline,
  SALON_RESPONSES
} from '../../../lib/salon-commands';

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
  details?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  console.log('🔔 WhatsApp webhook received');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));

  // Validate WhatsApp templates on startup (log warnings but don't block)
  try {
    const templateValidation = await validateWhatsAppTemplates();
    if (!templateValidation.allValid) {
      console.warn('⚠️ WhatsApp template validation warnings:', templateValidation.errors);
    } else {
      console.log('✅ All WhatsApp templates are valid');
    }
  } catch (error) {
    console.error('❌ Template validation failed:', error);
  }

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

    const fromPhone = payload.From?.replace('whatsapp:', '') || '';
    const messageBody = (payload.Body || '').trim().toLowerCase();

    // 🎯 SALON COMMAND DETECTION - Handle salon menu commands first
    // Check for salon menu button clicks or text commands
    let salonCommandType: string | null = null;
    
    // Handle salon menu button clicks (from interactive template)
    if (payload.ButtonPayload) {
      console.log('📋 Checking button payload for salon command:', payload.ButtonPayload);
      
      // Map English button IDs to command types (updated with actual button IDs from Twilio)
      const salonButtonMap: Record<string, string> = {
        'appointments': 'appointments',
        'today': 'appointments', 
        'oraret': 'appointments',
        'waiting': 'pending',
        'pending': 'pending',
        'pritje': 'pending',
        'tomorrow': 'tomorrow',
        'neser': 'tomorrow',
        'help': 'help',
        'ndihme': 'help'
      };
      
      salonCommandType = salonButtonMap[payload.ButtonPayload.toLowerCase()];
    }
    
    // Handle text commands (when no button payload or not appointment button)
    if (!salonCommandType && messageBody && !payload.ButtonPayload?.match(/^(approve|decline)_(.+)$/)) {
      console.log(`📱 Checking if message is salon command: "${messageBody}" from ${fromPhone}`);
      
      // Check if this is a known salon command
      const command = parseCommand(messageBody);
      if (command.type !== 'unknown') {
        salonCommandType = command.type;
      }
    }
    
    // Process salon command if detected
    if (salonCommandType) {
      console.log(`🎯 Processing salon command: ${salonCommandType}`);
      
      // Validate salon
      const salon = await validateSalon(fromPhone);
      if (!salon) {
        console.log(`❌ Unregistered salon: ${fromPhone}`);
        return res.status(200).end(); // Ignore messages from unregistered salons
      }

      // Check rate limiting
      const rateLimitPassed = await checkRateLimit(fromPhone);
      if (!rateLimitPassed) {
        await sendDirectWhatsAppMessage(fromPhone, SALON_RESPONSES.RATE_LIMIT);
        return res.status(200).end();
      }

      // Log command
      await logCommand(fromPhone, salonCommandType);

      // Handle menu command with interactive template
      if (salonCommandType === 'menu') {
        try {
          await sendWhatsAppTemplate(fromPhone, 'SALON_MENU', {});
          console.log(`📤 Interactive menu sent to ${fromPhone}`);
        } catch (error) {
          console.error('Error sending menu template:', error);
          // Fallback to plain text menu
          await sendDirectWhatsAppMessage(fromPhone, SALON_RESPONSES.MENU);
        }
        return res.status(200).end();
      }

      // Process other salon commands
      let response: string;
      switch (salonCommandType) {
        case 'appointments':
          response = await getTodayAppointments(salon.id);
          break;
        case 'pending':
          response = await getPendingAppointments(salon.id);
          break;
        case 'tomorrow':
          response = await getTomorrowAppointments(salon.id);
          break;
        case 'approve':
          {
            const command = parseCommand(messageBody);
            if (command.parameter) {
              response = await processApproval(command.parameter, salon.id);
            } else {
              response = '❌ Ju lutemi specifikoni ID-në e rezervimit. Shembull: "aprovo 12345678"';
            }
          }
          break;
        case 'decline':
          {
            const command = parseCommand(messageBody);
            if (command.parameter) {
              response = await processDecline(command.parameter, salon.id);
            } else {
              response = '❌ Ju lutemi specifikoni ID-në e rezervimit. Shembull: "refuzo 12345678"';
            }
          }
          break;
        case 'help':
          response = SALON_RESPONSES.HELP;
          break;
        default:
          response = SALON_RESPONSES.UNKNOWN_COMMAND(salonCommandType);
      }

      // Send response
      await sendDirectWhatsAppMessage(fromPhone, response);
      return res.status(200).end();
    }

    // 🎯 APPOINTMENT BUTTON PROCESSING - Continue with existing logic
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
    if (!appointment || !appointment.salons || !appointment.customers) {
      console.log('❌ Appointment not found:', appointmentId);
      console.log('🔍 Debugging appointment lookup failure:');
      console.log('- Appointment ID format:', typeof appointmentId, appointmentId.length);
      console.log('- Salon phone from webhook:', salonPhone);
      
      // Send more detailed error message to salon
      await sendWhatsAppErrorMessage(
        salonPhone, 
        `⚠️ *Gabim në sistem*\n\nRezervimi me ID: ${appointmentId.substring(0, 8)}... nuk u gjet.\n\n📱 Përdorni dashboard-in: https://imirezervimi.al/salon/dashboard\n\n💼 ImiRezervimi.al`
      );
      return res.status(200).json({
        success: false,
        message: 'Appointment not found',
        details: {
          appointmentId,
          salonPhone,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Validate salon ownership
    if (appointment.salons.phone !== salonPhone) {
      console.log('❌ Salon phone mismatch:', {
        appointmentSalonPhone: appointment.salons.phone,
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
        salon: appointment.salons.name
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
      const customerName = `${appointment.customers.first_name} ${appointment.customers.last_name}`;
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
        appointment.services?.name || 'Shërbim'
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
      
      console.log(`📱 Sending approval notification to customer: ${appointment.customers.phone}`);
      console.log(`🏪 Salon: ${appointment.salons.name}, Date: ${appointmentDate}, Time: ${appointment.start_time}`);
      
      const result = await sendWhatsAppTemplate(appointment.customers.phone, 'BOOKING_APPROVED', {
        salonName: appointment.salons.name,
        date: appointmentDate,
        time: appointment.start_time
      });
      
      if (result.success) {
        console.log(`✅ Approval notification sent to customer successfully. Message SID: ${result.messageSid}`);
      } else {
        console.error(`❌ Failed to send approval notification to customer: ${result.error}`);
        
        // Send fallback notification to salon about the failure
        await sendWhatsAppErrorMessage(
          salonPhone,
          `⚠️ *Kujdes*: Rezervimi u aprovua por klienti NUK u njoftua.\n\n📱 Ju lutem kontaktoni klientin manualisht:\n*${appointment.customers.first_name} ${appointment.customers.last_name}*\n📞 ${appointment.customers.phone}\n\n💼 ImiRezervimi.al`
        );
      }
    } catch (error) {
      console.error('⚠️ Exception in customer notification:', error);
      
      // Send fallback notification to salon about the critical failure
      await sendWhatsAppErrorMessage(
        salonPhone,
        `🚨 *Gabim kritik*: Rezervimi u aprovua por klienti NUK u njoftua për shkak të një gabimi teknik.\n\n📱 DUHET ta kontaktoni klientin manualisht:\n*${appointment.customers.first_name} ${appointment.customers.last_name}*\n📞 ${appointment.customers.phone}\n\n💼 ImiRezervimi.al`
      );
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
      const customerName = `${appointment.customers.first_name} ${appointment.customers.last_name}`;
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
        appointment.services?.name || 'Shërbim'
      );
      console.log('✅ Decline confirmation sent to salon');
    } catch (error) {
      console.error('⚠️ Failed to send salon confirmation:', error);
    }
    
    // Send decline notification to customer
    try {
      console.log(`📱 Sending decline notification to customer: ${appointment.customers.phone}`);
      console.log(`🏪 Salon: ${appointment.salons.name}`);
      
      const result = await sendWhatsAppTemplate(appointment.customers.phone, 'BOOKING_DECLINED', {
        salonName: appointment.salons.name,
        reason: 'Saloni nuk është i disponueshëm për këtë kohë'
      });
      
      if (result.success) {
        console.log(`✅ Decline notification sent to customer successfully. Message SID: ${result.messageSid}`);
      } else {
        console.error(`❌ Failed to send decline notification to customer: ${result.error}`);
        
        // Send fallback notification to salon about the failure
        await sendWhatsAppErrorMessage(
          salonPhone,
          `⚠️ *Kujdes*: Refuzimi u përpunua por klienti NUK u njoftua.\n\n📱 Ju lutem kontaktoni klientin manualisht:\n*${appointment.customers.first_name} ${appointment.customers.last_name}*\n📞 ${appointment.customers.phone}\n\n💼 ImiRezervimi.al`
        );
      }
    } catch (error) {
      console.error('⚠️ Exception in customer notification:', error);
      
      // Send fallback notification to salon about the critical failure
      await sendWhatsAppErrorMessage(
        salonPhone,
        `🚨 *Gabim kritik*: Refuzimi u përpunua por klienti NUK u njoftua për shkak të një gabimi teknik.\n\n📱 DUHET ta kontaktoni klientin manualisht:\n*${appointment.customers.first_name} ${appointment.customers.last_name}*\n📞 ${appointment.customers.phone}\n\n💼 ImiRezervimi.al`
      );
    }
    
    console.log(`❌ Appointment ${appointmentId} successfully declined via WhatsApp`);
    
  } catch (error) {
    console.error('❌ Error in handleDecline:', error);
    const salonPhoneClean = whatsappFrom.replace('whatsapp:', '');
    await sendWhatsAppErrorMessage(salonPhoneClean, 'Gabim në refuzimin e rezervimit. Kontaktoni mbështetjen teknike.');
  }
}

// Helper function to send direct WhatsApp messages for salon commands
async function sendDirectWhatsAppMessage(phone: string, message: string): Promise<void> {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phone}`
    });

    console.log(`📤 Direct message sent to ${phone}`);
  } catch (error) {
    console.error('Error sending direct WhatsApp message:', error);
    throw error;
  }
}

/**
 * Validate template configuration before sending notifications
 */
async function validateWhatsAppTemplates(): Promise<{
  allValid: boolean;
  approvalTemplateValid: boolean;
  declineTemplateValid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let approvalTemplateValid = false;
  let declineTemplateValid = false;

  try {
    // Check BOOKING_APPROVED template
    const approvalTemplate = getWhatsAppTemplate('BOOKING_APPROVED');
    if (approvalTemplate.contentSid && approvalTemplate.variables.includes('salonName') && 
        approvalTemplate.variables.includes('date') && approvalTemplate.variables.includes('time')) {
      approvalTemplateValid = true;
    } else {
      errors.push('BOOKING_APPROVED template missing or invalid variables');
    }
  } catch (error) {
    errors.push(`BOOKING_APPROVED template error: ${(error as Error).message}`);
  }

  try {
    // Check BOOKING_DECLINED template
    const declineTemplate = getWhatsAppTemplate('BOOKING_DECLINED');
    if (declineTemplate.contentSid && declineTemplate.variables.includes('salonName') && 
        declineTemplate.variables.includes('reason')) {
      declineTemplateValid = true;
    } else {
      errors.push('BOOKING_DECLINED template missing or invalid variables');
    }
  } catch (error) {
    errors.push(`BOOKING_DECLINED template error: ${(error as Error).message}`);
  }

  return {
    allValid: approvalTemplateValid && declineTemplateValid,
    approvalTemplateValid,
    declineTemplateValid,
    errors
  };
}

