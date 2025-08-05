// frontend/pages/api/appointments/reminders.ts
// 24-hour appointment reminder system for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/appointments';
import { sendNotification } from '../../../lib/twilio';

interface CustomerData {
  first_name: string;
  last_name: string;
  phone: string;
}

interface SalonData {
  name: string;
  address: string;
}

interface AppointmentWithRelations {
  id: string;
  appointment_date: string;
  start_time: string;
  service_name: string;
  customer: CustomerData;
  salon: SalonData;
}

interface ApiResponse {
  success: boolean;
  data?: {
    remindersSent: number;
    errors: number;
    details: Array<{
      appointmentId: string;
      customerPhone: string;
      status: 'sent' | 'failed';
      error?: string;
    }>;
  };
  error?: {
    code: string;
    message: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Vetëm kërkesat POST janë të lejuara',
      },
    });
  }

  try {
    // Authorization check - only allow if coming from cron job or admin
    const authToken = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authToken !== `Bearer ${cronSecret}`) {
      console.log('⚠️ Unauthorized reminder request');
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Nuk jeni të autorizuar',
        },
      });
    }

    console.log('🕐 Starting 24-hour reminder job...');

    // Find appointments that need reminders (24 hours from now, approved status)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        service_name,
        customer:customers!customer_id(
          first_name,
          last_name,
          phone
        ),
        salon:salons!salon_id(
          name,
          address
        )
      `)
      .eq('status', 'approved')
      .eq('appointment_date', tomorrowDateStr)
      .is('reminder_sent', null); // Only send if reminder hasn't been sent

    if (error) {
      console.error('❌ Error fetching appointments for reminders:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Gabim në bazën e të dhënave',
        },
      });
    }

    if (!appointments || appointments.length === 0) {
      console.log('✅ No appointments need reminders today');
      return res.status(200).json({
        success: true,
        data: {
          remindersSent: 0,
          errors: 0,
          details: [],
        },
      });
    }

    console.log(`📋 Found ${appointments.length} appointments needing reminders`);

    // Send reminders
    const results = [];
    let sentCount = 0;
    let errorCount = 0;

    for (const appointment of appointments as AppointmentWithRelations[]) {
      try {
        const customer = appointment.customer;
        const salon = appointment.salon;
        const customerPhone = customer?.phone;
        
        if (!customerPhone) {
          console.log(`⚠️ No phone number for appointment ${appointment.id}`);
          continue;
        }

        const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('sq-AL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        // Send reminder notification
        await sendNotification('reminder_24h', customerPhone, {
          salonName: salon?.name || 'Salloni',
          date: appointmentDate,
          time: appointment.start_time
        });

        // Mark reminder as sent
        await supabaseAdmin
          .from('appointments')
          .update({ 
            reminder_sent: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', appointment.id);

        results.push({
          appointmentId: appointment.id,
          customerPhone,
          status: 'sent' as const,
        });

        sentCount++;
        console.log(`✅ Reminder sent for appointment ${appointment.id}`);

      } catch (error) {
        console.error(`❌ Failed to send reminder for appointment ${appointment.id}:`, error);
        
        results.push({
          appointmentId: appointment.id,
          customerPhone: appointment.customer?.phone || 'unknown',
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        errorCount++;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`🎯 Reminder job completed: ${sentCount} sent, ${errorCount} errors`);

    return res.status(200).json({
      success: true,
      data: {
        remindersSent: sentCount,
        errors: errorCount,
        details: results,
      },
    });

  } catch (error) {
    console.error('❌ Reminder job failed:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ka ndodhur një gabim në sistemin e kujtesave',
      },
    });
  }
}