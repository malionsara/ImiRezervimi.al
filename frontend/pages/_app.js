// frontend/pages/_app.js
// NextAuth session provider for Albanian app

import { SessionProvider } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Head from 'next/head'
import ToastProvider from '../components/ToastProvider'
import '../styles/globals.css'

// Removed Twilio validation from frontend - only runs on server-side

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
        {/* Standard Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-128x128.png" />

        {/* iOS Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ImiRezervimi" />

        {/* Theme Colors */}
        <meta name="theme-color" content="#dc2626" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="ImiRezervimi.al" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* SEO & Description */}
        <meta name="description" content="Platforma shqiptare për rezervime në sallone bukurie. Gjej dhe rezervo takimin tënd lehtësisht." />
        <meta name="keywords" content="rezervime, sallone bukurie, Shqipëri, beauty, salon, booking" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ImiRezervimi.al - Rezervo takimin tënd" />
        <meta property="og:description" content="Platforma shqiptare për rezervime në sallone bukurie" />
        <meta property="og:site_name" content="ImiRezervimi.al" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ImiRezervimi.al - Rezervo takimin tënd" />
        <meta name="twitter:description" content="Platforma shqiptare për rezervime në sallone bukurie" />

        {/* Viewport for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </Head>
      <SessionProvider session={session}>
        <ToastProvider>
          <Component {...pageProps} supabase={supabase} />
          {/* Vercel Features */}
          <SpeedInsights />
          <Analytics />
        </ToastProvider>
      </SessionProvider>
    </>
  )
}