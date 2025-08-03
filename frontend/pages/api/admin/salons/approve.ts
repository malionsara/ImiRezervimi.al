// frontend/pages/api/admin/salons/approve.ts
// API endpoint for approving salon registrations

import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!

// Use service role to bypass RLS for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Vetëm POST request-et janë të lejuara'
    })
  }

  // TODO: Add proper admin authentication here
  // For now, this endpoint is open - you should add admin auth
  
  const { salonId } = req.body

  if (!salonId) {
    return res.status(400).json({
      success: false,
      error: 'ID e sallonit mungon'
    })
  }

  try {
    // Get salon details first
    const { data: salon, error: fetchError } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('id', salonId)
      .single()

    if (fetchError || !salon) {
      return res.status(404).json({
        success: false,
        error: 'Salloni nuk u gjet'
      })
    }

    if (salon.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Salloni nuk është në pritje për miratim'
      })
    }

    // Update salon status to active
    const { error: updateError } = await supabaseAdmin
      .from('salons')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', salonId)

    if (updateError) {
      console.error('Error updating salon status:', updateError)
      return res.status(500).json({
        success: false,
        error: 'Gabim në miratimin e sallonit'
      })
    }

    // Send approval notification to salon owner
    try {
      await sendApprovalNotification(salon)
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError)
      // Don't fail the approval if notification fails
    }

    console.log(`✅ Salon approved: ${salon.name} (${salon.slug})`)

    return res.status(200).json({
      success: true,
      message: 'Salloni u miratua me sukses!'
    })

  } catch (error) {
    console.error('Error approving salon:', error)
    return res.status(500).json({
      success: false,
      error: 'Ka ndodhur një gabim i brendshëm'
    })
  }
}

async function sendApprovalNotification(salon: { name: string; phone: string; slug: string; email?: string }) {
  try {
    // Try WhatsApp notification first
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
      const approvalMessage = `🎉 Përgëzime! Salloni juaj "${salon.name}" u miratua në ImiRezervimi.al! 

Tani mund të merrni rezervime online nga klientët. 

Linku juaj: https://imirezervimi.al/${salon.slug}

Faleminderit që zgjodhët ImiRezervimi.al! 💄✨`

      const response = await fetch('/api/twilio/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: salon.phone,
          message: approvalMessage
        })
      })

      if (!response.ok) {
        console.error('WhatsApp notification failed:', await response.text())
      } else {
        console.log(`✅ WhatsApp notification sent to ${salon.name} at ${salon.phone}`)
      }
    } else {
      console.log(`⚠️ WhatsApp not configured - notification would be sent to ${salon.name} at ${salon.phone}`)
    }

    // Log the notification for admin tracking
    console.log(`=== SALON APPROVED NOTIFICATION ===`)
    console.log(`Salon: ${salon.name}`)
    console.log(`Phone: ${salon.phone}`)
    console.log(`Profile: https://imirezervimi.al/${salon.slug}`)
    console.log(`==================================`)

  } catch (error) {
    console.error('Error in sendApprovalNotification:', error)
    throw error
  }
}