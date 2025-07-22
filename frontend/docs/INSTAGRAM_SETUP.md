# Instagram Login Setup Guide

This document provides step-by-step instructions for setting up Instagram authentication in ImiRezervimi.al.

## Overview

The Instagram login component uses Instagram Basic Display API to authenticate users and integrate with the booking workflow. This allows customers to sign in with their Instagram accounts and seamlessly book appointments.

## Prerequisites

- Facebook Developer Account
- Instagram Account (for testing)
- Next.js application with NextAuth.js configured

## Instagram App Configuration

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Select "Consumer" as the app type
4. Fill in app details:
   - App Name: `ImiRezervimi Instagram Auth`
   - App Contact Email: Your email
   - App Purpose: Authentication for booking platform

### 2. Add Instagram Basic Display

1. In your Facebook app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. Go to Instagram Basic Display > Basic Display
4. Click "Create New App" if prompted

### 3. Configure OAuth Settings

1. In Instagram Basic Display settings, add OAuth Redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/instagram
   https://imirezervimi.al/api/auth/callback/instagram
   https://www.imirezervimi.al/api/auth/callback/instagram
   ```

2. Add Deauthorize Callback URL:
   ```
   https://www.imirezervimi.al/api/auth/deauthorize
   ```

3. Add Data Deletion Request URL:
   ```
   https://www.imirezervimi.al/api/auth/data-deletion
   ```

### 4. Important: Domain Configuration

⚠️ **Critical**: Your domain `imirezervimi.al` redirects to `www.imirezervimi.al`. You MUST add BOTH URLs to your Instagram app:

- `https://imirezervimi.al/api/auth/callback/instagram` (redirects from)
- `https://www.imirezervimi.al/api/auth/callback/instagram` (redirects to)

Instagram OAuth requires exact URL matching, so both variants must be configured.

### 4. Get App Credentials

1. Copy your Instagram App ID
2. Copy your Instagram App Secret
3. Note these for environment configuration

## Environment Configuration

Create or update your `.env.local` file:

```bash
# Instagram Basic Display API
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your_instagram_app_id
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/callback/instagram

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Supabase (for user storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Testing Instagram Login

### 1. Add Test Users

1. Go to Instagram Basic Display > Roles
2. Click "Add Instagram Testers"
3. Enter Instagram usernames to test with
4. Test users must accept the invitation in their Instagram app

### 2. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the test page:
   ```
   http://localhost:3000/test-instagram
   ```

3. Click "Test Config" to verify environment variables
4. Try logging in with a test Instagram account

### 3. Verify Database Integration

Check that user data is properly stored in Supabase:

```sql
SELECT * FROM customers WHERE instagram_id IS NOT NULL;
```

## Component Usage

### Basic Usage

```tsx
import InstagramLogin from '../components/auth/InstagramLogin';

function LoginPage() {
  const handleSuccess = () => {
    console.log('Instagram login successful!');
  };

  const handleError = (error: string) => {
    console.error('Instagram login failed:', error);
  };

  return (
    <InstagramLogin
      onSuccess={handleSuccess}
      onError={handleError}
      redirectUrl="/dashboard"
    />
  );
}
```

### Advanced Usage with Custom Styling

```tsx
<InstagramLogin
  onSuccess={handleSuccess}
  onError={handleError}
  redirectUrl="/booking"
  className="custom-instagram-login"
/>
```

## API Integration

### Instagram Profile Data

The component automatically fetches and stores:

- Instagram User ID
- Username
- Account Type (PERSONAL/BUSINESS)
- Media Count

### Database Schema

User data is stored in the `customers` table:

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  instagram_id VARCHAR UNIQUE,
  instagram_username VARCHAR,
  profile_photo_url VARCHAR,
  account_type VARCHAR DEFAULT 'social',
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

The component provides Albanian error messages for common scenarios:

- **Invalid Token**: "Tokeni i Instagram është i pavlefshëm."
- **Rate Limited**: "Shumë kërkesa. Ju lutemi prisni pak dhe provoni përsëri."
- **Permission Denied**: "Lejimet e Instagram u refuzuan."
- **Network Error**: "Gabim në rrjet. Kontrolloni lidhjen tuaj të internetit."

## Security Considerations

### Token Storage

- Access tokens are encrypted before storage
- Tokens are stored securely in NextAuth sessions
- No sensitive data is exposed to client-side

### Data Protection

- Only necessary Instagram data is requested
- User consent is required for data access
- GDPR-compliant data handling

### Rate Limiting

- Instagram API rate limits are respected
- Error handling for rate limit scenarios
- Graceful degradation when limits are reached

## Mobile Optimization

The component is optimized for Instagram's in-app browser:

- Touch-friendly interface
- Fast loading on 3G connections
- Responsive design for mobile devices
- Albanian language support

## Troubleshooting

### Common Issues

1. **"Instagram OAuth not configured" Error**
   - Check environment variables are set correctly
   - Verify Instagram App ID and Secret

2. **"Invalid Redirect URI" Error**
   - Ensure redirect URI matches exactly in Instagram settings
   - Check for trailing slashes or protocol mismatches

3. **"Permission Denied" Error**
   - Verify user is added as Instagram Tester
   - Check app is in Development mode for testing

4. **Database Connection Issues**
   - Verify Supabase credentials
   - Check database table exists and has correct schema

### Debug Mode

Enable debug logging in development:

```bash
NODE_ENV=development npm run dev
```

Check browser console and server logs for detailed error information.

## Production Deployment

### 1. App Review Process

Before going live, submit your Instagram app for review:

1. Complete App Review form
2. Provide app screenshots and usage description
3. Explain data usage and privacy policy
4. Wait for Facebook approval (usually 7-14 days)

### 2. Environment Variables

Update production environment variables:

```bash
INSTAGRAM_CLIENT_ID=production_app_id
INSTAGRAM_CLIENT_SECRET=production_app_secret
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=https://imirezervimi.al/api/auth/callback/instagram
NEXTAUTH_URL=https://imirezervimi.al
```

### 3. Domain Verification

Add your production domain to Instagram app settings:

1. Go to Instagram Basic Display settings
2. Add production OAuth Redirect URIs
3. Update callback URLs for production domain

## Support

For issues with Instagram integration:

1. Check [Instagram Basic Display API Documentation](https://developers.facebook.com/docs/instagram-basic-display-api)
2. Review [NextAuth.js Documentation](https://next-auth.js.org/)
3. Contact development team for application-specific issues

## Changelog

- **v1.0.0** - Initial Instagram login implementation
- **v1.0.1** - Added Albanian error messages
- **v1.0.2** - Mobile optimization improvements
- **v1.0.3** - Enhanced security and token handling