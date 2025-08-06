// frontend/pages/api/salon/holidays.ts
// Holiday and special period management API
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/appointments'
import { ALBANIAN_ERRORS, createValidationError } from '../../../lib/validation'

// ==============================================
// API RESPONSE INTERFACE
// ==============================================
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

interface Holiday {
  id?: string
  salonId: string
  name: string
  startDate: string
  endDate: string
  description?: string
}

// ==============================================
// VALIDATION FUNCTIONS
// ==============================================

/**
 * Validate salon ID and permissions
 */
async function validateSalonAccess(salonId: string): Promise<boolean> {
  try {
    const { data: salon, error } = await supabaseAdmin
      .from('salons')
      .select('id, status')
      .eq('id', salonId)
      .eq('status', 'active')
      .single()

    return !error && !!salon
  } catch (error) {
    console.error('Error validating salon access:', error)
    return false
  }
}

/**
 * Validate holiday data
 */
function validateHoliday(holiday: Holiday): string[] {
  const errors: string[] = []

  if (!holiday.name || holiday.name.trim().length === 0) {
    errors.push('Emri i festës është i detyrueshëm')
  }

  if (!holiday.startDate) {
    errors.push('Data e fillimit është e detyrueshme')
  }

  if (!holiday.endDate) {
    errors.push('Data e mbarimit është e detyrueshme')
  }

  if (holiday.startDate && holiday.endDate) {
    const startDate = new Date(holiday.startDate)
    const endDate = new Date(holiday.endDate)

    if (startDate > endDate) {
      errors.push('Data e fillimit duhet të jetë para datës së mbarimit')
    }

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      errors.push('Format i gabuar i datës')
    }

    // Check if start date is not too far in the past
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    if (startDate < sixMonthsAgo) {
      errors.push('Data e fillimit nuk mund të jetë më shumë se 6 muaj në të kaluarën')
    }
  }

  if (holiday.name && holiday.name.length > 100) {
    errors.push('Emri i festës nuk mund të jetë më shumë se 100 karaktere')
  }

  if (holiday.description && holiday.description.length > 500) {
    errors.push('Përshkrimi nuk mund të jetë më shumë se 500 karaktere')
  }

  return errors
}

// ==============================================
// MAIN API HANDLER
// ==============================================
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res)
      case 'POST':
        return await handlePost(req, res)
      case 'PUT':
        return await handlePut(req, res)
      case 'DELETE':
        return await handleDelete(req, res)
      default:
        return res.status(405).json({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Metoda nuk është e lejuar'
          }
        })
    }
  } catch (error) {
    console.error('❌ Holiday API error:', error)
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ALBANIAN_ERRORS.INTERNAL_ERROR,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }
    })
  }
}

// ==============================================
// GET - FETCH HOLIDAYS
// ==============================================
async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { salonId, year, startDate, endDate } = req.query

  // Validate required parameters
  if (!salonId || typeof salonId !== 'string') {
    return res.status(400).json(createValidationError('ID e sallonit është e detyrueshme'))
  }

  // Validate salon access
  const hasAccess = await validateSalonAccess(salonId)
  if (!hasAccess) {
    return res.status(404).json(createValidationError(ALBANIAN_ERRORS.SALON_NOT_FOUND))
  }

  try {
    let query = supabaseAdmin
      .from('salon_holidays')
      .select('*')
      .eq('salon_id', salonId)
      .order('start_date', { ascending: true })

    // Filter by year if provided
    if (year && typeof year === 'string') {
      const yearInt = parseInt(year)
      if (yearInt >= 2020 && yearInt <= 2030) {
        const yearStart = `${yearInt}-01-01`
        const yearEnd = `${yearInt}-12-31`
        query = query.gte('start_date', yearStart).lte('end_date', yearEnd)
      }
    }

    // Filter by date range if provided
    if (startDate && typeof startDate === 'string') {
      query = query.gte('end_date', startDate)
    }
    
    if (endDate && typeof endDate === 'string') {
      query = query.lte('start_date', endDate)
    }

    const { data: holidays, error } = await query

    if (error) {
      console.error('Error fetching holidays:', error)
      return res.status(500).json(createValidationError('Gabim në ngarkimin e festave'))
    }

    // Transform to frontend format
    const transformedHolidays = holidays?.map(holiday => ({
      id: holiday.id,
      salonId: holiday.salon_id,
      name: holiday.name,
      startDate: holiday.start_date,
      endDate: holiday.end_date,
      description: holiday.description,
      createdAt: holiday.created_at,
      updatedAt: holiday.updated_at
    })) || []

    return res.status(200).json({
      success: true,
      data: {
        holidays: transformedHolidays,
        count: transformedHolidays.length
      }
    })

  } catch (error) {
    console.error('Error fetching holidays:', error)
    return res.status(500).json(createValidationError('Gabim në ngarkimin e festave'))
  }
}

