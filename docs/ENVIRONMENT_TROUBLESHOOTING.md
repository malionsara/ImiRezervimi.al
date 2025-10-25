# Environment Variable Troubleshooting Guide

## Issue: Environment Variables Not Found

The problem was that the admin setup validation was running **client-side** (in the browser), but environment variables like `SUPABASE_SERVICE_ROLE_KEY` are **server-side only** for security.

## ✅ **Fix Applied**

### What Was Changed:
1. **Moved validation to server-side**: Created `/api/admin/setup-status` endpoint
2. **Updated admin page**: Now fetches setup status from API instead of checking environment variables in browser
3. **Added debug endpoint**: `/api/debug/env-check` for troubleshooting

### Files Modified:
- `frontend/pages/api/admin/setup-status.ts` - Server-side environment validation
- `frontend/pages/api/debug/env-check.ts` - Debug endpoint
- `frontend/pages/admin/index.js` - Updated to use API for setup checking

## 🔍 **After Deployment - How to Test**

### 1. Check Admin Page
Visit: `https://www.imirezervimi.al/admin`

**Expected Results:**
- ✅ **Green box**: "Konfigurimi Komplet" (if all env vars configured)
- ⚠️ **Yellow box**: "Konfigurimi i WhatsApp" (if Twilio missing)
- ❌ **Red box**: "Konfigurimi i Admin" (if critical vars missing)

### 2. Debug Environment Variables
Visit: `https://www.imirezervimi.al/api/debug/env-check?admin_key=YOUR_ADMIN_SECRET`

Replace `YOUR_ADMIN_SECRET` with your actual `ADMIN_SECRET_KEY` value.

**Expected Response:**
```json
{
  "message": "Environment variable status",
  "status": {
    "NEXT_PUBLIC_SUPABASE_URL": true,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": true,
    "SUPABASE_SERVICE_ROLE_KEY": true,
    "SUPABASE_SERVICE_KEY": true,
    "ADMIN_SECRET_KEY": true,
    "TWILIO_ACCOUNT_SID": true,
    "TWILIO_AUTH_TOKEN": true,
    "TWILIO_WHATSAPP_NUMBER": true,
    "NODE_ENV": "production",
    "VERCEL": true,
    "VERCEL_ENV": "production"
  },
  "values": {
    "SUPABASE_SERVICE_ROLE_KEY": "eyJh...",
    "SUPABASE_SERVICE_KEY": "eyJh...",
    "ADMIN_SECRET_KEY": "ImiR...",
    "TWILIO_ACCOUNT_SID": "AC12...",
    "TWILIO_AUTH_TOKEN": "abcd...",
    "TWILIO_WHATSAPP_NUMBER": "+14155238886"
  }
}
```

### 3. Test Salon Approval Notifications
1. Register a test salon at `/salon/register`
2. Go to `/admin/salons` and approve it
3. Check the salon's phone for WhatsApp notification
4. Check Vercel function logs for notification status

## 🛠️ **If Issues Persist**

### Vercel Environment Variables Double-Check:
1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Ensure these are **ALL** set:

```bash
# Critical (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Service role key
ADMIN_SECRET_KEY=your-secure-password

# Optional (For WhatsApp)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### Variable Name Issues:
- Make sure `SUPABASE_SERVICE_ROLE_KEY` (not just `SUPABASE_SERVICE_KEY`)
- Check for typos in variable names
- Ensure no extra spaces in values

### Force Redeploy:
1. Go to **Vercel Dashboard** → **Deployments**
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

### Check Function Logs:
1. Go to **Vercel Dashboard** → **Functions**
2. Find the failing function (e.g., `/api/admin/setup-status`)
3. Click "View Function Logs"
4. Look for error messages

## 🎯 **Expected Final State**

### Admin Page Should Show:
- ✅ Green success message if all environment variables configured
- 📊 Statistics working (salon counts)
- 🏪 "Menaxho Sallone" link working

### Notifications Should Work:
- Salon approval → WhatsApp message sent
- Salon rejection → WhatsApp message sent  
- Console logs show success/failure status

### Debug Endpoint Should Show:
- All environment variables as `true`
- Actual variable values (first 4 characters)
- `VERCEL: true` and `NODE_ENV: "production"`

If all these check out, your environment is properly configured! 🎉