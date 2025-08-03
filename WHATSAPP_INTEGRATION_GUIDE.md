# WhatsApp Integration Setup Guide - ImiRezervimi.al

## 🎉 Your WhatsApp Integration is Ready!

Your Twilio WhatsApp system has been successfully integrated into your Albanian beauty salon booking platform. Here's everything you need to know to get it running.

## 🚀 What's Been Integrated

### ✅ Automatic Notifications
- **Customer booking confirmation** - When customers request appointments
- **Salon new booking alerts** - When salons receive new requests  
- **Approval/decline notifications** - When salons respond to requests
- **24-hour appointment reminders** - Automated daily reminders

### ✅ API Integration Points
- `POST /api/appointments/request` - Triggers customer + salon notifications
- `PUT /api/appointments/[id]/status` - Sends approval/decline notifications  
- `POST /api/appointments/reminders` - Automated reminder system
- `POST /api/test/whatsapp-flow` - End-to-end testing endpoint

### ✅ Albanian Message Templates
All messages are in Albanian with proper formatting:
- Booking confirmations with salon details
- Approval notifications with appointment info
- Reminder messages 24 hours before appointments
- Professional salon notifications for new requests

## 🔧 Required Environment Variables

Add these to your `.env.local` (development) and Vercel environment (production):

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token  
TWILIO_WHATSAPP_NUMBER=+14155238886  # Use sandbox number for testing
TWILIO_TEST_PHONE_NUMBER=+355691234567  # Your test phone number

# Cron Job Security
CRON_SECRET=your_secure_random_string_for_cron_jobs

# Test Endpoint Security (Production)
TEST_SECRET=your_secure_random_string_for_tests

# Required for scheduler
NEXTAUTH_URL=https://your-domain.com  # or http://localhost:3000 for dev
```

## 📱 Testing Your Integration

### 1. Development Testing

1. **Setup Twilio Sandbox:**
   - Go to [Twilio Console](https://console.twilio.com)
   - Navigate to Messaging → Try it out → Send a WhatsApp message
   - Send `join [your-sandbox-name]` to +14155238886 from your WhatsApp

2. **Test via UI:**
   - Visit `http://localhost:3000/test-whatsapp-flow`
   - Enter your phone number (+355XXXXXXXX format)
   - Run all tests or specific notification types
   - Check your WhatsApp for messages

3. **Test via API:**
   ```bash
   curl -X POST http://localhost:3000/api/test/whatsapp-flow \
     -H "Content-Type: application/json" \
     -d '{"testPhone": "+355691234567", "testType": "all"}'
   ```

### 2. Manual Booking Flow Test

1. **Create a test appointment:**
   ```bash
   curl -X POST http://localhost:3000/api/appointments/request \
     -H "Content-Type: application/json" \
     -d '{
       "salonId": "your-salon-id",
       "serviceId": "your-service-id", 
       "appointmentDate": "2025-01-15",
       "startTime": "14:30",
       "customerInfo": {
         "firstName": "Maria",
         "lastName": "Test",
         "phone": "+355691234567"
       }
     }'
   ```

2. **Test approval notification:**
   ```bash
   curl -X PUT http://localhost:3000/api/appointments/appointment-id/status \
     -H "Content-Type: application/json" \
     -d '{
       "salonId": "your-salon-id",
       "status": "approved",
       "salonNotes": "Miresevini!"
     }'
   ```

## 📅 24-Hour Reminder System

### Automatic Setup (Recommended)
The GitHub Actions workflow runs daily at 9:00 AM Albanian time:
- File: `.github/workflows/send-reminders.yml` 
- Runs automatically via GitHub Actions cron
- Requires `CRON_SECRET` and `NEXTAUTH_URL` in GitHub Secrets

### Manual Testing
```bash
# Run reminder job manually
node scripts/send-reminders.js

# Or via API
curl -X POST https://your-domain.com/api/appointments/reminders \
  -H "Authorization: Bearer your-cron-secret"
```

## 🗄️ Database Schema Update

Add this column to your appointments table:

```sql
-- Add reminder tracking to appointments table
ALTER TABLE appointments 
ADD COLUMN reminder_sent TIMESTAMP WITH TIME ZONE;

-- Add index for efficient reminder queries
CREATE INDEX idx_appointments_reminder ON appointments(appointment_date, status, reminder_sent) 
WHERE status = 'approved' AND reminder_sent IS NULL;
```

## 🔐 Production Deployment

### 1. Vercel Environment Variables
Set these in your Vercel dashboard:
```
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=+1234567890   # Your production WhatsApp Business number
CRON_SECRET=your-secure-random-string
NEXTAUTH_URL=https://your-domain.com
```

### 2. GitHub Actions Secrets
Add these to your GitHub repository secrets:
```
CRON_SECRET=your-secure-random-string
NEXTAUTH_URL=https://your-domain.com
```

### 3. WhatsApp Business API (For Production)
For production usage beyond Twilio Sandbox:
1. Apply for WhatsApp Business API approval
2. Get your dedicated WhatsApp Business number
3. Set up approved message templates
4. Update `TWILIO_WHATSAPP_NUMBER` with your production number

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid Albanian phone number format"**
   - Ensure numbers start with +355
   - Format: +355691234567

2. **"WhatsApp sandbox not connected"**  
   - Send `join [sandbox-name]` to +14155238886
   - Check Twilio console for sandbox status

3. **"Message failed to send"**
   - Check Twilio console for detailed error messages
   - Verify account balance and rate limits
   - Check environment variables

4. **Reminders not working**
   - Verify `CRON_SECRET` is set correctly
   - Check GitHub Actions logs
   - Ensure database has `reminder_sent` column

### Debug Commands

```bash
# Test Twilio connection
curl http://localhost:3000/api/twilio/test

# Test specific notification template  
curl "http://localhost:3000/api/twilio/test?type=booking_request&phone=+355691234567"

# Check reminder job manually
node scripts/send-reminders.js
```

## 📊 Monitoring

### Success Indicators
- ✅ Customer receives booking confirmation immediately
- ✅ Salon receives new booking notification  
- ✅ Status updates trigger customer notifications
- ✅ 24-hour reminders send automatically
- ✅ All messages display in Albanian correctly

### Logs to Monitor
```bash
# Successful booking flow
"✅ Appointment created successfully: appointment-id"
"✅ Customer confirmation sent to +355691234567" 
"✅ Salon notification sent to +355691234568"

# Successful status updates
"✅ WhatsApp notification sent to +355691234567 for status: approved"

# Successful reminders  
"🎯 Reminder job completed: 5 sent, 0 errors"
```

## 🎯 Next Steps

1. **Test everything in development** using `/test-whatsapp-flow`
2. **Update database schema** with the reminder_sent column
3. **Set up production environment variables** in Vercel
4. **Configure GitHub Actions secrets** for automated reminders
5. **Apply for WhatsApp Business API** for production usage
6. **Monitor logs** for successful message delivery

Your WhatsApp integration is now fully functional! 🚀

---

**Generated with Claude Code** 🤖  
**Co-Authored-By:** Claude <noreply@anthropic.com>