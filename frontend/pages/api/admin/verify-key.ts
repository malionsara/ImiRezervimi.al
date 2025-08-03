// frontend/pages/api/admin/verify-key.ts
// API endpoint to verify admin authentication key

import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Only POST requests are allowed'
    })
  }

  try {
    const { adminKey } = req.body

    if (!adminKey) {
      return res.status(400).json({
        success: false,
        error: 'Admin key is required'
      })
    }

    // Get the configured admin secret key
    const configuredAdminKey = process.env.ADMIN_SECRET_KEY

    // If no admin key is configured, deny access (security-first approach)
    if (!configuredAdminKey) {
      return res.status(500).json({
        success: false,
        error: 'Admin authentication not configured',
        valid: false
      })
    }

    // Verify the provided key matches the configured key
    const isValid = adminKey === configuredAdminKey

    // Log admin access attempts (for security monitoring)
    const timestamp = new Date().toISOString()
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
    
    if (isValid) {
      console.log(`✅ Admin access granted - IP: ${clientIP} - Time: ${timestamp}`)
    } else {
      console.log(`❌ Admin access denied - IP: ${clientIP} - Time: ${timestamp} - Invalid key attempt`)
    }

    return res.status(200).json({
      success: true,
      valid: isValid,
      timestamp
    })

  } catch (error) {
    console.error('Error verifying admin key:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error during key verification'
    })
  }
}