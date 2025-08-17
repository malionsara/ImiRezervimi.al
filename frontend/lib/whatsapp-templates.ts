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
  | 'BOOKING_CONFIRMATION'
  | 'BOOKING_APPROVED'
  | 'BOOKING_DECLINED'
  | 'APPOINTMENT_REMINDER'
  | 'SALON_NEW_REQUEST'
  | 'SALON_MENU'
  | 'WELCOME_MESSAGE';

// ==============================================
// WHATSAPP TEMPLATES CONFIGURATION
// ==============================================
export const WHATSAPP_TEMPLATES: Record<TemplateKey, WhatsAppTemplate> = {
  VERIFICATION_CODE: {
    id: 'verification_code',
    name: 'Verification Code',
    albanianName: 'Kodi i Verifikimit',
    contentSid: 'HX8a5c6361c10e7378b38f0d8e40e92b46',
    category: 'AUTHENTICATION',
    variables: ['code'],
    description: 'Phone number verification code for registration'
  },

  BOOKING_CONFIRMATION: {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    albanianName: 'Konfirmimi i Rezervimit',
    contentSid: 'HX068fc2360d9ac6fb1306c00caac87571',
    category: 'UTILITY',
    variables: ['salonName', 'date', 'time', 'service'],
    description: 'Customer booking request confirmation'
  },

  BOOKING_APPROVED: {
    id: 'booking_approved',
    name: 'Booking Approved',
    albanianName: 'Rezervimi u Konfirmua',
    contentSid: 'HXdc5b2a3f9b49618d0add658806b61e54',
    category: 'UTILITY',
    variables: ['salonName', 'date', 'time'],
    description: 'Appointment approved notification'
  },

  BOOKING_DECLINED: {
    id: 'booking_declined',
    name: 'Booking Declined',
    albanianName: 'Rezervimi i Refuzuar',
    contentSid: 'HX12dd964632817b691984678661f2b8e',
    category: 'UTILITY',
    variables: ['salonName', 'reason'],
    description: 'Appointment declined notification'
  },

  APPOINTMENT_REMINDER: {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    albanianName: 'Kujtesë Rezervimi',
    contentSid: 'HXdc77b8445736ab802da7ee23c9c86f9a',
    category: 'UTILITY',
    variables: ['time', 'salonName', 'date'],
    description: '24-hour appointment reminder'
  },

  SALON_NEW_REQUEST: {
    id: 'salon_new_request',
    name: 'New Request (Salon)',
    albanianName: 'Kërkesë e Re (Salon)',
    contentSid: 'HXee0d98d3a4fca2f9ab931edc6039572b',
    category: 'UTILITY',
    variables: ['customerName', 'service', 'date', 'time', 'phone', 'appointmentId'],
    description: 'Notify salon of new booking request'
  },

  SALON_MENU: {
    id: 'salon_menu',
    name: 'Salon Menu (Interactive)',
    albanianName: 'Menu Saloni (Interaktiv)',
    contentSid: 'HXb5f22c7c738ae8cca32413aa515b9101',
    category: 'UTILITY',
    variables: [],
    description: 'Interactive menu with buttons for salon commands'
  },

  WELCOME_MESSAGE: {
    id: 'welcome_message',
    name: 'Welcome Message',
    albanianName: 'Mirë se vini',
    contentSid: 'HX47e57b1104c259ba744777af81d56c5a',
    category: 'UTILITY',
    variables: ['firstName'],
    description: 'Welcome message for new customers'
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
 * Example usage for booking confirmation
 */
export function getBookingConfirmationTemplate(
  salonName: string, 
  date: string, 
  time: string,
  service: string
) {
  return {
    templateKey: 'BOOKING_CONFIRMATION' as TemplateKey,
    variables: { salonName, date, time, service }
  };
}

/**
 * Example usage for booking approved
 */
export function getBookingApprovedTemplate(
  salonName: string, 
  date: string, 
  time: string
) {
  return {
    templateKey: 'BOOKING_APPROVED' as TemplateKey,
    variables: { salonName, date, time }
  };
}

/**
 * Example usage for booking declined
 */
export function getBookingDeclinedTemplate(
  salonName: string, 
  reason: string
) {
  return {
    templateKey: 'BOOKING_DECLINED' as TemplateKey,
    variables: { salonName, reason }
  };
}

/**
 * Example usage for appointment reminder
 */
export function getAppointmentReminderTemplate(
  time: string,
  salonName: string, 
  date: string
) {
  return {
    templateKey: 'APPOINTMENT_REMINDER' as TemplateKey,
    variables: { time, salonName, date }
  };
}

/**
 * Example usage for salon new request
 */
export function getSalonNewRequestTemplate(
  customerName: string,
  service: string,
  date: string,
  time: string,
  phone: string,
  appointmentId: string
) {
  return {
    templateKey: 'SALON_NEW_REQUEST' as TemplateKey,
    variables: { customerName, service, date, time, phone, appointmentId }
  };
}

/**
 * Example usage for salon menu
 */
export function getSalonMenuTemplate() {
  return {
    templateKey: 'SALON_MENU' as TemplateKey,
    variables: {}
  };
}

/**
 * Example usage for welcome message
 */
export function getWelcomeMessageTemplate(firstName: string) {
  return {
    templateKey: 'WELCOME_MESSAGE' as TemplateKey,
    variables: { firstName }
  };
}