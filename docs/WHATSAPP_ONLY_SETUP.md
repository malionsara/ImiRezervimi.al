# WhatsApp-Only Setup Guide - ImiRezervimi.al

## 🎯 **WHATSAPP ONLY - NO SMS FALLBACK**

To fix Error 63016, you MUST create a WhatsApp message template in Twilio Console.

## 📋 **Step 1: Create Template in Twilio Console**

1. **Go to**: https://console.twilio.com/
2. **Navigate to**: Messaging → Content Template Builder
3. **Click**: "Create new"

## ⚙️ **Step 2: Template Configuration**

```
Template Name: verification_code
Language: English (en) 
Content Type: Text
Category: AUTHENTICATION

Template Body:
Your verification code is {{1}}. Valid for 5 minutes. Do not share this code.
```

**Important**: The `{{1}}` is a placeholder that will be replaced with your actual verification code.

## 🚀 **Step 3: Submit for Approval**

1. **Click**: "Save and submit for WhatsApp approval"
2. **Select Category**: AUTHENTICATION
3. **Wait**: 5 minutes to 24 hours for approval

## 🔑 **Step 4: Check Template Status & Get SID**

1. **Go back to**: Twilio Console → Messaging → Content Template Builder
2. **Check Status**:
   - **Approved** ✅ = Ready to use
   - **Pending** ⏳ = Still under review (wait)
   - **Rejected** ❌ = Need to fix and resubmit
3. **Once Approved**: Copy the **ContentSID** (starts with `HX...`)

## 🌐 **Step 5: Update Vercel Environment Variables**

```env
WHATSAPP_USE_MESSAGE_TEMPLATE=true
WHATSAPP_TEMPLATE_SID=HX1234567890abcdef1234567890abcdef
```

## ✅ **Step 6: Test**

Once template is approved and environment variables are set, test your WhatsApp verification again.

## 🚨 **Important Notes**

- **WhatsApp Business API requires templates** for all business-initiated messages
- **Error 63016** = trying to send freeform message without template
- **Templates must be approved** by WhatsApp before use
- **No SMS fallback** - WhatsApp only

## 🎯 **Expected Result**

After completing these steps:
- ✅ WhatsApp messages will send successfully
- ✅ Error 63016 will be resolved
- ✅ Verification codes will be delivered via WhatsApp only

---

**Template approval is the ONLY solution to Error 63016.**