// frontend/pages/salon/dashboard.tsx
// Salon Dashboard for Managing Appointment Requests
// Albanian Beauty Salon Booking Platform

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import RequestsQueue from '../../components/salon/RequestsQueue'
import CustomerDetails from '../../components/salon/CustomerDetails'
import AvailabilityCalendar from '../../components/salon/AvailabilityCalendar'
import WorkingHoursConfig from '../../components/salon/WorkingHoursConfig'
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
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [salonId, setSalonId] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'priority' | 'today' | 'tomorrow'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([])
  const [currentView, setCurrentView] = useState<'requests' | 'availability' | 'working-hours'>('requests')
  const [showAvailabilityManagement, setShowAvailabilityManagement] = useState(false)
  const [showWorkingHoursConfig, setShowWorkingHoursConfig] = useState(false)

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (salonId) {
      loadDashboardData()
      setupRealtimeSubscription()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId])

  const initializeDashboard = useCallback(async () => {
    try {
      // Get salon ID from URL parameter or session
      const urlSalonId = router.query.salonId as string
      const verified = router.query.verified as string
      
      if (urlSalonId) {
        setSalonId(urlSalonId)
        
        // Show success message if just verified via magic link
        if (verified === 'true') {
          addNotification('Hyrja u krye me sukses! Mirë se erdhe në dashboard.', 'success')
        }
      } else {
        // Redirect to salon login
        console.log('No salon ID provided, redirecting to login...')
        router.push('/login-salon')
      }
    } catch (error) {
      console.error('Dashboard initialization error:', error)
      setError('Gabim në inicializimin e dashboard-it')
    }
  }, [router])

  const loadDashboardData = useCallback(async () => {
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
  }, [salonId])

  const setupRealtimeSubscription = useCallback(() => {
    if (!salonId) return

    const unsubscribe = subscribeToRealtimeUpdates(salonId, (update) => {
      console.log('Real-time update received:', update.eventType)
      
      // Refresh dashboard data on updates
      loadDashboardData()
    })

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [salonId, loadDashboardData])

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
        // Show success notification
        addNotification(
          `Rezervimi u ${action === 'approve' ? 'miratua' : 'refuzua'} me sukses`,
          'success'
        )
        
        // Refresh dashboard data
        loadDashboardData()
        
        // Clear selected customer
        setSelectedCustomer(null)
        setShowCustomerDetails(false)
      } else {
        throw new Error('Failed to update appointment')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      addNotification(
        `Gabim në ${action === 'approve' ? 'miratimin' : 'refuzimin'} e rezervimit`,
        'error'
      )
    }
  }

  const handleRefresh = () => {
    loadDashboardData()
  }

  // Add notification system
  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, message, type }])
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  // Availability management handlers
  const handleWorkingHoursSave = (workingHours: any) => {
    addNotification('Orët e punës u përditësuan me sukses', 'success')
    loadDashboardData() // Refresh data
    setShowWorkingHoursConfig(false)
  }

  const handleAvailabilityChange = () => {
    addNotification('Disponueshmëria u përditësua', 'success')
    loadDashboardData() // Refresh data
  }

  const handleLogout = () => {
    // Clear any session cookies
    document.cookie = 'salon_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // Show logout notification
    addNotification('Dolët me sukses nga dashboard-i', 'info')
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login-salon')
    }, 1500)
  }

  // Enhanced search and filter functionality
  const filteredRequests = dashboardData?.pendingRequests.filter(request => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = `${request.customer.firstName} ${request.customer.lastName}`.toLowerCase().includes(query)
      const matchesPhone = request.customer.phone.includes(query)
      const matchesService = request.service.name.toLowerCase().includes(query)
      if (!matchesName && !matchesPhone && !matchesService) return false
    }

    // Status filter
    if (filterStatus !== 'all') {
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      switch (filterStatus) {
        case 'priority':
          return request.priorityScore >= 60
        case 'today':
          return request.appointmentDate === today
        case 'tomorrow':
          return request.appointmentDate === tomorrow
        default:
          return true
      }
    }

    return true
  }) || []

  // ==============================================
  // LOADING AND ERROR STATES
  // ==============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="text-clay mt-4">Po ngarkohet dashboard-i...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center bg-paper p-8 rounded shadow-sm max-w-md">
          <div className="text-accent text-4xl mb-4"></div>
          <h2 className="text-xl font-semibold text-ink mb-2">Gabim</h2>
          <p className="text-clay mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            Provo përsëri
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-clay">Nuk ka të dhëna për të shfaqur</p>
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

      <div className="min-h-screen bg-cream">
        {/* Notification System */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`max-w-sm px-4 py-3 rounded-lg shadow-soft border ${
                notification.type === 'success' ? 'bg-success/5 border-success/25 text-success' :
                notification.type === 'error' ? 'bg-accent-soft/60 border-accent/25 text-accent-strong' :
                'bg-accent-soft/40 border-accent/25 text-accent-strong'
              } animate-slide-in`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' && (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {notification.type === 'error' && (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {notification.type === 'info' && (
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                    className="inline-flex text-clay/70 hover:text-clay focus:outline-none"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Header */}
        <header className="bg-paper/95 backdrop-blur border-b border-linen sticky top-0 z-40">
          <div className="container-responsive">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/brand/logo.png"
                    alt="ImiRezervimi"
                    width={40}
                    height={40}
                    className="rounded-sm mr-3"
                    priority
                  />
                  <div>
                    <span className="font-display text-xl text-ink">{dashboardData.salon.name}</span>
                    <p className="text-sm text-clay -mt-0.5">Dashboard</p>
                  </div>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search (desktop) */}
                <div className="hidden md:block relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-clay/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Kërko klient, shërbim..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-64 pl-10 pr-3 py-2 border border-linen rounded-md leading-5 bg-paper placeholder:text-clay/60 focus:outline-none focus:ring-1 focus:ring-accent/25 focus:border-accent text-sm"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-colors ${
                    showFilters ? 'bg-accent-soft text-accent' : 'text-clay hover:text-ink hover:bg-sand'
                  }`}
                  title="Filtrat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                </button>

                {/* View toggle buttons */}
                <div className="hidden md:flex items-center gap-1 bg-sand rounded-lg p-1">
                  <button
                    onClick={() => setCurrentView('requests')}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                      currentView === 'requests' 
                        ? 'bg-paper text-ink shadow-sm' 
                        : 'text-clay hover:text-ink'
                    }`}
                  >
                    Kërkesat
                  </button>
                  <button
                    onClick={() => setCurrentView('availability')}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                      currentView === 'availability' 
                        ? 'bg-paper text-ink shadow-sm' 
                        : 'text-clay hover:text-ink'
                    }`}
                  >
                    Kalendari
                  </button>
                  <button
                    onClick={() => setCurrentView('working-hours')}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                      currentView === 'working-hours' 
                        ? 'bg-paper text-ink shadow-sm' 
                        : 'text-clay hover:text-ink'
                    }`}
                  >
                    Orët
                  </button>
                </div>

                <button
                  onClick={handleRefresh}
                  className="p-2 text-clay hover:text-ink rounded-lg hover:bg-sand transition-colors"
                  title="Rifresko"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                <button
                  onClick={handleLogout}
                  className="text-accent hover:text-accent-strong px-3 py-2 rounded-md text-sm font-medium hover:bg-accent-soft/60 transition-colors"
                  title="Dil nga dashboard-i"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Dil</span>
                  </div>
                </button>
                
                <Link href="/" className="text-clay hover:text-ink px-3 py-2 rounded-md text-sm font-medium">
                  Faqja kryesore
                </Link>
              </div>
            </div>

            {/* Mobile Search & Filters */}
            <div className="md:hidden pb-4">
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-clay/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Kërko klient, shërbim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-linen rounded-md leading-5 bg-paper placeholder:text-clay/60 focus:outline-none focus:ring-1 focus:ring-accent/25 focus:border-accent text-sm"
                />
              </div>
              
              {/* Mobile view toggle */}
              <div className="flex bg-sand rounded-lg p-1 mb-3">
                <button
                  onClick={() => setCurrentView('requests')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                    currentView === 'requests' 
                      ? 'bg-paper text-ink shadow-sm' 
                      : 'text-clay'
                  }`}
                >
                  Kërkesat
                </button>
                <button
                  onClick={() => setCurrentView('availability')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                    currentView === 'availability' 
                      ? 'bg-paper text-ink shadow-sm' 
                      : 'text-clay'
                  }`}
                >
                  Kalendari
                </button>
                <button
                  onClick={() => setCurrentView('working-hours')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                    currentView === 'working-hours' 
                      ? 'bg-paper text-ink shadow-sm' 
                      : 'text-clay'
                  }`}
                >
                  Orët
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            {showFilters && (
              <div className="border-t border-linen py-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'Të gjitha', count: dashboardData.pendingRequests.length },
                    { key: 'priority', label: 'Prioritet i lartë', count: dashboardData.pendingRequests.filter(r => r.priorityScore >= 60).length },
                    { key: 'today', label: 'Sot', count: dashboardData.pendingRequests.filter(r => r.appointmentDate === new Date().toISOString().split('T')[0]).length },
                    { key: 'tomorrow', label: 'Nesër', count: dashboardData.pendingRequests.filter(r => r.appointmentDate === new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]).length }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setFilterStatus(filter.key as typeof filterStatus)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filterStatus === filter.key
                          ? 'bg-accent-soft text-accent-strong border border-accent/25'
                          : 'bg-sand text-ink hover:bg-linen'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Mobile search */}
        <div className="container-responsive md:hidden py-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-clay/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Kërko klient, shërbim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-linen rounded-lg bg-paper placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent/25 focus:border-accent text-sm"
            />
          </div>
        </div>

        {/* Page Content */}
        <div className="container-responsive py-6">
          {/* Enhanced Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-paper rounded p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer" 
                 onClick={() => setFilterStatus('all')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-warning/10">
                    <span className="text-xl">⏳</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-clay">Në pritje</p>
                    <p className="text-2xl font-bold text-ink">{dashboardData.stats.pendingCount}</p>
                  </div>
                </div>
                {dashboardData.stats.pendingCount > 5 && (
                  <div className="bg-accent-soft text-accent text-xs font-medium px-2 py-1 rounded-full">
                    Shtypesë
                  </div>
                )}
              </div>
            </div>

            <div className="bg-paper rounded p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => setFilterStatus('today')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-success/10">
                    <span className="text-xl"></span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-clay">Sot</p>
                    <p className="text-2xl font-bold text-ink">{dashboardData.stats.todayCount}</p>
                  </div>
                </div>
                {dashboardData.todaySchedule.length > 0 && (
                  <div className="text-success text-xs">
                    Aktiv
                  </div>
                )}
              </div>
            </div>

            <div className="bg-paper rounded p-4 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-accent-soft">
                    <span className="text-xl"></span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-clay">Java</p>
                    <p className="text-2xl font-bold text-ink">{dashboardData.stats.weeklyBookings}</p>
                  </div>
                </div>
                {dashboardData.stats.weeklyBookings > 20 && (
                  <div className="text-accent text-xs">
                    Lartë
                  </div>
                )}
              </div>
            </div>

            <div className="bg-paper rounded p-4 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-100">
                    <span className="text-xl">⭐</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-clay">Vlerësimi</p>
                    <p className="text-2xl font-bold text-ink">{dashboardData.stats.averageRating.toFixed(1)}</p>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-4 h-4 ${
                      star <= dashboardData.stats.averageRating ? 'text-yellow-400' : 'text-linen'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          {(searchQuery || filterStatus !== 'all') && (
            <div className="bg-accent-soft/40 border border-accent/25 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-accent-strong text-sm">
                  <span className="font-medium">Po shfaqen {filteredRequests.length}</span> nga {dashboardData.pendingRequests.length} kërkesat
                  {searchQuery && <span> • Kërkim: &quot;{searchQuery}&quot;</span>}
                  {filterStatus !== 'all' && <span> • Filtri: {{
                    priority: 'Prioritet i lartë',
                    today: 'Sot',
                    tomorrow: 'Nesër'
                  }[filterStatus]}</span>}
                </p>
                {(searchQuery || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilterStatus('all')
                    }}
                    className="ml-auto text-accent hover:text-accent-strong text-sm font-medium"
                  >
                    Pastro filtrat
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Dashboard Content */}
          {currentView === 'requests' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Requests Queue */}
              <div className="lg:col-span-2">
                {filteredRequests.length === 0 && dashboardData.pendingRequests.length > 0 ? (
                  <div className="bg-paper rounded shadow-sm border p-8 text-center">
                    <div className="text-clay/70 text-5xl mb-4"></div>
                    <h3 className="text-lg font-medium text-ink mb-2">Asnjë rezultat</h3>
                    <p className="text-clay mb-4">
                      Nuk u gjet asnjë kërkesë me kriteret e zgjedhura
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setFilterStatus('all')
                      }}
                      className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      Pastro filtrat
                    </button>
                  </div>
                ) : (
                  <RequestsQueue
                    requests={filteredRequests}
                    onCustomerClick={handleCustomerClick}
                    onAppointmentAction={handleAppointmentAction}
                  />
                )}

              {/* Today's Schedule */}
              {dashboardData.todaySchedule.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-ink mb-4">Orari i sotëm</h2>
                  <div className="bg-paper rounded shadow-sm border overflow-hidden">
                    {dashboardData.todaySchedule.map((appointment) => (
                      <div key={appointment.id} className="p-4 border-b border-linen last:border-b-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-ink">
                              {appointment.customer.firstName} {appointment.customer.lastName}
                            </p>
                            <p className="text-sm text-clay">{appointment.service.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-ink">{appointment.startTime}</p>
                            <p className="text-sm text-clay">{appointment.service.duration} min</p>
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
                  <h2 className="text-lg font-semibold text-ink mb-4">Aktiviteti i fundit</h2>
                  <div className="bg-paper rounded shadow-sm border overflow-hidden">
                    {dashboardData.recentActivity.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="p-4 border-b border-linen last:border-b-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-ink">
                              {appointment.customer.firstName} {appointment.customer.lastName}
                            </p>
                            <p className="text-sm text-clay">{appointment.service.name}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'approved' ? 'bg-success/10 text-success' :
                              appointment.status === 'declined' ? 'bg-accent-soft text-accent-strong' :
                              appointment.status === 'completed' ? 'bg-accent-soft text-accent-strong' :
                              'bg-sand text-ink'
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
                    customer={selectedCustomer.customer}
                    onClose={() => {
                      setSelectedCustomer(null)
                      setShowCustomerDetails(false)
                    }}
                  />
                ) : (
                  <div className="bg-paper rounded shadow-sm border p-6 text-center">
                    <div className="text-clay/70 text-4xl mb-4"></div>
                    <h3 className="text-lg font-medium text-ink mb-2">Detajet e klientit</h3>
                    <p className="text-clay text-sm">
                      Kliko mbi një kërkesë për të parë detajet e klientit dhe historikun e rezervimeve.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Availability Calendar View */}
          {currentView === 'availability' && salonId && (
            <div className="space-y-6">
              <AvailabilityCalendar
                salonId={salonId}
                allowMultiSelect={true}
                onSelectionChange={() => handleAvailabilityChange()}
                className="w-full"
              />
            </div>
          )}

          {/* Working Hours Configuration View */}
          {currentView === 'working-hours' && salonId && dashboardData?.salon?.workingHours && (
            <div className="space-y-6">
              <WorkingHoursConfig
                salonId={salonId}
                initialWorkingHours={dashboardData.salon.workingHours}
                onSave={handleWorkingHoursSave}
                onCancel={() => setCurrentView('requests')}
              />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center py-4 text-sm text-clay">
          Përditësuar më: {lastUpdate.toLocaleTimeString('sq-AL')}
        </div>
      </div>

      {/* Mobile bottom actions */}
        <div className="mobile-nav md:hidden flex justify-around">
          <button onClick={handleRefresh} className="flex flex-col items-center text-ink">
            <div className="w-10 h-10 rounded bg-sand flex items-center justify-center mb-1">
              <svg className="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-xs">Rifresko</span>
          </button>
          <Link href="/" className="flex flex-col items-center text-ink">
            <div className="w-10 h-10 rounded bg-sand flex items-center justify-center mb-1">
              <svg className="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.75L12 4l9 5.75V20a2 2 0 01-2 2H5a2 2 0 01-2-2V9.75z" />
              </svg>
            </div>
            <span className="text-xs">Kryesore</span>
          </Link>
      </div>
    </>
  )
}
