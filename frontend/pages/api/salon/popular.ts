// frontend/pages/api/salon/popular.ts
// API endpoint to fetch popular/active salons for dashboard
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET method allowed' }
    })
  }

  try {
    const { limit = 6 } = req.query
    const limitNum = parseInt(limit as string)

    // Fetch active salons with basic info
    const { data: salons, error } = await supabase
      .from('salons')
      .select(`
        id,
        name,
        slug,
        description,
        city,
        address,
        instagram_handle,
        created_at
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limitNum)

    if (error) {
      console.error('Error fetching popular salons:', error)
      return res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: 'Failed to fetch salons' }
      })
    }

    console.log(`✅ Fetched ${salons?.length || 0} popular salons`)

    return res.status(200).json({
      success: true,
      data: salons || []
    })

  } catch (error) {
    console.error('Error in popular salons API:', error)
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
    })
  }
}