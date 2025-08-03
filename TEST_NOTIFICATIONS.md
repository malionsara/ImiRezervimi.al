# Testing WhatsApp Notifications

## After Vercel Deployment Completes

### 1. Check Environment Variables Are Working

Visit your admin page: `https://your-domain.com/admin`

**Expected Result**: The yellow warning box should disappear if environment variables are properly configured.

### 2. Test Notification System

#### Method 1: Test via Admin Panel
1. Register a test salon at `/salon/register`
2. Go to `/admin/salons` 
3. Approve the test salon
4. Check WhatsApp for approval notification

#### Method 2: Direct API Test
```bash
# Test the WhatsApp API directly
curl -X POST https://your-domain.com/api/twilio/send-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+355691234567",
    "message": "🧪 Test message from ImiRezervimi.al"
  }'
```

### 3. Check Vercel Logs

Go to Vercel Dashboard → Your Project → Functions → View Logs

Look for:
- ✅ `WhatsApp notification sent to...` (success)
- ❌ `WhatsApp notification failed:...` (error)
- ⚠️ `WhatsApp not configured - notification would be sent to...` (missing config)

### 4. Troubleshooting

#### If Environment Variables Still Missing:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Verify these exist:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_SERVICE_KEY` (both for compatibility)
   - `ADMIN_SECRET_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`

3. **Important**: Redeploy after adding variables:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

#### If Notifications Fail:
1. **Check Twilio Sandbox Setup**:
   - Customers must send "join [your-sandbox-keyword]" to +14155238886 first
   - Only verified numbers can receive sandbox messages

2. **Verify Phone Format**:
   - Must be in format: `+355XXXXXXXX` (Albanian)
   - Code validates Albanian phone numbers only

3. **Check Twilio Console**:
   - Go to https://console.twilio.com/
   - Check "Messaging" → "Logs" for delivery status

### 5. Expected WhatsApp Messages

#### Approval Message:
```
🎉 Përgëzime! Salloni juaj "Salon Name" u miratua në ImiRezervimi.al! 

Tani mund të merrni rezervime online nga klientët. 

Linku juaj: https://imirezervimi.al/salon-slug

Faleminderit që zgjodhët ImiRezervimi.al! 💄✨
```

#### Rejection Message:
```
Përshëndetje Salon Name! 

Faleminderit për aplikimin tuaj në ImiRezervimi.al. 

Regjistrimi juaj nuk mund të miratohet momentalisht.

Arsyeja: [reason if provided]

Ju lutemi kontaktoni mbështetjen tonë për më shumë informacion ose për të riaplikuar.

Email: support@imirezervimi.al
```

### 6. Production Setup Notes

For production (not sandbox):
1. Get Twilio phone number
2. Set up WhatsApp Business API
3. Update `TWILIO_WHATSAPP_NUMBER` to your business number
4. No "join" requirement for customers

### Quick Status Check

Run this after deployment:
- [ ] Visit `/admin` - no environment variable warnings
- [ ] Approve test salon - notification sent successfully  
- [ ] Check Vercel logs - no errors
- [ ] Test phone receives WhatsApp message

If all checks pass ✅, your notification system is working!