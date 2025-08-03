// frontend/pages/api/admin/salons/reject.ts
// API endpoint for rejecting salon registrations

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

  // Check admin authentication
  const adminKey = req.headers.authorization?.replace('Bearer ', '') || req.body.adminKey
  if (!await isValidAdmin(adminKey)) {
    return res.status(403).json({
      success: false,
      error: 'Qasja e paautorizuar - çelësi admin nuk është valid'
    })
  }
  
  const { salonId, reason } = req.body

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

    // For rejected salons, we can either:
    // 1. Delete them completely, or
    // 2. Mark as 'rejected' status for record keeping
    
    // Option 1: Delete the salon and its services
    const { error: deleteServicesError } = await supabaseAdmin
      .from('services')
      .delete()
      .eq('salon_id', salonId)

    if (deleteServicesError) {
      console.error('Error deleting salon services:', deleteServicesError)
      // Continue with salon deletion even if services deletion fails
    }

    const { error: deleteSalonError } = await supabaseAdmin
      .from('salons')
      .delete()
      .eq('id', salonId)

    if (deleteSalonError) {
      console.error('Error deleting salon:', deleteSalonError)
      return res.status(500).json({
        success: false,
        error: 'Gabim në refuzimin e sallonit'
      })
    }

    // Send rejection notification to salon owner
    try {
      await sendRejectionNotification(salon, reason)
    } catch (notificationError) {
      console.error('Error sending rejection notification:', notificationError)
      // Don't fail the rejection if notification fails
    }

    console.log(`Salon rejected: ${salon.name} (${salon.slug}). Reason: ${reason || 'No reason provided'}`)

    return res.status(200).json({
      success: true,
      message: 'Salloni u refuzua dhe u fshi nga sistemi'
    })

  } catch (error) {
    console.error('Error rejecting salon:', error)
    return res.status(500).json({
      success: false,
      error: 'Ka ndodhur një gabim i brendshëm'
    })
  }
}

async function sendRejectionNotification(salon: { name: string; phone: string; slug: string; email?: string }, reason?: string) {
  try {
    // Try WhatsApp notification first
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
      const rejectionMessage = `Përshëndetje ${salon.name}! 

Faleminderit për aplikimin tuaj në ImiRezervimi.al. 

Regjistrimi juaj nuk mund të miratohet momentalisht.${reason ? ` 

Arsyeja: ${reason}` : ''}

Ju lutemi kontaktoni mbështetjen tonë për më shumë informacion ose për të riaplikuar.

Email: support@imirezervimi.al`

      const response = await fetch('/api/twilio/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: salon.phone,
          message: rejectionMessage
        })
      })

      if (!response.ok) {
        console.error('WhatsApp rejection notification failed:', await response.text())
      } else {
        console.log(`✅ WhatsApp rejection notification sent to ${salon.name} at ${salon.phone}`)
      }
    } else {
      console.log(`⚠️ WhatsApp not configured - rejection notification would be sent to ${salon.name} at ${salon.phone}`)
    }

    // Log the notification for admin tracking
    console.log(`=== SALON REJECTED NOTIFICATION ===`)
    console.log(`Salon: ${salon.name}`)
    console.log(`Phone: ${salon.phone}`)
    console.log(`Reason: ${reason || 'No reason provided'}`)
    console.log(`==================================`)

  } catch (error) {
    console.error('Error in sendRejectionNotification:', error)
    throw error
  }
}

// Admin authentication helper
async function isValidAdmin(adminKey: string | undefined): Promise<boolean> {
  if (!adminKey) return false
  
  const configuredKey = process.env.ADMIN_SECRET_KEY
  if (!configuredKey) {
    console.warn('ADMIN_SECRET_KEY not configured - rejecting admin access')
    return false
  }
  
  return adminKey === configuredKey
}