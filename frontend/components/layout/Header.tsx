// frontend/components/layout/Header.tsx
// Standardized header component for ImiRezervimi.al
// Ensures consistent branding, navigation, and mobile responsiveness

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, LogOut, LayoutDashboard, CalendarDays, Search, User, Home, Store, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Logo from '../ui/Logo'
import { cn } from '../../utils/cn'

interface HeaderProps {
  variant?: 'default' | 'salon' | 'minimal' | 'auth'
  showNav?: boolean
  transparent?: boolean
  fixed?: boolean
  className?: string
}

interface CtaLink {
  href: string
  label: string
  icon?: LucideIcon
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

  const baseStyles = cn(
    fixed ? 'fixed top-0 left-0 right-0 z-50' : 'relative',
    'transition-all duration-300 ease-in-out border-b',
    transparent && !scrolled
      ? 'bg-transparent border-transparent'
      : 'bg-cream/90 backdrop-blur-xl border-linen',
    className
  )

  const taglines: Record<string, string> = {
    default: 'Rezervime Online',
    salon: 'Për Sallone',
    minimal: '',
    auth: 'Rezervime Online',
  }

  const navigationItems: Record<string, CtaLink[]> = {
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

  const navItems = navigationItems[variant] || []

  // Helper to check if we're on dashboard pages
  const isDashboardPage = router.pathname.startsWith('/dashboard')

  const authenticatedUser = session
    ? {
        name: session.user?.name || 'User',
        image: session.user?.image,
        provider: 'Google' // Default since we primarily use Google auth
      }
    : null

  const ctaConfig: Record<string, { primary: CtaLink; secondary: CtaLink | null }> = {
    default: {
      primary: session
        ? isDashboardPage
          ? { href: '/salons', label: 'Zbulo Sallone', icon: Search }
          : { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
        : { href: '/login', label: 'Identifikohu', icon: User },
      secondary: { href: '/salons', label: 'Zbulo Sallone', icon: Search },
    },
    salon: {
      primary: { href: '/salon/register', label: 'Fillo Tani', icon: ArrowRight },
      secondary: { href: '/login-salon', label: 'Hyr', icon: Store },
    },
    minimal: {
      primary: session
        ? { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
        : { href: '/login', label: 'Identifikohu', icon: User },
      secondary: null,
    },
    auth: {
      primary: { href: '/', label: 'Kthehu në krye', icon: Home },
      secondary: null,
    }
  }

  const currentCTA = ctaConfig[variant]
  const PrimaryIcon = currentCTA.primary.icon
  const SecondaryIcon = currentCTA.secondary?.icon

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className={baseStyles}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Logo size="md" tagline={taglines[variant] || undefined} />

          {/* Desktop Navigation */}
          {showNav && navItems.length > 0 && (
            <nav className="hidden lg:flex gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-clay hover:text-ink font-medium text-sm transition-colors duration-200 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {session && authenticatedUser ? (
              /* Authenticated User Menu */
              <div className="flex items-center gap-4">
                {currentCTA.secondary && (
                  <Link
                    href={currentCTA.secondary.href}
                    className="inline-flex items-center gap-2 px-3 py-2 text-clay hover:text-ink font-medium text-sm transition-colors duration-200"
                  >
                    {SecondaryIcon && <SecondaryIcon size={18} strokeWidth={1.75} aria-hidden="true" />}
                    {currentCTA.secondary.label}
                  </Link>
                )}

                <div className="flex items-center gap-3">
                  {authenticatedUser.image && (
                    <Image
                      src={authenticatedUser.image}
                      alt={authenticatedUser.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {authenticatedUser.name}
                    </p>
                    <p className="text-xs text-clay">
                      {authenticatedUser.provider}
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white font-medium text-sm rounded hover:bg-accent-strong transition-colors duration-200"
                >
                  <LayoutDashboard size={18} strokeWidth={1.75} aria-hidden="true" />
                  Dashboard
                </Link>

                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 px-3 py-2 text-clay hover:text-ink font-medium text-sm transition-colors duration-200"
                >
                  <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
                  Dil
                </button>
              </div>
            ) : (
              /* Non-authenticated User Menu */
              <div className="flex items-center gap-3">
                {currentCTA.secondary && (
                  <Link
                    href={currentCTA.secondary.href}
                    className="inline-flex items-center gap-2 px-3 py-2 text-clay hover:text-ink font-medium text-sm transition-colors duration-200"
                  >
                    {SecondaryIcon && <SecondaryIcon size={18} strokeWidth={1.75} aria-hidden="true" />}
                    {currentCTA.secondary.label}
                  </Link>
                )}

                <Link
                  href={currentCTA.primary.href}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-medium text-sm rounded hover:bg-accent-strong transition-colors duration-200"
                >
                  {currentCTA.primary.label}
                  {PrimaryIcon && <PrimaryIcon size={18} strokeWidth={1.75} aria-hidden="true" />}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded hover:bg-sand transition-colors btn-touch"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={22} strokeWidth={1.75} className="text-ink" aria-hidden="true" />
            ) : (
              <Menu size={22} strokeWidth={1.75} className="text-ink" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-paper border-t border-linen mt-2 rounded-b-lg shadow-lifted overflow-hidden animate-slide-down">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation */}
              {showNav && navItems.length > 0 && (
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 text-ink hover:bg-sand rounded font-medium transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Mobile CTA Buttons */}
              <div className="pt-4 border-t border-linen space-y-3">
                {session && authenticatedUser ? (
                  /* Authenticated Mobile Menu */
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-sand rounded">
                      {authenticatedUser.image && (
                        <Image
                          src={authenticatedUser.image}
                          alt={authenticatedUser.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {authenticatedUser.name}
                        </p>
                        <p className="text-xs text-clay">
                          {authenticatedUser.provider}
                        </p>
                      </div>
                    </div>

                    {/* Secondary Link */}
                    {currentCTA.secondary && (
                      <Link
                        href={currentCTA.secondary.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-ink font-medium border border-linen hover:border-clay rounded transition-colors duration-200 btn-touch"
                      >
                        {SecondaryIcon && <SecondaryIcon size={18} strokeWidth={1.75} aria-hidden="true" />}
                        {currentCTA.secondary.label}
                      </Link>
                    )}

                    {/* Dashboard Link */}
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white font-medium rounded hover:bg-accent-strong transition-colors duration-200 btn-touch"
                    >
                      <LayoutDashboard size={18} strokeWidth={1.75} aria-hidden="true" />
                      Dashboard
                    </Link>

                    {/* Sign Out Button */}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleSignOut()
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-ink font-medium border border-linen hover:border-clay rounded transition-colors duration-200 btn-touch"
                    >
                      <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
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
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-ink font-medium border border-linen hover:border-clay rounded transition-colors duration-200 btn-touch"
                      >
                        {SecondaryIcon && <SecondaryIcon size={18} strokeWidth={1.75} aria-hidden="true" />}
                        {currentCTA.secondary.label}
                      </Link>
                    )}

                    <Link
                      href={currentCTA.primary.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white font-medium rounded hover:bg-accent-strong transition-colors duration-200 btn-touch"
                    >
                      {currentCTA.primary.label}
                      {PrimaryIcon && <PrimaryIcon size={18} strokeWidth={1.75} aria-hidden="true" />}
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
