// frontend/pages/api/admin/setup-status.ts
// Server-side admin setup validation

import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Only GET requests are allowed'
    })
  }

  try {
    const issues: string[] = []

    // Check Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      issues.push('NEXT_PUBLIC_SUPABASE_URL is not configured')
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      issues.push('SUPABASE_SERVICE_ROLE_KEY is not configured - admin operations will fail')
    }

    if (!process.env.ADMIN_SECRET_KEY) {
      issues.push('ADMIN_SECRET_KEY is not configured - admin panel is unsecured')
    }

    // Check Twilio configuration (optional but recommended)
    const twilioIssues: string[] = []
    if (!process.env.TWILIO_ACCOUNT_SID) {
      twilioIssues.push('TWILIO_ACCOUNT_SID is not configured')
    }
    if (!process.env.TWILIO_AUTH_TOKEN) {
      twilioIssues.push('TWILIO_AUTH_TOKEN is not configured')
    }
    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      twilioIssues.push('TWILIO_WHATSAPP_NUMBER is not configured')
    }

    return res.status(200).json({
      success: true,
      data: {
        valid: issues.length === 0,
        issues,
        twilioConfigured: twilioIssues.length === 0,
        twilioIssues,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error checking admin setup:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to check admin setup'
    })
  }
}