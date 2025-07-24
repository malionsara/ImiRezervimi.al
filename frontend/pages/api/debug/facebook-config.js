// API endpoint to provide Facebook configuration for debugging
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get configuration from environment
  const config = {
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    clientId: process.env.FACEBOOK_CLIENT_ID || null,
    hasClientSecret: !!process.env.FACEBOOK_CLIENT_SECRET,
    baseUrl: getBaseUrl(),
    nextAuthUrl: process.env.NEXTAUTH_URL,
    vercelUrl: process.env.VERCEL_URL,
    timestamp: new Date().toISOString()
  };

  res.status(200).json(config);
}

// Same function as in [...nextauth].js
function getBaseUrl() {
  // For production - always use www version since domain redirects
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://www.imirezervimi.al';
  }
  
  // For preview/staging deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For local development
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}