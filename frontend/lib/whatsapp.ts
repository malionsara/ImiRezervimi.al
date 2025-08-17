// frontend/lib/whatsapp.ts
// WhatsApp verification system for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { Twilio } from 'twilio';
import { isValidAlbanianPhone } from './twilio';
import { createClient } from '@supabase/supabase-js';
import { 
  getWhatsAppTemplate, 
  buildTemplateVariables,
  type TemplateKey 
} from './whatsapp-templates';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
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

interface TwilioMessageOptions {
  to: string;
  contentSid: string;
  contentVariables: string;
  messagingServiceSid?: string;
  from?: string;
}

interface TwilioError {
  code: number;
  message: string;
}

// ==============================================
// TEMPLATE SYSTEM FUNCTIONS
// ==============================================

/**
 * Send WhatsApp message using template system
 */
export async function sendWhatsAppTemplate(
  phone: string,
  templateKey: TemplateKey,
  variables: Record<string, string>
): Promise<WhatsAppVerificationResult> {
  try {
    console.log(`🚀 Starting WhatsApp template message for: ${phone}`);
    console.log(`📋 Template: ${templateKey}`);
    console.log(`🔢 Variables:`, variables);
    
    // Get template configuration
    const template = getWhatsAppTemplate(templateKey);
    const contentVariables = buildTemplateVariables(templateKey, variables);
    
    console.log('📋 Using template:', template.name);
    console.log('🆔 Template SID:', template.contentSid);
    console.log('🔢 Content variables:', contentVariables);
    
    // Initialize Twilio client
    const client = initializeTwilio();
    
    // Get WhatsApp configuration
    const whatsappPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    
    if (!whatsappPhoneNumber) {
      throw new Error('TWILIO_WHATSAPP_NUMBER not configured for WhatsApp');
    }
    
    console.log('📱 Using WhatsApp number:', whatsappPhoneNumber);
    
    // Build message options
    const messageOptions: TwilioMessageOptions = {
      to: `whatsapp:${phone}`,
      contentSid: template.contentSid,
      contentVariables: contentVariables
    };
    
    // Add messaging service or direct number
    if (messagingServiceSid) {
      console.log('📡 Using Messaging Service SID:', messagingServiceSid);
      messageOptions.messagingServiceSid = messagingServiceSid;
    } else {
      console.log('📱 Using direct WhatsApp number');
      messageOptions.from = `whatsapp:${whatsappPhoneNumber}`;
    }
    
    console.log('📄 Final message options:', JSON.stringify(messageOptions, null, 2));
    
    // Send message
    const result = await client.messages.create(messageOptions);
    
    console.log('✅ WhatsApp template message sent successfully!');
    console.log('   Twilio SID:', result.sid);
    console.log('   Status:', result.status);
    
    return {
      success: true,
      messageSid: result.sid,
    };
    
  } catch (error: unknown) {
    console.error('❌ WhatsApp template send error:', error);
    
    // Check for specific template errors
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as TwilioError).code;
      if (errorCode === 63016) {
        console.error('🚨 Error 63016: Template not approved or SID incorrect');
        console.error('   Check template approval status in Twilio Console');
        console.error('   Verify TEMPLATE_* environment variables are set correctly');
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'WhatsApp template send failed';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ==============================================
// VERIFICATION FUNCTIONS
// ==============================================

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
 * Send WhatsApp verification code (main function)
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

    // Use new template system to send verification code
    const templateResult = await sendWhatsAppTemplate(
      phone, 
      'VERIFICATION_CODE', 
      { code }
    );
    
    if (templateResult.success) {
      // Log successful WhatsApp message
      await logWhatsAppNotification({
        phone,
        code,
        twilioSid: templateResult.messageSid!,
        status: 'sent',
        recordId,
      });
    } else {
      // Log failed WhatsApp message  
      await logWhatsAppNotification({
        phone,
        status: 'failed',
        error: templateResult.error,
      });
    }
    
    return templateResult;

  } catch (error: unknown) {
    console.error('❌ WhatsApp verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Gabim në dërgimin e mesazhit në WhatsApp';
    
    return {
      success: false,
      error: errorMessage,
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