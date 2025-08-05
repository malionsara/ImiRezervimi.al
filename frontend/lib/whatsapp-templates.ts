// frontend/lib/whatsapp-templates.ts
// WhatsApp Template Management System for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

// ==============================================
// TYPES AND INTERFACES
// ==============================================
export interface WhatsAppTemplate {
  id: string;
  name: string;
  contentSid: string;
  category: 'AUTHENTICATION' | 'UTILITY' | 'MARKETING';
  variables: string[];
  description: string;
  albanianName: string;
}

export type TemplateKey = 
  | 'VERIFICATION_CODE'
  | 'APPOINTMENT_CONFIRMATION'
  | 'APPOINTMENT_DECLINED'
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CANCELLED'
  | 'SALON_NEW_BOOKING_REQUEST'
  | 'WELCOME_NEW_CUSTOMER'
  | 'SPECIAL_OFFERS'
  | 'PAYMENT_CONFIRMATION';

// ==============================================
// WHATSAPP TEMPLATES CONFIGURATION
// ==============================================
export const WHATSAPP_TEMPLATES: Record<TemplateKey, WhatsAppTemplate> = {
  VERIFICATION_CODE: {
    id: 'verification_code',
    name: 'Verification Code',
    albanianName: 'Kodi i Verifikimit',
    contentSid: 'HX8a5c6361c10e7378b58f0d8e40e92b46', // Your approved template
    category: 'AUTHENTICATION',
    variables: ['code'],
    description: 'Phone number verification code for registration'
  },

  APPOINTMENT_CONFIRMATION: {
    id: 'appointment_confirmation',
    name: 'Appointment Confirmation',
    albanianName: 'Konfirmimi i Rezervimit',
    contentSid: process.env.TEMPLATE_APPOINTMENT_CONFIRMATION || '', // To be set after creation
    category: 'UTILITY',
    variables: ['salonName', 'date', 'time'],
    description: 'Confirm appointment booking to customer'
  },

  APPOINTMENT_DECLINED: {
    id: 'appointment_declined',
    name: 'Appointment Declined',
    albanianName: 'Rezervimi i Refuzuar',
    contentSid: process.env.TEMPLATE_APPOINTMENT_DECLINED || '',
    category: 'UTILITY',
    variables: ['salonName', 'dateTime', 'reason'],
    description: 'Notify customer of declined appointment'
  },

  APPOINTMENT_REMINDER: {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    albanianName: 'Kujtesë Rezervimi',
    contentSid: process.env.TEMPLATE_APPOINTMENT_REMINDER || '',
    category: 'UTILITY',
    variables: ['salonName', 'time'],
    description: '24-hour appointment reminder'
  },

  APPOINTMENT_CANCELLED: {
    id: 'appointment_cancelled',
    name: 'Appointment Cancelled',
    albanianName: 'Rezervimi i Anuluar',
    contentSid: process.env.TEMPLATE_APPOINTMENT_CANCELLED || '',
    category: 'UTILITY',
    variables: ['salonName', 'dateTime', 'reason'],
    description: 'Notify customer of cancelled appointment'
  },

  SALON_NEW_BOOKING_REQUEST: {
    id: 'salon_new_booking_request',
    name: 'New Booking Request (Salon)',
    albanianName: 'Kërkesë e Re (Salon)',
    contentSid: process.env.TEMPLATE_SALON_NEW_BOOKING || '',
    category: 'UTILITY',
    variables: ['firstName', 'lastName', 'service', 'date', 'time'],
    description: 'Notify salon of new booking request'
  },

  WELCOME_NEW_CUSTOMER: {
    id: 'welcome_new_customer',
    name: 'Welcome New Customer',
    albanianName: 'Mirë se vini',
    contentSid: process.env.TEMPLATE_WELCOME_CUSTOMER || '',
    category: 'MARKETING',
    variables: ['customerName'],
    description: 'Welcome message for new customers'
  },

  SPECIAL_OFFERS: {
    id: 'special_offers',
    name: 'Special Offers',
    albanianName: 'Oferta Speciale',
    contentSid: process.env.TEMPLATE_SPECIAL_OFFERS || '',
    category: 'MARKETING',
    variables: ['offerDescription', 'discountPercentage', 'expiryDate'],
    description: 'Send special offers and promotions'
  },

  PAYMENT_CONFIRMATION: {
    id: 'payment_confirmation',
    name: 'Payment Confirmation',
    albanianName: 'Konfirmimi i Pagesës',
    contentSid: process.env.TEMPLATE_PAYMENT_CONFIRMATION || '',
    category: 'UTILITY',
    variables: ['amount', 'service', 'salonName', 'invoiceNumber'],
    description: 'Confirm payment for appointments'
  }
};

