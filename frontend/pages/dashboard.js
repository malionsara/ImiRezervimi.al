// frontend/pages/dashboard.js
// Albanian customer dashboard after login

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg animate-pulse p-2">
            <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={64} height={64} className="w-full h-full object-contain" />
          </div>
          <p className="text-gray-600">Po ngarkohet...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  return (
    <>
      <Head>
        <title>Dashboard - ImiRezervimi.al</title>
        <meta name="description" content="Menaxho rezervimet e tua" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center mr-3 p-1 border">
                  <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={32} height={32} className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-bold text-gray-900">ImiRezervimi</span>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  {userProfile?.image && (
                    <Image
                      src={userProfile.image}
                      alt={userProfile.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      Mirë se erdhe, {userProfile?.name}!
                    </p>
                    <p className="text-xs text-gray-500">
                      {userProfile?.provider === 'instagram' ? 'Instagram' : 'Google'} përdorues
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dil
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Menaxho rezervimet e tua dhe zbulo sallone të reja
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Veprime të shpejta
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={handleExploreServices}
                  className="w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all"
                >
                  🔍 Zbulo sallone
                </button>
                <button 
                  onClick={handleMyBookings}
                  className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-between"
                >
                  <span>📅 Rezervimet e mia</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {profileStats.totalBookings}
                  </span>
                </button>
                <button 
                  onClick={handleFavorites}
                  className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  ⭐ Sallone të preferuara
                </button>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rezervimet e fundit
              </h3>
              {loading ? (
                <div className="space-y-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">📅</div>
                  <p className="text-gray-500 text-sm">
                    Nuk keni rezervime ende
                  </p>
                  <button 
                    onClick={handleFirstBooking}
                    className="mt-3 text-red-500 text-sm font-medium hover:text-red-600"
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
                      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">{booking.salon_name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'declined' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status === 'approved' ? 'Aprovuar' :
                           booking.status === 'pending' ? 'Në pritje' :
                           booking.status === 'declined' ? 'Refuzuar' : booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {booking.service_name} • {new Date(booking.appointment_date).toLocaleDateString('sq-AL')} në {booking.start_time}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Kliko për më shumë detaje
                      </p>
                    </div>
                  ))}
                  {recentBookings.length > 3 && (
                    <button 
                      onClick={handleMyBookings}
                      className="w-full text-center text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                      Shiko të gjitha ({recentBookings.length - 3} më shumë)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profili im
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Emri</label>
                  <p className="text-gray-900">{userProfile?.name || 'Pa emër'}</p>
                </div>
                {userProfile?.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900 text-sm">{userProfile.email}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Telefoni</label>
                  <p className="text-gray-900">
                    {userProfile?.phone ? userProfile.phone : (
                      <span className="text-gray-500 text-sm">Nuk është shtuar</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Statistika</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-red-600">{profileStats.totalBookings}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-yellow-600">{profileStats.pendingBookings}</p>
                      <p className="text-xs text-gray-500">Në pritje</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-green-600">{profileStats.completedBookings}</p>
                      <p className="text-xs text-gray-500">Kryer</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Identifikuar me</label>
                  <p className="text-gray-900 capitalize">
                    {userProfile?.provider === 'instagram' ? 'Instagram' : 'Google'}
                  </p>
                </div>
                <button 
                  onClick={handleProfile}
                  className="w-full mt-4 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Ndrysho profilin
                </button>
              </div>
            </div>
          </div>

          {/* Popular Salons Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Sallone të popullarizuara
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({length: 6}).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 border animate-pulse">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))
              ) : salons.length > 0 ? (
                salons.map((salon) => (
                  <div key={salon.id} className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow">
                    <div className="w-full h-32 bg-gradient-to-br from-pink-100 to-red-100 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">💅</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{salon.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{salon.description || 'Salon i bukurisë në Tiranë'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm text-gray-600 ml-1">4.8</span>
                      </div>
                      <button 
                        onClick={() => handleBookSalon(salon.slug)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                      >
                        Rezervo
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-xl shadow-sm p-12 border text-center">
                  <div className="text-gray-400 text-6xl mb-4">🏪</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Asnjë sallon i disponueshëm</h3>
                  <p className="text-gray-600 mb-4">Aktualisht nuk ka sallone të regjistruara në platformë.</p>
                  <Link href="/salon/register">
                    <a className="text-red-500 hover:text-red-600 font-medium">Regjistro sallonin tënd</a>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}