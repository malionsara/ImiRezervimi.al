// frontend/pages/api/debug/env-check.ts
// Debug endpoint to check environment variables in production

import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development or with admin key
  const adminKey = process.env.ADMIN_SECRET_KEY
  const providedKey = req.query.admin_key || req.headers.authorization?.replace('Bearer ', '')
  
  if (process.env.NODE_ENV === 'production' && (!adminKey || providedKey !== adminKey)) {
    return res.status(403).json({
      error: 'Access denied'
    })
  }

  // Check which environment variables are defined
  const envStatus = {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Admin
    ADMIN_SECRET_KEY: !!process.env.ADMIN_SECRET_KEY,
    
    // Twilio
    TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_NUMBER: !!process.env.TWILIO_WHATSAPP_NUMBER,
    TWILIO_MESSAGING_SERVICE_SID: !!process.env.TWILIO_MESSAGING_SERVICE_SID,
    TWILIO_PHONE_NUMBER: !!process.env.TWILIO_PHONE_NUMBER,
    
    // Environment info
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV
  }

  // Get actual values (first 4 characters only for security)
  const envValues = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 4) + '...',
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY?.substring(0, 4) + '...',
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID?.substring(0, 4) + '...',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN?.substring(0, 4) + '...',
    TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER,
    TWILIO_MESSAGING_SERVICE_SID: process.env.TWILIO_MESSAGING_SERVICE_SID?.substring(0, 4) + '...',
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER
  }

  // WhatsApp-specific analysis
  const whatsappAnalysis = {
    isUsingSandbox: process.env.TWILIO_WHATSAPP_NUMBER?.includes('14155238886') || false,
    numberFormat: process.env.TWILIO_WHATSAPP_NUMBER ? 'valid' : 'missing',
    hasMessagingService: !!process.env.TWILIO_MESSAGING_SERVICE_SID,
    environment: process.env.NODE_ENV,
    isVercelProduction: process.env.VERCEL_ENV === 'production'
  }

  return res.status(200).json({
    message: 'Environment variable status',
    status: envStatus,
    values: envValues,
    whatsappAnalysis,
    timestamp: new Date().toISOString()
  })
}