// frontend/pages/dashboard/bookings.js
// Mobile-first customer bookings management page - ImiRezervimi.al

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout, { dashboardLayout } from '../../components/layout/Layout'
import { showToast } from '../../components/ToastProvider'
import ConfirmationModal from '../../components/ui/ConfirmationModal'

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, approved, completed, declined
  const [showReschedule, setShowReschedule] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchBookings()
    }
  }, [status, router])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/customers/booking-history')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setBookings(data.data.bookings || [])
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = (booking) => {
    if (!booking) return
    setBookingToCancel(booking)
    setShowCancelModal(true)
  }

  const confirmCancel = async () => {
    if (!bookingToCancel) return
    
    setShowCancelModal(false)
    const booking = bookingToCancel
    setBookingToCancel(null)

    try {
      const res = await fetch(`/api/appointments/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', salonNotes: 'Anuluar nga klienti' })
      })
      const data = await res.json()
      if (data.success) {
        await fetchBookings()
        showToast.appointmentCancelled()
      } else {
        showToast.error(data.error?.message || 'Nuk u anulua. Provoni përsëri.')
      }
    } catch (e) {
      console.error(e)
      showToast.error('Gabim. Provoni përsëri.')
    }
  }

  const openReschedule = (booking) => {
    setSelectedBooking(booking)
    setNewDate(booking.appointment_date?.slice(0, 10) || '')
    setNewTime(booking.start_time?.slice(0, 5) || '')
    setNewNotes(booking.customer_notes || '')
    setShowReschedule(true)
  }

  const submitReschedule = async () => {
    if (!selectedBooking) return
    setSaving(true)
    try {
      const res = await fetch(`/api/appointments/${selectedBooking.id}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentDate: newDate, startTime: newTime, customerNotes: newNotes })
      })
      const data = await res.json()
      if (data.success) {
        setShowReschedule(false)
        setSelectedBooking(null)
        await fetchBookings()
        showToast.success('Rezervimi u përditësua me sukses!')
      } else {
        showToast.error(data.error?.message || 'Nuk u përditësua. Provoni përsëri.')
      }
    } catch (e) {
      console.error(e)
      showToast.error('Gabim. Provoni përsëri.')
    } finally {
      setSaving(false)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true
    return booking.status === filter
  })

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-warning/10 text-warning',
      approved: 'bg-success/10 text-success', 
      completed: 'bg-accent-soft text-accent-strong',
      declined: 'bg-accent-soft text-red-800',
      cancelled: 'bg-sand text-ink'
    }

    const labels = {
      pending: 'Në pritje',
      approved: 'Aprovuar',
      completed: 'Kryer', 
      declined: 'Refuzuar',
      cancelled: 'Anulluar'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (!session) return null

  return (
    <Layout {...dashboardLayout({ 
      title: 'Rezervimet e Mia',
      description: 'Shiko dhe menaxho të gjitha rezervimet e tua'
    })}>
      <div className="min-h-screen bg-cream">

        {/* Main Content */}
        <div className="px-4 sm:px-6 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">Rezervimet e Mia</h1>
            <p className="text-clay">Menaxho të gjitha rezervimet e tua</p>
          </div>

          {/* Mobile-Optimized Filter Tabs */}
          <div className="mb-6">
            <div className="flex overflow-x-auto pb-2 -mb-2 space-x-1">
              {[
                { key: 'all', label: 'Të gjitha', count: bookings.length },
                { key: 'pending', label: 'Në pritje', count: bookings.filter(b => b.status === 'pending').length },
                { key: 'approved', label: 'Aprovuar', count: bookings.filter(b => b.status === 'approved').length },
                { key: 'completed', label: 'Kryer', count: bookings.filter(b => b.status === 'completed').length },
                { key: 'declined', label: 'Refuzuar', count: bookings.filter(b => b.status === 'declined').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filter === tab.key
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-paper text-clay hover:text-ink border border-linen hover:border-linen'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                      filter === tab.key 
                        ? 'bg-white/20 text-white' 
                        : 'bg-sand text-clay'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-paper rounded p-4 border animate-pulse">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <div className="h-5 bg-linen rounded w-24"></div>
                      <div className="h-4 bg-linen rounded w-32"></div>
                    </div>
                    <div className="h-6 bg-linen rounded w-16"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-4 bg-linen rounded"></div>
                    <div className="h-4 bg-linen rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 bg-paper rounded border">
              <div className="text-clay/70 text-6xl mb-4"></div>
              <h3 className="text-lg font-semibold text-ink mb-2">
                {filter === 'all' ? 'Nuk keni rezervime' : `Nuk keni rezervime ${filter === 'pending' ? 'në pritje' : filter === 'approved' ? 'aprovuar' : filter === 'completed' ? 'kryer' : 'refuzuar'}`}
              </h3>
              <p className="text-clay mb-6">
                {filter === 'all' 
                  ? 'Bëni rezervimin tuaj të parë për të filluar!'
                  : 'Ndryshoni filtrin për të parë rezervime të tjera.'}
              </p>
              {filter === 'all' && (
                <Link href="/salons" className="inline-flex items-center px-6 py-3 bg-accent text-white rounded hover:bg-accent transition-colors font-medium">
                  Zbulo Sallone
                </Link>
              )}
            </div>
          ) : (
            /* Responsive Bookings Grid - 2 columns on desktop, 1 on mobile */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-paper rounded border p-4 hover:shadow-sm transition-shadow">
                  {/* Booking Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg text-ink truncate">{booking.salon_name}</h3>
                      <p className="text-clay text-sm">{booking.service_name}</p>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  
                  {/* Booking Details Grid - Mobile Optimized */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-clay mb-1">Data</p>
                      <p className="font-medium text-ink">
                        {new Date(booking.appointment_date).toLocaleDateString('sq-AL', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-clay mb-1">Ora</p>
                      <p className="font-medium text-ink">{booking.start_time}</p>
                    </div>
                    <div>
                      <p className="text-clay mb-1">Çmimi</p>
                      <p className="font-medium text-ink">{booking.service_price}€</p>
                    </div>
                    <div>
                      <p className="text-clay mb-1">Kërkuar më</p>
                      <p className="font-medium text-ink">
                        {new Date(booking.created_at).toLocaleDateString('sq-AL')}
                      </p>
                    </div>
                  </div>

                  {/* Salon Response */}
                  {booking.salon_notes && (
                    <div className="mb-4 p-3 bg-cream rounded-lg">
                      <p className="text-sm">
                        <strong className="text-ink">Përgjigja e sallonit:</strong>{' '}
                        <span className="text-ink">{booking.salon_notes}</span>
                      </p>
                    </div>
                  )}

                  {/* Action Buttons - Mobile Optimized */}
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href={`/booking/${booking.id}/status`}
                      className="w-full text-center px-4 py-2 bg-accent-soft/40 text-accent-strong rounded-lg hover:bg-accent-soft transition-colors font-medium text-sm"
                    >
                      Shiko detajet →
                    </Link>
                    
                    {(booking.status === 'pending' || booking.status === 'approved') && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openReschedule(booking)}
                          className="flex-1 px-4 py-2 bg-sand text-ink rounded-lg hover:bg-linen transition-colors font-medium text-sm"
                        >
                          Ndrysho orarin
                        </button>
                        <button
                          onClick={() => handleCancel(booking)}
                          className="flex-1 px-4 py-2 bg-accent-soft/60 text-accent-strong rounded-lg hover:bg-accent-soft transition-colors font-medium text-sm"
                        >
                          Anulloje
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile-Optimized Reschedule Modal */}
        {showReschedule && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4 z-50">
            <div className="bg-paper rounded-t-2xl sm:rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-ink">Ndrysho orarin</h3>
                  <button 
                    onClick={() => setShowReschedule(false)}
                    className="text-clay/70 hover:text-clay"
                  >
                    
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Data e re</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-3 border border-linen rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Ora e re</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full p-3 border border-linen rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Shënime (opsionale)</label>
                    <textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full p-3 border border-linen rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent"
                      rows={3}
                      placeholder="Arsyeja e ndryshimit..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowReschedule(false)}
                      className="flex-1 py-3 px-4 bg-sand text-ink rounded-lg hover:bg-linen transition-colors font-medium"
                    >
                      Anulo
                    </button>
                    <button
                      onClick={submitReschedule}
                      disabled={saving}
                      className="flex-1 py-3 px-4 bg-accent text-white rounded-lg hover:bg-accent transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? 'Po ruhet...' : 'Ruaj ndryshimet'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false)
          setBookingToCancel(null)
        }}
        onConfirm={confirmCancel}
        title="Anulo rezervimin"
        message="Jeni të sigurt që doni të anuloni këtë rezervim?"
        confirmText="Po, anulo"
        cancelText="Jo, mbaje"
        variant="danger"
      />
    </Layout>
  )
}