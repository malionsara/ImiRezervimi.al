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

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // Facebook Login with Instagram access (replaces deprecated Instagram Basic Display)
    {
      id: "instagram-via-facebook",
      name: "Instagram",
      type: "oauth",
      authorization: {
        url: "https://www.facebook.com/v18.0/dialog/oauth",
        params: {
          scope: "email,public_profile,instagram_basic,pages_show_list",
          response_type: "code",
        },
      },
      token: {
        url: "https://graph.facebook.com/v18.0/oauth/access_token",
      },
      userinfo: {
        url: "https://graph.facebook.com/v18.0/me",
        params: {
          fields: "id,name,email,picture,accounts{instagram_business_account{id,username,profile_picture_url,followers_count}}"
        },
        async request({ tokens }) {
          try {
            console.log('🔄 Facebook/Instagram profile fetch starting...');
            
            // Get Facebook profile with Instagram business account data
            const profileResponse = await fetch(
              `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture,accounts{instagram_business_account{id,username,profile_picture_url,followers_count}}&access_token=${tokens.access_token}`
            );
            
            if (!profileResponse.ok) {
              throw new Error(`Profile fetch failed: ${profileResponse.statusText}`);
            }
            
            const profile = await profileResponse.json();
            console.log('✅ Facebook/Instagram profile fetch successful');
            
            // Extract Instagram account if available
            let instagramAccount = null;
            if (profile.accounts?.data) {
              for (const account of profile.accounts.data) {
                if (account.instagram_business_account) {
                  instagramAccount = account.instagram_business_account;
                  break;
                }
              }
            }
            
            return {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              image: profile.picture?.data?.url,
              instagram: instagramAccount ? {
                id: instagramAccount.id,
                username: instagramAccount.username,
                profile_picture_url: instagramAccount.profile_picture_url,
                followers_count: instagramAccount.followers_count
              } : null
            };
          } catch (error) {
            console.error('❌ Facebook/Instagram profile fetch error:', error);
            throw error;
          }
        },
      },
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.image,
          instagram: profile.instagram, // Instagram account data if available
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
  url: getBaseUrl(),
  
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
          userData.instagram_username = profile.username
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