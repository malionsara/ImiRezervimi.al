// frontend/components/layout/Header.tsx
// Standardized header component for ImiRezervimi.al
// Ensures consistent branding, navigation, and mobile responsiveness

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

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
      { href: '/salons', label: 'Sallone' },
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
      primary: { href: '/login', label: 'Identifikohu', icon: '👤' },
      secondary: { href: '/salons', label: 'Zbulo Sallone', icon: '🔍' }
    },
    salon: {
      primary: { href: '/salon/register', label: 'Fillo Tani', icon: '🚀' },
      secondary: { href: '/login-salon', label: 'Hyr', icon: '🏪' }
    },
    minimal: {
      primary: { href: '/login', label: 'Identifikohu', icon: '👤' },
      secondary: null
    },
    auth: {
      primary: { href: '/', label: 'Kthehu në ballina', icon: '🏠' },
      secondary: null
    }
  }

  const currentCTA = ctaConfig[variant]

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
              {/* Logo Image/Icon */}
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-lg lg:text-xl">💅</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl lg:text-2xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {currentLogo.mainText}
                </span>
                <span className="text-xl lg:text-2xl font-black text-orange-500">
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