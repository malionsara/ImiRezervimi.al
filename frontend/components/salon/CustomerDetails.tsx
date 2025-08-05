// frontend/components/salon/CustomerDetails.tsx
// Customer profile display with history and rating information
// Albanian Beauty Salon Booking Platform

import { useState, useEffect, useCallback } from 'react'

// ==============================================
// TYPES AND INTERFACES
// ==============================================
interface CustomerDetailsProps {
  customer: {
    id: string
    firstName: string
    lastName: string
    phone: string
    rating: number
    totalVisits: number
    priorityScore: number
  }
  onClose: () => void
}

interface CustomerHistory {
  appointments: AppointmentHistoryItem[]
  stats: CustomerStats
  notes: CustomerNote[]
}

interface AppointmentHistoryItem {
  id: string
  serviceName: string
  appointmentDate: string
  startTime: string
  status: string
  salonNotes?: string
  customerNotes?: string
  price?: number
  createdAt: string
}

interface CustomerStats {
  totalVisits: number
  totalSpent: number
  averageRating: number
  cancellationRate: number
  noShowRate: number
  lastVisit?: string
  favoriteService?: string
}

interface CustomerNote {
  id: string
  note: string
  createdAt: string
  createdBy: string
}

// ==============================================
// CUSTOMER DETAILS COMPONENT
// ==============================================
export default function CustomerDetails({ customer, onClose }: CustomerDetailsProps) {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<CustomerHistory | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'notes'>('overview')
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)

  // ==============================================
  // DATA LOADING
  // ==============================================
  const loadCustomerHistory = useCallback(async () => {
    try {
      setLoading(true)
      
      // In a real implementation, this would fetch from API
      // For now, we'll simulate the data structure
      const mockHistory: CustomerHistory = {
        appointments: [
          {
            id: '1',
            serviceName: 'Manikyr klasik',
            appointmentDate: '2024-01-15',
            startTime: '10:00',
            status: 'completed',
            salonNotes: 'Klienti shumë i kënaqur',
            price: 15,
            createdAt: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            serviceName: 'Nail Art',
            appointmentDate: '2024-01-22',
            startTime: '14:30',
            status: 'completed',
            salonNotes: 'Dizajn i veçantë me lule',
            price: 25,
            createdAt: '2024-01-22T14:30:00Z'
          }
        ],
        stats: {
          totalVisits: customer.totalVisits,
          totalSpent: 85.50,
          averageRating: customer.rating,
          cancellationRate: 0.05,
          noShowRate: 0.02,
          lastVisit: '2024-01-22',
          favoriteService: 'Manikyr klasik'
        },
        notes: [
          {
            id: '1',
            note: 'Preferon ngjyra të errëta dhe dizajne minimale',
            createdAt: '2024-01-15T10:30:00Z',
            createdBy: 'Salon Staff'
          }
        ]
      }
      
      setHistory(mockHistory)
    } catch (error) {
      console.error('Error loading customer history:', error)
    } finally {
      setLoading(false)
    }
  }, [customer.totalVisits, customer.rating])

  useEffect(() => {
    loadCustomerHistory()
  }, [customer.id, loadCustomerHistory])

  // ==============================================
  // HELPER FUNCTIONS
  // ==============================================
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sq-AL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed': return 'I përfunduar'
      case 'cancelled': return 'I anuluar'
      case 'no_show': return 'Nuk u paraqit'
      case 'approved': return 'I miratuar'
      case 'declined': return 'I refuzuar'
      default: return status
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-orange-100 text-orange-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'declined': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLevel = (score: number): { label: string; color: string; icon: string } => {
    if (score >= 80) {
      return { label: 'VIP', color: 'text-purple-600', icon: '👑' }
    } else if (score >= 60) {
      return { label: 'I lartë', color: 'text-red-600', icon: '🔥' }
    } else if (score >= 40) {
      return { label: 'Mesatar', color: 'text-yellow-600', icon: '⭐' }
    } else {
      return { label: 'Normal', color: 'text-gray-600', icon: '👤' }
    }
  }

  // ==============================================
  // EVENT HANDLERS
  // ==============================================
  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      setAddingNote(true)
      
      // In real implementation, this would call API
      const note: CustomerNote = {
        id: Date.now().toString(),
        note: newNote.trim(),
        createdAt: new Date().toISOString(),
        createdBy: 'Salon Staff'
      }

      if (history) {
        setHistory({
          ...history,
          notes: [note, ...history.notes]
        })
      }

      setNewNote('')
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setAddingNote(false)
    }
  }

  // ==============================================
  // LOADING STATE
  // ==============================================
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Po ngarkohet...</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      </div>
    )
  }

  if (!history) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
        <div className="text-red-500 text-4xl mb-4">❌</div>
        <p className="text-gray-600">Gabim në ngarkimin e të dhënave të klientit</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Mbyll
        </button>
      </div>
    )
  }

  const priority = getPriorityLevel(customer.priorityScore)

  // ==============================================
  // MAIN RENDER
  // ==============================================
  return (
    <div className="bg-white rounded-xl shadow-sm border h-fit sticky top-24">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h3>
            <p className="text-sm text-gray-600">{customer.phone}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Priority and Rating */}
        <div className="flex gap-2 mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priority.color} bg-opacity-10`}>
            <span className="mr-1">{priority.icon}</span>
            {priority.label}
          </span>
          {customer.rating > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ⭐ {customer.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Vizita totale</p>
            <p className="font-semibold text-gray-900">{history.stats.totalVisits}</p>
          </div>
          <div>
            <p className="text-gray-600">Shuma totale</p>
            <p className="font-semibold text-gray-900">{history.stats.totalSpent.toFixed(2)}€</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'overview', label: 'Përmbledhje', icon: '📊' },
            { id: 'history', label: 'Historiku', icon: '📅' },
            { id: 'notes', label: 'Shënime', icon: '📝' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'history' | 'notes')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Statistika</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Mesatarja e vlerësimit</span>
                  <span className="font-medium">{history.stats.averageRating.toFixed(1)} ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Shkalla e anulimeve</span>
                  <span className="font-medium">{(history.stats.cancellationRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Shkalla e mosparaqitjeve</span>
                  <span className="font-medium">{(history.stats.noShowRate * 100).toFixed(1)}%</span>
                </div>
                {history.stats.lastVisit && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Vizita e fundit</span>
                    <span className="font-medium">{formatDate(history.stats.lastVisit)}</span>
                  </div>
                )}
                {history.stats.favoriteService && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Shërbimi i preferuar</span>
                    <span className="font-medium">{history.stats.favoriteService}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Historiku i rezervimeve</h4>
            {history.appointments.length > 0 ? (
              <div className="space-y-3">
                {history.appointments.map((appointment) => (
                  <div key={appointment.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.serviceName}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(appointment.appointmentDate)} në {appointment.startTime}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    {appointment.price && (
                      <p className="text-sm text-gray-600 mb-2">{appointment.price}€</p>
                    )}
                    {appointment.salonNotes && (
                      <div className="text-sm">
                        <p className="text-gray-600">Shënim nga salloni:</p>
                        <p className="text-gray-800 italic">&quot;{appointment.salonNotes}&quot;</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Nuk ka histori rezervimesh</p>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Shënime të sallonit</h4>
            
            {/* Add New Note */}
            <div className="mb-4 p-3 border border-gray-200 rounded-lg">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Shto një shënim për këtë klient..."
                className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {addingNote ? 'Po shtohet...' : 'Shto shënim'}
                </button>
              </div>
            </div>

            {/* Existing Notes */}
            {history.notes.length > 0 ? (
              <div className="space-y-3">
                {history.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800 mb-2">{note.note}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{note.createdBy}</span>
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Nuk ka shënime të ruajtura</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}