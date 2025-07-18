// frontend/lib/twilio-validation.ts
// Twilio environment validation utility
// Albanian Beauty Salon Booking Platform

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
  testPhoneNumber?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config?: TwilioConfig;
}

/**
 * Validate Twilio environment configuration
 */
export function validateTwilioConfig(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  const testPhoneNumber = process.env.TWILIO_TEST_PHONE_NUMBER;

  // Check required variables
  if (!accountSid) {
    errors.push('TWILIO_ACCOUNT_SID is required');
  } else if (!accountSid.startsWith('AC')) {
    errors.push('TWILIO_ACCOUNT_SID should start with "AC"');
  }

  if (!authToken) {
    errors.push('TWILIO_AUTH_TOKEN is required');
  } else if (authToken.length < 32) {
    errors.push('TWILIO_AUTH_TOKEN appears to be invalid (too short)');
  }

  if (!whatsappNumber) {
    errors.push('TWILIO_WHATSAPP_NUMBER is required');
  } else if (!whatsappNumber.startsWith('+')) {
    errors.push('TWILIO_WHATSAPP_NUMBER should start with "+"');
  }

  // Check optional test phone number
  if (testPhoneNumber && !testPhoneNumber.match(/^\+355[0-9]{8,9}$/)) {
    warnings.push('TWILIO_TEST_PHONE_NUMBER should be in Albanian format (+355XXXXXXXX)');
  }

  // Environment-specific checks
  if (process.env.NODE_ENV === 'development') {
    if (!testPhoneNumber) {
      warnings.push('TWILIO_TEST_PHONE_NUMBER recommended for development testing');
    }
    
    if (whatsappNumber !== '+14155238886') {
      warnings.push('Consider using Twilio sandbox number (+14155238886) for development');
    }
  }

  if (process.env.NODE_ENV === 'production') {
    if (whatsappNumber === '+14155238886') {
      errors.push('Cannot use Twilio sandbox number in production');
    }
  }

  const isValid = errors.length === 0;
  const config = isValid ? {
    accountSid: accountSid!,
    authToken: authToken!,
    whatsappNumber: whatsappNumber!,
    testPhoneNumber,
  } : undefined;

  return {
    isValid,
    errors,
    warnings,
    config,
  };
}

/**
 * Log validation results
 */
export function logTwilioValidation(): void {
  const result = validateTwilioConfig();
  
  console.log('🔧 Twilio Configuration Validation');
  console.log('================================');
  
  if (result.isValid) {
    console.log('✅ Twilio configuration is valid');
    
    if (result.config) {
      console.log(`📱 WhatsApp Number: ${result.config.whatsappNumber}`);
      console.log(`🧪 Test Number: ${result.config.testPhoneNumber || 'Not set'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    }
  } else {
    console.log('❌ Twilio configuration has errors:');
    result.errors.forEach(error => console.log(`   • ${error}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`   • ${warning}`));
  }
  
  console.log('================================');
}

/**
 * Get Twilio configuration or throw error
 */
export function getTwilioConfig(): TwilioConfig {
  const result = validateTwilioConfig();
  
  if (!result.isValid) {
    throw new Error(`Twilio configuration invalid: ${result.errors.join(', ')}`);
  }
  
  return result.config!;
}