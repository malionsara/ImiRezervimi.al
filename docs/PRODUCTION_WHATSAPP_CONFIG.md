# Production WhatsApp Configuration - imirezervimi.al

## Environment Variables for Vercel Dashboard

Set these in your Vercel project settings → Environment Variables:

```env
# Your Production Twilio Credentials
TWILIO_ACCOUNT_SID=AC...  # Your actual account SID
TWILIO_AUTH_TOKEN=...     # Your actual auth token

# Your Production WhatsApp Business Number (NOT sandbox)
TWILIO_WHATSAPP_NUMBER=+1234567890  # Your approved WhatsApp Business number

# Security for automated reminders
CRON_SECRET=your_secure_random_string_here

# Production URL
NEXTAUTH_URL=https://imirezervimi.al

# Test endpoint security (optional)
TEST_SECRET=your_test_secret_here
```

## Key Differences from Sandbox:

1. **No "join" requirement** - Your customers don't need to join anything
2. **Your own WhatsApp number** - Use your approved business number
3. **Approved message templates** - Make sure your Albanian templates are approved
4. **Production rate limits** - Higher limits than sandbox

## Quick Test:

Once configured, test with:
- Visit: https://imirezervimi.al/test-whatsapp-flow
- Enter any Albanian phone number (+355...)
- Should work without any "join" step