// frontend/pages/api/debug/nextauth.js
// NextAuth configuration debugging endpoint

export default function handler(req, res) {
  // Only allow in development or with debug key
  const isDebugMode = process.env.NODE_ENV === 'development' || 
                     req.query.debug === process.env.DEBUG_KEY;
  
  if (!isDebugMode) {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    // Safely get environment variables without exposing secrets
    const config = {
      nextauth: {
        url: process.env.NEXTAUTH_URL,
        secret: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
        vercel_env: process.env.VERCEL_ENV,
        vercel_url: process.env.VERCEL_URL,
      },
      instagram: {
        client_id: process.env.INSTAGRAM_CLIENT_ID ? 'SET' : 'MISSING',
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET ? 'SET' : 'MISSING',
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
        anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
        service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      },
      computed: {
        base_url: getComputedBaseUrl(),
        instagram_redirect: `${getComputedBaseUrl()}/api/auth/callback/instagram`,
      },
      checks: {
        all_instagram_vars: process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET,
        nextauth_configured: process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL,
        domain_redirect_issue: process.env.VERCEL_ENV === 'production' && !getComputedBaseUrl().includes('www'),
      }
    };

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      config,
      warnings: generateWarnings(config),
      recommendations: generateRecommendations(config)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

function getComputedBaseUrl() {
  // Replicate the getBaseUrl logic from NextAuth config
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://www.imirezervimi.al';
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

function generateWarnings(config) {
  const warnings = [];
  
  if (config.instagram.client_id === 'MISSING') {
    warnings.push('INSTAGRAM_CLIENT_ID environment variable is missing');
  }
  
  if (config.instagram.client_secret === 'MISSING') {
    warnings.push('INSTAGRAM_CLIENT_SECRET environment variable is missing');
  }
  
  if (config.nextauth.secret === 'MISSING') {
    warnings.push('NEXTAUTH_SECRET environment variable is missing');
  }
  
  if (config.checks.domain_redirect_issue) {
    warnings.push('Domain redirect issue: Production URL should use www version');
  }
  
  return warnings;
}

function generateRecommendations(config) {
  const recommendations = [];
  
  if (!config.checks.all_instagram_vars) {
    recommendations.push({
      issue: 'Missing Instagram OAuth credentials',
      solution: 'Set INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET in Vercel environment variables',
      priority: 'HIGH'
    });
  }
  
  if (!config.checks.nextauth_configured) {
    recommendations.push({
      issue: 'NextAuth not properly configured',
      solution: 'Set NEXTAUTH_SECRET and NEXTAUTH_URL in environment variables',
      priority: 'HIGH'
    });
  }
  
  recommendations.push({
    issue: 'Instagram app configuration',
    solution: 'Ensure both redirect URIs are added to Instagram app: ' +
              'https://imirezervimi.al/api/auth/callback/instagram AND ' +
              'https://www.imirezervimi.al/api/auth/callback/instagram',
    priority: 'CRITICAL'
  });
  
  return recommendations;
}