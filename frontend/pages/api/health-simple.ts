// pages/api/health-simple.ts
// Simple health check endpoint for CI/testing environments

import type { NextApiRequest, NextApiResponse } from 'next';

type SimpleHealthResponse = {
  status: 'ok' | 'error';
  timestamp: string;
  environment: string;
  uptime: number;
  config: {
    supabase: boolean;
    twilio: boolean;
    instagram: boolean;
    nextauth: boolean;
  };
};

const startTime = Date.now();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleHealthResponse>
) {
  if (req.method !== 'GET') {
    res.status(405).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: 0,
      config: {
        supabase: false,
        twilio: false,
        instagram: false,
        nextauth: false
      }
    });
    return;
  }

  const healthResponse: SimpleHealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: Date.now() - startTime,
    config: {
      supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      instagram: !!(process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET),
      nextauth: !!process.env.NEXTAUTH_SECRET
    }
  };

  res.status(200).json(healthResponse);
}