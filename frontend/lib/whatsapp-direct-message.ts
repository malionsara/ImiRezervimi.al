// frontend/lib/whatsapp-direct-message.ts
// Direct WhatsApp message sending (non-template) for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { Twilio } from 'twilio';
import { isValidAlbanianPhone } from './twilio';

// Lazy-loaded Twilio client
let twilioClient: Twilio | null = null;

function initializeTwilio(): Twilio {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required');
    }
    
    twilioClient = new Twilio(accountSid, authToken);
  }
  return twilioClient;
}

/**
 * Send a direct WhatsApp message (not using templates)
 * Used for error messages and confirmations
 */
export async function sendDirectWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    console.log(`📤 Sending direct WhatsApp message to ${to}`);
    console.log(`📝 Message: ${message}`);
    
    // Validate phone number
    if (!isValidAlbanianPhone(to)) {
      throw new Error(`Invalid Albanian phone number: ${to}`);
    }
    
    // Initialize Twilio client
    const client = initializeTwilio();
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    
    if (!whatsappNumber) {
      throw new Error('TWILIO_WHATSAPP_NUMBER not configured');
    }
    
    // Send message
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${to}`
    });
    
    console.log('✅ Direct WhatsApp message sent successfully');
    console.log('   Message SID:', result.sid);
    console.log('   Status:', result.status);
    
    return {
      success: true,
      messageSid: result.sid
    };
    
  } catch (error) {
    console.error('❌ Failed to send direct WhatsApp message:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send error message to salon via WhatsApp
 */
export async function sendWhatsAppErrorMessage(
  salonPhone: string,
  errorMessage: string
): Promise<void> {
  try {
    const fullMessage = `⚠️ *Gabim*

${errorMessage}

📱 Përdorni dashboard-in: https://imirezervimi.al/salon/dashboard

💼 ImiRezervimi.al`;

    await sendDirectWhatsAppMessage(salonPhone, fullMessage);
  } catch (error) {
    console.error('❌ Failed to send error message:', error);
  }
}

/**
 * Send confirmation message to salon after processing appointment
 */
export async function sendWhatsAppConfirmation(
  salonPhone: string,
  action: 'approved' | 'declined',
  customerName: string,
  appointmentDate: string,
  appointmentTime: string,
  serviceName: string
): Promise<void> {
  try {
    let confirmationMessage: string;
    
    if (action === 'approved') {
      confirmationMessage = `✅ *Rezervimi u Aprovua*

👤 ${customerName}
📅 ${appointmentDate} në ${appointmentTime}
💅 ${serviceName}

📱 Klienti është njoftuar automatikisht
📊 Dashboard: https://imirezervimi.al/salon/dashboard

💼 ImiRezervimi.al`;
    } else {
      confirmationMessage = `❌ *Rezervimi u Refuzua*

👤 ${customerName}
📅 ${appointmentDate} në ${appointmentTime}
💅 ${serviceName}

📱 Klienti është njoftuar automatikisht
📊 Dashboard: https://imirezervimi.al/salon/dashboard

💼 ImiRezervimi.al`;
    }
    
    await sendDirectWhatsAppMessage(salonPhone, confirmationMessage);
    
  } catch (error) {
    console.error('❌ Failed to send confirmation message:', error);
  }
}