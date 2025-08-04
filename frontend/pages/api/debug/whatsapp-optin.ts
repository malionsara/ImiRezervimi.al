// frontend/pages/api/debug/whatsapp-optin.ts
// WhatsApp opt-in message sender for production debugging

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
    console.log('🧪 WhatsApp Opt-in Test Starting...');
    console.log('Phone:', phone);
    
    // Initialize Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    
    if (!accountSid || !authToken || !whatsappNumber) {
      throw new Error('Missing Twilio configuration');
    }
    
    const client = new Twilio(accountSid, authToken);
    
    // Send opt-in message (simple, likely to be approved)
    const optinMessage = `Hi! This is a test message from ImiRezervimi.al WhatsApp Business API. Please reply "YES" to confirm you can receive messages. Thank you!`;
    
    console.log('📤 Sending opt-in message...');
    console.log('   From:', `whatsapp:${whatsappNumber}`);
    console.log('   To:', `whatsapp:${phone}`);
    console.log('   Message:', optinMessage);
    
    const result = await client.messages.create({
      body: optinMessage,
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${phone}`,
    });
    
    console.log('✅ WhatsApp opt-in message sent!');
    console.log('   Twilio SID:', result.sid);
    console.log('   Status:', result.status);
    
    return res.status(200).json({
      success: true,
      message: 'WhatsApp opt-in message sent successfully',
      result: {
        sid: result.sid,
        status: result.status,
        to: result.to,
        from: result.from
      },
      debug: {
        environment: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        whatsappNumber: whatsappNumber,
        messageLength: optinMessage.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('🚨 WhatsApp Opt-in Test Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        environment: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
        timestamp: new Date().toISOString()
      }
    });
  }
}