// frontend/pages/salon/[slug]/book.tsx
// Booking page for specific salon - ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import BookingForm from '../../../components/booking/BookingForm'

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
  working_hours: any
  services: Service[]
}

// ==============================================
// BOOKING PAGE COMPONENT
// ==============================================
export default function BookingPage() {
  const router = useRouter()
  const { slug } = router.query

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
          setError(data.error?.message || 'Gabim në ngarkimin e të dhënave të sallonit')
        }
      } catch (err) {
        console.error('Error fetching salon data:', err)
        setError('Gabim në komunikim me serverin')
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
    
    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ==============================================
  // BOOKING ERROR HANDLER
  // ==============================================
  const handleBookingError = (errorMessage: string) => {
    setError(errorMessage)
    
    // Scroll to top to show error message
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ==============================================
  // RESET BOOKING STATE
  // ==============================================
  const resetBookingState = () => {
    setBookingSuccess(false)
    setAppointmentId('')
    setError('')
  }

  // ==============================================
  // LOADING STATE
  // ==============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Po ngarkon...</h2>
          <p className="text-gray-600">Po marrim informacionet e sallonit</p>
        </div>
      </div>
    )
  }

  // ==============================================
  // ERROR STATE
  // ==============================================
  if (error && !salon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Gabim</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 border border-transparent text-base font-medium 
                       rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Provo përsëri
            </button>
            <Link href="/">
              <a className="block w-full py-3 px-6 border border-gray-300 text-base font-medium 
                          rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none 
                          focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
                Kthehu në fillim
              </a>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ==============================================
  // SUCCESS STATE
  // ==============================================
  if (bookingSuccess && salon) {
    return (
      <>
        <Head>
          <title>Rezervimi u dërgua - {salon.name} | ImiRezervimi.al</title>
          <meta name="description" content={`Rezervimi juaj për ${salon.name} u dërgua me sukses. Do të kontaktoheni brenda 2 orësh.`} />
        </Head>

        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <Link href="/">
                  <a className="text-2xl font-bold text-red-600">ImiRezervimi.al</a>
                </Link>
                <Link href={`/salon/${salon.slug}`}>
                  <a className="text-gray-600 hover:text-gray-900 font-medium">
                    ← Kthehu te {salon.name}
                  </a>
                </Link>
              </div>
            </div>
          </div>

          {/* Success Content */}
          <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Rezervimi u dërgua me sukses! 🎉
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Faleminderit! Rezervimi juaj për <strong>{salon.name}</strong> u dërgua me sukses.
              </p>
            </div>

            {/* What happens next */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Çfarë ndodh më pas?</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Kontakt nga salloni</h3>
                    <p className="text-gray-600 text-sm">
                      {salon.name} do t'ju kontaktojë në WhatsApp brenda 2 orësh për të konfirmuar rezervimin.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Konfirmimi</h3>
                    <p className="text-gray-600 text-sm">
                      Pasi të konfirmohet, do të merrni një mesazh me detajet e rezervimit dhe udhëzimet.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Kujtesë</h3>
                    <p className="text-gray-600 text-sm">
                      Do të merrni një kujtesë 24 orë para takimit për të mos e harruar.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">ID i Rezervimit</h3>
              <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-300">
                <code className="text-lg font-mono text-gray-800">{appointmentId}</code>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Ruajeni këtë kod për referencë të ardhshme.
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">Informacion i rëndësishëm</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ju lutem jini të disponueshëm në numrin tuaj të telefonit</li>
                    <li>• Nëse keni nevojë të ndryshoni rezervimin, kontaktoni {salon.name}</li>
                    <li>• Për anulime, njoftoni të paktën 2 orë para</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetBookingState}
                className="flex-1 py-3 px-6 border border-red-300 text-red-700 font-medium 
                         rounded-xl hover:bg-red-50 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Rezervo përsëri
              </button>
              
              <Link href={`/salon/${salon.slug}`}>
                <a className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-medium 
                             rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 
                             focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 text-center">
                  Shiko sallonin
                </a>
              </Link>
              
              <Link href="/">
                <a className="flex-1 py-3 px-6 bg-red-600 text-white font-medium rounded-xl 
                             hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                             focus:ring-red-500 transition-colors duration-200 text-center">
                  Kthehu në fillim
                </a>
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ==============================================
  // MAIN BOOKING PAGE
  // ==============================================
  if (!salon) return null

  return (
    <>
      <Head>
        <title>Rezervo - {salon.name} | ImiRezervimi.al</title>
        <meta name="description" content={`Rezervoni një termin në ${salon.name} - ${salon.description}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`Rezervo - ${salon.name} | ImiRezervimi.al`} />
        <meta property="og:description" content={`Rezervoni një termin në ${salon.name} - ${salon.description}`} />
        <meta property="og:image" content="/api/og?salon=" + salon.name />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={`Rezervo - ${salon.name} | ImiRezervimi.al`} />
        <meta property="twitter:description" content={`Rezervoni një termin në ${salon.name} - ${salon.description}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/">
                <a className="text-2xl font-bold text-red-600">ImiRezervimi.al</a>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link href={`/salon/${salon.slug}`}>
                  <a className="text-gray-600 hover:text-gray-900 font-medium">
                    ← Kthehu te {salon.name}
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-2xl text-white">💅</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gray-900">
                  Rezervo në {salon.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {salon.address}, {salon.city}
                </p>
              </div>
            </div>
            
            {salon.description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {salon.description}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="text-red-600 hover:text-red-800 text-xs mt-1 underline"
                  >
                    Mbyll
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Booking Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <BookingForm
              salon={salon}
              onSuccess={handleBookingSuccess}
              onError={handleBookingError}
            />
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Keni pyetje? Kontaktoni{' '}
              <a 
                href={`tel:${salon.phone}`}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                {salon.phone}
              </a>
            </p>
            
            {salon.instagram_handle && (
              <p className="text-gray-600 text-sm mt-1">
                Ose vizitoni{' '}
                <a 
                  href={`https://instagram.com/${salon.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  @{salon.instagram_handle}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}