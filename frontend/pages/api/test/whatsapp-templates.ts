// frontend/pages/api/test/whatsapp-templates.ts
// Test endpoint for validating WhatsApp templates
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppTemplate } from '../../../lib/whatsapp-templates';
import { sendWhatsAppTemplate } from '../../../lib/whatsapp';

interface TemplateTestResponse {
  success: boolean;
  templateValidation: {
    allValid: boolean;
    approvalTemplateValid: boolean;
    declineTemplateValid: boolean;
    errors: string[];
  };
  testResults?: {
    approvalTest?: any;
    declineTest?: any;
  };
  error?: string;
}

/**
 * Validate template configuration
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
    console.log('Approval template:', approvalTemplate);
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
    console.log('Decline template:', declineTemplate);
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TemplateTestResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      templateValidation: {
        allValid: false,
        approvalTemplateValid: false,
        declineTemplateValid: false,
        errors: ['Method not allowed']
      },
      error: 'Method not allowed'
    });
  }

  try {
    console.log('🧪 Testing WhatsApp templates...');
    
    // Validate templates
    const templateValidation = await validateWhatsAppTemplates();
    
    const response: TemplateTestResponse = {
      success: templateValidation.allValid,
      templateValidation
    };

    // If there's a test phone number in query params, send test messages
    const testPhone = req.query.phone as string;
    if (testPhone && templateValidation.allValid) {
      console.log(`📱 Sending test messages to: ${testPhone}`);
      
      const testResults: any = {};
      
      // Test approval notification
      try {
        testResults.approvalTest = await sendWhatsAppTemplate(testPhone, 'BOOKING_APPROVED', {
          salonName: 'Test Salon',
          date: '23 Gusht 2025',
          time: '14:00'
        });
      } catch (error) {
        testResults.approvalTest = { success: false, error: (error as Error).message };
      }
      
      // Test decline notification
      try {
        testResults.declineTest = await sendWhatsAppTemplate(testPhone, 'BOOKING_DECLINED', {
          salonName: 'Test Salon',
          reason: 'Test reason'
        });
      } catch (error) {
        testResults.declineTest = { success: false, error: (error as Error).message };
      }
      
      response.testResults = testResults;
    }

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Template test error:', error);
    return res.status(500).json({
      success: false,
      templateValidation: {
        allValid: false,
        approvalTemplateValid: false,
        declineTemplateValid: false,
        errors: [(error as Error).message]
      },
      error: (error as Error).message
    });
  }
}