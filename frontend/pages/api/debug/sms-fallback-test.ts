// frontend/pages/api/debug/sms-fallback-test.ts
// SMS fallback test for when WhatsApp templates are not approved yet

import { NextApiRequest, NextApiResponse } from 'next';
import { Twilio } from 'twilio';

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
    console.log('📱 SMS Fallback Test Starting...');
    console.log('Phone:', phone);
    
    // Initialize Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const smsNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken || !smsNumber) {
      throw new Error('Missing Twilio configuration for SMS');
    }
    
    const client = new Twilio(accountSid, authToken);
    
    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send SMS instead of WhatsApp
    const smsMessage = `Your ImiRezervimi.al verification code is: ${code}. Valid for 5 minutes. Do not share this code.`;
    
    console.log('📤 Sending SMS message...');
    console.log('   From:', smsNumber);
    console.log('   To:', phone);
    console.log('   Code:', code);
    
    const result = await client.messages.create({
      body: smsMessage,
      from: smsNumber,
      to: phone,
    });
    
    console.log('✅ SMS message sent successfully!');
    console.log('   Twilio SID:', result.sid);
    console.log('   Status:', result.status);
    
    return res.status(200).json({
      success: true,
      message: 'SMS verification sent successfully (WhatsApp fallback)',
      result: {
        sid: result.sid,
        status: result.status,
        to: result.to,
        from: result.from,
        verificationCode: code // Only for testing
      },
      debug: {
        method: 'SMS',
        environment: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        smsNumber: smsNumber,
        messageLength: smsMessage.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('🚨 SMS Fallback Test Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        method: 'SMS',
        environment: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        smsNumber: process.env.TWILIO_PHONE_NUMBER,
        timestamp: new Date().toISOString()
      }
    });
  }
}