// ==============================================
// TEMPLATE HELPER FUNCTIONS
// ==============================================

/**
 * Get WhatsApp template by key
 */
export function getWhatsAppTemplate(templateKey: TemplateKey): WhatsAppTemplate {
  const template = WHATSAPP_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`WhatsApp template not found: ${templateKey}`);
  }
  if (!template.contentSid) {
    throw new Error(`WhatsApp template SID not configured: ${templateKey}`);
  }
  return template;
}

/**
 * Build content variables for template
 */
export function buildTemplateVariables(
  templateKey: TemplateKey, 
  variables: Record<string, string>
): string {
  const template = getWhatsAppTemplate(templateKey);
  
  // Build variables object in the format {"1": "value", "2": "value", ...}
  const contentVariables: Record<string, string> = {};
  
  template.variables.forEach((variableName, index) => {
    const variableValue = variables[variableName];
    if (variableValue === undefined) {
      throw new Error(`Missing variable '${variableName}' for template ${templateKey}`);
    }
    contentVariables[(index + 1).toString()] = variableValue;
  });
  
  return JSON.stringify(contentVariables);
}

/**
 * Validate template configuration
 */
export function validateTemplateConfig(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  Object.entries(WHATSAPP_TEMPLATES).forEach(([key, template]) => {
    if (!template.contentSid) {
      warnings.push(`Template ${key} has no ContentSID configured`);
    }
    
    if (template.variables.length === 0) {
      warnings.push(`Template ${key} has no variables defined`);
    }
    
    if (!template.description) {
      errors.push(`Template ${key} missing description`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get all available templates
 */
export function getAllTemplates(): WhatsAppTemplate[] {
  return Object.values(WHATSAPP_TEMPLATES);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: WhatsAppTemplate['category']): WhatsAppTemplate[] {
  return Object.values(WHATSAPP_TEMPLATES).filter(template => template.category === category);
}

/**
 * Check if template is configured and ready to use
 */
export function isTemplateReady(templateKey: TemplateKey): boolean {
  try {
    const template = getWhatsAppTemplate(templateKey);
    return !!template.contentSid;
  } catch {
    return false;
  }
}

// ==============================================
// TEMPLATE USAGE EXAMPLES
// ==============================================

/**
 * Example usage for verification code
 */
export function getVerificationCodeTemplate(code: string) {
  return {
    templateKey: 'VERIFICATION_CODE' as TemplateKey,
    variables: { code }
  };
}

/**
 * Example usage for appointment confirmation
 */
export function getAppointmentConfirmationTemplate(
  salonName: string, 
  date: string, 
  time: string
) {
  return {
    templateKey: 'APPOINTMENT_CONFIRMATION' as TemplateKey,
    variables: { salonName, date, time }
  };
}

/**
 * Example usage for appointment declined
 */
export function getAppointmentDeclinedTemplate(
  salonName: string, 
  dateTime: string, 
  reason: string
) {
  return {
    templateKey: 'APPOINTMENT_DECLINED' as TemplateKey,
    variables: { salonName, dateTime, reason }
  };
}