// frontend/pages/api/auth/[...nextauth].js
// Simplified NextAuth without Supabase adapter - manual user handling

import NextAuth from 'next-auth'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default NextAuth({
  providers: [
    // Facebook provider (works for Instagram accounts too)
    FacebookProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
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
        if (account.provider === 'facebook') {
          userData.instagram_id = profile.id
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