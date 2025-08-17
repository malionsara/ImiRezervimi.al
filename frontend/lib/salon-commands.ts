// frontend/lib/salon-commands.ts
// Salon WhatsApp command processing utilities
// Albanian Beauty Salon Booking Platform

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ==============================================
// TYPES AND INTERFACES
// ==============================================

export interface SalonCommand {
  type: 'menu' | 'appointments' | 'pending' | 'tomorrow' | 'approve' | 'decline' | 'help' | 'unknown'
  parameter?: string
  originalText: string
}

export interface CommandResponse {
  success: boolean
  message: string
  error?: string
}

export interface SalonInfo {
  id: string
  name: string
  phone: string
  status: string
}

// ==============================================
// COMMAND PARSING
// ==============================================

export function parseCommand(text: string): SalonCommand {
  const normalized = text.trim().toLowerCase()
  
  // Menu commands
  if (normalized === 'menu' || normalized === 'meny') {
    return { type: 'menu', originalText: text }
  }
  
  // Appointments commands
  if (['oraret', 'appointments', 'rezervimet', 'today', 'sot'].includes(normalized)) {
    return { type: 'appointments', originalText: text }
  }
  
  // Pending commands
  if (['pending', 'pritje', 'kerkesa', 'kërkesa'].includes(normalized)) {
    return { type: 'pending', originalText: text }
  }
  
  // Tomorrow commands
  if (['tomorrow', 'neser', 'nesër'].includes(normalized)) {
    return { type: 'tomorrow', originalText: text }
  }
  
  // Help commands
  if (['help', 'ndihme', 'ndihmë'].includes(normalized)) {
    return { type: 'help', originalText: text }
  }
  
  // Approve commands
  const approveMatch = normalized.match(/^(approve|aprovo)\s+(.+)$/)
  if (approveMatch) {
    return { type: 'approve', parameter: approveMatch[2], originalText: text }
  }
  
  // Decline commands
  const declineMatch = normalized.match(/^(decline|refuzo)\s+(.+)$/)
  if (declineMatch) {
    return { type: 'decline', parameter: declineMatch[2], originalText: text }
  }
  
  // Unknown command
  return { type: 'unknown', originalText: text }
}

// ==============================================
// COMMAND VALIDATION
// ==============================================

export async function validateSalon(phone: string): Promise<SalonInfo | null> {
  try {
    console.log(`🔍 Validating salon with phone: ${phone}`)
    
    const { data: salon, error } = await supabase
      .from('salons')
      .select('id, name, phone, whatsapp_number, status')
      .or(`phone.eq.${phone},whatsapp_number.eq.${phone}`)
      .eq('status', 'active')
      .single()

    console.log(`📊 Salon query result:`, { salon, error })

    if (error || !salon) {
      console.log(`❌ Invalid salon phone: ${phone}`)
      // Also try to find ANY salon with this phone (regardless of status) for debugging
      const { data: debugSalon, error: debugError } = await supabase
        .from('salons')
        .select('id, name, phone, whatsapp_number, status')
        .or(`phone.eq.${phone},whatsapp_number.eq.${phone}`)
      console.log(`🔍 Debug salon search (any status):`, { debugSalon, debugError })
      return null
    }

    console.log(`✅ Valid salon found: ${salon.name} (ID: ${salon.id})`)
    return salon
  } catch (error) {
    console.error('Error validating salon:', error)
    return null
  }
}

export async function checkRateLimit(phone: string): Promise<boolean> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { data: recentCommands, error } = await supabase
      .from('salon_command_log')
      .select('id')
      .eq('salon_phone', phone)
      .gte('created_at', oneHourAgo)

    if (error) {
      console.error('Error checking rate limit:', error)
      return true // Allow on error
    }

    const commandCount = recentCommands?.length || 0
    console.log(`📊 Salon ${phone} has sent ${commandCount} commands in the last hour`)

    return commandCount < 10
  } catch (error) {
    console.error('Error in rate limiting:', error)
    return true // Allow on error
  }
}

