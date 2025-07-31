// frontend/lib/whatsapp.ts
// WhatsApp verification system for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { Twilio } from 'twilio';
import { isValidAlbanianPhone } from './twilio';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Lazy-loaded Twilio client
let twilioClient: Twilio | null = null;

function initializeTwilio(): Twilio {
  if (!twilioClient) {
    try {
      // For now, allow sandbox number in production for testing
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      
      if (!accountSid || !authToken) {
        throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required');
      }
      
      twilioClient = new Twilio(accountSid, authToken);
    } catch (error) {
      throw new Error(`Failed to initialize Twilio: ${(error as Error).message}`);
    }
  }
  return twilioClient;
}

export interface WhatsAppVerificationResult {
  success: boolean;
  messageSid?: string;
  error?: string;
}

export interface WhatsAppVerifyResult {
  success: boolean;
  verified: boolean;
  error?: string;
  attemptsRemaining?: number;
}

// Albanian WhatsApp message templates
const ALBANIAN_WHATSAPP_TEMPLATES = {
  verification: (code: string) => 
    `🔐 *Kodi i Verifikimit - ImiRezervimi.al*\n\nKodi juaj është: *${code}*\n\n⏰ Ky kod skadon brenda 5 minutave\n🔒 Mos e ndani këtë kod me askënd\n\n💅 ImiRezervimi.al - Rezervoni tani!`,
  
  welcome: (name?: string) =>
    `🎉 *Mirë se vini në ImiRezervimi.al!*\n\n${name ? `Përshëndetje ${name}! ` : ''}Llogaria juaj është krijuar me sukses.\n\n✅ Tani mund të:\n• Rezervoni shërbime bukurie\n• Zgjidhni kohën që ju përshtatet\n• Merrni konfirmime në WhatsApp\n\n🏪 Zbuloni salonet më të mira në Shqipëri!\n\n📱 https://www.imirezervimi.al`,

  appointmentConfirmed: (salonName: string, date: string, time: string, service: string) =>
    `✅ *Rezervimi u Konfirmua!*\n\n🏪 *Saloni:* ${salonName}\n📅 *Data:* ${date}\n🕐 *Ora:* ${time}\n💅 *Shërbimi:* ${service}\n\n📍 Adresa dhe detajet e tjera do t'ju dërgohen së shpejti.\n\n🔔 Do të merrni një kujtesë 24 orë përpara.\n\n📱 ImiRezervimi.al`,

  appointmentReminder: (salonName: string, date: string, time: string) =>
    `⏰ *Kujtesë për Rezervimin*\n\n🏪 ${salonName}\n📅 Nesër, ${date}\n🕐 Ora ${time}\n\n✅ Ju presim në kohë!\n❌ Për të anuluar, na kontaktoni\n\n📱 ImiRezervimi.al`,

  appointmentCancelled: (salonName: string, date: string, time: string, reason?: string) =>
    `❌ *Rezervimi u Anulua*\n\n🏪 ${salonName}\n📅 ${date} - ${time}\n\n${reason ? `📝 Arsyeja: ${reason}\n\n` : ''}😔 Na vjen keq për këtë ndryshim.\n🔄 Rezervoni përsëri kur të dëshironi.\n\n📱 ImiRezervimi.al`
};

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if phone number is rate limited for WhatsApp
 */
export async function checkWhatsAppRateLimit(phone: string): Promise<boolean> {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    
    const { data, error } = await supabase
      .from('verification_codes')
      .select('id')
      .eq('phone_number', phone)
      .gte('created_at', oneMinuteAgo)
      .limit(1);

    if (error) {
      console.error('WhatsApp rate limit check error:', error);
      return true; // Fail safe - assume rate limited
    }

    return (data && data.length > 0); // Rate limited if recent code exists
  } catch (error) {
    console.error('WhatsApp rate limit check error:', error);
    return true; // Fail safe
  }
}

/**
 * Store WhatsApp verification code in database
 */
