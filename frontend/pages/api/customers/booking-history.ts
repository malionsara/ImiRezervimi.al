// frontend/pages/api/customers/booking-history.ts
// Customer booking history API endpoint
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import type { NextAuthOptions } from 'next-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
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
  data?: {
    bookings: BookingHistoryItem[];
    total: number;
    pending: number;
    completed: number;
    approved: number;
    declined: number;
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
    // Get session for authentication
    const session = await getServerSession(req, res, authOptions as NextAuthOptions);
    
    if (!session?.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Duhet të jeni të identifikuar'
        }
      });
    }

    const { limit = 20 } = req.query;
    const limitNum = parseInt(limit as string);
    
    console.log(`📖 Fetching booking history for user: ${session.user.email}`);

    // First, find the customer by email from the session
    const { data: customerByEmail, error: customerError } = await supabase
      .from('customers')
      .select('id, phone, email')
      .eq('email', session.user.email)
      .maybeSingle();
    
    if (customerError && customerError.code !== 'PGRST116') {
      console.error('❌ Customer lookup error:', customerError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Gabim në leximin e të dhënave'
        }
      });
    }

    let customer = customerByEmail
    
    // Fallback: try by session user id if available
    if (!customer && (session as any)?.user?.id) {
      const { data: customerById } = await supabase
        .from('customers')
        .select('id, phone, email')
        .eq('id', (session as any).user.id)
        .maybeSingle();
      customer = customerById as any
    }

    if (!customer) {
      // No bookings found for this user
      return res.status(200).json({
        success: true,
        data: {
          bookings: [],
          total: 0,
          pending: 0,
          completed: 0,
          approved: 0,
          declined: 0
        }
      });
    }

    // Query appointment history with joins
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        status,
        service_name,
        service_price,
        customer_notes,
        salon_notes,
        requested_at,
        responded_at,
        salons!inner (
          name,
          address,
          city
        )
      `)
      .eq('customer_id', customer.id)
      .order('requested_at', { ascending: false })
      .limit(limitNum);

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

    // Format the response and calculate stats
    const formattedHistory: BookingHistoryItem[] = appointments?.map(appointment => ({
      id: appointment.id,
      salon_name: (appointment.salons as any)?.name || 'Salon i panjohur',
      service_name: appointment.service_name || 'Shërbim i panjohur',
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      status: appointment.status,
      service_price: appointment.service_price,
      customer_notes: appointment.customer_notes,
      salon_notes: appointment.salon_notes,
      requested_at: appointment.requested_at,
      responded_at: appointment.responded_at,
      created_at: appointment.requested_at
    })) || [];

    // Calculate statistics
    const stats = {
      total: formattedHistory.length,
      pending: formattedHistory.filter(a => a.status === 'pending').length,
      approved: formattedHistory.filter(a => a.status === 'approved').length,
      completed: formattedHistory.filter(a => a.status === 'completed').length,
      declined: formattedHistory.filter(a => a.status === 'declined').length
    };

    console.log(`✅ Found ${formattedHistory.length} appointments for customer ${customer.id}`);

    return res.status(200).json({
      success: true,
      data: {
        bookings: formattedHistory,
        ...stats
      }
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