# WhatsApp Direct Approval Implementation Plan

## Overview

Enable salons to approve/decline appointment requests directly from WhatsApp messages using interactive buttons, eliminating the need to access the dashboard for simple decisions.

## Technical Implementation

### 1. Enhanced WhatsApp Templates

**Current template:** `salon_new_request`
```
📋 Kërkesë e re nga {{1}}
🎯 Shërbimi: {{2}}
📅 {{3}} në {{4}}
📞 Tel: {{5}}
Shikoni dashboard-in tuaj për të aprovuar!
```

**NEW Interactive template:** `salon_new_request_interactive`
```
📋 *Kërkesë e re rezervimi*

👤 {{1}} dëshiron të rezervojë:
💅 {{2}}
📅 {{3}} në {{4}}
📞 {{5}}

⚡ Përgjigjuni direkt:
```

**Interactive Buttons:**
- ✅ **Pranoj** (Quick Reply - ID: `approve_{{appointmentId}}`)
- ❌ **Refuzoj** (Quick Reply - ID: `decline_{{appointmentId}}`)
- 📱 **Dashboard** (URL Button - opens salon dashboard)

### 2. Webhook Endpoint Implementation

**File:** `frontend/pages/api/twilio/webhook.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { updateAppointmentStatus } from '../../../lib/appointments';
import { sendWhatsAppTemplate } from '../../../lib/whatsapp';

interface TwilioWebhookPayload {
  From: string;          // whatsapp:+355691234567
  To: string;            // whatsapp:+14155238886  
  Body: string;          // "Pranoj" or "Refuzoj"
  ButtonText?: string;   // Button text that was clicked
  ButtonPayload?: string; // Button ID: "approve_{{appointmentId}}"
  MessageSid: string;
  AccountSid: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload: TwilioWebhookPayload = req.body;
    
    // Verify webhook authenticity (Twilio signature validation)
    // TODO: Implement Twilio signature validation for security
    
    // Extract appointment ID from button payload
    const buttonPayload = payload.ButtonPayload || '';
    const appointmentMatch = buttonPayload.match(/^(approve|decline)_(.+)$/);
    
    if (!appointmentMatch) {
      console.log('Non-button message received:', payload.Body);
      return res.status(200).json({ message: 'Message processed' });
    }
    
    const [, action, appointmentId] = appointmentMatch;
    const salonPhone = payload.From.replace('whatsapp:', '');
    
    console.log(`WhatsApp ${action} action for appointment ${appointmentId} from ${salonPhone}`);
    
    // Validate salon owns this appointment
    const appointment = await validateSalonAppointment(appointmentId, salonPhone);
    if (!appointment) {
      await sendErrorMessage(salonPhone, 'Rezervimi nuk u gjet ose nuk i përket salonit tuaj.');
      return res.status(200).json({ message: 'Invalid appointment' });
    }
    
    // Process approval/decline
    if (action === 'approve') {
      await handleApproval(appointmentId, salonPhone, appointment);
    } else if (action === 'decline') {
      await handleDecline(appointmentId, salonPhone, appointment);
    }
    
    return res.status(200).json({ message: 'Action processed successfully' });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleApproval(appointmentId: string, salonPhone: string, appointment: any) {
  try {
    // Update appointment status
    const result = await updateAppointmentStatus(appointmentId, {
      status: 'approved',
      salonNotes: 'Aprovuar nga WhatsApp'
    });
    
    if (result.success) {
      // Send confirmation to salon
      await sendWhatsAppTemplate(salonPhone, 'APPROVAL_CONFIRMATION', {
        customerName: appointment.customer.name,
        date: appointment.date,
        time: appointment.time
      });
      
      // Send approval notification to customer
      await sendWhatsAppTemplate(appointment.customer.phone, 'BOOKING_APPROVED', {
        salonName: appointment.salon.name,
        date: appointment.date,
        time: appointment.time
      });
      
      console.log(`✅ Appointment ${appointmentId} approved via WhatsApp`);
    }
  } catch (error) {
    console.error('Approval processing error:', error);
    await sendErrorMessage(salonPhone, 'Gabim në aprovimin e rezervimit. Provoni përsëri.');
  }
}

async function handleDecline(appointmentId: string, salonPhone: string, appointment: any) {
  try {
    // Update appointment status
    const result = await updateAppointmentStatus(appointmentId, {
      status: 'declined',
      salonNotes: 'Refuzuar nga WhatsApp'
    });
    
    if (result.success) {
      // Send confirmation to salon
      await sendWhatsAppTemplate(salonPhone, 'DECLINE_CONFIRMATION', {
        customerName: appointment.customer.name,
        date: appointment.date,
        time: appointment.time
      });
      
      // Send decline notification to customer
      await sendWhatsAppTemplate(appointment.customer.phone, 'BOOKING_DECLINED', {
        salonName: appointment.salon.name,
        reason: 'Saloni nuk është i disponueshëm për këtë kohë'
      });
      
      console.log(`❌ Appointment ${appointmentId} declined via WhatsApp`);
    }
  } catch (error) {
    console.error('Decline processing error:', error);
    await sendErrorMessage(salonPhone, 'Gabim në refuzimin e rezervimit. Provoni përsëri.');
  }
}
```

