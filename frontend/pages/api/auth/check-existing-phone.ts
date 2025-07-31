// frontend/pages/api/auth/check-existing-phone.ts
// API endpoint for checking if user has existing phone number
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface ApiResponse {
  success: boolean;
  phone?: string;
  error?: {
    code: string;
    message: string;
  };
}

interface CheckExistingPhoneRequest {
  email: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
        message: 'Only POST requests are allowed',
      },
    });
  }

  try {
    const { email }: CheckExistingPhoneRequest = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email is required',
        },
      });
    }

    // Check if user exists in database and has a phone number
    const { data, error } = await supabase
      .from('customers')
      .select('phone_number')
      .eq('email', email)
      .single();

    if (error) {
      // User doesn't exist or database error
      if (error.code === 'PGRST116') {
        // No rows returned - user doesn't exist yet
        return res.status(200).json({
          success: true,
        });
      }
      
      console.error('Database error checking existing phone:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error checking existing phone number',
        },
      });
    }

    // Return phone number if it exists
    return res.status(200).json({
      success: true,
      phone: data.phone_number || undefined,
    });

  } catch (error: unknown) {
    console.error('Check existing phone error:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  }
}