// frontend/lib/sms.ts
// SMS verification system for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { Twilio } from 'twilio';
import { getTwilioConfig } from './twilio-validation';
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
      const config = getTwilioConfig();
      twilioClient = new Twilio(config.accountSid, config.authToken);
    } catch (error) {
      throw new Error(`Failed to initialize Twilio: ${(error as Error).message}`);
    }
  }
  return twilioClient;
}

export interface VerificationCode {
  id: string;
  phone_number: string;
  code: string;
  attempts: number;
  created_at: string;
  expires_at: string;
  verified: boolean;
}

export interface SendVerificationResult {
  success: boolean;
  messageSid?: string;
  error?: string;
}

export interface VerifyPhoneResult {
  success: boolean;
  verified: boolean;
  error?: string;
  attemptsRemaining?: number;
}

// Albanian SMS templates
const ALBANIAN_SMS_TEMPLATES = {
  verification: (code: string) => 
    `Kodi juaj i verifikimit për ImiRezervimi.al është: ${code}\n\nKy kod skadon brenda 5 minutave.\n\nMos e ndani me askënd! 🔒`,
  
  welcome: () =>
    `Mirë se vini në ImiRezervimi.al! 💅\n\nTani mund të rezervoni në salonet më të mira në Shqipëri!\n\n📱 ImiRezervimi.al`,
};

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if phone number is rate limited
 */
export async function checkRateLimit(phone: string): Promise<boolean> {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    
    const { data, error } = await supabase
      .from('verification_codes')
      .select('id')
      .eq('phone_number', phone)
      .gte('created_at', oneMinuteAgo)
      .limit(1);

    if (error) {
      console.error('Rate limit check error:', error);
      return true; // Fail safe - assume rate limited
    }

    return (data && data.length > 0); // Rate limited if recent code exists
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Fail safe
  }
}

/**
 * Store verification code in database
 */
export async function storeVerificationCode(
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
      console.error('Database error storing verification code:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error storing verification code:', error);
    return null;
  }
}

/**
 * Send SMS verification code
 */
export async function sendVerificationSMS(phone: string): Promise<SendVerificationResult> {
  try {
    // Validate Albanian phone number
    if (!isValidAlbanianPhone(phone)) {
      return {
        success: false,
        error: 'Numri i telefonit duhet të jetë në formatin +355XXXXXXXX',
      };
    }

    // Check rate limiting (1 SMS per minute)
    const isRateLimited = await checkRateLimit(phone);
    if (isRateLimited) {
      return {
        success: false,
        error: 'Duhet të prisni 1 minutë para se të kërkoni një kod tjetër',
      };
    }

    // Generate verification code
    const code = generateVerificationCode();

    // Store in database
    const recordId = await storeVerificationCode(phone, code);
    if (!recordId) {
      return {
        success: false,
        error: 'Gabim në ruajtjen e kodit të verifikimit',
      };
    }

    // Initialize Twilio and send SMS
    const client = initializeTwilio();
    
    // Get the SMS phone number from environment
    const smsPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!smsPhoneNumber) {
      throw new Error('TWILIO_PHONE_NUMBER not configured for SMS');
    }

    const message = ALBANIAN_SMS_TEMPLATES.verification(code);
    
    console.log(`Sending SMS verification to ${phone}: ${code}`);

    const result = await client.messages.create({
      body: message,
      from: smsPhoneNumber,
      to: phone,
    });

    // Log successful SMS
    await logSMSNotification({
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
    console.error('SMS send error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Gabim në dërgimin e SMS-it';
    
    // Log failed SMS
    await logSMSNotification({
      phone,
      status: 'failed',
      error: errorMessage,
    });

    return {
      success: false,
      error: 'Gabim në dërgimin e SMS-it. Provoni përsëri.',
    };
  }
}

/**
 * Verify phone number with provided code
 */
export async function verifyPhoneCode(
  phone: string, 
  providedCode: string
): Promise<VerifyPhoneResult> {
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
    await logSMSNotification({
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
    console.error('Phone verification error:', error);
    return {
      success: false,
      verified: false,
      error: 'Gabim në verifikimin e kodit',
    };
  }
}

/**
 * Clean up expired verification codes
 */
export async function cleanupExpiredCodes(): Promise<number> {
  try {
    const { error, count } = await supabase
      .from('verification_codes')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Cleanup error:', error);
      return 0;
    }

    const deletedCount = count || 0;
    console.log(`Cleaned up ${deletedCount} expired verification codes`);
    return deletedCount;
  } catch (error) {
    console.error('Cleanup error:', error);
    return 0;
  }
}

/**
 * Check if a phone number is verified
 */
export async function isPhoneVerified(phone: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('verification_codes')
      .select('id')
      .eq('phone_number', phone)
      .eq('verified', true)
      .limit(1);

    if (error) {
      console.error('Phone verification check error:', error);
      return false;
    }

    return (data && data.length > 0);
  } catch (error) {
    console.error('Phone verification check error:', error);
    return false;
  }
}

/**
 * Log SMS notification (for tracking and debugging)
 */
async function logSMSNotification(data: {
  phone: string;
  code?: string;
  twilioSid?: string;
  status: 'sent' | 'failed' | 'verified';
  error?: string;
  recordId?: string;
}): Promise<void> {
  try {
    // TODO: Store in notifications table when implemented
    console.log('SMS Notification log:', {
      timestamp: new Date().toISOString(),
      type: 'sms_verification',
      ...data,
    });
  } catch (error) {
    console.error('Error logging SMS notification:', error);
  }
}

/**
 * Send welcome SMS after successful verification
 */
export async function sendWelcomeSMS(phone: string): Promise<void> {
  try {
    const client = initializeTwilio();
    const smsPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!smsPhoneNumber) {
      console.log('Welcome SMS skipped - no SMS phone number configured');
      return;
    }

    const message = ALBANIAN_SMS_TEMPLATES.welcome();
    
    await client.messages.create({
      body: message,
      from: smsPhoneNumber,
      to: phone,
    });

    console.log(`Welcome SMS sent to ${phone}`);
  } catch (error) {
    console.error('Welcome SMS error:', error);
    // Don't throw - welcome SMS failure shouldn't block the main flow
  }
}