### 3. Additional Templates Needed

**Approval Confirmation (for salon):**
```
✅ *Rezervimi u Aprovua*

👤 {{1}} - {{2}} në {{3}}
📱 Klienti do të njoftohet automatikisht

💼 ImiRezervimi.al
```

**Decline Confirmation (for salon):**
```
❌ *Rezervimi u Refuzua*

👤 {{1}} - {{2}} në {{3}}
📱 Klienti do të njoftohet automatikisht

💼 ImiRezervimi.al
```

### 4. Webhook Configuration

**Twilio Console Setup:**
1. Go to WhatsApp Senders in Twilio Console
2. Set webhook URL: `https://imirezervimi.al/api/twilio/webhook`
3. Select HTTP POST method
4. Enable message status callbacks

**Environment Variables:**
```env
TWILIO_WEBHOOK_URL=https://imirezervimi.al/api/twilio/webhook
TWILIO_AUTH_TOKEN=your_twilio_auth_token  # For signature validation
```

### 5. Security Considerations

**Webhook Signature Validation:**
```typescript
import { validateRequest } from 'twilio';

const isValidWebhook = validateRequest(
  process.env.TWILIO_AUTH_TOKEN!,
  twilioSignature,
  webhookUrl,
  req.body
);

if (!isValidWebhook) {
  return res.status(403).json({ error: 'Invalid signature' });
}
```

**Rate Limiting:**
- Prevent spam button clicks
- Track and limit rapid successive actions
- Implement cooldown periods

### 6. Error Handling

**Common Scenarios:**
- Appointment already processed by another salon member
- Invalid appointment ID in button payload
- Salon phone number not found in system
- Network timeouts during processing

**Error Messages (Albanian):**
- "Rezervimi është procesuar tashmë nga dikush tjetër."
- "Rezervimi nuk u gjet në sistem."
- "Gabim teknik. Kontaktoni mbështetjen."

### 7. Fallback Mechanisms

**Dashboard Always Available:**
- Include dashboard URL button in all messages
- Maintain existing dashboard functionality
- Sync WhatsApp actions with dashboard in real-time

**Message Expiry:**
- Set expiration time for interactive buttons (e.g., 24 hours)
- Send reminder if no action taken within 2 hours
- Auto-decline after 24 hours of inactivity

### 8. Analytics and Tracking

**Metrics to Track:**
- WhatsApp approval vs dashboard approval rates
- Response time improvement with direct approval
- Error rates and webhook failures
- User adoption of WhatsApp vs dashboard

**Database Schema Addition:**
```sql
ALTER TABLE appointments 
ADD COLUMN approval_method VARCHAR(20) DEFAULT 'dashboard';
-- Values: 'dashboard', 'whatsapp', 'auto'

ALTER TABLE appointments
ADD COLUMN webhook_processed_at TIMESTAMP WITH TIME ZONE;
```

### 9. Testing Strategy

**Webhook Testing:**
- Use ngrok for local webhook testing
- Test with Twilio sandbox numbers
- Validate button payloads and responses
- Test concurrent button clicks

**Integration Testing:**
- Test complete approval flow from WhatsApp
- Verify customer notifications are sent
- Test error scenarios and fallbacks
- Validate dashboard sync

### 10. Deployment Checklist

- [ ] Create interactive WhatsApp templates in Twilio
- [ ] Implement webhook endpoint with security
- [ ] Configure webhook URL in Twilio console
- [ ] Add environment variables to production
- [ ] Test webhook with production numbers
- [ ] Monitor webhook logs and errors
- [ ] Update salon onboarding documentation

## Benefits

1. **Faster Response Times:** Salons can approve/decline without opening dashboard
2. **Better Mobile Experience:** Native WhatsApp interface vs web dashboard
3. **Reduced Friction:** One-tap approval vs multi-step dashboard process
4. **Higher Engagement:** Salons more likely to respond quickly via WhatsApp
5. **Improved Customer Experience:** Faster confirmations for customers

## Timeline

**Phase 1 (Week 1):** Webhook endpoint and basic approval/decline
**Phase 2 (Week 2):** Interactive templates and button integration  
**Phase 3 (Week 3):** Security, error handling, and testing
**Phase 4 (Week 4):** Production deployment and monitoring

## Related Issues

- **Extends:** Issue #22 - MONDAY_2048009336 (Appointment approval workflow)
- **Requires:** Issue #20 - MONDAY_2048009333 (WhatsApp notification system)
- **Integrates with:** Issue #19 - MONDAY_2048009332 (Salon dashboard)

---

**Implementation Priority:** High  
**Estimated Effort:** 2-3 weeks  
**Impact:** Significantly improves salon user experience and response times