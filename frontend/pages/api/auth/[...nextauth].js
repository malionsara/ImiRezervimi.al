// frontend/pages/api/auth/[...nextauth].js
// Simplified NextAuth without Supabase adapter - manual user handling

import NextAuth from 'next-auth'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'
import { exchangeCodeForToken, getInstagramProfile } from '../../../lib/instagram'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Dynamic URL configuration for multiple environments
const getBaseUrl = () => {
  // For production
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://imirezervimi.al'; // Your custom domain
  }
  
  // For preview/staging deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For local development
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  url: getBaseUrl(),
  providers: [
    // Instagram Basic Display API provider
    {
      id: "instagram",
      name: "Instagram",
      type: "oauth",
      authorization: {
        url: "https://api.instagram.com/oauth/authorize",
        params: {
          client_id: process.env.INSTAGRAM_CLIENT_ID,
          redirect_uri: `${getBaseUrl()}/api/auth/callback/instagram`,
          scope: "user_profile,user_media",
          response_type: "code",
        },
      },
      token: {
        url: "https://api.instagram.com/oauth/access_token",
        async request({ params }) {
          try {
            console.log('🔄 Instagram token exchange starting...', { code: params.code });
            const tokenResponse = await exchangeCodeForToken(params.code, `${getBaseUrl()}/api/auth/callback/instagram`);
            console.log('✅ Instagram token exchange successful');
            return {
              tokens: {
                access_token: tokenResponse.access_token,
                token_type: "Bearer",
              },
            };
          } catch (error) {
            console.error('❌ Instagram token exchange error:', error);
            throw error;
          }
        },
      },
      userinfo: {
        async request({ tokens }) {
          try {
            console.log('🔄 Instagram profile fetch starting...');
            const profile = await getInstagramProfile(tokens.access_token);
            console.log('✅ Instagram profile fetch successful:', profile.username);
            return {
              id: profile.id,
              name: profile.username,
              username: profile.username,
              account_type: profile.account_type,
              media_count: profile.media_count,
            };
          } catch (error) {
            console.error('❌ Instagram profile fetch error:', error);
            throw error;
          }
        },
      },
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username,
          username: profile.username,
          image: null, // Instagram Basic Display API doesn't provide profile photos
          email: null, // Instagram Basic Display API doesn't provide email
        };
      },
    },
    
    // Facebook provider (fallback for Instagram accounts)
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
  url: process.env.NEXTAUTH_URL,
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist user data in JWT token
      if (user) {
        token.userId = user.id
        token.provider = account?.provider
      }
      return token
    },
    
    async session({ session, token }) {
      // Add custom data to session
      session.user.id = token.userId
      session.user.provider = token.provider
      return session
    },
    
    async signIn({ user, account, profile }) {
      console.log('🚀 Sign in attempt:', { 
        provider: account.provider, 
        user: user.name,
        email: user.email 
      })
      
      try {
        // Check if user exists in our database
        const { data: existingUser, error: checkError } = await supabase
          .from('customers')
          .select('id, first_name, last_name')
          .eq('email', user.email)
          .single()
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ Database check error:', checkError)
        }
        
        // Create or update user in Supabase
        const userData = {
          email: user.email,
          first_name: user.name?.split(' ')[0] || '',
          last_name: user.name?.split(' ').slice(1).join(' ') || '',
          profile_photo_url: user.image,
          account_type: 'social',
          phone_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Add provider-specific fields
        if (account.provider === 'instagram') {
          userData.instagram_id = profile.id
        } else if (account.provider === 'facebook') {
          userData.facebook_id = profile.id
        } else if (account.provider === 'google') {
          userData.google_id = profile.sub || profile.id
        }
        
        if (existingUser) {
          // Update existing user
          const { error: updateError } = await supabase
            .from('customers')
            .update({
              ...userData,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingUser.id)
          
          if (updateError) {
            console.error('❌ Update user error:', updateError)
          } else {
            console.log('✅ User updated successfully')
          }
        } else {
          // Create new user
          const { data: newUser, error: insertError } = await supabase
            .from('customers')
            .insert([userData])
            .select()
            .single()
          
          if (insertError) {
            console.error('❌ Create user error:', insertError)
          } else {
            console.log('✅ New user created:', newUser)
          }
        }
        
        return true // Always allow sign in
        
      } catch (error) {
        console.error('❌ SignIn callback error:', error)
        return true // Still allow login even if database fails
      }
    },
    
    async redirect({ baseUrl }) {
      // Always redirect to Albanian dashboard after login
      console.log('🔀 Redirecting to dashboard')
      return baseUrl + '/dashboard'
    }
  },
  
  debug: process.env.NODE_ENV === 'development'
})