// frontend/pages/api/appointments/[id]/reschedule.ts
// Customer reschedule endpoint

import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { supabaseAdmin, checkAppointmentConflict, validateWorkingHours } from '../../../../lib/appointments'

interface ApiResponse {
  success: boolean
  data?: unknown
  error?: { code: string; message: string; details?: unknown }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Lejohen vetëm kërkesat PUT' } })
  }

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: { code: 'MISSING_ID', message: 'ID e rezervimit është e detyrueshme' } })
  }

  const { appointmentDate, startTime, customerNotes } = req.body || {}
  if (!appointmentDate || !startTime) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_DATA', message: 'Data dhe ora janë të detyrueshme' } })
  }

  try {
    const session = await getSession({ req })
    const sessionUserId = (session as any)?.user?.id
    if (!sessionUserId) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Duhet të jeni i identifikuar' } })
    }

    // Load appointment with salon working hours and ownership
    const { data: appt, error: apptErr } = await supabaseAdmin
      .from('appointments')
      .select(`
        id, customer_id, salon_id, status, duration_minutes,
        appointment_date, start_time, customer_notes,
        salon:salons!salon_id(id, working_hours)
      `)
      .eq('id', id)
      .maybeSingle()

    if (apptErr || !appt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Rezervimi nuk u gjet' } })
    }

    if (appt.customer_id !== sessionUserId) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Nuk keni të drejtë të ndryshoni këtë rezervim' } })
    }

    if (!['pending', 'approved'].includes(appt.status)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Vetëm rezervimet në pritje ose të aprovuara mund të ri-planifikohen' } })
    }

    // Validate working hours
    const working = (appt as any)?.salon?.working_hours || {}
    const hoursValidation = validateWorkingHours(appointmentDate, startTime, working)
    if (!hoursValidation.valid) {
      return res.status(400).json({ success: false, error: { code: 'OUT_OF_HOURS', message: hoursValidation.error || 'Orari nuk është i vlefshëm' } })
    }

    // Conflict check
    const conflict = await checkAppointmentConflict(appt.salon_id, appointmentDate, startTime, appt.duration_minutes)
    if (conflict.hasConflict) {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Ky orar është i zënë. Zgjidhni një orar tjetër.' } })
    }

    // Update appointment; approved bookings revert to pending
    const updatePayload: Record<string, unknown> = {
      appointment_date: appointmentDate,
      start_time: startTime,
      customer_notes: typeof customerNotes === 'string' ? customerNotes : appt.customer_notes,
      status: appt.status === 'approved' ? 'pending' : appt.status,
      updated_at: new Date().toISOString()
    }
    if (appt.status === 'approved') {
      // When moving approved back to pending, clear responded_at
      updatePayload.responded_at = null
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('appointments')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        id, appointment_date, start_time, status, customer_notes
      `)
      .single()

    if (updErr || !updated) {
      return res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: 'Gabim gjatë përditësimit të rezervimit' } })
    }

    return res.status(200).json({
      success: true,
      data: updated
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Gabim i brendshëm i serverit' } })
  }
}