export async function logCommand(salonPhone: string, command: string): Promise<void> {
  try {
    await supabase
      .from('salon_command_log')
      .insert({
        salon_phone: salonPhone,
        command,
        created_at: new Date().toISOString()
      })
    
    console.log(`📝 Logged command: ${command} from ${salonPhone}`)
  } catch (error) {
    console.error('Error logging command:', error)
    // Don't throw - logging failure shouldn't break the flow
  }
}

// ==============================================
// COMMAND HANDLERS
// ==============================================

export async function getTodayAppointments(salonId: string): Promise<string> {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers (first_name, last_name, phone),
        services (name, duration_minutes)
      `)
      .eq('salon_id', salonId)
      .eq('appointment_date', today)
      .in('status', ['approved', 'pending'])
      .order('start_time', { ascending: true })

    if (error) {
      throw error
    }

    if (!appointments || appointments.length === 0) {
      return '📅 *ORARET E SOTME*\n\nNuk keni rezervime sot.'
    }

    let response = '📅 *ORARET E SOTME*\n\n'
    
    appointments.forEach(apt => {
      const status = apt.status === 'approved' ? '✅' : '⏳'
      const customer = `${apt.customers.first_name} ${apt.customers.last_name}`
      const service = apt.services.name
      const time = apt.start_time.substring(0, 5) // HH:MM format
      
      response += `${status} ${time} - ${customer}\n📋 ${service}\n📞 ${apt.customers.phone}\n\n`
    })

    return response.trim()
  } catch (error) {
    console.error('Error getting today appointments:', error)
    return '❌ Gabim në marrjen e rezervimeve të sotme.'
  }
}

export async function getPendingAppointments(salonId: string): Promise<string> {
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers (first_name, last_name, phone),
        services (name)
      `)
      .eq('salon_id', salonId)
      .eq('status', 'pending')
      .gte('appointment_date', new Date().toISOString().split('T')[0])
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      throw error
    }

    if (!appointments || appointments.length === 0) {
      return '⏳ *KËRKESA NË PRITJE*\n\nNuk keni kërkesa në pritje.'
    }

    let response = '⏳ *KËRKESA NË PRITJE*\n\n'
    
    appointments.forEach(apt => {
      const customer = `${apt.customers.first_name} ${apt.customers.last_name}`
      const service = apt.services.name
      const date = new Date(apt.appointment_date).toLocaleDateString('sq-AL')
      const time = apt.start_time.substring(0, 5)
      const shortId = apt.id.substring(0, 8)
      
      response += `🆔 ${shortId}\n👤 ${customer}\n📅 ${date} në ${time}\n📋 ${service}\n\n`
    })

    response += '💡 Për të aprovuar: "aprovo [ID]"\n💡 Për të refuzuar: "refuzo [ID]"'

    return response
  } catch (error) {
    console.error('Error getting pending appointments:', error)
    return '❌ Gabim në marrjen e kërkesave në pritje.'
  }
}