// ==============================================
// POST - CREATE HOLIDAY
// ==============================================
async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { salonId } = req.query
  const holidayData: Holiday = req.body

  // Validate required parameters
  if (!salonId || typeof salonId !== 'string') {
    return res.status(400).json(createValidationError('ID e sallonit është e detyrueshme'))
  }

  // Validate salon access
  const hasAccess = await validateSalonAccess(salonId)
  if (!hasAccess) {
    return res.status(404).json(createValidationError(ALBANIAN_ERRORS.SALON_NOT_FOUND))
  }

  // Validate holiday data
  const holiday = { ...holidayData, salonId }
  const validationErrors = validateHoliday(holiday)
  if (validationErrors.length > 0) {
    return res.status(400).json(createValidationError(validationErrors.join(', ')))
  }

  try {
    // Check for overlapping holidays
    const { data: existingHolidays, error: checkError } = await supabaseAdmin
      .from('salon_holidays')
      .select('id, name, start_date, end_date')
      .eq('salon_id', salonId)
      .or(`and(start_date.lte.${holiday.endDate},end_date.gte.${holiday.startDate})`)

    if (checkError) {
      console.error('Error checking existing holidays:', checkError)
      return res.status(500).json(createValidationError('Gabim në verifikimin e festave ekzistuese'))
    }

    if (existingHolidays && existingHolidays.length > 0) {
      const conflictingHoliday = existingHolidays[0]
      return res.status(400).json(createValidationError(
        `Kjo periudhë përplaset me festën "${conflictingHoliday.name}" (${conflictingHoliday.start_date} - ${conflictingHoliday.end_date})`
      ))
    }

    // Create the holiday
    const { data: newHoliday, error: insertError } = await supabaseAdmin
      .from('salon_holidays')
      .insert({
        salon_id: salonId,
        name: holiday.name.trim(),
        start_date: holiday.startDate,
        end_date: holiday.endDate,
        description: holiday.description?.trim() || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating holiday:', insertError)
      return res.status(500).json(createValidationError('Gabim në krijimin e festës'))
    }

    // Transform to frontend format
    const transformedHoliday = {
      id: newHoliday.id,
      salonId: newHoliday.salon_id,
      name: newHoliday.name,
      startDate: newHoliday.start_date,
      endDate: newHoliday.end_date,
      description: newHoliday.description,
      createdAt: newHoliday.created_at,
      updatedAt: newHoliday.updated_at
    }

    console.log(`✅ Holiday created: ${newHoliday.name} for salon ${salonId}`)

    return res.status(201).json({
      success: true,
      data: {
        holiday: transformedHoliday,
        message: 'Festa u krijua me sukses'
      }
    })

  } catch (error) {
    console.error('Error creating holiday:', error)
    return res.status(500).json(createValidationError('Gabim në krijimin e festës'))
  }
}