export async function storeWhatsAppVerificationCode(
  phone: string, 
  code: string
): Promise<string | null> {
  try {
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes from now

    const { data, error } = await supabase
      .from('verification_codes')
      .insert([
        {
          phone_number: phone,
          code,
          expires_at: expiresAt.toISOString(),
          attempts: 0,
          verified: false,
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Database error storing WhatsApp verification code:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error storing WhatsApp verification code:', error);
    return null;
  }
}

/**
 * Send WhatsApp verification code
 */
export async function sendWhatsAppVerification(phone: string): Promise<WhatsAppVerificationResult> {
  try {
    // Validate Albanian phone number
    if (!isValidAlbanianPhone(phone)) {
      return {
        success: false,
        error: 'Numri i telefonit duhet të jetë në formatin +355XXXXXXXX',
      };
    }

    // Check rate limiting (1 message per minute)
    const isRateLimited = await checkWhatsAppRateLimit(phone);
    if (isRateLimited) {
      return {
        success: false,
        error: 'Duhet të prisni 1 minutë para se të kërkoni një kod tjetër',
      };
    }

    // Generate verification code
    const code = generateVerificationCode();

    // Store in database
    const recordId = await storeWhatsAppVerificationCode(phone, code);
    if (!recordId) {
      return {
        success: false,
        error: 'Gabim në ruajtjen e kodit të verifikimit',
      };
    }

    // Initialize Twilio and send WhatsApp message
    const client = initializeTwilio();
    
    // Get the WhatsApp phone number from environment
    const whatsappPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!whatsappPhoneNumber) {
      throw new Error('TWILIO_WHATSAPP_NUMBER not configured for WhatsApp');
    }

    const message = ALBANIAN_WHATSAPP_TEMPLATES.verification(code);
    
    console.log(`Sending WhatsApp verification to ${phone}: ${code}`);

    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${whatsappPhoneNumber}`,
      to: `whatsapp:${phone}`,
    });

    // Log successful WhatsApp message
    await logWhatsAppNotification({
      phone,
      code,
      twilioSid: result.sid,
      status: 'sent',
      recordId,
    });

    return {
      success: true,
      messageSid: result.sid,
    };

  } catch (error: unknown) {
    console.error('WhatsApp send error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Gabim në dërgimin e mesazhit në WhatsApp';
    
    // Log failed WhatsApp message
    await logWhatsAppNotification({
      phone,
      status: 'failed',
      error: errorMessage,
    });

    return {
      success: false,
      error: 'Gabim në dërgimin e mesazhit në WhatsApp. Provoni përsëri.',
    };
  }
}

/**
 * Verify phone number with WhatsApp code
 */
export async function verifyWhatsAppCode(
  phone: string, 
  providedCode: string
): Promise<WhatsAppVerifyResult> {
  try {
    // Find the most recent unverified code for this phone
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('phone_number', phone)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return {
        success: false,
        verified: false,
        error: 'Kodi i verifikimit ka skaduar ose nuk ekziston',
      };
    }

    // Check if too many attempts
    if (data.attempts >= 3) {
      return {
        success: false,
        verified: false,
        error: 'Shumë përpjekje të dështuara. Kërkoni një kod të ri.',
      };
    }

    // Increment attempts
    await supabase
      .from('verification_codes')
      .update({ attempts: data.attempts + 1 })
      .eq('id', data.id);

    // Check if code matches
    if (data.code !== providedCode) {
      const attemptsRemaining = 2 - data.attempts;
      return {
        success: false,
        verified: false,
        error: `Kod i pasakt. Ju kanë mbetur ${attemptsRemaining + 1} përpjekje.`,
        attemptsRemaining,
      };
    }

    // Code is correct - mark as verified
    await supabase
      .from('verification_codes')
      .update({ verified: true })
      .eq('id', data.id);

    // Log successful verification
    await logWhatsAppNotification({
      phone,
      code: providedCode,
      status: 'verified',
      recordId: data.id,
    });

    return {
      success: true,
      verified: true,
    };

  } catch (error: unknown) {
    console.error('WhatsApp phone verification error:', error);
    return {
      success: false,
      verified: false,
      error: 'Gabim në verifikimin e kodit',
    };
  }
}

/**
 * Send WhatsApp welcome message after successful registration
 */
export async function sendWhatsAppWelcome(phone: string, name?: string): Promise<void> {
  try {
    const client = initializeTwilio();
    const whatsappPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    
    if (!whatsappPhoneNumber) {
      console.log('Welcome WhatsApp message skipped - no WhatsApp number configured');
      return;
    }

    const message = ALBANIAN_WHATSAPP_TEMPLATES.welcome(name);
    
    await client.messages.create({
      body: message,
      from: `whatsapp:${whatsappPhoneNumber}`,
      to: `whatsapp:${phone}`,
    });

    console.log(`Welcome WhatsApp message sent to ${phone}`);
  } catch (error) {
    console.error('Welcome WhatsApp message error:', error);
    // Don't throw - welcome message failure shouldn't block the main flow
  }
}

/**
 * Send appointment confirmation via WhatsApp
 */
export async function sendAppointmentConfirmation(
  phone: string,
  appointmentDetails: {
    salonName: string;
    date: string;
    time: string;
    service: string;
  }
): Promise<void> {
  try {
    const client = initializeTwilio();
    const whatsappPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    
    if (!whatsappPhoneNumber) {
      console.log('Appointment confirmation WhatsApp message skipped - no WhatsApp number configured');
      return;
    }

    const message = ALBANIAN_WHATSAPP_TEMPLATES.appointmentConfirmed(
      appointmentDetails.salonName,
      appointmentDetails.date,
      appointmentDetails.time,
      appointmentDetails.service
    );
    
    await client.messages.create({
      body: message,
      from: `whatsapp:${whatsappPhoneNumber}`,
      to: `whatsapp:${phone}`,
    });

    console.log(`Appointment confirmation WhatsApp message sent to ${phone}`);
  } catch (error) {
    console.error('Appointment confirmation WhatsApp message error:', error);
  }
}

/**
 * Send appointment reminder via WhatsApp
 */
export async function sendAppointmentReminder(
  phone: string,
  appointmentDetails: {
    salonName: string;
    date: string;
    time: string;
  }
): Promise<void> {
  try {
    const client = initializeTwilio();
    const whatsappPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    
    if (!whatsappPhoneNumber) {
      console.log('Appointment reminder WhatsApp message skipped - no WhatsApp number configured');
      return;
    }

    const message = ALBANIAN_WHATSAPP_TEMPLATES.appointmentReminder(
      appointmentDetails.salonName,
      appointmentDetails.date,
      appointmentDetails.time
    );
    
    await client.messages.create({
      body: message,
      from: `whatsapp:${whatsappPhoneNumber}`,
      to: `whatsapp:${phone}`,
    });

    console.log(`Appointment reminder WhatsApp message sent to ${phone}`);
  } catch (error) {
    console.error('Appointment reminder WhatsApp message error:', error);
  }
}

/**
 * Log WhatsApp notification (for tracking and debugging)
 */
async function logWhatsAppNotification(data: {
  phone: string;
  code?: string;
  twilioSid?: string;
  status: 'sent' | 'failed' | 'verified';
  error?: string;
  recordId?: string;
}): Promise<void> {
  try {
    // TODO: Store in notifications table when implemented
    console.log('WhatsApp Notification log:', {
      timestamp: new Date().toISOString(),
      type: 'whatsapp_verification',
      ...data,
    });
  } catch (error) {
    console.error('Error logging WhatsApp notification:', error);
  }
}

/**
 * Check if a phone number is verified via WhatsApp
 */
export async function isPhoneVerifiedWhatsApp(phone: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('verification_codes')
      .select('id')
      .eq('phone_number', phone)
      .eq('verified', true)
      .limit(1);

    if (error) {
      console.error('WhatsApp phone verification check error:', error);
      return false;
    }

    return (data && data.length > 0);
  } catch (error) {
    console.error('WhatsApp phone verification check error:', error);
    return false;
  }
}