// frontend/pages/salon-booking-improved.tsx
// Improved mobile-first salon booking page
// This will replace [slug].tsx with better mobile experience

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Layout, { bookingLayout } from '../components/layout/Layout'
import MobileBookingForm from '../components/booking/MobileBookingForm'
import Link from 'next/link'

// Types
interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
  sort_order: number
}

interface Salon {
  id: string
  name: string
  slug: string
  description: string
  phone: string
  address: string
  city: string
  instagram_handle: string
  working_hours: { [key: string]: { open: string; close: string; closed: boolean } }
  services: Service[]
}

export default function ImprovedSalonBookingPage() {
  const router = useRouter()
  const { slug } = router.query
  const { data: session, status } = useSession()

  const [salon, setSalon] = useState<Salon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [appointmentId, setAppointmentId] = useState('')

  // Fetch salon data
  useEffect(() => {
    if (!slug || typeof slug !== 'string') return

    const fetchSalonData = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/salon/${slug}`)
        const data = await response.json()

        if (data.success && data.data) {
          setSalon(data.data)
        } else {
          setError('Salloni nuk u gjet ose nuk është aktiv')
        }
      } catch (err) {
        console.error('Error fetching salon:', err)
        setError('Gabim në lidhje me serverin')
      } finally {
        setLoading(false)
      }
    }

    fetchSalonData()
  }, [slug])

  const handleBookingSuccess = (id: string) => {
    setAppointmentId(id)
    setBookingSuccess(true)
  }

  const handleBookingError = (errorMessage: string) => {
    setError(errorMessage)
  }

  // Loading state
  if (loading) {
    return (
      <Layout {...bookingLayout({ title: 'Po ngarkon...', showHeader: false })}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="h-16 w-16 mx-auto rounded-lg bg-accent flex items-center justify-center mb-4 shadow-lifted animate-pulse">
              <span className="text-2xl">💅</span>
            </div>
            <div className="flex space-x-1 justify-center mb-4">
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <h2 className="text-xl font-semibold text-ink mb-2">Po ngarkon...</h2>
            <p className="text-clay">Po marrim informacionet e sallonit</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Error state
  if (error && !salon) {
    return (
      <Layout {...bookingLayout({ title: 'Gabim', showHeader: false })}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="mx-auto w-16 h-16 bg-accent-soft rounded-lg flex items-center justify-center mb-6">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-semibold text-ink mb-2">Gabim</h2>
            <p className="text-clay mb-8">{error}</p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-6 bg-accent text-white font-medium rounded hover:bg-accent-strong transition-all touch-manipulation"
              >
                🔄 Provo përsëri
              </button>
              <Link
                href="/salons"
                className="block w-full py-3 px-6 bg-paper border border-linen text-ink font-medium rounded hover:bg-cream transition-colors text-center touch-manipulation"
              >
                ← Kthehu te sallone
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Success state
  if (bookingSuccess && appointmentId) {
    return (
      <Layout {...bookingLayout({ 
        title: `Rezervimi u dërgua - ${salon?.name}`,
        description: 'Rezervimi juaj u dërgua me sukses. Do të merrni konfirmim në WhatsApp.'
      })}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md mx-auto">
            <div className="bg-paper rounded-lg shadow-soft p-8 text-center">
              {/* Success Animation */}
              <div className="mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-xl">✓</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-ink mb-2">Rezervimi u dërgua!</h2>
              
              <div className="space-y-3 text-left bg-cream rounded p-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-clay">Salloni:</span>
                  <span className="font-medium">{salon?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-clay">ID Rezervimi:</span>
                  <span className="font-mono text-sm font-medium">{appointmentId.slice(0, 8)}</span>
                </div>
              </div>

              <div className="space-y-4 text-sm text-clay mb-8">
                <div className="flex items-center justify-center space-x-2 p-3 bg-accent-soft/40 rounded">
                  <span className="text-lg">💬</span>
                  <p>Do të merrni konfirmim në WhatsApp nga salloni</p>
                </div>
                
                <div className="flex items-center justify-center space-x-2 p-3 bg-success/5 rounded">
                  <span className="text-lg">📱</span>
                  <p>Mund të ndiqni statusin e rezervimit tuaj</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/booking/${appointmentId}/status`}
                  className="block w-full py-3 px-6 bg-accent text-white font-medium rounded hover:bg-accent-strong transition-all touch-manipulation"
                >
                  📋 Shiko Statusin
                </Link>
                
                <Link
                  href="/salons"
                  className="block w-full py-3 px-6 bg-paper border border-linen text-ink font-medium rounded hover:bg-cream transition-colors text-center touch-manipulation"
                >
                  ← Rezervo në sallone të tjerë
                </Link>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-4 border-t border-linen">
                <p className="text-xs text-clay mb-2">Keni pyetje? Kontaktoni</p>
                <div className="flex justify-center space-x-4">
                  <Link
                    href={`tel:${salon?.phone}`}
                    className="text-accent hover:text-accent-strong font-medium text-sm"
                  >
                    📞 {salon?.phone}
                  </Link>
                  {salon?.instagram_handle && (
                    <Link
                      href={`https://instagram.com/${salon.instagram_handle}`}
                      target="_blank"
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      📱 @{salon.instagram_handle}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Need authentication
  if (status !== 'loading' && !session) {
    return (
      <Layout {...bookingLayout({ 
        title: `Rezervo në ${salon?.name}`,
        description: `Rezervoni online në ${salon?.name}. Identifikohuni për të vazhduar.`
      })}>
        <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
          <div className="max-w-md mx-auto">
            <div className="bg-paper rounded-lg shadow-soft overflow-hidden">
              {/* Header */}
              <div className="bg-accent p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center">
                    <span className="text-2xl">💅</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Rezervo në {salon?.name}</h1>
                    <p className="text-white/80 text-sm">{salon?.address}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-ink mb-2">
                    Identifikohuni për të vazhduar
                  </h2>
                  <p className="text-clay text-sm">
                    Për të bërë një rezervim në {salon?.name}, ju lutemi identifikohuni ose regjistrohuni.
                  </p>
                </div>

                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(router.asPath)}`}
                  className="block w-full py-3 px-6 bg-accent text-white font-medium rounded hover:bg-accent-strong transition-all text-center touch-manipulation mb-4"
                >
                  🔐 Identifikohu / Regjistrohu →
                </Link>

                <div className="text-center text-xs text-clay mb-4">
                  Keni pyetje? Kontaktoni
                </div>

                <div className="flex justify-center space-x-4 text-sm">
                  <Link
                    href={`tel:${salon?.phone}`}
                    className="text-accent hover:text-accent-strong font-medium"
                  >
                    📞 {salon?.phone}
                  </Link>
                  {salon?.instagram_handle && (
                    <Link
                      href={`https://instagram.com/${salon.instagram_handle}`}
                      target="_blank"
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      📱 @{salon.instagram_handle}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Main booking form (authenticated user)
  if (salon) {
    return (
      <Layout {...bookingLayout({ 
        title: `Rezervo në ${salon.name}`,
        description: `Rezervoni online në ${salon.name}. ${salon.description || ''}`,
        showHeader: false
      })}>
        <div className="min-h-screen bg-cream py-6 px-4">
          {/* Back Navigation */}
          <div className="max-w-md mx-auto mb-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-clay hover:text-ink transition-colors"
            >
              <span>←</span>
              <span className="text-sm font-medium">ImiRezervimi.al</span>
            </Link>
          </div>

          {/* Mobile Booking Form */}
          <MobileBookingForm
            salon={salon}
            onSuccess={handleBookingSuccess}
            onError={handleBookingError}
          />

          {/* Additional Info */}
          <div className="max-w-md mx-auto mt-6 text-center">
            <div className="bg-white/80 backdrop-blur rounded p-4 text-sm text-clay">
              <p className="mb-2">🔒 Rezervimi juaj është i sigurt dhe privat</p>
              <p>💬 Do të merrni konfirmim automatik në WhatsApp</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return null
}