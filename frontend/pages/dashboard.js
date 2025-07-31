// frontend/pages/dashboard.js
// Albanian customer dashboard after login

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [recentBookings] = useState([])

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
        provider: session.user.provider
      })
      
      // TODO: Fetch recent bookings from Supabase
      // fetchRecentBookings(session.user.id)
    }
  }, [session])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg animate-pulse p-2">
            <img src="/favicon-96x96.png" alt="ImiRezervimi Logo" className="w-full h-full object-contain" />
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
                  <img src="/favicon-96x96.png" alt="ImiRezervimi Logo" className="w-full h-full object-contain" />
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
                <button className="w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all">
                  🔍 Zbulo sallone
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                  📅 Rezervimet e mia
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                  ⭐ Sallone të preferuara
                </button>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rezervimet e fundit
              </h3>
              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">📅</div>
                  <p className="text-gray-500 text-sm">
                    Nuk keni rezervime ende
                  </p>
                  <button className="mt-3 text-red-500 text-sm font-medium hover:text-red-600">
                    Bëni rezervimin e parë
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* TODO: Map through actual bookings */}
                  <p className="text-gray-500 text-sm">Po ngarkohen rezervimet...</p>
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
                    <p className="text-gray-900">{userProfile.email}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Identifikuar me</label>
                  <p className="text-gray-900 capitalize">
                    {userProfile?.provider === 'instagram' ? 'Instagram' : 'Google'}
                  </p>
                </div>
                <button className="w-full mt-4 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all">
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
              {/* TODO: Map through actual salons from Supabase */}
              <div className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow">
                <div className="w-full h-32 bg-gradient-to-br from-pink-100 to-red-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-4xl">💅</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Klea Nails Studio</h3>
                <p className="text-gray-600 text-sm mb-3">Nail art profesional në Tiranë</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-600 ml-1">4.8 (127)</span>
                  </div>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">
                    Rezervo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}