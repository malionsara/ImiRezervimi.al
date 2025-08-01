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

  // TODO: Add proper admin authentication here
  // For now, this endpoint is open - you should add admin auth
  
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

    // TODO: Send rejection notification to salon owner via email/WhatsApp
    // await sendRejectionNotification(salon, reason)

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

// TODO: Implement notification function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendRejectionNotification(salon: { name: string; phone: string; slug: string }, reason?: string) {
  // Send email or WhatsApp notification to salon owner
  // Implementation depends on your notification service
  console.log(`Should send rejection notification to ${salon.name} at ${salon.phone}`)
  if (reason) {
    console.log(`Rejection reason: ${reason}`)
  }
}