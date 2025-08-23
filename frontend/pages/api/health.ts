// pages/api/health.ts
// Health check endpoint for monitoring and testing

import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    [key: string]: {
      status: 'up' | 'down' | 'degraded';
      latency?: number;
      message?: string;
    };
  };
  uptime: number;
};

const startTime = Date.now();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {},
      uptime: 0
    });
    return;
  }

  const healthResponse: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {},
    uptime: Date.now() - startTime
  };

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  try {
    // Check Supabase connection
    const supabaseStart = Date.now();
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        healthResponse.services.supabase = {
          status: 'down',
          message: 'Supabase configuration missing'
        };
        overallStatus = 'degraded';
      } else {
        // Simple connection test
        // Simple connection test with timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        const latency = Date.now() - supabaseStart;
        
        if (response.ok) {
          healthResponse.services.supabase = {
            status: latency > 2000 ? 'degraded' : 'up',
            latency
          };
          if (latency > 2000) {
            overallStatus = 'degraded';
          }
        } else {
          healthResponse.services.supabase = {
            status: 'down',
            message: `HTTP ${response.status}`
          };
          overallStatus = 'degraded';
        }
      }
    } catch (error) {
      healthResponse.services.supabase = {
        status: 'down',
        message: error instanceof Error ? error.message : 'Connection failed'
      };
      overallStatus = 'degraded';
    }

    // Check Twilio connection (for WhatsApp)
    const twilioStart = Date.now();
    try {
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioToken = process.env.TWILIO_AUTH_TOKEN;
      
      if (!twilioSid || !twilioToken) {
        healthResponse.services.twilio = {
          status: 'down',
          message: 'Twilio configuration missing'
        };
        overallStatus = 'degraded';
      } else {
        // Simple Twilio API test
        const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}.json`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        const latency = Date.now() - twilioStart;
        
        if (response.ok) {
          healthResponse.services.twilio = {
            status: latency > 3000 ? 'degraded' : 'up',
            latency
          };
          if (latency > 3000) {
            overallStatus = 'degraded';
          }
        } else {
          healthResponse.services.twilio = {
            status: 'down',
            message: `HTTP ${response.status}`
          };
          overallStatus = 'degraded';
        }
      }
    } catch (error) {
      healthResponse.services.twilio = {
        status: 'down',
        message: error instanceof Error ? error.message : 'Connection failed'
      };
      overallStatus = 'degraded';
    }

    // Check Instagram API configuration
    const instagramClientId = process.env.INSTAGRAM_CLIENT_ID;
    const instagramSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    
    if (!instagramClientId || !instagramSecret) {
      healthResponse.services.instagram = {
        status: 'down',
        message: 'Instagram API configuration missing'
      };
      overallStatus = 'degraded';
    } else {
      healthResponse.services.instagram = {
        status: 'up',
        message: 'Configuration present'
      };
    }

    // Check NextAuth configuration
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    
    if (!nextAuthSecret) {
      healthResponse.services.nextauth = {
        status: 'down',
        message: 'NextAuth secret missing'
      };
      overallStatus = 'degraded';
    } else {
      healthResponse.services.nextauth = {
        status: 'up',
        message: 'Configuration present'
      };
    }

  } catch (error) {
    console.error('Health check error:', error);
    overallStatus = 'unhealthy';
  }

  // Set overall status
  healthResponse.status = overallStatus;

  // Return appropriate HTTP status
  const httpStatus = overallStatus === 'healthy' ? 200 : 
                    overallStatus === 'degraded' ? 200 : 503;

  res.status(httpStatus).json(healthResponse);
}