// frontend/pages/api/salon/auth/verify.ts
// Magic link token verification endpoint for salon authentication

import { NextApiRequest, NextApiResponse } from 'next'
import { verifySalonLoginToken } from '../../../../lib/salon-auth'

interface VerifyRequest {
  token: string
}

interface ApiResponse {
  success: boolean
  message?: string
  data?: {
    salon: any
    sessionToken: string
    redirectUrl: string
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: { 
        code: 'METHOD_NOT_ALLOWED', 
        message: 'Lejohen vetëm GET dhe POST kërkesat' 
      } 
    })
  }

  try {
    // Get token from query params (GET) or body (POST)
    let token: string
    
    if (req.method === 'GET') {
      token = req.query.token as string
    } else {
      const { token: bodyToken }: VerifyRequest = req.body || {}
      token = bodyToken
    }
    
    // Validate token
    if (!token || typeof token !== 'string' || token.length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'INVALID_TOKEN', 
          message: 'Token-i i hyrjes është i pavlefshëm ose mungon' 
        } 
      })
    }

    console.log('🔍 Verifying salon magic link token')

    // Verify token and get salon session
    const verificationResult = await verifySalonLoginToken(token)
    
    if (!verificationResult.success || !verificationResult.salon) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VERIFICATION_FAILED',
          message: verificationResult.error || 'Token-i i hyrjes është i pavlefshëm ose ka skaduar'
        }
      })
    }

    const { salon } = verificationResult
    console.log('✅ Salon authenticated successfully:', salon.salon.name)

    // For GET requests (magic link clicks), redirect to dashboard with session
    if (req.method === 'GET') {
      // Set session cookie
      const cookieOptions = [
        `salon_session=${salon.token}`,
        'HttpOnly',
        'Secure',
        'SameSite=Lax',
        `Max-Age=${7 * 24 * 60 * 60}`, // 7 days
        'Path=/'
      ].join('; ')
      
      res.setHeader('Set-Cookie', cookieOptions)
      
      // Redirect to salon dashboard
      const dashboardUrl = `/salon/dashboard?salonId=${salon.salon.id}&verified=true`
      res.writeHead(302, { Location: dashboardUrl })
      res.end()
      return
    }

    // For POST requests, return JSON response
    return res.status(200).json({ 
      success: true,
      message: 'Hyrja u krye me sukses',
      data: {
        salon: salon.salon,
        sessionToken: salon.token,
        redirectUrl: `/salon/dashboard?salonId=${salon.salon.id}`
      }
    })

  } catch (error) {
    console.error('❌ Salon verification API error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Gabim i brendshëm në server. Provoni përsëri.'
      }
    })
  }
}