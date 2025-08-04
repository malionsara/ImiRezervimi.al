# WhatsApp Message Templates Setup Guide

## 🚨 **CRITICAL: Required for Production WhatsApp Business API**

**Error 63016** occurs because WhatsApp Business API requires **pre-approved Message Templates** for sending messages. You cannot send freeform messages to users.

## 📋 **Step-by-Step Setup Process**

### **Step 1: Create Message Template in Meta Business Manager**

1. **Go to Meta Business Manager**
   - Visit: https://business.facebook.com/
   - Navigate to **WhatsApp Manager**

2. **Access Message Templates**
   - Select your **WhatsApp Business Account**
   - Go to **Account Tools** → **Message Templates**
   - Click **Create Template**

3. **Template Configuration**
   ```
   Template Name: verification_code_imirezervimi
   Category: AUTHENTICATION
   Language: English (en) or Albanian (sq)
   Header: None
   Body: Your verification code is {{1}}. Valid for 5 minutes. Do not share this code.
   Footer: ImiRezervimi.al
   Buttons: None
   ```

### **Step 2: Wait for Template Approval**
- Meta reviews templates within **24-48 hours**
- You'll receive email notification when approved
- Template status will show as **"APPROVED"**

### **Step 3: Get Template SID from Twilio**

1. **Go to Twilio Console**
   - Visit: https://console.twilio.com/
   - Navigate to **Messaging** → **Content Templates**

2. **Find Your Template**
   - Look for your approved template
   - Copy the **Content SID** (starts with `HX...`)

### **Step 4: Update Environment Variables**

Add these to your **Vercel Environment Variables**:

```env
# Enable message template usage
WHATSAPP_USE_MESSAGE_TEMPLATE=true

# Your template SID from Twilio Console
WHATSAPP_TEMPLATE_SID=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 📝 **Recommended Templates for ImiRezervimi.al**

### **1. Verification Code Template**
```
Name: verification_code
Category: AUTHENTICATION
Body: Your verification code is {{1}}. Valid for 5 minutes. Do not share this code.
```

### **2. Appointment Confirmation Template**
```
Name: appointment_confirmed
Category: UTILITY
Body: Your appointment at {{1}} on {{2}} at {{3}} has been confirmed. See you soon!
```

### **3. Appointment Reminder Template**
```
Name: appointment_reminder
Category: UTILITY
Body: Reminder: You have an appointment at {{1}} tomorrow at {{2}}. We look forward to seeing you!
```

## 🔧 **Testing Your Template**

Once approved, test with:

```bash
curl -X POST https://yourdomain.com/api/debug/whatsapp-test?admin_key=YOUR_ADMIN_KEY \
  -H "Content-Type: application/json" \
  -d '{"phone": "+355675490330"}'
```

## 🚨 **Important Notes**

### **Template Approval Requirements:**
- **Must be business-related** (not promotional)
- **Clear, professional language**
- **No misleading content**
- **Proper variable placeholders** ({{1}}, {{2}}, etc.)

### **Template Categories:**
- **AUTHENTICATION**: Verification codes, login confirmations
- **UTILITY**: Appointment confirmations, order updates
- **MARKETING**: Promotional messages (requires opt-in)

### **Variable Rules:**
- Use `{{1}}`, `{{2}}`, `{{3}}` for dynamic content
- Variables must be in sequential order
- Maximum 10 variables per template

## 🔄 **Fallback Strategy**

If templates are not ready, you can temporarily:

1. **Use Twilio SMS** instead of WhatsApp
2. **Set up sandbox mode** for testing
3. **Use simple English templates** (higher approval rate)

## 📞 **Alternative: Use Twilio SMS as Fallback**

Update your environment variables:
```env
# Disable WhatsApp, use SMS fallback
WHATSAPP_USE_MESSAGE_TEMPLATE=false
USE_SMS_FALLBACK=true
```

## 🎯 **Quick Fix for Testing**

**Immediate solution**: Use SMS instead of WhatsApp until templates are approved:

```typescript
// In your verification function
if (process.env.WHATSAPP_USE_MESSAGE_TEMPLATE !== 'true') {
  // Use SMS instead
  return await sendSMSVerification(phone)
}
```

## ✅ **Template Status Check**

Monitor your template status at:
- **Meta Business Manager** → **WhatsApp Manager** → **Message Templates**
- **Twilio Console** → **Messaging** → **Content Templates**

---

**Next Steps:**
1. Create the verification template in Meta Business Manager
2. Wait for approval (24-48 hours)
3. Add Template SID to Vercel environment variables
4. Test the updated system

The error will be resolved once you use approved message templates instead of freeform messages.