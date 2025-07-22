# Instagram Login Component

A comprehensive Instagram authentication component for ImiRezervimi.al booking platform.

## Features

- 🔐 **Secure OAuth 2.0 Authentication** - Uses Instagram Basic Display API
- 🇦🇱 **Albanian Localization** - All text and error messages in Albanian
- 📱 **Mobile Optimized** - Designed for Instagram in-app browser
- ⚡ **Fast Loading** - Optimized for 3G connections
- 🛡️ **Secure Token Handling** - Encrypted storage and session management
- 🎨 **Beautiful UI** - Instagram-branded design with animations

## Quick Start

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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSuccess` | `() => void` | - | Callback when login succeeds |
| `onError` | `(error: string) => void` | - | Callback when login fails |
| `redirectUrl` | `string` | `'/dashboard'` | Where to redirect after login |
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