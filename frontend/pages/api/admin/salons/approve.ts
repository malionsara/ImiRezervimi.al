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

    // TODO: Send approval notification to salon owner via email/WhatsApp
    // await sendApprovalNotification(salon)

    console.log(`Salon approved: ${salon.name} (${salon.slug})`)

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

// TODO: Implement notification function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendApprovalNotification(salon: { name: string; phone: string; slug: string }) {
  // Send email or WhatsApp notification to salon owner
  // Implementation depends on your notification service
  console.log(`Should send approval notification to ${salon.name} at ${salon.phone}`)
}