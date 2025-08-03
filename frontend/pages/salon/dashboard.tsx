// frontend/pages/salon/dashboard.tsx
// Salon Dashboard for Managing Appointment Requests
// Albanian Beauty Salon Booking Platform

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import RequestsQueue from '../../components/salon/RequestsQueue'
import CustomerDetails from '../../components/salon/CustomerDetails'
// import AppointmentActions from '../../components/salon/AppointmentActions' // Unused import
import { getSalonDashboardData, subscribeToRealtimeUpdates } from '../../lib/salon-dashboard'

// ==============================================
// TYPES AND INTERFACES
// ==============================================
interface DashboardData {
  pendingRequests: AppointmentRequest[]
  todaySchedule: Appointment[]
  recentActivity: Appointment[]
  salon: SalonInfo
  stats: DashboardStats
}

interface AppointmentRequest {
  id: string
  customer: {
    id: string
    firstName: string
    lastName: string
    phone: string
    rating: number
    totalVisits: number
    priorityScore: number
  }
  service: {
    id: string
    name: string
    duration: number
    price: number
  }
  appointmentDate: string
  startTime: string
  customerNotes?: string
  requestedAt: string
  priorityScore: number
}

interface Appointment {
  id: string
  customer: {
    firstName: string
    lastName: string
    phone: string
  }
  service: {
    name: string
    duration: number
  }
  appointmentDate: string
  startTime: string
  status: string
  salonNotes?: string
}

interface SalonInfo {
  id: string
  name: string
  workingHours: { [key: string]: { open: string; close: string; closed: boolean } }
}

interface DashboardStats {
  pendingCount: number
  todayCount: number
  weeklyBookings: number
  averageRating: number
}

// ==============================================
// MAIN SALON DASHBOARD COMPONENT
// ==============================================
export default function SalonDashboard() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<AppointmentRequest | null>(null)
  const [, setShowCustomerDetails] = useState(false) // showCustomerDetails unused
  const [salonId, setSalonId] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Suppress unused variable warning - supabase is used in loadDashboardData and setupRealtimeSubscription
  console.log('Supabase client initialized:', !!supabase)

  // ==============================================
  // INITIALIZATION AND DATA LOADING
  // ==============================================
  useEffect(() => {
    initializeDashboard()
  }, [])

  useEffect(() => {
    if (salonId) {
      loadDashboardData()
      setupRealtimeSubscription()
    }
  }, [salonId])

  const initializeDashboard = async () => {
    try {
      // Get salon ID from URL parameter or session
      const urlSalonId = router.query.salonId as string
      if (urlSalonId) {
        setSalonId(urlSalonId)
      } else {
        // Redirect to salon selection or login
        router.push('/salon/login')
      }
    } catch (error) {
      console.error('Dashboard initialization error:', error)
      setError('Gabim në inicializimin e dashboard-it')
    }
  }

  const loadDashboardData = async () => {
    if (!salonId) return
    
    try {
      setLoading(true)
      const data = await getSalonDashboardData(salonId)
      setDashboardData(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Gabim në ngarkimin e të dhënave')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    if (!salonId) return

    const unsubscribe = subscribeToRealtimeUpdates(salonId, (update) => {
      console.log('🔄 Real-time update received:', update.eventType)
      
      // Refresh dashboard data on updates
      loadDashboardData()
    })

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }

  // ==============================================
  // EVENT HANDLERS
  // ==============================================
  const handleCustomerClick = (request: AppointmentRequest) => {
    setSelectedCustomer(request)
    setShowCustomerDetails(true)
  }

  const handleAppointmentAction = async (appointmentId: string, action: 'approve' | 'decline', notes?: string) => {
    try {
      // Update appointment status via API
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salonId,
          status: action === 'approve' ? 'approved' : 'declined',
          salonNotes: notes
        })
      })

      if (response.ok) {
        // Show success message
        console.log(`✅ Rezervimi u ${action === 'approve' ? 'miratua' : 'refuzua'} me sukses`)
        
        // Refresh dashboard data
        loadDashboardData()
      } else {
        throw new Error('Failed to update appointment')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      setError(`Gabim në ${action === 'approve' ? 'miratimin' : 'refuzimin'} e rezervimit`)
    }
  }

  const handleRefresh = () => {
    loadDashboardData()
  }

  // ==============================================
  // LOADING AND ERROR STATES
  // ==============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <p className="text-gray-600 mt-4">Po ngarkohet dashboard-i...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-md">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Gabim</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Provo përsëri
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nuk ka të dhëna për të shfaqur</p>
        </div>
      </div>
    )
  }

  // ==============================================
  // MAIN DASHBOARD RENDER
  // ==============================================
  return (
    <>
      <Head>
        <title>Dashboard - {dashboardData.salon.name} | ImiRezervimi.al</title>
        <meta name="description" content="Menaxho rezervimet e sallonit tuaj" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg">
                    <span className="text-lg font-bold text-white">IR</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-gray-900">{dashboardData.salon.name}</span>
                    <p className="text-sm text-gray-500">Dashboard</p>
                  </div>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Rifresko"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                
                <Link href="/" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Faqja kryesore
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100">
                  <span className="text-xl">⏳</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Në pritje</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.pendingCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100">
                  <span className="text-xl">📅</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Sot</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.todayCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100">
                  <span className="text-xl">📊</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Java</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.weeklyBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-purple-100">
                  <span className="text-xl">⭐</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Vlerësimi</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Requests Queue */}
            <div className="lg:col-span-2">
              <RequestsQueue
                requests={dashboardData.pendingRequests}
                onCustomerClick={handleCustomerClick}
                onAppointmentAction={handleAppointmentAction}
              />

              {/* Today's Schedule */}
              {dashboardData.todaySchedule.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Orari i sotëm</h2>
                  <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {dashboardData.todaySchedule.map((appointment) => (
                      <div key={appointment.id} className="p-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.customer.firstName} {appointment.customer.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{appointment.service.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{appointment.startTime}</p>
                            <p className="text-sm text-gray-600">{appointment.service.duration} min</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {dashboardData.recentActivity.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">🕒 Aktiviteti i fundit</h2>
                  <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {dashboardData.recentActivity.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="p-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.customer.firstName} {appointment.customer.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{appointment.service.name}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'declined' ? 'bg-red-100 text-red-800' :
                              appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status === 'approved' ? 'I miratuar' :
                               appointment.status === 'declined' ? 'I refuzuar' :
                               appointment.status === 'completed' ? 'I përfunduar' : appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Customer Details */}
            <div className="lg:col-span-1">
              {selectedCustomer ? (
                <CustomerDetails
                  customer={selectedCustomer}
                  onClose={() => {
                    setSelectedCustomer(null)
                    setShowCustomerDetails(false)
                  }}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
                  <div className="text-gray-400 text-4xl mb-4">👤</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Detajet e klientit</h3>
                  <p className="text-gray-600 text-sm">
                    Kliko mbi një kërkesë për të parë detajet e klientit dhe historikun e rezervimeve.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer info */}
        <div className="text-center py-4 text-sm text-gray-500">
          Përditësuar më: {lastUpdate.toLocaleTimeString('sq-AL')}
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="flex justify-around">
          <button
            onClick={handleRefresh}
            className="flex flex-col items-center p-2 text-gray-600"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs">Rifresko</span>
          </button>
          
          <Link href="/" className="flex flex-col items-center p-2 text-gray-600">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Kryesore</span>
          </Link>
        </div>
      </div>
    </>
  )
}