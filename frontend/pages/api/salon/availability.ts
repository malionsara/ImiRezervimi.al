// frontend/pages/api/salon/availability.ts
// Enhanced salon availability management API endpoints
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/appointments'
import { ALBANIAN_ERRORS, createValidationError } from '../../../lib/validation'
import {
  calculateAvailability,
  blockTimeSlot,
  unblockTimeSlot,
  bulkManageTimeSlots,
  updateWorkingHours,
  generateCalendarMonth,
  validateTimeSlot,
  isTimeSlotInWorkingHours
} from '../../../lib/availability'
import {
  WorkingHours,
  BulkTimeSlotOperation,
  AvailabilityFilter,
  DayHours
} from '../../../types/database'

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
 * Validate working hours format
 */
function validateWorkingHours(workingHours: WorkingHours): string[] {
  const errors: string[] = []
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
  for (const day of days) {
    const dayHours = workingHours[day] as DayHours
    if (!dayHours) {
      errors.push(`Mungojnë orët e punës për ${day}`)
      continue
    }

    if (!dayHours.closed) {
      if (!dayHours.open || !dayHours.close) {
        errors.push(`Koha e hapjes dhe mbylljes është e detyrueshme për ${day}`)
      } else if (dayHours.open >= dayHours.close) {
        errors.push(`Koha e hapjes duhet të jetë para kohës së mbylljes për ${day}`)
      }

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(dayHours.open) || !timeRegex.test(dayHours.close)) {
        errors.push(`Format i gabuar i kohës për ${day}`)
      }
    }
  }

  return errors
}

/**
 * Validate bulk operation request
 */
function validateBulkOperation(operation: BulkTimeSlotOperation): string[] {
  const errors: string[] = []

  if (!['block', 'unblock', 'delete'].includes(operation.operation)) {
    errors.push('Operacioni nuk është i vlefshëm')
  }

  if (!operation.slots || operation.slots.length === 0) {
    errors.push('Nuk ka orë të zgjedhura')
  }

  if (operation.slots && operation.slots.length > 100) {
    errors.push('Shumë orë të zgjedhura (maksimumi 100)')
  }

  for (const slot of operation.slots || []) {
    if (!slot.date || !slot.startTime) {
      errors.push('Data dhe koha e fillimit janë të detyrueshme')
      break
    }

    if (!validateTimeSlot(slot.startTime, slot.duration || 30)) {
      errors.push(`Format i gabuar i kohës: ${slot.startTime}`)
      break
    }
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
    console.error('❌ API error:', error)
    
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
// GET - FETCH AVAILABILITY DATA
// ==============================================
async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { salonId, action, date, duration, month, year } = req.query

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
    switch (action) {
      case 'calendar':
        // Get calendar month view
        const calendarYear = year ? parseInt(year as string) : new Date().getFullYear()
        const calendarMonth = month ? parseInt(month as string) : new Date().getMonth()
        
        if (calendarYear < 2020 || calendarYear > 2030) {
          return res.status(400).json(createValidationError('Viti duhet të jetë midis 2020 dhe 2030'))
        }
        
        if (calendarMonth < 0 || calendarMonth > 11) {
          return res.status(400).json(createValidationError('Muaji duhet të jetë midis 0 dhe 11'))
        }

        const calendar = await generateCalendarMonth(salonId, calendarYear, calendarMonth)
        
        return res.status(200).json({
          success: true,
          data: calendar
        })

      case 'day':
      default:
        // Get day availability (default behavior)
        if (!date || typeof date !== 'string') {
          return res.status(400).json(createValidationError('Data është e detyrueshme'))
        }

        const serviceDuration = duration ? parseInt(duration as string) : 30
        if (serviceDuration < 15 || serviceDuration > 480) {
          return res.status(400).json(createValidationError('Kohëzgjatja e shërbimit duhet të jetë midis 15 dhe 480 minutash'))
        }

        const availability = await calculateAvailability(salonId, date, serviceDuration)
        
        return res.status(200).json({
          success: true,
          data: availability
        })
    }
  } catch (error) {
    console.error('Error fetching availability:', error)
    return res.status(500).json(createValidationError('Gabim në ngarkimin e disponueshmërisë'))
  }
}

