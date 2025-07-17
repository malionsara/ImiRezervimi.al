// frontend/pages/api/twilio/webhook.ts
// Twilio webhook handler for WhatsApp message status updates
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { TwilioWebhookPayload } from '../../../../shared/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests from Twilio
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse Twilio webhook payload
    const payload: TwilioWebhookPayload = req.body;

    console.log('Twilio webhook received:', {
      MessageSid: payload.MessageSid,
      From: payload.From,
      To: payload.To,
      MessageStatus: payload.MessageStatus,
      ErrorCode: payload.ErrorCode,
      ErrorMessage: payload.ErrorMessage,
    });

    // Handle different message statuses
    switch (payload.MessageStatus) {
      case 'sent':
        await handleMessageSent(payload);
        break;
      
      case 'delivered':
        await handleMessageDelivered(payload);
        break;
      
      case 'failed':
      case 'undelivered':
        await handleMessageFailed(payload);
        break;
      
      default:
        console.log(`Unhandled message status: ${payload.MessageStatus}`);
    }

    // Respond to Twilio with 200 OK
    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    
    // Still return 200 to prevent Twilio retries for processing errors
    return res.status(200).json({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Handle message sent status
 */
async function handleMessageSent(payload: TwilioWebhookPayload): Promise<void> {
  console.log(`Message ${payload.MessageSid} sent successfully`);
  
  // TODO: Update notification status in database
  // await updateNotificationStatus(payload.MessageSid, 'sent');
}

/**
 * Handle message delivered status
 */
async function handleMessageDelivered(payload: TwilioWebhookPayload): Promise<void> {
  console.log(`Message ${payload.MessageSid} delivered successfully`);
  
  // TODO: Update notification status in database
  // await updateNotificationStatus(payload.MessageSid, 'delivered', new Date());
}

/**
 * Handle message failed status
 */
async function handleMessageFailed(payload: TwilioWebhookPayload): Promise<void> {
  console.error(`Message ${payload.MessageSid} failed:`, {
    ErrorCode: payload.ErrorCode,
    ErrorMessage: payload.ErrorMessage,
  });
  
  // TODO: Update notification status in database and handle retry logic
  // await updateNotificationStatus(payload.MessageSid, 'failed', null, payload.ErrorMessage);
  
  // TODO: Implement retry logic for failed messages
  // await scheduleMessageRetry(payload.MessageSid);
}

/**
 * Update notification status in database (placeholder)
 */
async function updateNotificationStatus(
  twilioSid: string,
  status: 'sent' | 'delivered' | 'failed',
  deliveredAt?: Date,
  errorMessage?: string
): Promise<void> {
  // TODO: Implement with Supabase
  console.log('Update notification status:', {
    twilioSid,
    status,
    deliveredAt,
    errorMessage,
  });
}