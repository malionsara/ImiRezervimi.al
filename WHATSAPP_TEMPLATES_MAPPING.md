# WhatsApp Templates Mapping - ImiRezervimi.al

## 🎯 **Template Management Strategy**

Instead of hardcoding template SIDs in environment variables, we'll create a template mapping system that can handle multiple templates dynamically.

## 📋 **Required Templates for ImiRezervimi.al**

### **1. Authentication Templates**

#### **verification_code**
- **Purpose**: Phone number verification during registration
- **Category**: AUTHENTICATION
- **Template**: `Your verification code is {{1}}. Valid for 5 minutes. Do not share this code.`
- **Variables**: `{{1}}` = verification code
- **Current SID**: `HX8a5c6361c10e7378b58f0d8e40e92b46`

---

### **2. Utility Templates (Appointment Management)**

#### **appointment_confirmation**
- **Purpose**: Confirm appointment booking
- **Category**: UTILITY
- **Template**: `✅ Rezervimi konfirmuar! {{1}} - {{2}} në {{3}}. Ju presim! ImiRezervimi.al`
- **Variables**: 
  - `{{1}}` = salon name
  - `{{2}}` = date 
  - `{{3}}` = time
- **Need to create**

#### **appointment_declined**
- **Purpose**: Notify customer of declined appointment
- **Category**: UTILITY
- **Template**: `❌ Rezervimi për {{1}} - {{2}} nuk mund të aprovohet. Arsyeja: {{3}}. Provoni një kohë tjetër. ImiRezervimi.al`
- **Variables**:
  - `{{1}}` = salon name
  - `{{2}}` = requested date/time
  - `{{3}}` = decline reason
- **Need to create**

#### **appointment_reminder**
- **Purpose**: 24-hour appointment reminder
- **Category**: UTILITY
- **Template**: `⏰ Kujtesë: Rezervimi juaj në {{1}} është nesër në {{2}}. Na kontaktoni për ndryshime. ImiRezervimi.al`
- **Variables**:
  - `{{1}}` = salon name
  - `{{2}}` = appointment time
- **Need to create**

#### **appointment_cancelled**
- **Purpose**: Notify customer of cancelled appointment
- **Category**: UTILITY
- **Template**: `🚫 Rezervimi juaj në {{1}} për {{2}} është anuluar. Arsyeja: {{3}}. Na vjen keq! ImiRezervimi.al`
- **Variables**:
  - `{{1}}` = salon name
  - `{{2}}` = appointment date/time
  - `{{3}}` = cancellation reason
- **Need to create**

---

### **3. Marketing Templates (Promotional)**

#### **welcome_new_customer**
- **Purpose**: Welcome message for new customers
- **Category**: MARKETING
- **Template**: `🎉 Mirë se vini në ImiRezervimi.al! {{1}}, zbuloni salonet më të mira në Shqipëri. Rezervoni tani! 💅`
- **Variables**: `{{1}}` = customer name
- **Need to create**

#### **special_offers**
- **Purpose**: Send special offers and promotions
- **Category**: MARKETING
- **Template**: `💎 Ofertë speciale për ju! {{1}} - {{2}}% zbritje deri më {{3}}. Rezervoni në ImiRezervimi.al`
- **Variables**:
  - `{{1}}` = offer description
  - `{{2}}` = discount percentage
  - `{{3}}` = expiry date
- **Need to create**

---

### **4. Notification Templates**

#### **salon_new_booking_request**
- **Purpose**: Notify salon owners of new booking requests
- **Category**: UTILITY
- **Template**: `📅 Kërkesë e re! {{1}} {{2}} dëshiron rezervim për {{3}} më {{4}} në {{5}}. Shikoni dashboard-in tuaj.`
- **Variables**:
  - `{{1}}` = customer first name
  - `{{2}}` = customer last name
  - `{{3}}` = service name
  - `{{4}}` = requested date
  - `{{5}}` = requested time
- **Need to create**

#### **payment_confirmation**
- **Purpose**: Confirm payment for appointments
- **Category**: UTILITY
- **Template**: `💳 Pagesa konfirmuar! {{1}}€ për {{2}} në {{3}}. Fatura: {{4}}. Faleminderit! ImiRezervimi.al`
- **Variables**:
  - `{{1}}` = amount
  - `{{2}}` = service
  - `{{3}}` = salon name
  - `{{4}}` = invoice number
- **Need to create**

---

## 🏗️ **Template Management System**

### **Template Configuration Object**
```typescript
interface WhatsAppTemplate {
  id: string;
  name: string;
  contentSid: string;
  category: 'AUTHENTICATION' | 'UTILITY' | 'MARKETING';
  variables: string[];
  description: string;
}

const WHATSAPP_TEMPLATES: Record<string, WhatsAppTemplate> = {
  VERIFICATION_CODE: {
    id: 'verification_code',
    name: 'Verification Code',
    contentSid: 'HX8a5c6361c10e7378b58f0d8e40e92b46',
    category: 'AUTHENTICATION',
    variables: ['code'],
    description: 'Phone verification code'
  },
  APPOINTMENT_CONFIRMATION: {
    id: 'appointment_confirmation',
    name: 'Appointment Confirmation',
    contentSid: 'HX...', // To be filled after template creation
    category: 'UTILITY',
    variables: ['salonName', 'date', 'time'],
    description: 'Confirm appointment booking'
  },
  // ... more templates
};
```

### **Template Usage Function**
```typescript
function getWhatsAppTemplate(templateKey: string): WhatsAppTemplate {
  return WHATSAPP_TEMPLATES[templateKey];
}

function sendWhatsAppTemplate(
  phone: string, 
  templateKey: string, 
  variables: Record<string, string>
) {
  const template = getWhatsAppTemplate(templateKey);
  const contentVariables = JSON.stringify({
    "1": variables[template.variables[0]],
    "2": variables[template.variables[1]],
    "3": variables[template.variables[2]],
    // ... etc
  });
  
  return client.messages.create({
    contentSid: template.contentSid,
    contentVariables: contentVariables,
    from: `whatsapp:${whatsappPhoneNumber}`,
    to: `whatsapp:${phone}`
  });
}
```

## 📊 **Priority Order for Template Creation**

### **Phase 1: Essential (Create First)**
1. ✅ `verification_code` - Already created
2. 🔲 `appointment_confirmation` 
3. 🔲 `appointment_declined`
4. 🔲 `salon_new_booking_request`

### **Phase 2: Important (Create Second)**
5. 🔲 `appointment_reminder`
6. 🔲 `appointment_cancelled`
7. 🔲 `welcome_new_customer`

### **Phase 3: Optional (Create Later)**
8. 🔲 `special_offers`
9. 🔲 `payment_confirmation`

## 🎯 **Implementation Plan**

1. **Create remaining templates** in Twilio Console
2. **Build template management system** in code
3. **Update WhatsApp functions** to use template mapping
4. **Test each template** individually
5. **Deploy with all templates** working

This approach gives us flexibility to manage multiple templates without hardcoding SIDs in environment variables.