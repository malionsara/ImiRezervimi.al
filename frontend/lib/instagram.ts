// frontend/lib/instagram.ts
// Instagram Basic Display API integration for ImiRezervimi.al

export interface InstagramAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: ['user_profile', 'user_media'];
}

export interface InstagramProfile {
  id: string;
  username: string;
  accountType: 'PERSONAL' | 'BUSINESS';
  mediaCount: number;
}

export interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
}

export interface InstagramUserData {
  id: string;
  username: string;
  account_type: 'PERSONAL' | 'BUSINESS';
  media_count: number;
}

// Instagram API endpoints
const INSTAGRAM_API_BASE = 'https://graph.instagram.com';
const INSTAGRAM_OAUTH_BASE = 'https://api.instagram.com/oauth';

/**
 * Generate Instagram OAuth authorization URL
 */
export function getInstagramAuthUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    throw new Error('Instagram OAuth configuration missing');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'user_profile,user_media',
    response_type: 'code'
  });

  return `${INSTAGRAM_OAUTH_BASE}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string, redirectUri?: string): Promise<InstagramTokenResponse> {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  
  // Use provided redirectUri or fallback to environment variable
  const finalRedirectUri = redirectUri || process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;

  if (!clientId || !clientSecret || !finalRedirectUri) {
    throw new Error('Instagram OAuth configuration missing');
  }

  console.log('🔄 Instagram token exchange params:', {
    client_id: clientId,
    redirect_uri: finalRedirectUri,
    code: code ? 'present' : 'missing'
  });
  const response = await fetch(`${INSTAGRAM_OAUTH_BASE}/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: finalRedirectUri,
      code: code,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Instagram token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Get Instagram user profile data
 */
export async function getInstagramProfile(accessToken: string): Promise<InstagramUserData> {
  const response = await fetch(
    `${INSTAGRAM_API_BASE}/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Instagram profile fetch failed: ${error}`);
  }

  return response.json();
}

/**
 * Validate Instagram access token
 */
export async function validateInstagramToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${INSTAGRAM_API_BASE}/me?fields=id&access_token=${accessToken}`
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Albanian error messages for Instagram authentication
 */
export const instagramErrorMessages = {
  MISSING_CONFIG: 'Konfigurimi i Instagram nuk është i plotë.',
  AUTH_FAILED: 'Identifikimi me Instagram dështoi. Ju lutemi provoni përsëri.',
  TOKEN_INVALID: 'Tokeni i Instagram është i pavlefshëm.',
  PROFILE_FETCH_FAILED: 'Nuk mund të merren të dhënat e profilit nga Instagram.',
  NETWORK_ERROR: 'Gabim në rrjet. Kontrolloni lidhjen tuaj të internetit.',
  PERMISSION_DENIED: 'Lejimet e Instagram u refuzuan.',
  RATE_LIMITED: 'Shumë kërkesa. Ju lutemi prisni pak dhe provoni përsëri.',
  UNKNOWN_ERROR: 'Ka ndodhur një gabim i papritur. Ju lutemi provoni përsëri.',
} as const;

/**
 * Get localized error message
 */
export function getInstagramErrorMessage(error: string): string {
  // Map common Instagram API errors to Albanian messages
  if (error.includes('access_token')) {
    return instagramErrorMessages.TOKEN_INVALID;
  }
  if (error.includes('rate limit')) {
    return instagramErrorMessages.RATE_LIMITED;
  }
  if (error.includes('permission')) {
    return instagramErrorMessages.PERMISSION_DENIED;
  }
  if (error.includes('network') || error.includes('fetch')) {
    return instagramErrorMessages.NETWORK_ERROR;
  }
  
  return instagramErrorMessages.UNKNOWN_ERROR;
}

/**
 * Encrypt sensitive Instagram data for storage
 */
export function encryptInstagramData(data: string): string {
  // Simple base64 encoding for now - in production use proper encryption
  return Buffer.from(data).toString('base64');
}

/**
 * Decrypt Instagram data from storage
 */
export function decryptInstagramData(encryptedData: string): string {
  try {
    return Buffer.from(encryptedData, 'base64').toString('utf-8');
  } catch {
    throw new Error('Failed to decrypt Instagram data');
  }
}