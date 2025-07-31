// frontend/pages/api/auth/verify-whatsapp.ts
// API endpoint for verifying WhatsApp verification codes
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyWhatsAppCode } from '../../../lib/whatsapp';
import { isValidAlbanianPhone } from '../../../lib/twilio';

interface ApiResponse {
  success: boolean;
  data?: {
    phone: string;
    verified: boolean;
    timestamp: string;
    attemptsRemaining?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface VerifyWhatsAppRequest {
  phone: string;
  code: string;
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
    const { phone, code }: VerifyWhatsAppRequest = req.body;

    // Validate required fields
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Numri i telefonit dhe kodi janë të nevojshëm',
        },
      });
    }

    // Validate phone number format
    if (typeof phone !== 'string' || !isValidAlbanianPhone(phone)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Numri i telefonit duhet të jetë në formatin +355XXXXXXXX',
        },
      });
    }

    // Validate code format (6 digits)
    if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CODE',
          message: 'Kodi duhet të jetë 6 shifra',
        },
      });
    }

    // Additional security checks
    const userAgent = req.headers['user-agent'] || '';
    const xForwardedFor = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Simple bot detection
    if (userAgent.length < 10 || userAgent.toLowerCase().includes('bot')) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'SUSPICIOUS_REQUEST',
          message: 'Kërkesë e dyshimtë. Provoni përsëri më vonë.',
        },
      });
    }

    console.log(`WhatsApp verification attempt from ${xForwardedFor} for ${phone} with code ${code}`);

    // Verify WhatsApp code
    const result = await verifyWhatsAppCode(phone, code);

    if (!result.success) {
      // Verification failed
      const statusCode = result.error?.includes('shumë përpjekje') ? 429 : 400;
      
      return res.status(statusCode).json({
        success: false,
        error: {
          code: statusCode === 429 ? 'TOO_MANY_ATTEMPTS' : 'VERIFICATION_FAILED',
          message: result.error || 'Verifikimi dështoi',
        },
        data: {
          phone,
          verified: false,
          timestamp: new Date().toISOString(),
          attemptsRemaining: result.attemptsRemaining,
        },
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      data: {
        phone,
        verified: result.verified,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: unknown) {
    console.error('Verify WhatsApp code error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Gabim i brendshëm i serverit';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Gabim në verifikimin e kodit të WhatsApp',
        details: process.env.NODE_ENV === 'development' ? { error: errorMessage, stack: errorStack } : undefined,
      },
    });
  }
}