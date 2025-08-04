// frontend/pages/api/debug/whatsapp-test.ts
// WhatsApp configuration test endpoint for production debugging

import { NextApiRequest, NextApiResponse } from 'next';
import { sendWhatsAppVerification } from '../../../lib/whatsapp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development or with admin key
  const adminKey = process.env.ADMIN_SECRET_KEY;
  const providedKey = req.query.admin_key || req.headers.authorization?.replace('Bearer ', '');
  
  if (process.env.NODE_ENV === 'production' && (!adminKey || providedKey !== adminKey)) {
    return res.status(403).json({
      error: 'Access denied'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST.'
    });
  }

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      error: 'Phone number is required. Use Albanian format: +355XXXXXXXX'
    });
  }

  try {
    console.log('🧪 WhatsApp Debug Test Starting...');
    console.log('Phone:', phone);
    
    // Test the WhatsApp sending function
    const result = await sendWhatsAppVerification(phone);
    
    // Return detailed debug information
    return res.status(200).json({
      success: true,
      message: 'WhatsApp test completed',
      result,
      debug: {
        environment: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...',
        whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID?.substring(0, 10) + '...',
        isUsingSandbox: process.env.TWILIO_WHATSAPP_NUMBER?.includes('14155238886') || false,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('🚨 WhatsApp Debug Test Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        environment: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...',
        whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID?.substring(0, 10) + '...',
        isUsingSandbox: process.env.TWILIO_WHATSAPP_NUMBER?.includes('14155238886') || false,
        timestamp: new Date().toISOString()
      }
    });
  }
}