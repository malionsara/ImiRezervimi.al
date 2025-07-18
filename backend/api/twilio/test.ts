// frontend/pages/api/twilio/test.ts
// Test endpoint for Twilio WhatsApp integration
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { testWhatsAppConnection, sendNotification } from '../../../lib/twilio';
import { ApiResponse } from '../../../../shared/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests in development
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET requests are allowed',
      },
    });
  }

  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Test endpoint not available in production',
      },
    });
  }

  try {
    const testType = req.query.type as string;
    const testPhone = req.query.phone as string || process.env.TWILIO_TEST_PHONE_NUMBER;

    if (!testPhone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PHONE',
          message: 'Test phone number required. Set TWILIO_TEST_PHONE_NUMBER or pass ?phone=+355XXXXXXXX',
        },
      });
    }

    let result;

    switch (testType) {
      case 'connection':
        // Test basic connection
        const connectionTest = await testWhatsAppConnection();
        result = { connectionTest, message: 'Connection test completed' };
        break;

      case 'booking_request':
        // Test booking request template
        result = await sendNotification('booking_request', testPhone, {
          salonName: 'Klea Nails Studio',
          date: '25 Korrik 2025',
          time: '14:30',
        });
        break;

      case 'booking_approved':
        // Test booking approved template
        result = await sendNotification('booking_approved', testPhone, {
          salonName: 'Klea Nails Studio',
          date: '25 Korrik 2025',
          time: '14:30',
        });
        break;

      case 'booking_declined':
        // Test booking declined template
        result = await sendNotification('booking_declined', testPhone, {
          salonName: 'Klea Nails Studio',
          reason: 'Kjo orë është e zënë',
        });
        break;

      case 'reminder':
        // Test reminder template
        result = await sendNotification('reminder_24h', testPhone, {
          salonName: 'Klea Nails Studio',
          date: 'nesër',
          time: '14:30',
        });
        break;

      case 'salon_notification':
        // Test salon notification template
        result = await sendNotification('new_request_salon', testPhone, {
          customerName: 'Ana Hoxha',
          service: 'Manikyr + Nail Art',
          date: '25 Korrik 2025',
          time: '14:30',
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TEST_TYPE',
            message: 'Valid test types: connection, booking_request, booking_approved, booking_declined, reminder, salon_notification',
          },
        });
    }

    return res.status(200).json({
      success: true,
      data: {
        testType,
        testPhone,
        result,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });

  } catch (error: unknown) {
    console.error('Twilio test error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Test failed';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return res.status(500).json({
      success: false,
      error: {
        code: 'TEST_ERROR',
        message: errorMessage,
        details: errorStack,
      },
    });
  }
}