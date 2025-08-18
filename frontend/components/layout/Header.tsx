// frontend/components/layout/Header.tsx
// Standardized header component for ImiRezervimi.al
// Ensures consistent branding, navigation, and mobile responsiveness

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

interface HeaderProps {
  variant?: 'default' | 'salon' | 'minimal' | 'auth'
  showNav?: boolean
  transparent?: boolean
  fixed?: boolean
  className?: string
}

export default function Header({ 
  variant = 'default', 
  showNav = true, 
  transparent = false,
  fixed = false,
  className = ''
}: HeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!fixed) return
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [fixed])

  const baseStyles = `
    ${fixed ? 'fixed top-0 left-0 right-0 z-50' : 'relative'}
    transition-all duration-300 ease-in-out
    ${transparent && !scrolled 
      ? 'bg-transparent border-transparent' 
      : 'bg-white/95 backdrop-blur-xl border-red-100/50 shadow-lg shadow-red-100/25'
    }
    border-b
    ${className}
  `

  const logoConfig = {
    default: {
      mainText: 'ImiRezervimi',
      subText: '.al',
      tagline: 'Rezervime Online'
    },
    salon: {
      mainText: 'ImiRezervimi',
      subText: '.al',
      tagline: 'Për Sallone'
    },
    minimal: {
      mainText: 'ImiRezervimi',
      subText: '.al',
      tagline: ''
    },
    auth: {
      mainText: 'ImiRezervimi',
      subText: '.al',
      tagline: 'Rezervime Online'
    }
  }

  const currentLogo = logoConfig[variant]

  const navigationItems = {
    default: [
      { href: '#si-funksionon', label: 'Si funksionon' },
      { href: '/salon', label: 'Për Sallone' },
      { href: '#kontakt', label: 'Kontakt' }
    ],
    salon: [
      { href: '/salon#avantazhet', label: 'Avantazhet' },
      { href: '/salon#cmimi', label: 'Çmimi' },
      { href: '/salon#deshmi', label: 'Dëshmi' },
      { href: 'tel:+355694567890', label: 'Kontakt' }
    ]
  }

  const navItems = navigationItems[variant as keyof typeof navigationItems] || []

  const ctaConfig = {
    default: {
      primary: session ? { href: '/dashboard', label: 'Dashboard', icon: '📊' } : { href: '/login', label: 'Identifikohu', icon: '👤' },
      secondary: { href: '/salons', label: 'Zbulo Sallone', icon: '🔍' },
      authenticated: session ? { 
        user: {
          name: session.user?.name || 'User',
          image: session.user?.image,
          provider: 'Google' // Default since we primarily use Google auth
        },
        actions: [
          { href: '/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/dashboard/bookings', label: 'Rezervimet e mia', icon: '📅' },
          { label: 'Dil', action: 'signOut', icon: '🚪' }
        ]
      } : null
    },
    salon: {
      primary: { href: '/salon/register', label: 'Fillo Tani', icon: '🚀' },
      secondary: { href: '/login-salon', label: 'Hyr', icon: '🏪' },
      authenticated: session ? { 
        user: {
          name: session.user?.name || 'User',
          image: session.user?.image,
          provider: 'Google' // Default since we primarily use Google auth
        },
        actions: [
          { href: '/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/dashboard/bookings', label: 'Rezervimet e mia', icon: '📅' },
          { label: 'Dil', action: 'signOut', icon: '🚪' }
        ]
      } : null
    },
    minimal: {
      primary: session ? { href: '/dashboard', label: 'Dashboard', icon: '📊' } : { href: '/login', label: 'Identifikohu', icon: '👤' },
      secondary: null,
      authenticated: session ? { 
        user: {
          name: session.user?.name || 'User',
          image: session.user?.image,
          provider: 'Google' // Default since we primarily use Google auth
        },
        actions: [
          { href: '/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/dashboard/bookings', label: 'Rezervimet e mia', icon: '📅' },
          { label: 'Dil', action: 'signOut', icon: '🚪' }
        ]
      } : null
    },
    auth: {
      primary: { href: '/', label: 'Kthehu në krye', icon: '🏠' },
      secondary: null,
      authenticated: session ? { 
        user: {
          name: session.user?.name || 'User',
          image: session.user?.image,
          provider: 'Google' // Default since we primarily use Google auth
        },
        actions: [
          { href: '/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/dashboard/bookings', label: 'Rezervimet e mia', icon: '📅' },
          { label: 'Dil', action: 'signOut', icon: '🚪' }
        ]
      } : null
    }
  }

  const currentCTA = ctaConfig[variant]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className={baseStyles}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-300"
          >
            <div className="relative">
              {/* Logo Image */}
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-white shadow-lg group-hover:shadow-xl transition-shadow overflow-hidden">
                <Image 
                  src="/favicon-96x96.png" 
                  alt="ImiRezervimi Logo" 
                  width={48} 
                  height={48} 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {currentLogo.mainText}
                </span>
                <span className="text-xl lg:text-2xl font-bold text-orange-500">
                  {currentLogo.subText}
                </span>
              </div>
              {currentLogo.tagline && (
                <span className="text-xs lg:text-sm text-gray-600 -mt-1 font-medium">
                  {currentLogo.tagline}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          {showNav && navItems.length > 0 && (
            <nav className="hidden lg:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {session && currentCTA.authenticated ? (
              /* Authenticated User Menu */
              <div className="flex items-center space-x-4">
                {currentCTA.secondary && (
                  <Link
                    href={currentCTA.secondary.href}
                    className="px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors duration-200"
                  >
                    <span className="mr-2">{currentCTA.secondary.icon}</span>
                    {currentCTA.secondary.label}
                  </Link>
                )}
                
                <div className="flex items-center space-x-3">
                  {currentCTA.authenticated.user.image && (
                    <Image
                      src={currentCTA.authenticated.user.image}
                      alt={currentCTA.authenticated.user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {currentCTA.authenticated.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentCTA.authenticated.user.provider === 'instagram' ? 'Instagram' : 'Google'}
                    </p>
                  </div>
                </div>
                
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span className="mr-2">📊</span>
                  Dashboard
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors duration-200"
                >
                  <span className="mr-2">🚪</span>
                  Dil
                </button>
              </div>
            ) : (
              /* Non-authenticated User Menu */
              <div className="flex items-center space-x-3">
                {currentCTA.secondary && (
                  <Link
                    href={currentCTA.secondary.href}
                    className="px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors duration-200"
                  >
                    <span className="mr-2">{currentCTA.secondary.icon}</span>
                    {currentCTA.secondary.label}
                  </Link>
                )}
                
                <Link
                  href={currentCTA.primary.href}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span className="mr-2">{currentCTA.primary.icon}</span>
                  {currentCTA.primary.label}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-600 mt-1 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-600 mt-1 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-red-100 mt-2 rounded-b-xl shadow-xl overflow-hidden animate-slideDown">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation */}
              {showNav && navItems.length > 0 && (
                <div className="space-y-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Mobile CTA Buttons */}
              <div className="pt-4 border-t border-red-100 space-y-3">
                {session && currentCTA.authenticated ? (
                  /* Authenticated Mobile Menu */
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-xl">
                      {currentCTA.authenticated.user.image && (
                        <Image
                          src={currentCTA.authenticated.user.image}
                          alt={currentCTA.authenticated.user.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {currentCTA.authenticated.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentCTA.authenticated.user.provider === 'instagram' ? 'Instagram' : 'Google'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Secondary Link */}
                    {currentCTA.secondary && (
                      <Link
                        href={currentCTA.secondary.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center px-4 py-2 text-gray-700 hover:text-red-600 font-medium border border-gray-300 hover:border-red-300 rounded-xl transition-colors duration-200"
                      >
                        <span className="mr-2">{currentCTA.secondary.icon}</span>
                        {currentCTA.secondary.label}
                      </Link>
                    )}
                    
                    {/* Dashboard Link */}
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
                    >
                      <span className="mr-2">📊</span>
                      Dashboard
                    </Link>
                    
                    {/* Sign Out Button */}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleSignOut()
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 text-gray-700 hover:text-red-600 font-medium border border-gray-300 hover:border-red-300 rounded-xl transition-colors duration-200"
                    >
                      <span className="mr-2">🚪</span>
                      Dil
                    </button>
                  </div>
                ) : (
                  /* Non-authenticated Mobile Menu */
                  <div className="space-y-3">
                    {currentCTA.secondary && (
                      <Link
                        href={currentCTA.secondary.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center px-4 py-2 text-gray-700 hover:text-red-600 font-medium border border-gray-300 hover:border-red-300 rounded-xl transition-colors duration-200"
                      >
                        <span className="mr-2">{currentCTA.secondary.icon}</span>
                        {currentCTA.secondary.label}
                      </Link>
                    )}
                    
                    <Link
                      href={currentCTA.primary.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
                    >
                      <span className="mr-2">{currentCTA.primary.icon}</span>
                      {currentCTA.primary.label}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

// Animation classes for Tailwind (add to globals.css)
/*
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slideDown {
  animation: slideDown 0.2s ease-out;
}
*/