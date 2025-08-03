# Twilio WhatsApp Integration - ImiRezervimi.al

## Overview

This module provides WhatsApp messaging functionality for the Albanian beauty salon booking platform using Twilio's WhatsApp Business API.

## Features

- ✅ Albanian message templates for all booking scenarios
- ✅ Phone number validation for Albanian format (+355)
- ✅ Automatic retry logic with exponential backoff
- ✅ Webhook handling for message status updates
- ✅ Test endpoints for development
- ✅ Comprehensive error handling
- ✅ Message delivery tracking

## Setup Instructions

### 1. Twilio Account Setup

1. Create account at [console.twilio.com](https://console.twilio.com)
2. Get your Account SID and Auth Token from the Console Dashboard
3. Enable WhatsApp Sandbox for testing:
   - Go to Messaging → Try it out → Send a WhatsApp message
   - Send "join [your-sandbox-name]" to +14155238886 from your WhatsApp
   - Your phone number is now connected to the sandbox

### 2. Environment Variables

Add these to your `.env.local` file:

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
TWILIO_TEST_PHONE_NUMBER=+355691234567
```

### 3. Production Setup

For production, you'll need to:
1. Apply for WhatsApp Business API approval
2. Get your own WhatsApp Business number
3. Set up message templates with WhatsApp
4. Configure webhooks for status updates

## Usage

### Send Notification with Template

```typescript
import { sendNotification } from '../lib/twilio';

// Send booking confirmation
await sendNotification('booking_approved', '+355691234567', {
  salonName: 'Klea Nails Studio',
  date: '25 Korrik 2025',
  time: '14:30'
});
```

### Send Custom Message

```typescript
import { sendWhatsAppMessage } from '../lib/twilio';

await sendWhatsAppMessage(
  '+355691234567',
  'Përshëndetje nga ImiRezervimi.al! 👋'
);
```

### API Endpoints

#### POST /api/twilio/send-whatsapp

Send WhatsApp message via API:

```javascript
const response = await fetch('/api/twilio/send-whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '+355691234567',
    type: 'booking_approved',
    params: {
      salonName: 'Klea Nails Studio',
      date: '25 Korrik 2025',
      time: '14:30'
    }
  })
});
```

#### POST /api/twilio/webhook

Handles Twilio webhook callbacks for message status updates.

#### GET /api/twilio/test

Development-only endpoint for testing different message types:

```
/api/twilio/test?type=booking_request&phone=+355691234567
```

## Albanian Message Templates

### Booking Request Sent
```
Kërkesa u dërgua te {salonName} për {date} në {time}. Do të njoftoheni brenda 2 orësh! 💅

📱 ImiRezervimi.al
```

### Booking Approved
```
🎉 Rezervimi u bë me sukses!

{salonName} ju mirëpret {date} në {time}! ✨

📱 ImiRezervimi.al
```

### Booking Declined
```
Na vjen keq, {salonName} nuk mund të ju pranojë këtë herë. {reason} 🙏

📱 ImiRezervimi.al
```

### 24-Hour Reminder
```
⏰ Kujtesë: Nesër në {time} te {salonName}.

Shihemi atje! 💅

📱 ImiRezervimi.al
```

### New Request for Salon
```
📋 Kërkesë e re nga {customerName}

🎯 Shërbimi: {service}
📅 Data: {date} në {time}

Shikoni dashboard-in tuaj! 📱

💼 ImiRezervimi.al
```

## Testing

### Development Test Page

Visit `/twilio-test` in development to access the test panel with:
- Connection testing
- Template message testing
- Custom message sending
- Environment validation

### Test Types Available

- `connection` - Basic connection test
- `booking_request` - Test booking request template
- `booking_approved` - Test booking approved template
- `booking_declined` - Test booking declined template
- `reminder` - Test 24h reminder template
- `salon_notification` - Test salon notification template

## Error Handling

The integration includes comprehensive error handling:

- **Invalid phone numbers** - Validates Albanian format (+355XXXXXXXX)
- **Network failures** - Automatic retry with exponential backoff
- **Rate limiting** - Respects Twilio API limits
- **Message failures** - Logs and tracks failed deliveries
- **Webhook errors** - Graceful handling of status updates

## Phone Number Validation

All phone numbers must be in Albanian format:
- Valid: `+355691234567`, `+35569123456`
- Invalid: `0691234567`, `355691234567`, `+1234567890`

The system automatically formats numbers when possible.

## Monitoring & Logging

All messages are logged with:
- Timestamp
- Recipient phone number
- Message content
- Twilio SID
- Delivery status
- Error details (if any)

## Security Considerations

- Environment variables are validated on startup
- Webhook endpoints verify Twilio signatures (TODO)
- Test endpoints are disabled in production
- Phone numbers are validated before sending
- Rate limiting prevents abuse

## Troubleshooting

### Common Issues

1. **"Missing required environment variable"**
   - Check all Twilio env vars are set in `.env.local`

2. **"Invalid Albanian phone number format"**
   - Ensure phone numbers start with +355

3. **"WhatsApp sandbox not connected"**
   - Send "join [sandbox-name]" to +14155238886

4. **"Message failed to send"**
   - Check Twilio console for detailed error messages
   - Verify account balance and limits

### Debug Mode

Set `NODE_ENV=development` to enable:
- Detailed error logging
- Test endpoints
- Stack traces in API responses

## New Integration Points ✨

### Automatic Notifications

The WhatsApp system is now fully integrated into your booking flow:

1. **Customer Books Appointment** → Automatic confirmation via WhatsApp
2. **Salon Receives Notification** → New booking alert via WhatsApp  
3. **Salon Approves/Declines** → Customer gets instant WhatsApp update
4. **24-Hour Reminders** → Automatic reminder system via cron job

### API Integration Points

- `POST /api/appointments/request` - Sends customer confirmation + salon notification
- `PUT /api/appointments/[id]/status` - Sends approval/decline notifications
- `POST /api/appointments/reminders` - Sends 24-hour reminders (cron job)

### Testing Interface

Visit `/test-whatsapp-flow` to test all notification types with your phone number.

## Production Checklist

- [ ] WhatsApp Business API approved
- [ ] Production WhatsApp number configured
- [ ] Message templates approved by WhatsApp
- [ ] Webhook URLs configured in Twilio
- [ ] Environment variables set in production (including CRON_SECRET)
- [ ] Test endpoints disabled
- [ ] Monitoring and alerting configured
- [ ] GitHub Actions cron job configured
- [ ] Database schema updated with reminder_sent column

## Files Structure

```
frontend/
├── lib/
│   ├── twilio.ts              # Main Twilio integration
│   └── README-Twilio.md       # This documentation
├── pages/api/twilio/
│   ├── send-whatsapp.ts       # Send message API
│   ├── webhook.ts             # Webhook handler
│   └── test.ts                # Test endpoint
├── components/
│   └── TwilioTestPanel.tsx    # Test UI component
└── pages/
    └── twilio-test.tsx        # Test page
```

## Contributing

When modifying the Twilio integration:

1. Update Albanian message templates carefully
2. Test all changes with the test panel
3. Update this documentation
4. Ensure backward compatibility
5. Add appropriate error handling

---

**Generated with Claude Code** 🤖  
**Co-Authored-By:** Claude <noreply@anthropic.com>