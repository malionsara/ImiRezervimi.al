// frontend/pages/dashboard/bookings.js
// Customer bookings management page - ImiRezervimi.al

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

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

  const handleCancel = async (booking) => {
    if (!booking) return
    const confirmed = window.confirm('Jeni të sigurt që doni të anuloni këtë rezervim?')
    if (!confirmed) return

    try {
      const res = await fetch(`/api/appointments/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', salonNotes: 'Anuluar nga klienti' })
      })
      const data = await res.json()
      if (data.success) {
        await fetchBookings()
      } else {
        alert(data.error?.message || 'Nuk u anulua. Provoni përsëri.')
      }
    } catch (e) {
      console.error(e)
      alert('Gabim. Provoni përsëri.')
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
      } else {
        alert(data.error?.message || 'Nuk u përditësua. Provoni përsëri.')
      }
    } catch (e) {
      console.error(e)
      alert('Gabim. Provoni përsëri.')
    } finally {
      setSaving(false)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    return booking.status === filter
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Në pritje' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprovuar' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Kryer' },
      declined: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refuzuar' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Anulluar' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg animate-pulse p-2">
            <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={64} height={64} />
          </div>
          <p className="text-gray-600">Po ngarkon...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <>
      <Head>
        <title>Rezervimet e Mia - ImiRezervimi.al</title>
        <meta name="description" content="Shiko dhe menaxho të gjitha rezervimet e tua" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/dashboard">
                  <a className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center mr-3 p-1 border">
                      <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={32} height={32} />
                    </div>
                    <span className="text-xl font-bold text-gray-900">ImiRezervimi</span>
                  </a>
                </Link>
                <span className="ml-4 text-gray-400">•</span>
                <span className="ml-4 text-gray-600">Rezervimet e Mia</span>
              </div>
              
              <Link href="/dashboard">
                <a className="text-gray-500 hover:text-gray-700 text-sm">
                  ← Kthehu te Dashboard
                </a>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rezervimet e Mia</h1>
            <p className="text-gray-600">Menaxho të gjitha rezervimet e tua</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg inline-flex">
            {[
              { key: 'all', label: 'Të gjitha' },
              { key: 'pending', label: 'Në pritje' },
              { key: 'approved', label: 'Aprovuar' },
              { key: 'completed', label: 'Kryer' },
              { key: 'declined', label: 'Refuzuar' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.key !== 'all' && (
                  <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                    {bookings.filter(b => b.status === tab.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'Nuk keni rezervime' : `Nuk keni rezervime ${filter === 'pending' ? 'në pritje' : filter === 'approved' ? 'aprovuar' : filter === 'completed' ? 'kryer' : 'refuzuar'}`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Bëni rezervimin tuaj të parë për të filluar!'
                  : 'Ndryshoni filtrin për të parë rezervime të tjera.'}
              </p>
              {filter === 'all' && (
                <Link href="/salon">
                  <a className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    🔍 Zbulo Sallone
                  </a>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl border p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{booking.salon_name}</h3>
                      <p className="text-gray-600">{booking.service_name}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Data</p>
                      <p className="font-medium">
                        {new Date(booking.appointment_date).toLocaleDateString('sq-AL', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ora</p>
                      <p className="font-medium">{booking.start_time}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Çmimi</p>
                      <p className="font-medium">{booking.service_price}€</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Kërkuar më</p>
                      <p className="font-medium">
                        {new Date(booking.requested_at).toLocaleDateString('sq-AL')}
                      </p>
                    </div>
                  </div>

                  {booking.customer_notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Shënimi:</strong> {booking.customer_notes}
                      </p>
                    </div>
                  )}

                  {booking.salon_notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Përgjigja e sallonit:</strong> {booking.salon_notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <Link href={`/booking/${booking.id}/status`}>
                      <a className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Shiko detajet →
                      </a>
                    </Link>

                    {(booking.status === 'pending' || booking.status === 'approved') && (
                      <div className="flex items-center gap-4">
                        <button 
                          className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                          onClick={() => openReschedule(booking)}
                        >
                          Ndrysho orarin
                        </button>
                        <button 
                          className="text-gray-500 hover:text-gray-700 text-sm"
                          onClick={() => handleCancel(booking)}
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
        </main>
      
      {/* Reschedule Modal */}
      {showReschedule && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ri-planifiko rezervimin</h3>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowReschedule(false)}>✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Data</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Ora</label>
                <input type="time" className="w-full border rounded-lg px-3 py-2" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Shënimet tuaja (opsionale)</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows={3} value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setShowReschedule(false)}>Anulo</button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                onClick={submitReschedule}
                disabled={saving || !newDate || !newTime}
              >
                {saving ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </>
  )
}