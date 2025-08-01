// frontend/pages/api/salon/register.ts
// API endpoint for salon registration

import { NextApiRequest, NextApiResponse } from 'next'
import { registerSalon, validateSalonRegistration, SalonRegistrationData } from '../../../lib/salon'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Vetëm POST request-et janë të lejuara'
      }
    })
  }

  try {
    const registrationData: SalonRegistrationData = req.body

    // Validate request body
    if (!registrationData) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DATA',
          message: 'Të dhënat e regjistrimit mungojnë'
        }
      })
    }

    // Validate salon data
    const validationErrors = validateSalonRegistration(registrationData)
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Të dhënat nuk janë të vlefshme',
          details: validationErrors
        }
      })
    }

    // Additional server-side validations
    if (registrationData.services) {
      for (const service of registrationData.services) {
        if (!service.name.trim()) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_SERVICE',
              message: 'Të gjitha shërbimet duhet të kenë emër'
            }
          })
        }
        
        if (service.duration < 15 || service.duration > 480) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_SERVICE_DURATION',
              message: 'Kohëzgjatja e shërbimit duhet të jetë midis 15 dhe 480 minutave'
            }
          })
        }

        if (service.price && (service.price < 0 || service.price > 1000)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_SERVICE_PRICE',
              message: 'Çmimi i shërbimit duhet të jetë midis 0 dhe 1000 euro'
            }
          })
        }
      }
    }

    // Validate working hours
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    for (const day of days) {
      const hours = registrationData.workingHours[day]
      if (!hours) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_WORKING_HOURS',
            message: `Oraret e punës për ${day} mungojnë`
          }
        })
      }

      if (!hours.closed) {
        if (!hours.open || !hours.close) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_WORKING_HOURS',
              message: `Ora e fillimit dhe mbarimit duhet të specifikohen për ${day}`
            }
          })
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(hours.open) || !timeRegex.test(hours.close)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_TIME_FORMAT',
              message: `Formati i orës për ${day} nuk është i saktë (duhet të jetë HH:MM)`
            }
          })
        }

        // Check that close time is after open time
        const [openHour, openMin] = hours.open.split(':').map(Number)
        const [closeHour, closeMin] = hours.close.split(':').map(Number)
        const openMinutes = openHour * 60 + openMin
        const closeMinutes = closeHour * 60 + closeMin

        if (closeMinutes <= openMinutes) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_TIME_RANGE',
              message: `Ora e mbylljes duhet të jetë pas orës së hapjes për ${day}`
            }
          })
        }
      }
    }

    // Register salon
    const result = await registerSalon(registrationData)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: result.error || 'Regjistrimi dështoi'
        }
      })
    }

    // Success response
    return res.status(201).json({
      success: true,
      data: {
        salon: result.data,
        message: 'Salloni u regjistrua me sukses! Do të shqyrtohet nga ekipi ynë dhe do të aktivizohet brenda 24 orëve.'
      }
    })

  } catch (error) {
    console.error('Salon registration API error:', error)
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ka ndodhur një gabim i brendshëm. Ju lutemi provoni përsëri më vonë.'
      }
    })
  }
}