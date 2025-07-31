// frontend/pages/api/auth/complete-registration.js
// API endpoint to complete user registration after phone verification

import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from './[...nextauth]'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' }
    })
  }

  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(req, res, authOptions)
    
    if (!session || !session.user.tempData) {
      return res.status(401).json({ 
        success: false, 
        error: { code: 'UNAUTHORIZED', message: 'Session e pavlefshme' }
      })
    }

    const { phoneNumber, userData } = req.body

    if (!phoneNumber || !userData) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'MISSING_DATA', message: 'Të dhënat e regjistrimit mungojnë' }
      })
    }

    // Validate phone number format (Albanian)
    const phoneRegex = /^\+355[0-9]{8,9}$/
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'INVALID_PHONE', message: 'Numri i telefonit është i pavlefshëm' }
      })
    }

    // Check if phone number is already in use
    const { data: existingPhone } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phoneNumber)
      .single()

    if (existingPhone) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'PHONE_EXISTS', message: 'Ky numër telefoni është në përdorim nga një llogari tjetër' }
      })
    }

    // Check if email is already registered
    const { data: existingUser } = await supabase
      .from('customers')
      .select('id, phone_verified')
      .eq('email', userData.email)
      .single()

    let customerId

    if (existingUser) {
      // User exists but phone not verified - update with phone verification
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          first_name: userData.name?.split(' ')[0] || '',
          last_name: userData.name?.split(' ').slice(1).join(' ') || '',
          phone: phoneNumber,
          phone_verified: true,
          whatsapp_confirmed: true,
          profile_photo_url: userData.image,
          account_type: 'verified',
          facebook_id: userData.provider === 'facebook' ? userData.providerId : null,
          google_id: userData.provider === 'google' ? userData.providerId : null,
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('❌ User update error:', updateError)
        return res.status(500).json({ 
          success: false, 
          error: { code: 'DATABASE_ERROR', message: 'Gabim në përditësimin e llogarisë' }
        })
      }

      customerId = existingUser.id
      console.log('✅ User registration completed via update:', customerId)

    } else {
      // Create new user with verified phone
      const newUserData = {
        email: userData.email,
        first_name: userData.name?.split(' ')[0] || '',
        last_name: userData.name?.split(' ').slice(1).join(' ') || '',
        phone: phoneNumber,
        phone_verified: true,
        whatsapp_confirmed: true,
        profile_photo_url: userData.image,
        account_type: 'verified',
        facebook_id: userData.provider === 'facebook' ? userData.providerId : null,
        google_id: userData.provider === 'google' ? userData.providerId : null,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newUser, error: insertError } = await supabase
        .from('customers')
        .insert([newUserData])
        .select()
        .single()
      
      if (insertError) {
        console.error('❌ User creation error:', insertError)
        return res.status(500).json({ 
          success: false, 
          error: { code: 'DATABASE_ERROR', message: 'Gabim në krijimin e llogarisë' }
        })
      }

      customerId = newUser.id
      console.log('✅ New user registration completed:', customerId)
    }

    // Send welcome WhatsApp message
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/twilio/send-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber,
          message: `Mirë se erdhe në ImiRezervimi.al! 🎉\n\nLlogaria jote është krijuar me sukses. Tani mund të rezervosh shërbime bukurie me vetëm disa klikime.\n\nFillo duke eksploruar sallone të reja: https://www.imirezervimi.al/dashboard`
        })
      })
    } catch (error) {
      console.error('⚠️ Welcome message failed:', error)
      // Don't fail registration if welcome message fails
    }

    return res.status(200).json({ 
      success: true, 
      data: { 
        customerId,
        message: 'Regjistrimi u plotësua me sukses!' 
      }
    })

  } catch (error) {
    console.error('❌ Complete registration error:', error)
    return res.status(500).json({ 
      success: false, 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Ka ndodhur një gabim i brendshëm' 
      }
    })
  }
}