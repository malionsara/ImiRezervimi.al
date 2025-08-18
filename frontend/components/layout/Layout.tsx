// frontend/components/layout/Layout.tsx
// Main layout wrapper for ImiRezervimi.al
// Provides consistent page structure and responsive design

import { ReactNode } from 'react'
import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  headerVariant?: 'default' | 'salon' | 'minimal' | 'auth'
  footerVariant?: 'default' | 'salon' | 'minimal'
  showHeader?: boolean
  showFooter?: boolean
  showNav?: boolean
  transparentHeader?: boolean
  fixedHeader?: boolean
  backgroundClass?: string
  containerClass?: string
  className?: string
}

const defaultMeta = {
  title: 'ImiRezervimi.al - Rezervime Online për Sallone Bukurie',
  description: 'Platforma e parë shqiptare për rezervime online në sallone bukurie. Rezervo me Instagram, konfirmo me WhatsApp.',
  keywords: 'rezervime online, sallone bukurie, shqiperi, manikyr, haircut, instagram booking, whatsapp confirmation',
  ogImage: '/og-image.jpg'
}

export default function Layout({
  children,
  title,
  description,
  keywords,
  ogImage,
  headerVariant = 'default',
  footerVariant = 'default',
  showHeader = true,
  showFooter = true,
  showNav = true,
  transparentHeader = false,
  fixedHeader = false,
  backgroundClass = 'bg-white',
  containerClass = '',
  className = ''
}: LayoutProps) {
  const pageTitle = title ? `${title} | ImiRezervimi.al` : defaultMeta.title
  const pageDescription = description || defaultMeta.description
  const pageKeywords = keywords || defaultMeta.keywords
  const pageOgImage = ogImage || defaultMeta.ogImage

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ef4444" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://imirezervimi.al" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageOgImage} />
        <meta property="og:site_name" content="ImiRezervimi.al" />
        <meta property="og:locale" content="sq_AL" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://imirezervimi.al" />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content={pageOgImage} />
        
        {/* Apple */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ImiRezervimi" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ImiRezervimi.al",
              "url": "https://imirezervimi.al",
              "description": pageDescription,
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
              },
              "creator": {
                "@type": "Organization",
                "name": "ImiRezervimi.al",
                "url": "https://imirezervimi.al"
              }
            })
          }}
        />
      </Head>

      <div className={`min-h-screen flex flex-col ${backgroundClass} ${className}`}>
        {/* Header */}
        {showHeader && (
          <Header
            variant={headerVariant}
            showNav={showNav}
            transparent={transparentHeader}
            fixed={fixedHeader}
          />
        )}

        {/* Main Content */}
        <main 
          className={`flex-1 ${fixedHeader ? 'pt-16 lg:pt-20' : ''} ${containerClass}`}
          role="main"
        >
          {children}
        </main>

        {/* Footer */}
        {showFooter && (
          <Footer variant={footerVariant} />
        )}
      </div>

      {/* Global Loading Spinner */}
      <div 
        id="global-loading"
        className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 hidden"
        role="progressbar"
        aria-label="Po ngarkohet..."
      >
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4 shadow-2xl animate-pulse mx-auto">
            <span className="text-2xl">💅</span>
          </div>
          <div className="flex space-x-1 justify-center mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-gray-600 text-sm">Po ngarkohet...</p>
        </div>
      </div>
    </>
  )
}

// Utility functions for dynamic layout control
export const showGlobalLoading = () => {
  const loader = document.getElementById('global-loading')
  if (loader) loader.classList.remove('hidden')
}

export const hideGlobalLoading = () => {
  const loader = document.getElementById('global-loading')
  if (loader) loader.classList.add('hidden')
}

// Layout variants for common page types
export const homeLayout = (props: Partial<LayoutProps>) => ({
  headerVariant: 'default' as const,
  footerVariant: 'default' as const,
  transparentHeader: true,
  fixedHeader: true,
  backgroundClass: 'bg-gradient-to-br from-pink-50 via-red-50 to-orange-50',
  ...props
})

export const salonLayout = (props: Partial<LayoutProps>) => ({
  headerVariant: 'salon' as const,
  footerVariant: 'salon' as const,
  transparentHeader: true,
  fixedHeader: true,
  backgroundClass: 'bg-gradient-to-br from-pink-50 via-red-50 to-orange-50',
  ...props
})

export const authLayout = (props: Partial<LayoutProps>) => ({
  headerVariant: 'auth' as const,
  footerVariant: 'minimal' as const,
  backgroundClass: 'bg-gradient-to-br from-pink-50 via-red-50 to-orange-50',
  ...props
})

export const dashboardLayout = (props: Partial<LayoutProps>) => ({
  headerVariant: 'minimal' as const,
  footerVariant: 'minimal' as const,
  backgroundClass: 'bg-gray-50',
  ...props
})

export const bookingLayout = (props: Partial<LayoutProps>) => ({
  headerVariant: 'minimal' as const,
  footerVariant: 'minimal' as const,
  backgroundClass: 'bg-white',
  ...props
})