// frontend/lib/twilio.ts
// Twilio WhatsApp Integration for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { Twilio } from 'twilio';
import { WhatsAppMessageResponse, NotificationType } from '../../shared/types';
import { getTwilioConfig } from './twilio-validation';

// Lazy-loaded Twilio client and config
let twilioClient: Twilio | null = null;
let twilioConfig: ReturnType<typeof getTwilioConfig> | null = null;

// Initialize Twilio client on first use
function initializeTwilio(): { client: Twilio; config: ReturnType<typeof getTwilioConfig> } {
  if (!twilioClient || !twilioConfig) {
    try {
      twilioConfig = getTwilioConfig();
      twilioClient = new Twilio(
        twilioConfig.accountSid,
        twilioConfig.authToken
      );
    } catch (error) {
      throw new Error(`Failed to initialize Twilio: ${(error as Error).message}`);
    }
  }
  return { client: twilioClient, config: twilioConfig };
}

// Albanian WhatsApp message templates
export const ALBANIAN_WHATSAPP_TEMPLATES = {
  booking_request: (salonName: string, date: string, time: string) => 
    `Kërkesa u dërgua te ${salonName} për ${date} në ${time}. Do të njoftoheni brenda 2 orësh! 💅\n\n📱 ImiRezervimi.al`,
  
  booking_approved: (salonName: string, date: string, time: string) => 
    `🎉 Rezervimi u bë me sukses!\n\n${salonName} ju mirëpret ${date} në ${time}! ✨\n\n📱 ImiRezervimi.al`,
  
  booking_declined: (salonName: string, reason?: string) => 
    `Na vjen keq, ${salonName} nuk mund të ju pranojë këtë herë. ${reason || 'Provoni një kohë tjetër!'} 🙏\n\n📱 ImiRezervimi.al`,
  
  reminder_24h: (salonName: string, date: string, time: string) => 
    `⏰ Kujtesë: Nesër në ${time} te ${salonName}.\n\nShihemi atje! 💅\n\n📱 ImiRezervimi.al`,
  
  new_request_salon: (customerName: string, service: string, date: string, time: string) => 
    `📋 Kërkesë e re nga ${customerName}\n\n🎯 Shërbimi: ${service}\n📅 Data: ${date} në ${time}\n\nShikoni dashboard-in tuaj! 📱\n\n💼 ImiRezervimi.al`,
};

/**
 * Send WhatsApp message with Albanian encoding support
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  retryCount = 0
): Promise<WhatsAppMessageResponse> {
  try {
    // Initialize Twilio on first use
    const { client, config } = initializeTwilio();

    // Validate Albanian phone number format
    if (!isValidAlbanianPhone(to)) {
      throw new Error(`Invalid Albanian phone number format: ${to}`);
    }

    // Format phone number for WhatsApp
    const formattedPhone = formatPhoneForWhatsApp(to);
    
    console.log(`Sending WhatsApp message to ${formattedPhone}:`, message);

    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${config.whatsappNumber}`,
      to: `whatsapp:${formattedPhone}`,
    });

    // Log successful delivery
    await logNotification({
      phone: to,
      message,
      twilioSid: result.sid,
      status: 'sent',
    });

    return {
      sid: result.sid,
      status: result.status as 'queued' | 'sent' | 'delivered' | 'failed',
    };

  } catch (error: unknown) {
    console.error(`WhatsApp message failed (attempt ${retryCount + 1}):`, error);

    // Retry logic with exponential backoff
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.log(`Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendWhatsAppMessage(to, message, retryCount + 1);
    }

    // Log failed delivery after all retries
    const errorMessage = error instanceof Error ? error.message : String(error);
    await logNotification({
      phone: to,
      message,
      status: 'failed',
      error: errorMessage,
    });

    throw new Error(`Failed to send WhatsApp message after ${retryCount + 1} attempts: ${errorMessage}`);
  }
}

/**
 * Send notification using predefined Albanian templates
 */
export async function sendNotification(
  type: NotificationType,
  to: string,
  params: Record<string, string>
): Promise<WhatsAppMessageResponse> {
  let message: string;

  switch (type) {
    case 'booking_request':
      message = ALBANIAN_WHATSAPP_TEMPLATES.booking_request(
        params.salonName,
        params.date,
        params.time
      );
      break;
    
    case 'booking_approved':
      message = ALBANIAN_WHATSAPP_TEMPLATES.booking_approved(
        params.salonName,
        params.date,
        params.time
      );
      break;
    
    case 'booking_declined':
      message = ALBANIAN_WHATSAPP_TEMPLATES.booking_declined(
        params.salonName,
        params.reason
      );
      break;
    
    case 'reminder_24h':
      message = ALBANIAN_WHATSAPP_TEMPLATES.reminder_24h(
        params.salonName,
        params.date,
        params.time
      );
      break;
    
    case 'new_request_salon':
      message = ALBANIAN_WHATSAPP_TEMPLATES.new_request_salon(
        params.customerName,
        params.service,
        params.date,
        params.time
      );
      break;
    
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }

  return sendWhatsAppMessage(to, message);
}

/**
 * Validate Albanian phone number format (+355XXXXXXXX)
 */
export function isValidAlbanianPhone(phone: string): boolean {
  const albanianPhoneRegex = /^\+355[0-9]{8,9}$/;
  return albanianPhoneRegex.test(phone);
}

/**
 * Format phone number for WhatsApp (ensure +355 prefix)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove any whitespace
  phone = phone.replace(/\s/g, '');
  
  // If it starts with +355, return as is
  if (phone.startsWith('+355')) {
    return phone;
  }
  
  // If it starts with 355, add +
  if (phone.startsWith('355')) {
    return `+${phone}`;
  }
  
  // If it starts with 0, replace with +355
  if (phone.startsWith('0')) {
    return `+355${phone.substring(1)}`;
  }
  
  // If it's just the number without prefix, add +355
  if (/^[0-9]{8,9}$/.test(phone)) {
    return `+355${phone}`;
  }
  
  throw new Error(`Cannot format phone number: ${phone}`);
}

/**
 * Log notification to database (placeholder - will be implemented with Supabase)
 */
async function logNotification(data: {
  phone: string;
  message: string;
  twilioSid?: string;
  status: 'sent' | 'failed';
  error?: string;
}): Promise<void> {
  // TODO: Implement database logging with Supabase
  console.log('Notification log:', {
    timestamp: new Date().toISOString(),
    ...data,
  });
}

/**
 * Test WhatsApp connection (for development)
 */
export async function testWhatsAppConnection(): Promise<boolean> {
  try {
    // Test with Twilio sandbox number
    const testMessage = "🧪 Test poruke nga ImiRezervimi.al\n\nNëse e shihni këtë mesazh, WhatsApp integrimi funksionon! ✅";
    
    // Use a test number - in production this should be configurable
    const testNumber = process.env.TWILIO_TEST_PHONE_NUMBER || '+355691234567';
    
    await sendWhatsAppMessage(testNumber, testMessage);
    return true;
  } catch (error) {
    console.error('WhatsApp connection test failed:', error);
    return false;
  }
}

export default twilioClient;