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
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
      const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
      
      console.log('🔧 Twilio Configuration Check:');
      console.log(`   Account SID: ${accountSid ? accountSid.substring(0, 10) + '...' : 'MISSING'}`);
      console.log(`   Auth Token: ${authToken ? '[SET]' : 'MISSING'}`);
      console.log(`   WhatsApp Number: ${whatsappNumber || 'MISSING'}`);
      console.log(`   Messaging Service SID: ${messagingServiceSid || 'NOT SET (optional)'}`);
      
      if (!accountSid || !authToken) {
        throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required');
      }
      
      if (!whatsappNumber) {
        throw new Error('TWILIO_WHATSAPP_NUMBER is required for WhatsApp messaging');
      }
      
      twilioClient = new Twilio(accountSid, authToken);
      console.log('✅ Twilio client initialized successfully');
    } catch (error) {
      console.error('❌ Twilio initialization failed:', error);
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

// Albanian WhatsApp message templates with enhanced branding
const ALBANIAN_WHATSAPP_TEMPLATES = {
  verification: (code: string) => 
    `Your verification code is: ${code}. Valid for 5 minutes. Do not share this code.`,
  
  verificationAlbanian: (code: string) => 
    `🔐 *Kodi i Verifikimit - ImiRezervimi.al*\n\n💎 Kodi juaj është: *${code}*\n\n⏰ Ky kod skadon brenda 5 minutave\n🔒 Mos e ndani këtë kod me askënd\n\n✨ *ImiRezervimi.al* - Platforma #1 për salona bukurie në Shqipëri\n📱 www.imirezervimi.al`,
  
  welcome: (name?: string) =>
    `🎉 *Mirë se vini në ImiRezervimi.al!*\n\n${name ? `✨ Përshëndetje ${name}! ` : ''}Llogaria juaj është krijuar me sukses.\n\n🌟 *Ç'mund të bëni tani:*\n💅 Rezervoni shërbimet tuaja të preferuara\n⏰ Zgjidhni kohën që ju përshtatet\n📲 Merrni konfirmime direkt në WhatsApp\n🎁 Përfitoni oferta ekskluzive\n\n🏆 *Zbuloni salonet më të mira në Shqipëri!*\n\n📱 www.imirezervimi.al\n📧 info@imirezervimi.al`,

  appointmentConfirmed: (salonName: string, date: string, time: string, service: string) =>
    `✅ *Rezervimi u Konfirmua - ImiRezervimi.al*\n\n🏪 *Saloni:* ${salonName}\n📅 *Data:* ${date}\n🕐 *Ora:* ${time}\n💅 *Shërbimi:* ${service}\n\n📍 Adresa dhe detajet e tjera do t'ju dërgohen së shpejti\n🔔 Kujtesë automatike 24 orë përpara\n\n💎 *Faleminderit që zgjodhët ImiRezervimi.al!*\n📱 www.imirezervimi.al`,

  appointmentReminder: (salonName: string, date: string, time: string) =>
    `⏰ *Kujtesë Rezervimi - ImiRezervimi.al*\n\n🏪 *${salonName}*\n📅 *Nesër:* ${date}\n🕐 *Ora:* ${time}\n\n✨ Ju presim në kohë!\n❌ Për anulim: Kontaktoni salonin direkt\n\n💄 Përgatitur për një përvojë të shkëlqyer?\n📱 www.imirezervimi.al`,

  appointmentCancelled: (salonName: string, date: string, time: string, reason?: string) =>
    `❌ *Rezervimi u Anulua - ImiRezervimi.al*\n\n🏪 *Saloni:* ${salonName}\n📅 *Data/Ora:* ${date} - ${time}\n\n${reason ? `📝 *Arsyeja:* ${reason}\n\n` : ''}😔 Na vjen keq për këtë ndryshim\n\n🔄 *Rezervoni përsëri kur të dëshironi:*\n📱 www.imirezervimi.al\n\n💎 Faleminderit për besimin!`
};

/**
 * Check if we're using Twilio Sandbox or Production WhatsApp
 */
function isUsingSandbox(): boolean {
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  // Sandbox uses the Twilio test number +14155238886
  // Production should use your actual WhatsApp Business number
  const isSandbox = whatsappNumber?.includes('14155238886') || false;
  console.log(`📋 WhatsApp Mode Detection:`);
  console.log(`   Number: ${whatsappNumber}`);
  console.log(`   Is Sandbox: ${isSandbox}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  return isSandbox;
}

/**
 * Add sandbox disclaimer to messages in development
 */
function addSandboxDisclaimer(message: string): string {
  const isSandbox = isUsingSandbox();
  console.log(`📝 Message processing:`);
  console.log(`   Is Sandbox: ${isSandbox}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  
  if (isSandbox) {
    console.log(`   Adding sandbox disclaimer`);
    return message + '\n\n💡 _Mesazhi dërgohet nga Twilio Sandbox për teste_';
  }
  console.log(`   Using production message (no disclaimer)`);
  return message;
}

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
    console.log('🚀 Starting WhatsApp verification process for:', phone);
    
    // Validate Albanian phone number
    if (!isValidAlbanianPhone(phone)) {
      console.log('❌ Invalid Albanian phone number format:', phone);
      return {
        success: false,
        error: 'Numri i telefonit duhet të jetë në formatin +355XXXXXXXX',
      };
    }
    console.log('✅ Phone number format validated');

    // Check rate limiting (1 message per minute)
    const isRateLimited = await checkWhatsAppRateLimit(phone);
    if (isRateLimited) {
      console.log('⏱️ Rate limited for phone:', phone);
      return {
        success: false,
        error: 'Duhet të prisni 1 minutë para se të kërkoni një kod tjetër',
      };
    }
    console.log('✅ Rate limit check passed');

    // Generate verification code
    const code = generateVerificationCode();
    console.log('🔢 Generated verification code:', code);

    // Store in database
    const recordId = await storeWhatsAppVerificationCode(phone, code);
    if (!recordId) {
      console.log('❌ Failed to store verification code in database');
      return {
        success: false,
        error: 'Gabim në ruajtjen e kodit të verifikimit',
      };
    }
    console.log('✅ Verification code stored in database with ID:', recordId);

    // Initialize Twilio and send WhatsApp message
    console.log('🔧 Initializing Twilio client...');
    const client = initializeTwilio();
    
    // Get the WhatsApp phone number from environment
    const whatsappPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    console.log('📱 Using WhatsApp number:', whatsappPhoneNumber);
    
    if (!whatsappPhoneNumber) {
      console.log('❌ TWILIO_WHATSAPP_NUMBER environment variable not set');
      throw new Error('TWILIO_WHATSAPP_NUMBER not configured for WhatsApp');
    }

    // Check if using sandbox or production
    const isSandbox = isUsingSandbox();
    console.log('🏗️ WhatsApp mode:', isSandbox ? 'SANDBOX' : 'PRODUCTION');
    
    // Try simple English template first (more likely to be approved)
    const useSimpleTemplate = process.env.WHATSAPP_USE_SIMPLE_TEMPLATE === 'true'
    const message = useSimpleTemplate 
      ? ALBANIAN_WHATSAPP_TEMPLATES.verification(code)
      : addSandboxDisclaimer(ALBANIAN_WHATSAPP_TEMPLATES.verificationAlbanian(code));
    console.log('📝 Message prepared, length:', message.length);
    
    console.log('📤 Sending WhatsApp message...');
    console.log('   From:', `whatsapp:${whatsappPhoneNumber}`);
    console.log('   To:', `whatsapp:${phone}`);
    console.log('   Code:', code);

    // Check if we should use WhatsApp Message Templates (required for production)
    const useMessageTemplate = process.env.WHATSAPP_USE_MESSAGE_TEMPLATE === 'true';
    const templateSid = process.env.WHATSAPP_TEMPLATE_SID; // Template SID from Twilio Console
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    
    let messageOptions: any;
    
    if (useMessageTemplate && templateSid) {
      console.log('📋 Using WhatsApp Message Template:', templateSid);
      console.log('🔢 Template variables:', { "1": code });
      
      // Use approved message template - Correct Twilio format
      messageOptions = {
        to: `whatsapp:${phone}`,
        contentSid: templateSid,
        contentVariables: JSON.stringify({
          "1": code // The verification code variable
        })
      };
      
      // Add messaging service or from number
      if (messagingServiceSid) {
        console.log('📡 Using Messaging Service SID:', messagingServiceSid);
        messageOptions.messagingServiceSid = messagingServiceSid;
      } else {
        console.log('📱 Using direct WhatsApp number:', whatsappPhoneNumber);
        messageOptions.from = `whatsapp:${whatsappPhoneNumber}`;
      }
    } else {
      console.log('⚠️ WARNING: Using freeform message - will fail in production with Error 63016');
      console.log('📝 Set WHATSAPP_USE_MESSAGE_TEMPLATE=true and provide WHATSAPP_TEMPLATE_SID');
      
      // Fallback to freeform message (will fail in production with Error 63016)
      messageOptions = {
        body: message,
        to: `whatsapp:${phone}`,
      };

      if (messagingServiceSid) {
        console.log('📡 Using Messaging Service SID:', messagingServiceSid);
        messageOptions.messagingServiceSid = messagingServiceSid;
      } else {
        console.log('📱 Using direct WhatsApp number:', whatsappPhoneNumber);
        messageOptions.from = `whatsapp:${whatsappPhoneNumber}`;
      }
    }

    console.log('📄 Message options:', JSON.stringify(messageOptions, null, 2));

    const result = await client.messages.create(messageOptions);

    console.log('✅ WhatsApp message sent successfully!');
    console.log('   Twilio SID:', result.sid);
    console.log('   Status:', result.status);
    console.log('   Error Code:', result.errorCode);
    console.log('   Error Message:', result.errorMessage);

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
    console.error('❌ WhatsApp send error details:');
    console.error('   Error type:', typeof error);
    console.error('   Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('   Full error:', error);
    
    // Additional Twilio-specific error logging
    let isTemplateError = false;
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('   Twilio Error Code:', (error as any).code);
      console.error('   Twilio Error Details:', (error as any).details);
      console.error('   Twilio More Info:', (error as any).moreInfo);
      
      // Check if it's the template error (63016)
      isTemplateError = (error as any).code === 63016;
    }

    const errorMessage = error instanceof Error ? error.message : 'Gabim në dërgimin e mesazhit në WhatsApp';
    
    // Log specific template error for debugging
    if (isTemplateError) {
      console.error('🚨 WhatsApp Template Error 63016 detected');
      console.error('   SOLUTION: Create approved WhatsApp message template');
      console.error('   1. Go to Twilio Console → Messaging → Content Template Builder');
      console.error('   2. Create template: "Your verification code is {{1}}. Valid for 5 minutes."');
      console.error('   3. Category: AUTHENTICATION');
      console.error('   4. Submit for approval (5min-24hrs)');
      console.error('   5. Add ContentSid to WHATSAPP_TEMPLATE_SID environment variable');
      console.error('   6. Set WHATSAPP_USE_MESSAGE_TEMPLATE=true');
    }
    
    // Log failed WhatsApp message
    await logWhatsAppNotification({
      phone,
      status: 'failed',
      error: errorMessage,
    });

    return {
      success: false,
      error: isTemplateError 
        ? 'WhatsApp kërkon template të miratuar. Krijoni template në Twilio Console → Content Template Builder.'
        : 'Gabim në dërgimin e mesazhit në WhatsApp. Provoni përsëri.',
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