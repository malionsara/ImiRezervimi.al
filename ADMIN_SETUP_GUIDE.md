# Admin System Setup Guide

## Overview

I've created a complete admin system for managing salon registrations on ImiRezervimi.al. Here's how it works and how to set it up.

## What's Been Created

### 🔧 Admin Components

1. **Admin Dashboard** (`/admin`)
   - Overview with statistics
   - Quick access to all admin functions
   - Setup status check

2. **Salon Management** (`/admin/salons`)
   - View pending salon registrations
   - Approve or reject salons
   - View active salons
   - Detailed salon information display

3. **API Endpoints**
   - `POST /api/admin/salons/approve` - Approve salon
   - `POST /api/admin/salons/reject` - Reject salon

4. **Admin Utilities** (`lib/admin.ts`)
   - Statistics functions
   - Authentication helpers
   - Notification placeholders

## Setup Instructions

### Step 1: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Your existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Required for admin operations
SUPABASE_SERVICE_KEY=your_service_role_key

# Optional: Secure admin access (recommended for production)
ADMIN_SECRET_KEY=your_secure_admin_password
```

**To get your Service Role Key:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the "service_role" key (not the anon key)
4. Add it to your Vercel environment variables as `SUPABASE_SERVICE_KEY`

### Step 2: Fix Database RLS (If Not Done Already)

Run the SQL from `database/fix-salon-registration-rls.sql` in your Supabase SQL Editor to allow salon registrations.

### Step 3: Access the Admin Panel

**Development (unsecured):**
- Go to `http://localhost:3000/admin`

**With Admin Key (secured):**
- Go to `http://localhost:3000/admin?admin_key=your_secure_admin_password`

**Production (recommended):**
- Set up proper authentication system
- Replace the simple key check with your auth system

## How to Confirm Salon Registrations

### 1. Access Admin Panel
- Go to `/admin` to see the overview
- Click "Menaxho Sallone" or go directly to `/admin/salons`

### 2. Review Pending Registrations
You'll see detailed information for each pending salon:
- **Basic Info**: Name, phone, email, address
- **Business Details**: Instagram handle, description
- **Working Hours**: Complete schedule
- **Services**: List of offered services with durations and prices
- **Registration Date**: When they applied

### 3. Make a Decision

**To Approve:**
1. Click the green "✅ Miratu" button
2. The salon status changes from 'pending' to 'active'
3. The salon becomes visible on the platform
4. Salon can now receive bookings

**To Reject:**
1. Click the red "❌ Refuzo" button
2. Enter an optional rejection reason
3. The salon and its services are deleted from the database

### 4. Track Results
- Approved salons appear in the "Aktive" tab
- Statistics update automatically
- Console logs show admin actions

## Current Features

✅ **Complete salon registration flow**
✅ **Admin dashboard with statistics**
✅ **Pending salon review interface**
✅ **One-click approve/reject**
✅ **Detailed salon information display**
✅ **Mobile-responsive design**
✅ **Error handling and loading states**

## Pending Features (TODOs)

🔲 **Email/WhatsApp notifications** for approval status
🔲 **Proper admin authentication system**
🔲 **Audit logging** for admin actions
🔲 **Bulk operations** (approve/reject multiple salons)
🔲 **Salon editing** after approval
🔲 **Advanced statistics and reporting**

## Security Notes

### Current Security Level: Basic
- Simple admin key check
- Service role for database operations
- No session management

### Recommended for Production:
1. **Implement proper authentication:**
   ```typescript
   // Replace simple key check with:
   - NextAuth.js with admin role
   - Firebase Auth with custom claims
   - Your existing auth system
   ```

2. **Add audit logging:**
   ```sql
   CREATE TABLE admin_actions (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     admin_id TEXT,
     action VARCHAR(50),
     target_id UUID,
     details JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Rate limiting on admin endpoints**

4. **IP whitelisting for admin access**

## Notification System Setup

### Email Notifications (Future)
```typescript
// In lib/admin.ts - replace placeholder function
import nodemailer from 'nodemailer'

async function sendApprovalEmail(salon, approved) {
  const transporter = nodemailer.createTransporter(/* config */)
  await transporter.sendMail({
    to: salon.email,
    subject: approved ? 'Salon Approved!' : 'Salon Application Update',
    html: /* your email template */
  })
}
```

### WhatsApp Notifications (Future)
```typescript
// Using your existing Twilio setup
import { sendWhatsAppMessage } from '../lib/twilio'

async function sendApprovalWhatsApp(salon, approved) {
  const message = approved 
    ? `Congratulations! Your salon "${salon.name}" has been approved.`
    : `Your salon application needs attention.`
    
  await sendWhatsAppMessage(salon.phone, message)
}
```

## Usage Examples

### Typical Admin Workflow:

1. **Morning Review**: Check `/admin` for pending count
2. **Review Applications**: Go to `/admin/salons` → "Në pritje" tab
3. **For Each Salon**:
   - Review business information
   - Check Instagram handle exists
   - Verify phone number format
   - Look at services offered
   - Approve if everything looks good
4. **Quality Check**: Verify approved salons appear correctly

### Common Actions:

```bash
# Quick stats check
curl http://localhost:3000/api/admin/salons/stats

# Approve a salon
curl -X POST http://localhost:3000/api/admin/salons/approve \
  -H "Content-Type: application/json" \
  -d '{"salonId": "salon-uuid-here"}'

# Reject with reason
curl -X POST http://localhost:3000/api/admin/salons/reject \
  -H "Content-Type: application/json" \
  -d '{"salonId": "salon-uuid-here", "reason": "Missing required information"}'
```

## Files Created/Modified

- `frontend/pages/admin/index.js` - Admin portal homepage
- `frontend/pages/admin/salons.js` - Salon management interface
- `frontend/pages/api/admin/salons/approve.ts` - Approval API
- `frontend/pages/api/admin/salons/reject.ts` - Rejection API
- `frontend/lib/admin.ts` - Admin utility functions
- `frontend/pages/index.js` - Added admin link in footer
- `database/fix-salon-registration-rls.sql` - Database fixes
- This guide and setup documentation

## Need Help?

The admin system is ready to use! Test the complete flow:

1. Register a test salon at `/salon`
2. Go to `/admin/salons` to see it pending
3. Approve or reject it
4. Verify it appears in active salons

Any questions about the admin system or need additional features? Let me know!