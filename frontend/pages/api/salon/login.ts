// frontend/pages/api/salon/login.ts
// Salon login API - sends WhatsApp magic link for authentication

import { NextApiRequest, NextApiResponse } from 'next'
import { createSalonLoginToken, sendSalonMagicLink } from '../../../lib/salon-auth'

interface LoginRequest {
  phone: string
}

interface ApiResponse {
  success: boolean
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: { 
        code: 'METHOD_NOT_ALLOWED', 
        message: 'Lejohet vetëm POST kërkesa' 
      } 
    })
  }

  try {
    const { phone }: LoginRequest = req.body || {}
    
    // Validate phone number
    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'INVALID_PHONE', 
          message: 'Numri i telefonit është i detyrueshëm dhe duhet të jetë i vlefshëm' 
        } 
      })
    }

    const trimmedPhone = phone.trim()
    console.log('🔑 Salon login request for phone:', trimmedPhone)

    // Create login token
    const tokenResult = await createSalonLoginToken(trimmedPhone)
    
    if (!tokenResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: tokenResult.error || 'Gabim në krijimin e token-it të hyrjes'
        }
      })
    }

    // Send magic link via WhatsApp
    const messageSent = await sendSalonMagicLink(
      trimmedPhone, 
      tokenResult.token!, 
      tokenResult.salonName
    )

    if (!messageSent) {
      console.error('❌ Failed to send magic link WhatsApp')
      return res.status(500).json({
        success: false,
        error: {
          code: 'MESSAGE_SEND_FAILED',
          message: 'Nuk u dërgua mesazhi në WhatsApp. Provoni përsëri.'
        }
      })
    }

    console.log('✅ Salon login magic link sent successfully')
    
    return res.status(200).json({ 
      success: true,
      message: 'Linku i hyrjes u dërgua në WhatsApp. Kontrolloni mesazhet tuaja.'
    })

  } catch (error) {
    console.error('❌ Salon login API error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Gabim i brendshëm në server. Provoni përsëri.'
      }
    })
  }
}


