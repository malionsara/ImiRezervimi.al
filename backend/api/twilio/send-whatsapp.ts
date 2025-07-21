// frontend/pages/api/twilio/send-whatsapp.ts
// API endpoint for sending WhatsApp messages
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { sendWhatsAppMessage, sendNotification, isValidAlbanianPhone } from '../../lib/twilio';
import { ApiResponse, NotificationType } from '../../../shared/types';

interface SendWhatsAppRequest {
  to: string;
  message?: string;
  type?: NotificationType;
  params?: Record<string, string>;
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
        message: 'Only POST requests are allowed',
      },
    });
  }

  try {
    const { to, message, type, params }: SendWhatsAppRequest = req.body;

    // Validate required fields
    if (!to) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PHONE',
          message: 'Phone number is required',
        },
      });
    }

    // Validate Albanian phone number format
    if (!isValidAlbanianPhone(to)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Numri i telefonit duhet të jetë në formatin +355XXXXXXXX',
        },
      });
    }

    let result;

    // Send using template or direct message
    if (type && params) {
      // Send using Albanian template
      result = await sendNotification(type, to, params);
    } else if (message) {
      // Send direct message
      result = await sendWhatsAppMessage(to, message);
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CONTENT',
          message: 'Either message or type+params are required',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        sid: result.sid,
        status: result.status,
        to,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: unknown) {
    console.error('WhatsApp send error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to send WhatsApp message';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return res.status(500).json({
      success: false,
      error: {
        code: 'WHATSAPP_ERROR',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
    });
  }
}