export async function getTomorrowAppointments(salonId: string): Promise<string> {
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDate = tomorrow.toISOString().split('T')[0]
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers (first_name, last_name),
        services (name)
      `)
      .eq('salon_id', salonId)
      .eq('appointment_date', tomorrowDate)
      .eq('status', 'approved')
      .order('start_time', { ascending: true })

    if (error) {
      throw error
    }

    if (!appointments || appointments.length === 0) {
      return '📅 *ORARET E NESËRME*\n\nNuk keni rezervime nesër.'
    }

    let response = '📅 *ORARET E NESËRME*\n\n'
    
    appointments.forEach(apt => {
      const customer = `${apt.customers.first_name} ${apt.customers.last_name}`
      const service = apt.services.name
      const time = apt.start_time.substring(0, 5)
      
      response += `✅ ${time} - ${customer}\n📋 ${service}\n\n`
    })

    return response.trim()
  } catch (error) {
    console.error('Error getting tomorrow appointments:', error)
    return '❌ Gabim në marrjen e rezervimeve të nesërme.'
  }
}

export async function processApproval(appointmentId: string, salonId: string): Promise<string> {
  try {
    // Find appointment with short ID (first 8 characters)
    const { data: appointments, error: findError } = await supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId)
      .eq('status', 'pending')
      .ilike('id', `${appointmentId}%`)

    if (findError || !appointments || appointments.length === 0) {
      return `❌ Nuk u gjet rezervim me ID "${appointmentId}"`
    }

    if (appointments.length > 1) {
      return `❌ Disa rezervime përputhen me ID "${appointmentId}". Ju lutemi përdorni ID më të gjatë.`
    }

    const appointment = appointments[0]

    // Update appointment status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        responded_at: new Date().toISOString(),
        salon_notes: 'Miratuar nga WhatsApp'
      })
      .eq('id', appointment.id)

    if (updateError) {
      throw updateError
    }

    return `✅ *REZERVIMI U MIRATUA*\n\n🆔 ID: ${appointmentId}\n📅 Data: ${appointment.appointment_date}\n🕐 Ora: ${appointment.start_time}\n\nKlienti do të njoftohet automatikisht.`
  } catch (error) {
    console.error('Error approving appointment:', error)
    return '❌ Gabim në miratimin e rezervimit.'
  }
}

export async function processDecline(appointmentId: string, salonId: string): Promise<string> {
  try {
    // Find appointment with short ID (first 8 characters)
    const { data: appointments, error: findError } = await supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId)
      .eq('status', 'pending')
      .ilike('id', `${appointmentId}%`)

    if (findError || !appointments || appointments.length === 0) {
      return `❌ Nuk u gjet rezervim me ID "${appointmentId}"`
    }

    if (appointments.length > 1) {
      return `❌ Disa rezervime përputhen me ID "${appointmentId}". Ju lutemi përdorni ID më të gjatë.`
    }

    const appointment = appointments[0]

    // Update appointment status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'declined',
        declined_at: new Date().toISOString(),
        responded_at: new Date().toISOString(),
        salon_notes: 'Refuzuar nga WhatsApp'
      })
      .eq('id', appointment.id)

    if (updateError) {
      throw updateError
    }

    return `❌ *REZERVIMI U REFUZUA*\n\n🆔 ID: ${appointmentId}\n📅 Data: ${appointment.appointment_date}\n🕐 Ora: ${appointment.start_time}\n\nKlienti do të njoftohet automatikisht.`
  } catch (error) {
    console.error('Error declining appointment:', error)
    return '❌ Gabim në refuzimin e rezervimit.'
  }
}

// ==============================================
// RESPONSE TEMPLATES
// ==============================================

export const SALON_RESPONSES = {
  MENU: `📋 *MENU SALONI*

Komanda të disponueshme:

🕐 *oraret* - Rezervimet e sotme
⏳ *pritje* - Kërkesa në pritje  
📅 *nesër* - Rezervimet e nesërme
✅ *aprovo [ID]* - Aprovo rezervimin
❌ *refuzo [ID]* - Refuzo rezervimin
❓ *ndihme* - Lista e komandave

Shembull: "aprovo 12345678"`,

  HELP: `❓ *NDIHMA - KOMANDA*

📋 *menu* - Shfaq menunë kryesore
🕐 *oraret* - Rezervimet e sotme
⏳ *pritje* - Kërkesa në pritje
📅 *nesër* - Rezervimet e nesërme

*Menaxhimi i rezervimeve:*
✅ *aprovo [ID]* - Aprovo rezervimin  
❌ *refuzo [ID]* - Refuzo rezervimin

*Shembuj:*
• "oraret" - shfaq rezervimet e sotme
• "aprovo 12345678" - aprovo rezervimin
• "refuzo 12345678" - refuzo rezervimin

📞 Për mbështetje: WhatsApp +355 69 xxx xxxx`,

  RATE_LIMIT: 'Ju lutemi prisni pak para se të dërgoni komandën tjetër. Maksimumi 10 komanda në orë.',

  UNKNOWN_COMMAND: (command: string) => `❓ Komandë e panjohur: "${command}"\n\nDërgoni "menu" për të parë opsionet e disponueshme.`,

  ERROR: '❌ Ka ndodhur një gabim. Ju lutemi provoni përsëri më vonë.'
} as const