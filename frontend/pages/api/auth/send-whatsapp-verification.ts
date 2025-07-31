// frontend/pages/api/auth/send-whatsapp-verification.ts
// API endpoint for sending WhatsApp verification codes
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { sendWhatsAppVerification } from '../../../lib/whatsapp';
import { cleanupExpiredCodes } from '../../../lib/sms';
import { isValidAlbanianPhone } from '../../../lib/twilio';

interface ApiResponse {
  success: boolean;
  data?: {
    messageSid?: string;
    phone: string;
    timestamp: string;
    expiresIn: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface SendWhatsAppVerificationRequest {
  phone: string;
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
    // Clean up expired codes periodically (10% chance)
    if (Math.random() < 0.1) {
      cleanupExpiredCodes().catch(console.error);
    }

    const { phone }: SendWhatsAppVerificationRequest = req.body;

    // Validate required fields
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PHONE',
          message: 'Numri i telefonit është i nevojshëm',
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

    console.log(`WhatsApp verification request from ${xForwardedFor} for ${phone}`);

    // Send WhatsApp verification
    const result = await sendWhatsAppVerification(phone);

    if (!result.success) {
      // Rate limit or other WhatsApp error
      const statusCode = result.error?.includes('prisni') ? 429 : 500;
      
      return res.status(statusCode).json({
        success: false,
        error: {
          code: statusCode === 429 ? 'RATE_LIMITED' : 'WHATSAPP_ERROR',
          message: result.error || 'Gabim në dërgimin e mesazhit në WhatsApp',
        },
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      data: {
        messageSid: result.messageSid,
        phone,
        timestamp: new Date().toISOString(),
        expiresIn: 300, // 5 minutes in seconds
      },
    });

  } catch (error: unknown) {
    console.error('Send WhatsApp verification error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Gabim i brendshëm i serverit';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Gabim në dërgimin e kodit të verifikimit në WhatsApp',
        details: process.env.NODE_ENV === 'development' ? { error: errorMessage, stack: errorStack } : undefined,
      },
    });
  }
}