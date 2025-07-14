/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configure external image domains
  images: {
    domains: [
      // Facebook/Instagram profile images
      'platform-lookaside.fbsbx.com',
      'graph.facebook.com',
      'scontent.fbkr1-1.fna.fbcdn.net',
      
      // Google profile images
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      
      // Instagram profile images
      'instagram.com',
      'scontent.cdninstagram.com',
      
      // Supabase storage (for future uploaded images)
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || 'your-supabase-url.supabase.co',
      
      // Local development
      'localhost'
    ],
    
    // Image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Enable modern image formats
    formats: ['image/webp', 'image/avif'],
    
    // Minimize layout shift
    minimumCacheTTL: 60,
  },
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Experimental features (optional)
  experimental: {
    // Enable app directory for future migration
    appDir: false,
    
    // Optimize images during build
    optimizeImages: true,
  },
  
  // Environment variables available to the browser
  env: {
    CUSTOM_APP_NAME: 'ImiRezervimi.al',
    CUSTOM_APP_VERSION: '1.0.0',
  },
  
  // Redirects for SEO (optional)
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/salon/:slug',
        destination: '/:slug',
        permanent: false,
      },
    ]
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig