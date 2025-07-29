# Authentication Components

Comprehensive authentication components for ImiRezervimi.al booking platform.

## Components

### 1. Instagram Login Component

A secure Instagram OAuth authentication component.

### 2. Phone Verification Component ✅ COMPLETED

A complete SMS-based phone verification system with Albanian localization.

## Instagram Login Features

- 🔐 **Secure OAuth 2.0 Authentication** - Uses Instagram Basic Display API
- 🇦🇱 **Albanian Localization** - All text and error messages in Albanian
- 📱 **Mobile Optimized** - Designed for Instagram in-app browser
- ⚡ **Fast Loading** - Optimized for 3G connections
- 🛡️ **Secure Token Handling** - Encrypted storage and session management
- 🎨 **Beautiful UI** - Instagram-branded design with animations

## Phone Verification Features ✅

- 📱 **SMS Verification** - 6-digit codes via Twilio SMS API
- 🇦🇱 **Albanian Localization** - Complete Albanian language support
- ⏱️ **Rate Limiting** - 1 SMS per minute per phone number
- 🔒 **Security Features** - Code expiry (5 min), attempt limits, anti-spam
- 📱 **Albanian Phone Format** - Supports +355 format validation
- ♻️ **Resend Functionality** - With 60-second cooldown period
- 🎨 **Modern UI** - Mobile-first responsive design
- ✅ **Welcome SMS** - Automatic welcome message after verification

## Quick Start

### Instagram Login

```tsx
import InstagramLogin from './components/auth/InstagramLogin';

function LoginPage() {
  return (
    <InstagramLogin
      onSuccess={() => console.log('Login successful!')}
      onError={(error) => console.error('Login failed:', error)}
      redirectUrl="/dashboard"
    />
  );
}
```

### Phone Verification ✅

```tsx
import PhoneVerification from './components/auth/PhoneVerification';

function VerificationPage() {
  return (
    <PhoneVerification
      onVerificationComplete={(phone) => {
        console.log('Phone verified:', phone);
        // Proceed with booking flow
      }}
      onError={(error) => console.error('Verification failed:', error)}
      initialPhone="+355"
    />
  );
}
```

## Props

### Instagram Login Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSuccess` | `() => void` | - | Callback when login succeeds |
| `onError` | `(error: string) => void` | - | Callback when login fails |
| `redirectUrl` | `string` | `'/dashboard'` | Where to redirect after login |
| `className` | `string` | `''` | Additional CSS classes |

### Phone Verification Props ✅

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onVerificationComplete` | `(phone: string) => void` | - | Callback when phone is verified |
| `onError` | `(error: string) => void` | - | Callback when verification fails |
| `initialPhone` | `string` | `''` | Pre-fill phone number input |
| `className` | `string` | `''` | Additional CSS classes |

## Setup Required

1. Configure Instagram app in Facebook Developer Console
2. Set environment variables in `.env.local`
3. Add test users for development
4. Submit app for review before production

See [INSTAGRAM_SETUP.md](../../docs/INSTAGRAM_SETUP.md) for detailed setup instructions.

## Albanian Error Messages

The component provides user-friendly error messages in Albanian:

- **Invalid Token**: "Tokeni i Instagram është i pavlefshëm."
- **Rate Limited**: "Shumë kërkesa. Ju lutemi prisni pak dhe provoni përsëri."
- **Permission Denied**: "Lejimet e Instagram u refuzuan."
- **Network Error**: "Gabim në rrjet. Kontrolloni lidhjen tuaj të internetit."

## Testing

Run the test suite:

```bash
npm run test:instagram
```

Test manually at:
```
http://localhost:3000/test-instagram
```

## Integration

The component automatically:
- Stores user data in Supabase database
- Creates NextAuth.js sessions
- Handles token refresh and validation
- Provides loading states and error handling

Perfect for integration with the ImiRezervimi.al booking workflow!