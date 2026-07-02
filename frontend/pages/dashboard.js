// frontend/pages/dashboard.js
// Albanian customer dashboard after login

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import Layout, { dashboardLayout } from '../components/layout/Layout'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [salons, setSalons] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileStats, setProfileStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.isRegistered === false) {
      // User is authenticated but not fully registered - redirect to complete registration
      router.push('/complete-registration')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user) {
      // Set user profile from session
      setUserProfile({
        name: session.user.name || session.user.username,
        email: session.user.email,
        image: session.user.image,
        provider: session.user.provider,
        phone: session.user.phone || null
      })
      
      // Fetch dashboard data
      fetchDashboardData()
    }
  }, [session])

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch recent bookings
      const bookingsResponse = await fetch('/api/customers/booking-history?limit=5')
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        if (bookingsData.success) {
          setRecentBookings(bookingsData.data.bookings || [])
          setProfileStats({
            totalBookings: bookingsData.data.total || 0,
            pendingBookings: bookingsData.data.pending || 0,
            completedBookings: bookingsData.data.completed || 0
          })
        }
      }
      
      // Fetch popular salons
      const salonsResponse = await fetch('/api/salon/popular?limit=6')
      if (salonsResponse.ok) {
        const salonsData = await salonsResponse.json()
        if (salonsData.success) {
          setSalons(salonsData.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Navigation handlers
  const handleExploreServices = () => {
    router.push('/salons')
  }

  const handleMyBookings = () => {
    router.push('/dashboard/bookings')
  }

  const handleFavorites = () => {
    router.push('/dashboard/favorites')
  }

  const handleProfile = () => {
    router.push('/dashboard/profile')
  }

  const handleFirstBooking = () => {
    router.push('/salon')
  }

  const handleBookSalon = (salonSlug) => {
    router.push(`/${salonSlug}`)
  }

  const handleBookingClick = (bookingId) => {
    router.push(`/booking/${bookingId}/status`)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-lg bg-paper flex items-center justify-center mb-4 shadow-soft animate-pulse p-2">
            <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={64} height={64} className="w-full h-full object-contain" />
          </div>
          <p className="text-clay">Po ngarkohet...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  return (
    <Layout {...dashboardLayout({
      title: "Dashboard",
      description: "Menaxho rezervimet e tua"
    })}>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink mb-2">
              Dashboard
            </h1>
            <p className="text-clay">
              Menaxho rezervimet e tua dhe zbulo sallone të reja
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="bg-paper rounded shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-ink mb-4">
                Veprime të shpejta
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={handleExploreServices}
                  className="w-full text-left px-4 py-3 rounded-lg bg-accent text-white hover:bg-accent-strong transition-all"
                >
                  Zbulo sallone
                </button>
                <button 
                  onClick={handleMyBookings}
                  className="w-full text-left px-4 py-3 rounded-lg bg-sand text-ink hover:bg-linen transition-all flex items-center justify-between"
                >
                  <span>Rezervimet e mia</span>
                  <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">
                    {profileStats.totalBookings}
                  </span>
                </button>
                <button 
                  onClick={handleFavorites}
                  className="w-full text-left px-4 py-3 rounded-lg bg-sand text-ink hover:bg-linen transition-all"
                >
                  ⭐ Sallone të preferuara
                </button>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-paper rounded shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-ink mb-4">
                Rezervimet e fundit
              </h3>
              {loading ? (
                <div className="space-y-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-linen rounded mb-2"></div>
                    <div className="h-3 bg-linen rounded mb-2"></div>
                    <div className="h-3 bg-linen rounded w-3/4"></div>
                  </div>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-clay/70 text-4xl mb-3"></div>
                  <p className="text-clay text-sm">
                    Nuk keni rezervime ende
                  </p>
                  <button 
                    onClick={handleFirstBooking}
                    className="mt-3 text-accent text-sm font-medium hover:text-accent"
                  >
                    Bëni rezervimin e parë
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.slice(0, 3).map((booking) => (
                    <div 
                      key={booking.id} 
                      onClick={() => handleBookingClick(booking.id)}
                      className="p-3 border border-linen rounded-lg cursor-pointer hover:bg-cream hover:border-linen transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-ink">{booking.salon_name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'approved' ? 'bg-success/10 text-success' :
                          booking.status === 'pending' ? 'bg-warning/10 text-yellow-700' :
                          booking.status === 'declined' ? 'bg-accent-soft text-accent-strong' :
                          'bg-sand text-ink'
                        }`}>
                          {booking.status === 'approved' ? 'Aprovuar' :
                           booking.status === 'pending' ? 'Në pritje' :
                           booking.status === 'declined' ? 'Refuzuar' : booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-clay">
                        {booking.service_name} • {new Date(booking.appointment_date).toLocaleDateString('sq-AL')} në {booking.start_time}
                      </p>
                      <p className="text-xs text-clay/70 mt-1">
                        Kliko për më shumë detaje
                      </p>
                    </div>
                  ))}
                  {recentBookings.length > 3 && (
                    <button 
                      onClick={handleMyBookings}
                      className="w-full text-center text-sm text-accent hover:text-accent font-medium"
                    >
                      Shiko të gjitha ({recentBookings.length - 3} më shumë)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="bg-paper rounded shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-ink mb-4">
                Profili im
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-ink">Emri</label>
                  <p className="text-ink">{userProfile?.name || 'Pa emër'}</p>
                </div>
                {userProfile?.email && (
                  <div>
                    <label className="text-sm font-medium text-ink">Email</label>
                    <p className="text-ink text-sm">{userProfile.email}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-ink">Telefoni</label>
                  <p className="text-ink">
                    {userProfile?.phone ? userProfile.phone : (
                      <span className="text-clay text-sm">Nuk është shtuar</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Statistika</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div className="text-center p-2 bg-cream rounded-lg">
                      <p className="font-semibold text-accent">{profileStats.totalBookings}</p>
                      <p className="text-xs text-clay">Total</p>
                    </div>
                    <div className="text-center p-2 bg-cream rounded-lg">
                      <p className="font-semibold text-warning">{profileStats.pendingBookings}</p>
                      <p className="text-xs text-clay">Në pritje</p>
                    </div>
                    <div className="text-center p-2 bg-cream rounded-lg">
                      <p className="font-semibold text-success">{profileStats.completedBookings}</p>
                      <p className="text-xs text-clay">Kryer</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Identifikuar me</label>
                  <p className="text-ink capitalize">
                    {userProfile?.provider === 'instagram' ? 'Instagram' : 'Google'}
                  </p>
                </div>
                <button 
                  onClick={handleProfile}
                  className="w-full mt-4 px-4 py-2 rounded-lg border border-linen text-ink hover:bg-cream transition-all"
                >
                  Ndrysho profilin
                </button>
              </div>
            </div>
          </div>

          {/* Popular Salons Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-ink mb-6">
              Sallone të popullarizuara
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({length: 6}).map((_, index) => (
                  <div key={index} className="bg-paper rounded shadow-sm p-6 border animate-pulse">
                    <div className="w-full h-32 bg-linen rounded-lg mb-4"></div>
                    <div className="h-4 bg-linen rounded mb-2"></div>
                    <div className="h-3 bg-linen rounded mb-3"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-linen rounded w-20"></div>
                      <div className="h-8 bg-linen rounded w-16"></div>
                    </div>
                  </div>
                ))
              ) : salons.length > 0 ? (
                salons.map((salon) => (
                  <div key={salon.id} className="bg-paper rounded shadow-sm p-6 border hover:shadow-md transition-shadow">
                    <div className="w-full h-32 bg-accent rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-clay/70 text-4xl"></span>
                    </div>
                    <h3 className="font-semibold text-ink mb-2">{salon.name}</h3>
                    <p className="text-clay text-sm mb-3">{salon.description || 'Salon i bukurisë në Tiranë'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm text-clay ml-1">4.8</span>
                      </div>
                      <button 
                        onClick={() => handleBookSalon(salon.slug)}
                        className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent transition-colors"
                      >
                        Rezervo
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-paper rounded shadow-sm p-12 border text-center">
                  <div className="text-clay/70 text-6xl mb-4"></div>
                  <h3 className="text-lg font-semibold text-ink mb-2">Asnjë sallon i disponueshëm</h3>
                  <p className="text-clay mb-4">Aktualisht nuk ka sallone të regjistruara në platformë.</p>
                  <Link href="/salon/register">
                    <a className="text-accent hover:text-accent font-medium">Regjistro sallonin tënd</a>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
    </Layout>
  )
}