// ==============================================
// PUT - UPDATE HOLIDAY
// ==============================================
async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { salonId, holidayId } = req.query
  const holidayData: Holiday = req.body

  // Validate required parameters
  if (!salonId || typeof salonId !== 'string') {
    return res.status(400).json(createValidationError('ID e sallonit është e detyrueshme'))
  }

  if (!holidayId || typeof holidayId !== 'string') {
    return res.status(400).json(createValidationError('ID e festës është e detyrueshme'))
  }

  // Validate salon access
  const hasAccess = await validateSalonAccess(salonId)
  if (!hasAccess) {
    return res.status(404).json(createValidationError(ALBANIAN_ERRORS.SALON_NOT_FOUND))
  }

  // Validate holiday data
  const holiday = { ...holidayData, salonId }
  const validationErrors = validateHoliday(holiday)
  if (validationErrors.length > 0) {
    return res.status(400).json(createValidationError(validationErrors.join(', ')))
  }

  try {
    // Check if holiday exists and belongs to salon
    const { data: existingHoliday, error: fetchError } = await supabaseAdmin
      .from('salon_holidays')
      .select('*')
      .eq('id', holidayId)
      .eq('salon_id', salonId)
      .single()

    if (fetchError || !existingHoliday) {
      return res.status(404).json(createValidationError('Festa nuk u gjet'))
    }

    // Check for overlapping holidays (excluding current holiday)
    const { data: conflictingHolidays, error: checkError } = await supabaseAdmin
      .from('salon_holidays')
      .select('id, name, start_date, end_date')
      .eq('salon_id', salonId)
      .neq('id', holidayId)
      .or(`and(start_date.lte.${holiday.endDate},end_date.gte.${holiday.startDate})`)

    if (checkError) {
      console.error('Error checking conflicting holidays:', checkError)
      return res.status(500).json(createValidationError('Gabim në verifikimin e festave'))
    }

    if (conflictingHolidays && conflictingHolidays.length > 0) {
      const conflictingHoliday = conflictingHolidays[0]
      return res.status(400).json(createValidationError(
        `Kjo periudhë përplaset me festën "${conflictingHoliday.name}" (${conflictingHoliday.start_date} - ${conflictingHoliday.end_date})`
      ))
    }

    // Update the holiday
    const { data: updatedHoliday, error: updateError } = await supabaseAdmin
      .from('salon_holidays')
      .update({
        name: holiday.name.trim(),
        start_date: holiday.startDate,
        end_date: holiday.endDate,
        description: holiday.description?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', holidayId)
      .eq('salon_id', salonId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating holiday:', updateError)
      return res.status(500).json(createValidationError('Gabim në përditësimin e festës'))
    }

    // Transform to frontend format
    const transformedHoliday = {
      id: updatedHoliday.id,
      salonId: updatedHoliday.salon_id,
      name: updatedHoliday.name,
      startDate: updatedHoliday.start_date,
      endDate: updatedHoliday.end_date,
      description: updatedHoliday.description,
      createdAt: updatedHoliday.created_at,
      updatedAt: updatedHoliday.updated_at
    }

    console.log(`✅ Holiday updated: ${updatedHoliday.name} for salon ${salonId}`)

    return res.status(200).json({
      success: true,
      data: {
        holiday: transformedHoliday,
        message: 'Festa u përditësua me sukses'
      }
    })

  } catch (error) {
    console.error('Error updating holiday:', error)
    return res.status(500).json(createValidationError('Gabim në përditësimin e festës'))
  }
}

// ==============================================
// DELETE - DELETE HOLIDAY
// ==============================================
async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { salonId, holidayId } = req.query

  // Validate required parameters
  if (!salonId || typeof salonId !== 'string') {
    return res.status(400).json(createValidationError('ID e sallonit është e detyrueshme'))
  }

  if (!holidayId || typeof holidayId !== 'string') {
    return res.status(400).json(createValidationError('ID e festës është e detyrueshme'))
  }

  // Validate salon access
  const hasAccess = await validateSalonAccess(salonId)
  if (!hasAccess) {
    return res.status(404).json(createValidationError(ALBANIAN_ERRORS.SALON_NOT_FOUND))
  }

  try {
    // Check if holiday exists and belongs to salon
    const { data: existingHoliday, error: fetchError } = await supabaseAdmin
      .from('salon_holidays')
      .select('id, name')
      .eq('id', holidayId)
      .eq('salon_id', salonId)
      .single()

    if (fetchError || !existingHoliday) {
      return res.status(404).json(createValidationError('Festa nuk u gjet'))
    }

    // Delete the holiday
    const { error: deleteError } = await supabaseAdmin
      .from('salon_holidays')
      .delete()
      .eq('id', holidayId)
      .eq('salon_id', salonId)

    if (deleteError) {
      console.error('Error deleting holiday:', deleteError)
      return res.status(500).json(createValidationError('Gabim në fshirjen e festës'))
    }

    console.log(`✅ Holiday deleted: ${existingHoliday.name} for salon ${salonId}`)

    return res.status(200).json({
      success: true,
      data: {
        message: 'Festa u fshi me sukses'
      }
    })

  } catch (error) {
    console.error('Error deleting holiday:', error)
    return res.status(500).json(createValidationError('Gabim në fshirjen e festës'))
  }
}