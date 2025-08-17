# Environment Variable Standardization for ImiRezervimi.al

## Overview
This document standardizes environment variable naming across the codebase to ensure consistency and reduce confusion.

## Current Issues Found
Multiple variations were found in the codebase:
- `SUPABASE_SERVICE_ROLE_KEY` (preferred)
- `SUPABASE_SERVICE_KEY` (deprecated)  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (correct)

## Standard Environment Variables

### Production Environment Variables
```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth Configuration (REQUIRED)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://www.imirezervimi.al

# Instagram OAuth (REQUIRED for customer auth)
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_secret

# Twilio WhatsApp (REQUIRED for notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Development Environment Variables
```env
# Same as production but with development values
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
NEXTAUTH_URL=http://localhost:3000
```

## Migration Plan

### Phase 1: Update Core Library Files ✅
- [x] `lib/appointments.ts` - Use `SUPABASE_SERVICE_ROLE_KEY`
- [x] `lib/salon-auth.ts` - Use `SUPABASE_SERVICE_ROLE_KEY` 
- [x] `lib/admin.ts` - Use `SUPABASE_SERVICE_ROLE_KEY`

### Phase 2: Update API Endpoints
- [ ] `pages/api/**/*.ts` - Standardize to `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Remove fallback to deprecated `SUPABASE_SERVICE_KEY`

### Phase 3: Update Documentation
- [ ] Update `.env.example`
- [ ] Update deployment guides
- [ ] Update CLAUDE.md environment section

## Code Patterns

### ✅ Correct Pattern
```typescript
// For server-side operations (API routes, server functions)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// For client-side operations (React components)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### ❌ Deprecated Pattern
```typescript
// Don't use these patterns anymore:
const key = process.env.SUPABASE_SERVICE_KEY // Deprecated
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY // Too complex
```

## Security Notes

### Public vs Private Keys
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Safe for client-side, has RLS restrictions
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side only, bypasses RLS

### Never Expose Service Role Key
```typescript
// ❌ NEVER do this - exposes service role key to client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // This would be exposed to browser!
)

// ✅ Correct - use anon key for client-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## Files Requiring Updates

### High Priority (Server-side operations)
1. `lib/appointments.ts` - Already uses fallback pattern
2. `lib/salon-auth.ts` - Already uses fallback pattern  
3. `lib/admin.ts` - Already uses fallback pattern
4. `pages/api/auth/[...nextauth].js` - Uses deprecated key
5. `pages/api/customers/booking-history.ts` - Complex fallback chain

### Medium Priority (API endpoints)
6. `pages/api/admin/salons/*.ts` - Uses fallback pattern
7. `pages/api/debug/*.ts` - Mixed usage
8. `lib/whatsapp.ts` - Uses deprecated key
9. `lib/sms.ts` - Uses deprecated key

### Low Priority (Client-side - already correct)
10. `pages/_app.js` - Uses anon key (correct)
11. `components/**/*.tsx` - Use anon key (correct)

## Environment File Template

### `.env.local` (Development)
```env
# Copy this to .env.local and fill in your values
# DO NOT commit .env.local to git

# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth
NEXTAUTH_SECRET=development_secret_min_32_chars
NEXTAUTH_URL=http://localhost:3000

# Instagram OAuth
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_account_sid  
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### `.env.example` (Template for new developers)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth Configuration  
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://www.imirezervimi.al

# Instagram OAuth
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Verification Script

Run this script to verify all environment variables are properly set:

```bash
npm run env:check
```

This will:
1. Check all required variables are present
2. Validate key formats 
3. Test Supabase connectivity
4. Verify Twilio configuration

## Rollback Plan

If issues arise after standardization:

1. **Immediate**: Add fallback support temporarily
```typescript
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
```

2. **Update deployment**: Ensure new environment variable is set in production

3. **Remove fallback**: Once verified, remove deprecated fallback

---

*Migration 004: Environment Variable Standardization*
*Status: In Progress*
*Priority: LOW*