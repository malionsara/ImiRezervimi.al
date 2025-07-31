// frontend/pages/api/auth/[...nextauth].js
// Simplified NextAuth without Supabase adapter - manual user handling

import NextAuth from 'next-auth'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'
// Remove unused import - using Facebook Graph API directly now

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Dynamic URL configuration for multiple environments
const getBaseUrl = () => {
  // For production - always use www version since domain redirects
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://www.imirezervimi.al'; // Your custom domain with www
  }
  
  // For preview/staging deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For local development
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // Facebook Login for end users
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'email,public_profile'
        }
      }
    }),
    
    // Google provider as backup
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile'
        }
      }
    })
  ],
  
  // Remove Supabase adapter - use JWT strategy instead
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  
  // Add NEXTAUTH_URL for production
  url: getBaseUrl(),
  
  callbacks: {

    async jwt({ token, user, account, profile, trigger }) {
      // Store social login data temporarily until phone verification
      if (user && account) {
        token.email = user.email
        token.name = user.name
        token.image = user.image
        token.provider = account.provider
        
        // Store provider-specific IDs
        if (account.provider === 'facebook') {
          token.providerId = profile?.id || user.id
        } else if (account.provider === 'google') {
          token.providerId = profile?.sub || profile?.id || user.id
        }
      }
      
      // Check registration status on sign-in OR when session is updated
      if ((user && account) || trigger === 'update') {
        try {
          const { data: existingUser, error: dbError } = await supabase
            .from('customers')
            .select('id, phone_verified')
            .eq('email', token.email)
            .single()
          
          if (dbError && dbError.code !== 'PGRST116') {
            console.error('❌ JWT Callback - Database error:', dbError)
            // Assume not registered if database error
            token.isRegistered = false
          } else if (existingUser && existingUser.phone_verified) {
            token.userId = existingUser.id
            token.isRegistered = true
            console.log('✅ JWT Callback - User is fully registered:', token.email)
          } else {
            token.isRegistered = false
            console.log('⚠️ JWT Callback - User needs phone verification:', token.email)
          }

        } catch (error) {
          console.error('❌ JWT Callback - Connection error:', error)
          token.isRegistered = false
        }
      }
      
      return token
    },
    
    async session({ session, token }) {
      // Add user data to session
      session.user.id = token.userId
      session.user.provider = token.provider
      session.user.providerId = token.providerId
      session.user.isRegistered = token.isRegistered
      
      // Include temporary data for unregistered users
      if (!token.isRegistered) {
        session.user.tempData = {
          email: token.email,
          name: token.name,
          image: token.image,
          provider: token.provider,
          providerId: token.providerId
        }
      }
      
      return session
    },
    
    async signIn({ user, account }) {
      console.log('🚀 Sign in attempt:', { 
        provider: account.provider, 
        user: user.name,
        email: user.email 
      })
      
      try {
        // Check if user exists and is fully registered (has verified phone)
        const { data: existingUser, error: checkError } = await supabase
          .from('customers')
          .select('id, first_name, last_name, phone_verified, phone')
          .eq('email', user.email)
          .single()
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ Database check error:', checkError)
        }
        
        if (existingUser && existingUser.phone_verified) {
          // Existing user with verified phone - allow login
          console.log('✅ Existing verified user logging in')
          return true
        } else if (existingUser && !existingUser.phone_verified) {
          // User exists but phone not verified - needs to complete registration
          console.log('⚠️ User exists but phone not verified - redirect to complete registration')
          return true // Allow signin but will redirect to complete registration
        } else {
          // New user - needs full registration flow
          console.log('🆕 New user - needs complete registration')
          return true // Allow signin but will redirect to complete registration
        }
        
      } catch (error) {
        console.error('❌ SignIn callback error:', error)
        return true // Still allow signin to prevent blocking
      }
    },
    
    async redirect({ url, baseUrl }) {
      // Allow redirect to complete-registration page
      if (url.includes('/complete-registration')) {
        return url
      }
      
      // Default redirect - let the frontend handle registration check
      const urlParams = new URLSearchParams(url.split('?')[1] || '')
      const callbackUrl = urlParams.get('callbackUrl')
      
      console.log('🔀 Redirecting after auth')
      return callbackUrl || baseUrl + '/dashboard'
    }
  },
  
  debug: process.env.NODE_ENV === 'development'
}

export default NextAuth(authOptions)