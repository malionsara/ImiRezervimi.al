// frontend/lib/salon-auth.ts
// Salon Authentication and Magic Link System
// Albanian Beauty Salon Booking Platform

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Types
export interface SalonAuthToken {
  id: string
  salon_id: string
  token: string
  email: string
  expires_at: string
  used_at?: string
  created_at: string
}

export interface SalonLoginResponse {
  success: boolean
  message: string
  error?: string
}

export interface SalonSession {
  salon: {
    id: string
    name: string
    email: string
    phone: string
    status: string
  }
  token: string
  expiresAt: string
}

// Generate secure random token
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Create magic link token for salon login
export async function createSalonLoginToken(phone: string): Promise<{ success: boolean; salonId?: string; salonName?: string; token?: string; error?: string }> {
  try {
    console.log('🔍 Creating login token for salon phone:', phone)
    
    // Normalize phone number
    const normalizedPhone = phone.replace(/\s+/g, '').replace(/^00/, '+')
    
    // Find salon by phone
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('id, name, phone, email, status')
      .eq('phone', normalizedPhone)
      .eq('status', 'active')
      .single()
    
    if (salonError || !salon) {
      console.log('❌ Salon not found or inactive:', phone)
      return {
        success: false,
        error: 'Saloni nuk u gjet ose nuk është aktiv. Kontrolloni numrin e telefonit ose regjistrohuni.'
      }
    }
    
    console.log('✅ Salon found:', salon.name)
    
    // Generate secure token
    const token = generateSecureToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry
    
    // Store token in database
    const { error: tokenError } = await supabaseAdmin
      .from('salon_auth_tokens')
      .insert({
        salon_id: salon.id,
        token: token,
        phone: normalizedPhone,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })
    
    if (tokenError) {
      console.error('❌ Error creating auth token:', tokenError)
      return {
        success: false,
        error: 'Gabim në krijimin e token-it të hyrjes'
      }
    }
    
    console.log('✅ Auth token created successfully for salon:', salon.id)
    
    return {
      success: true,
      salonId: salon.id,
      salonName: salon.name,
      token: token
    }
    
  } catch (error) {
    console.error('❌ Exception in createSalonLoginToken:', error)
    return {
      success: false,
      error: 'Gabim i brendshëm në server'
    }
  }
}

// Verify magic link token and create session
export async function verifySalonLoginToken(token: string): Promise<{ success: boolean; salon?: SalonSession; error?: string }> {
  try {
    console.log('🔍 Verifying salon login token')
    
    // Find valid token
    const { data: authToken, error: tokenError } = await supabaseAdmin
      .from('salon_auth_tokens')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (tokenError || !authToken) {
      console.log('❌ Invalid or expired token')
      return {
        success: false,
        error: 'Token-i i hyrjes është i pavlefshëm ose ka skaduar. Kërkoni një link të ri.'
      }
    }
    
    // Get salon details
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('id, name, email, phone, status')
      .eq('id', authToken.salon_id)
      .eq('status', 'active')
      .single()
    
    if (salonError || !salon) {
      console.log('❌ Salon not found or inactive')
      return {
        success: false,
        error: 'Saloni nuk u gjet ose nuk është aktiv'
      }
    }
    
    // Mark token as used
    await supabaseAdmin
      .from('salon_auth_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)
    
    // Create session token (valid for 7 days)
    const sessionToken = generateSecureToken()
    const sessionExpiresAt = new Date()
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7)
    
    console.log('✅ Token verified successfully for salon:', salon.name)
    
    return {
      success: true,
      salon: {
        salon: {
          id: salon.id,
          name: salon.name,
          email: salon.email,
          phone: salon.phone,
          status: salon.status
        },
        token: sessionToken,
        expiresAt: sessionExpiresAt.toISOString()
      }
    }
    
  } catch (error) {
    console.error('❌ Exception in verifySalonLoginToken:', error)
    return {
      success: false,
      error: 'Gabim i brendshëm në server'
    }
  }
}

// Validate salon session
export async function validateSalonSession(sessionToken: string): Promise<{ success: boolean; salon?: any; error?: string }> {
  try {
    // For now, we'll implement a simple validation
    // In production, you'd want to store session tokens in database with expiry
    if (!sessionToken || sessionToken.length < 10) {
      return {
        success: false,
        error: 'Sesioni i pavlefshëm'
      }
    }
    
    // This is a simplified implementation
    // In production, validate against stored session tokens
    return {
      success: true,
      salon: { sessionValid: true }
    }
    
  } catch (error) {
    console.error('❌ Exception in validateSalonSession:', error)
    return {
      success: false,
      error: 'Gabim në validimin e sesionit'
    }
  }
}

// Send magic link via WhatsApp
export async function sendSalonMagicLink(phone: string, token: string, salonName?: string): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.imirezervimi.al'
    const magicLink = `${baseUrl}/salon/auth/verify?token=${token}`
    
    console.log('📱 Sending magic link WhatsApp to:', phone)
    console.log('🔗 Magic link:', magicLink)
    
    // Format WhatsApp message for salon login
    const whatsappMessage = `🏪 *ImiRezervimi.al - Hyrje në Dashboard*

Përshëndetje${salonName ? ` nga ${salonName}` : ''}!

Keni kërkuar hyrje në dashboard-in e sallonit tuaj.

🔐 *Kliko linkun për të hyrë:*
${magicLink}

⚠️ *Siguria:*
• Linku skadon për 24 orë
• Mund të përdoret vetëm një herë
• Nëse nuk keni kërkuar hyrje, injoroni këtë mesazh

💼 ImiRezervimi.al`
    
    // Send via Twilio WhatsApp API
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      console.error('❌ Twilio credentials not configured')
      return false
    }
    
    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${twilioWhatsAppNumber}`,
          To: `whatsapp:${phone}`,
          Body: whatsappMessage
        }).toString()
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Magic link WhatsApp sent successfully:', result.sid)
        return true
      } else {
        const error = await response.text()
        console.error('❌ Failed to send WhatsApp:', error)
        return false
      }
      
    } catch (twilioError) {
      console.error('❌ Twilio API error:', twilioError)
      return false
    }
    
  } catch (error) {
    console.error('❌ Error sending magic link WhatsApp:', error)
    return false
  }
}

// Clean up expired tokens (call this periodically)
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('salon_auth_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString())
    
    if (error) {
      console.error('❌ Error cleaning up expired tokens:', error)
    } else {
      console.log('🧹 Expired tokens cleaned up successfully')
    }
  } catch (error) {
    console.error('❌ Exception in cleanupExpiredTokens:', error)
  }
}