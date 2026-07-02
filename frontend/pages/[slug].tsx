// frontend/pages/[slug].tsx
// Mobile-first direct booking page for salons - ImiRezervimi.al
// Clean URL structure: /slug instead of /salon/slug/book

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { XCircle, RefreshCw, ArrowLeft, Check, MessageCircle, Smartphone, ClipboardList, Phone, Lock, ShieldCheck } from 'lucide-react'
import Layout, { bookingLayout } from '../components/layout/Layout'
import BookingForm from '../components/booking/BookingForm'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import Card, { CardBody } from '../components/ui/Card'

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
            <Spinner size="lg" />
            <h2 className="font-display text-xl text-ink mt-6 mb-2">Po ngarkon...</h2>
            <p className="text-clay">Po marrim informacionet e sallonit</p>
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
            <div className="mx-auto w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center mb-6">
              <XCircle size={28} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
            </div>
            <h2 className="font-display text-xl text-ink mb-2">Gabim</h2>
            <p className="text-clay mb-8">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw size={18} strokeWidth={1.75} aria-hidden="true" />
                Provo përsëri
              </Button>
              <Button href="/salons" variant="outline" className="w-full">
                <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
                Kthehu te sallone
              </Button>
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
          <div className="max-w-md mx-auto w-full">
            <Card>
              <CardBody className="text-center p-8">
                {/* Success mark */}
                <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-6">
                  <span className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                    <Check size={22} strokeWidth={2.5} className="text-white" aria-hidden="true" />
                  </span>
                </div>

                <h2 className="font-display text-2xl text-ink mb-4">Rezervimi u dërgua!</h2>

                <div className="space-y-3 text-left bg-sand rounded p-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-clay">Salloni:</span>
                    <span className="font-medium text-ink">{salon?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-clay">ID Rezervimi:</span>
                    <span className="font-mono text-sm font-medium text-ink">{appointmentId.slice(0, 8)}</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-clay mb-8">
                  <div className="flex items-center gap-3 p-3 bg-cream rounded text-left">
                    <MessageCircle size={18} strokeWidth={1.75} className="shrink-0 text-success" aria-hidden="true" />
                    <p>Do të merrni konfirmim në WhatsApp nga salloni</p>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-cream rounded text-left">
                    <Smartphone size={18} strokeWidth={1.75} className="shrink-0 text-accent" aria-hidden="true" />
                    <p>Mund të ndiqni statusin e rezervimit tuaj</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button href={`/booking/${appointmentId}/status`} className="w-full">
                    <ClipboardList size={18} strokeWidth={1.75} aria-hidden="true" />
                    Shiko Statusin
                  </Button>

                  <Button href="/salons" variant="outline" className="w-full">
                    <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
                    Rezervo në sallone të tjerë
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="mt-6 pt-4 border-t border-linen">
                  <p className="text-xs text-clay mb-2">Keni pyetje? Kontaktoni</p>
                  <div className="flex justify-center gap-4">
                    <Link
                      href={`tel:${salon?.phone}`}
                      className="inline-flex items-center gap-1.5 text-accent hover:text-accent-strong font-medium text-sm"
                    >
                      <Phone size={15} strokeWidth={1.75} aria-hidden="true" />
                      {salon?.phone}
                    </Link>
                    {salon?.instagram_handle && (
                      <Link
                        href={`https://instagram.com/${salon.instagram_handle}`}
                        target="_blank"
                        className="text-accent hover:text-accent-strong font-medium text-sm"
                      >
                        @{salon.instagram_handle}
                      </Link>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
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
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md mx-auto w-full">
            <Card className="overflow-hidden">
              {/* Header */}
              <div className="bg-ink p-6 text-cream">
                <h1 className="font-display text-xl">Rezervo në {salon?.name}</h1>
                {salon?.address && <p className="text-cream/60 text-sm mt-1">{salon.address}</p>}
              </div>

              {/* Content */}
              <CardBody>
                <div className="text-center mb-6">
                  <h2 className="font-display text-lg text-ink mb-2">
                    Identifikohuni për të vazhduar
                  </h2>
                  <p className="text-clay text-sm">
                    Për të bërë një rezervim në {salon?.name}, ju lutemi identifikohuni ose regjistrohuni.
                  </p>
                </div>

                <Button
                  href={`/login?callbackUrl=${encodeURIComponent(router.asPath)}`}
                  className="w-full mb-4"
                >
                  <Lock size={18} strokeWidth={1.75} aria-hidden="true" />
                  Identifikohu / Regjistrohu
                </Button>

                <div className="text-center text-xs text-clay mb-4">
                  Keni pyetje? Kontaktoni
                </div>

                <div className="flex justify-center gap-4 text-sm">
                  <Link
                    href={`tel:${salon?.phone}`}
                    className="inline-flex items-center gap-1.5 text-accent hover:text-accent-strong font-medium"
                  >
                    <Phone size={15} strokeWidth={1.75} aria-hidden="true" />
                    {salon?.phone}
                  </Link>
                  {salon?.instagram_handle && (
                    <Link
                      href={`https://instagram.com/${salon.instagram_handle}`}
                      target="_blank"
                      className="text-accent hover:text-accent-strong font-medium"
                    >
                      @{salon.instagram_handle}
                    </Link>
                  )}
                </div>
              </CardBody>
            </Card>
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
          <div className="max-w-md mx-auto w-full">
            <Card>
              <CardBody className="text-center p-8">
                <h2 className="font-display text-xl text-ink mb-2">Përfundoni regjistrimin</h2>
                <p className="text-clay mb-6">Ju lutemi verifikoni numrin e telefonit për të vazhduar me rezervimin.</p>
                <Button
                  href={`/complete-registration?callbackUrl=${encodeURIComponent(router.asPath)}`}
                  className="w-full"
                >
                  Vazhdo regjistrimin
                </Button>
              </CardBody>
            </Card>
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
        showHeader: true,
        headerVariant: 'minimal'
      })}>
        <div className="py-4 sm:py-6 px-2 sm:px-4">

          {/* Enhanced Booking Form with Albanian Calendar */}
          <BookingForm
            salon={salon}
            onSuccess={handleBookingSuccess}
            onError={handleBookingError}
          />

          {/* Additional Info - Mobile Optimized */}
          <div className="max-w-md mx-auto mt-4 sm:mt-6">
            <div className="bg-paper/80 backdrop-blur rounded border border-linen p-3 sm:p-4 text-xs sm:text-sm text-clay space-y-1.5">
              <p className="flex items-center gap-2">
                <ShieldCheck size={15} strokeWidth={1.75} className="shrink-0 text-success" aria-hidden="true" />
                Rezervimi juaj është i sigurt dhe privat
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle size={15} strokeWidth={1.75} className="shrink-0 text-success" aria-hidden="true" />
                Do të merrni konfirmim automatik në WhatsApp
              </p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return null
}
