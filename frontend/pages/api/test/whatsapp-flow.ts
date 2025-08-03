// frontend/pages/api/test/whatsapp-flow.ts
// End-to-end WhatsApp notification flow testing for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { sendNotification, sendWhatsAppMessage } from '../../../lib/twilio';

interface TestResult {
  test: string;
  status: 'success' | 'failed';
  message: string;
  data?: any;
  error?: string;
}

interface ApiResponse {
  success: boolean;
  results?: TestResult[];
  summary?: {
    total: number;
    passed: number;
    failed: number;
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
  // Only allow in development or with proper auth
  if (process.env.NODE_ENV === 'production') {
    const authToken = req.headers.authorization;
    const testSecret = process.env.TEST_SECRET;
    
    if (!testSecret || authToken !== `Bearer ${testSecret}`) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Test endpoint only available in development or with proper authorization',
        },
      });
    }
  }

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

  const { testPhone, testType = 'all' } = req.body;

  if (!testPhone) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PHONE',
        message: 'Test phone number is required in request body',
      },
    });
  }

  console.log(`🧪 Starting WhatsApp flow tests for phone: ${testPhone}`);

  const results: TestResult[] = [];

  // Test 1: Basic WhatsApp message
  if (testType === 'all' || testType === 'basic') {
    try {
      await sendWhatsAppMessage(testPhone, 'Test mesazh nga ImiRezervimi.al! 🧪');
      results.push({
        test: 'Basic WhatsApp Message',
        status: 'success',
        message: 'Basic message sent successfully',
      });
    } catch (error) {
      results.push({
        test: 'Basic WhatsApp Message',
        status: 'failed',
        message: 'Failed to send basic message',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Test 2: Booking request confirmation (customer)
  if (testType === 'all' || testType === 'booking_request') {
    try {
      await sendNotification('booking_request', testPhone, {
        salonName: 'Klea Nails Studio',
        date: '15 Janar 2025',
        time: '14:30'
      });
      results.push({
        test: 'Booking Request Confirmation',
        status: 'success',
        message: 'Customer booking confirmation sent successfully',
      });
    } catch (error) {
      results.push({
        test: 'Booking Request Confirmation',
        status: 'failed',
        message: 'Failed to send booking request confirmation',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Test 3: Booking approved notification
  if (testType === 'all' || testType === 'booking_approved') {
    try {
      await sendNotification('booking_approved', testPhone, {
        salonName: 'Klea Nails Studio',
        date: '15 Janar 2025',
        time: '14:30'
      });
      results.push({
        test: 'Booking Approved Notification',
        status: 'success',
        message: 'Booking approved notification sent successfully',
      });
    } catch (error) {
      results.push({
        test: 'Booking Approved Notification',
        status: 'failed',
        message: 'Failed to send booking approved notification',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Test 4: Booking declined notification
  if (testType === 'all' || testType === 'booking_declined') {
    try {
      await sendNotification('booking_declined', testPhone, {
        salonName: 'Klea Nails Studio',
        reason: 'Nuk ka vende të lira për këtë kohë'
      });
      results.push({
        test: 'Booking Declined Notification',
        status: 'success',
        message: 'Booking declined notification sent successfully',
      });
    } catch (error) {
      results.push({
        test: 'Booking Declined Notification',
        status: 'failed',
        message: 'Failed to send booking declined notification',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Test 5: Salon notification (new booking)
  if (testType === 'all' || testType === 'salon_notification') {
    try {
      await sendNotification('new_request_salon', testPhone, {
        customerName: 'Maria Kurti',
        service: 'Manikyri',
        date: '15 Janar 2025',
        time: '14:30'
      });
      results.push({
        test: 'Salon New Booking Notification',
        status: 'success',
        message: 'Salon notification sent successfully',
      });
    } catch (error) {
      results.push({
        test: 'Salon New Booking Notification',
        status: 'failed',
        message: 'Failed to send salon notification',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Test 6: 24-hour reminder
  if (testType === 'all' || testType === 'reminder') {
    try {
      await sendNotification('reminder_24h', testPhone, {
        salonName: 'Klea Nails Studio',
        date: '15 Janar 2025',
        time: '14:30'
      });
      results.push({
        test: '24-Hour Reminder',
        status: 'success',
        message: '24-hour reminder sent successfully',
      });
    } catch (error) {
      results.push({
        test: '24-Hour Reminder',
        status: 'failed',
        message: 'Failed to send 24-hour reminder',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Calculate summary
  const total = results.length;
  const passed = results.filter(r => r.status === 'success').length;
  const failed = total - passed;

  const summary = { total, passed, failed };

  console.log(`🧪 WhatsApp flow tests completed: ${passed}/${total} passed`);

  return res.status(200).json({
    success: true,
    results,
    summary,
  });
}