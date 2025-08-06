// frontend/pages/api/customers/booking-history.ts
// Customer booking history API endpoint
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { isValidAlbanianPhone } from '../../../lib/twilio';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BookingHistoryItem {
  id: string;
  salon_name: string;
  service_name: string;
  appointment_date: string;
  start_time: string;
  status: string;
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  data?: BookingHistoryItem[];
  error?: {
    code: string;
    message: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Vetëm GET request-et janë të lejuara'
      }
    });
  }

  try {
    const { phone } = req.query;

    // Validate phone parameter
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PHONE',
          message: 'Numri i telefonit është i detyrueshëm'
        }
      });
    }

    if (!isValidAlbanianPhone(phone)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Numri i telefonit nuk është i vlefshëm'
        }
      });
    }

    console.log(`📖 Fetching booking history for phone: ${phone}`);

    // Query appointment history with joins
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        status,
        created_at,
        salons!inner (
          name
        ),
        services!inner (
          name
        ),
        customers!inner (
          phone
        )
      `)
      .eq('customers.phone', phone)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Gabim në leximin e të dhënave'
        }
      });
    }

    // Format the response
    const formattedHistory: BookingHistoryItem[] = appointments?.map(appointment => ({
      id: appointment.id,
      salon_name: (appointment.salons as unknown as { name: string })?.name || 'Salon i panjohur',
      service_name: (appointment.services as unknown as { name: string })?.name || 'Shërbim i panjohur',
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      status: appointment.status,
      created_at: appointment.created_at
    })) || [];

    console.log(`✅ Found ${formattedHistory.length} appointments for ${phone}`);

    return res.status(200).json({
      success: true,
      data: formattedHistory
    });

  } catch (error) {
    console.error('❌ Booking history error:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Gabim i brendshëm i serverit'
      }
    });
  }
}