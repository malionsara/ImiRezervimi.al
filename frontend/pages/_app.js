// frontend/pages/_app.js
// NextAuth session provider for Albanian app

import { SessionProvider } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { SpeedInsights } from "@vercel/speed-insights/next"
import Head from 'next/head'
import '../styles/globals.css'

// Initialize Supabase client with fallback values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize app
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg animate-pulse">
            <span className="text-2xl font-bold text-white">IR</span>
          </div>
          <p className="text-gray-600">Po ngarkohet...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-32x32.png" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="msapplication-TileColor" content="#dc2626" />
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} supabase={supabase} />
        <SpeedInsights />
      </SessionProvider>
    </>
  )
}