// ==============================================
// POST - BLOCK/MANAGE TIME SLOTS
// ==============================================
async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { salonId } = req.query
  const { action, date, startTime, duration, reason, bulkOperation } = req.body

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
    switch (action) {
      case 'block':
        // Block a single time slot
        if (!date || !startTime) {
          return res.status(400).json(createValidationError('Data dhe koha e fillimit janë të detyrueshme'))
        }

        if (!validateTimeSlot(startTime, duration || 30)) {
          return res.status(400).json(createValidationError('Format i gabuar i kohës'))
        }

        await blockTimeSlot(salonId, date, startTime, duration || 30, reason || 'E bllokuar')
        
        return res.status(200).json({
          success: true,
          data: { message: 'Ora u bllokua me sukses' }
        })

      case 'bulk':
        // Bulk operations
        if (!bulkOperation) {
          return res.status(400).json(createValidationError('Operacioni në grup është i detyrueshëm'))
        }

        const operationErrors = validateBulkOperation(bulkOperation)
        if (operationErrors.length > 0) {
          return res.status(400).json(createValidationError(operationErrors.join(', ')))
        }

        const result = await bulkManageTimeSlots(salonId, bulkOperation)
        
        return res.status(200).json({
          success: result.success,
          data: result
        })

      default:
        return res.status(400).json(createValidationError('Aksioni nuk është i vlefshëm'))
    }
  } catch (error) {
    console.error('Error in POST operation:', error)
    return res.status(500).json(createValidationError('Gabim në operacion'))
  }
}

// ==============================================
// PUT - UPDATE WORKING HOURS OR UNBLOCK SLOTS
// ==============================================
async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { salonId } = req.query
  const { action, workingHours, date, startTime } = req.body

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
    switch (action) {
      case 'working-hours':
        // Update working hours
        if (!workingHours) {
          return res.status(400).json(createValidationError('Orët e punës janë të detyrueshme'))
        }

        const hoursErrors = validateWorkingHours(workingHours)
        if (hoursErrors.length > 0) {
          return res.status(400).json(createValidationError(hoursErrors.join(', ')))
        }

        await updateWorkingHours(salonId, workingHours)
        
        return res.status(200).json({
          success: true,
          data: { message: 'Orët e punës u përditësuan me sukses' }
        })

      case 'unblock':
        // Unblock a time slot
        if (!date || !startTime) {
          return res.status(400).json(createValidationError('Data dhe koha e fillimit janë të detyrueshme'))
        }

        await unblockTimeSlot(salonId, date, startTime)
        
        return res.status(200).json({
          success: true,
          data: { message: 'Ora u çbllokua me sukses' }
        })

      default:
        return res.status(400).json(createValidationError('Aksioni nuk është i vlefshëm'))
    }
  } catch (error) {
    console.error('Error in PUT operation:', error)
    return res.status(500).json(createValidationError('Gabim në përditësim'))
  }
}

// ==============================================
// DELETE - UNBLOCK TIME SLOTS
// ==============================================
async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { salonId, date, startTime } = req.query

  // Validate required parameters
  if (!salonId || typeof salonId !== 'string') {
    return res.status(400).json(createValidationError('ID e sallonit është e detyrueshme'))
  }

  if (!date || typeof date !== 'string' || !startTime || typeof startTime !== 'string') {
    return res.status(400).json(createValidationError('Data dhe koha e fillimit janë të detyrueshme'))
  }

  // Validate salon access
  const hasAccess = await validateSalonAccess(salonId)
  if (!hasAccess) {
    return res.status(404).json(createValidationError(ALBANIAN_ERRORS.SALON_NOT_FOUND))
  }

  try {
    await unblockTimeSlot(salonId, date, startTime)
    
    return res.status(200).json({
      success: true,
      data: { message: 'Ora u çbllokua me sukses' }
    })
  } catch (error) {
    console.error('Error in DELETE operation:', error)
    return res.status(500).json(createValidationError('Gabim në fshirje'))
  }
}