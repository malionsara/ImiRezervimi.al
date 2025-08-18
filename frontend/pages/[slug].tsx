// frontend/pages/[slug].tsx
// Mobile-first direct booking page for salons - ImiRezervimi.al
// Clean URL structure: /slug instead of /salon/slug/book

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Layout, { bookingLayout } from '../components/layout/Layout'
import MobileBookingForm from '../components/booking/MobileBookingForm'

// ==============================================
// TYPES AND INTERFACES
// ==============================================
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

// ==============================================
// MAIN BOOKING PAGE COMPONENT
// ==============================================
export default function SalonBookingPage() {
  const router = useRouter()
  const { slug } = router.query
  const { data: session, status } = useSession()

  // State management
  const [salon, setSalon] = useState<Salon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [appointmentId, setAppointmentId] = useState('')

  // ==============================================
  // FETCH SALON DATA
  // ==============================================
  useEffect(() => {
    if (!slug || typeof slug !== 'string') return

    const fetchSalonData = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/salon/${slug}`)
        const data = await response.json()

        if (data.success) {
          setSalon(data.data)
        } else {
          setError(data.error?.message || 'Salloni nuk u gjet ose nuk është aktiv')
        }
      } catch (err) {
        console.error('Error fetching salon data:', err)
        setError('Gabim në lidhje me serverin')
      } finally {
        setLoading(false)
      }
    }

    fetchSalonData()
  }, [slug])

  // ==============================================
  // BOOKING SUCCESS HANDLER
  // ==============================================
  const handleBookingSuccess = (id: string) => {
    setAppointmentId(id)
    setBookingSuccess(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ==============================================
  // BOOKING ERROR HANDLER
  // ==============================================
  const handleBookingError = (errorMessage: string) => {
    setError(errorMessage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ==============================================
  // LOADING STATE
  // ==============================================
  if (loading) {
    return (
      <Layout {...bookingLayout({ title: 'Po ngarkon...', showHeader: false })}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4 shadow-2xl animate-pulse">
              <span className="text-2xl">💅</span>
            </div>
            <div className="flex space-x-1 justify-center mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Po ngarkon...</h2>
            <p className="text-gray-600">Po marrim informacionet e sallonit</p>
          </div>
        </div>
      </Layout>
    )
  }

  // ==============================================
  // ERROR STATE
  // ==============================================
  if (error && !salon) {
    return (
      <Layout {...bookingLayout({ title: 'Gabim', showHeader: false })}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Gabim</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-pink-600 transition-all touch-manipulation"
              >
                🔄 Provo përsëri
              </button>
              <Link
                href="/salons"
                className="block w-full py-3 px-6 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-center touch-manipulation"
              >
                ← Kthehu te sallone
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // ==============================================
  // SUCCESS STATE
  // ==============================================
  if (bookingSuccess && appointmentId) {
    return (
      <Layout {...bookingLayout({ 
        title: `Rezervimi u dërgua - ${salon?.name}`,
        description: 'Rezervimi juaj u dërgua me sukses. Do të merrni konfirmim në WhatsApp.'
      })}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              {/* Success Animation */}
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-xl">✓</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Rezervimi u dërgua!</h2>
              
              <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Salloni:</span>
                  <span className="font-medium">{salon?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Rezervimi:</span>
                  <span className="font-mono text-sm font-medium">{appointmentId.slice(0, 8)}</span>
                </div>
              </div>

              <div className="space-y-4 text-sm text-gray-600 mb-8">
                <div className="flex items-center justify-center space-x-2 p-3 bg-blue-50 rounded-xl">
                  <span className="text-lg">💬</span>
                  <p>Do të merrni konfirmim në WhatsApp nga salloni</p>
                </div>
                
                <div className="flex items-center justify-center space-x-2 p-3 bg-green-50 rounded-xl">
                  <span className="text-lg">📱</span>
                  <p>Mund të ndiqni statusin e rezervimit tuaj</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/booking/${appointmentId}/status`}
                  className="block w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all touch-manipulation"
                >
                  📋 Shiko Statusin
                </Link>
                
                <Link
                  href="/salons"
                  className="block w-full py-3 px-6 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-center touch-manipulation"
                >
                  ← Rezervo në sallone të tjerë
                </Link>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Keni pyetje? Kontaktoni</p>
                <div className="flex justify-center space-x-4">
                  <Link
                    href={`tel:${salon?.phone}`}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
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

  // ==============================================
  // NEED AUTHENTICATION
  // ==============================================
  if (status !== 'loading' && !session) {
    return (
      <Layout {...bookingLayout({ 
        title: `Rezervo në ${salon?.name}`,
        description: `Rezervoni online në ${salon?.name}. Identifikohuni për të vazhduar.`
      })}>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
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
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Identifikohuni për të vazhduar
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Për të bërë një rezervim në {salon?.name}, ju lutemi identifikohuni ose regjistrohuni.
                  </p>
                </div>

                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(router.asPath)}`}
                  className="block w-full py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-pink-600 transition-all text-center touch-manipulation mb-4"
                >
                  🔐 Identifikohu / Regjistrohu →
                </Link>

                <div className="text-center text-xs text-gray-500 mb-4">
                  Keni pyetje? Kontaktoni
                </div>

                <div className="flex justify-center space-x-4 text-sm">
                  <Link
                    href={`tel:${salon?.phone}`}
                    className="text-red-600 hover:text-red-700 font-medium"
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

  // ==============================================
  // INCOMPLETE REGISTRATION
  // ==============================================
  if ((session?.user as any)?.isRegistered === false) {
    return (
      <Layout {...bookingLayout({ 
        title: `Përfundoni regjistrimin - ${salon?.name}`,
        description: 'Përfundoni regjistrimin për të vazhduar me rezervimin.'
      })}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Përfundoni regjistrimin</h2>
              <p className="text-gray-600 mb-6">Ju lutemi verifikoni numrin e telefonit për të vazhduar me rezervimin.</p>
              <Link
                href={`/complete-registration?callbackUrl=${encodeURIComponent(router.asPath)}`}
                className="block w-full py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-pink-600 transition-all text-center touch-manipulation"
              >
                Vazhdo regjistrimin →
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // ==============================================
  // MAIN BOOKING FORM (AUTHENTICATED USER)
  // ==============================================
  if (salon) {
    return (
      <Layout {...bookingLayout({ 
        title: `Rezervo në ${salon.name}`,
        description: `Rezervoni online në ${salon.name}. ${salon.description || ''}`,
        showHeader: false
      })}>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 py-6 px-4">

          {/* Mobile Booking Form */}
          <MobileBookingForm
            salon={salon}
            onSuccess={handleBookingSuccess}
            onError={handleBookingError}
          />

          {/* Additional Info */}
          <div className="max-w-md mx-auto mt-6 text-center">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-sm text-gray-600">
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