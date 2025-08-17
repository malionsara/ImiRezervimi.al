// frontend/pages/api/twilio/salon-webhook.ts
// WhatsApp webhook for salon query commands
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import {
  parseCommand,
  validateSalon,
  checkRateLimit,
  logCommand,
  getTodayAppointments,
  getPendingAppointments,
  getTomorrowAppointments,
  processApproval,
  processDecline,
  SALON_RESPONSES
} from '../../../lib/salon-commands'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST method allowed' }
    })
  }

  try {
    console.log('🎯 Salon webhook received:', req.body)

    // Extract Twilio webhook data
    const { From, To, Body } = req.body
    const salonPhone = From?.replace('whatsapp:', '') || ''
    const messageBody = (Body || '').trim().toLowerCase()

    console.log(`📱 Message from salon ${salonPhone}: "${messageBody}"`)

    // Validate salon phone number
    const salon = await validateSalon(salonPhone)
    if (!salon) {
      return res.status(200).end() // Ignore messages from unregistered salons
    }

    console.log(`✅ Valid salon: ${salon.name}`)

    // Check rate limiting
    const rateLimitPassed = await checkRateLimit(salonPhone)
    if (!rateLimitPassed) {
      await sendResponse(res, salonPhone, SALON_RESPONSES.RATE_LIMIT)
      return
    }

    // Log command
    await logCommand(salonPhone, messageBody)

    // Parse and process command
    const command = parseCommand(messageBody)
    const response = await processCommandType(command, salon)
    
    // Send response
    await sendResponse(res, salonPhone, response)

  } catch (error) {
    console.error('❌ Error in salon webhook:', error)
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
    })
  }
}

async function processCommandType(command: any, salon: any): Promise<string> {
  try {
    switch (command.type) {
      case 'menu':
        return SALON_RESPONSES.MENU

      case 'appointments':
        return await getTodayAppointments(salon.id)

      case 'pending':
        return await getPendingAppointments(salon.id)

      case 'tomorrow':
        return await getTomorrowAppointments(salon.id)

      case 'help':
        return SALON_RESPONSES.HELP

      case 'approve':
        if (!command.parameter) {
          return '❌ Ju lutemi specifikoni ID e rezervimit. Shembull: "aprovo 12345678"'
        }
        return await processApproval(command.parameter, salon.id)

      case 'decline':
        if (!command.parameter) {
          return '❌ Ju lutemi specifikoni ID e rezervimit. Shembull: "refuzo 12345678"'
        }
        return await processDecline(command.parameter, salon.id)

      case 'unknown':
      default:
        return SALON_RESPONSES.UNKNOWN_COMMAND(command.originalText)
    }
  } catch (error) {
    console.error('Error processing command:', error)
    return SALON_RESPONSES.ERROR
  }
}


async function sendResponse(res: NextApiResponse, phone: string, message: string): Promise<void> {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )

    await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phone}`
    })

    console.log(`📤 Response sent to ${phone}`)
    res.status(200).end()
  } catch (error) {
    console.error('Error sending response:', error)
    res.status(500).json({ error: 'Failed to send response' })
  }
}