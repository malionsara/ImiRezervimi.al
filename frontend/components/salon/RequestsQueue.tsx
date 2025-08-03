// frontend/components/salon/RequestsQueue.tsx
// Pending appointment requests queue with priority sorting
// Albanian Beauty Salon Booking Platform

import { useState, useMemo } from 'react'
import AppointmentActions from './AppointmentActions'

// ==============================================
// TYPES AND INTERFACES
// ==============================================
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

interface RequestsQueueProps {
  requests: AppointmentRequest[]
  onCustomerClick: (request: AppointmentRequest) => void
  onAppointmentAction: (appointmentId: string, action: 'approve' | 'decline', notes?: string) => void
}

// ==============================================
// REQUESTS QUEUE COMPONENT
// ==============================================
export default function RequestsQueue({ 
  requests, 
  onCustomerClick, 
  onAppointmentAction 
}: RequestsQueueProps) {
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'date'>('priority')
  const [filterBy, setFilterBy] = useState<'all' | 'vip' | 'new' | 'returning'>('all')
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)

  // ==============================================
  // SORTING AND FILTERING LOGIC
  // ==============================================
  const sortedAndFilteredRequests = useMemo(() => {
    let filtered = requests

    // Apply filters
    if (filterBy !== 'all') {
      filtered = requests.filter(request => {
        switch (filterBy) {
          case 'vip':
            return request.customer.priorityScore >= 80
          case 'new':
            return request.customer.totalVisits === 0
          case 'returning':
            return request.customer.totalVisits > 0
          default:
            return true
        }
      })
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priorityScore - a.priorityScore
        case 'time':
          return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()
        case 'date':
          const dateA = new Date(`${a.appointmentDate} ${a.startTime}`)
          const dateB = new Date(`${b.appointmentDate} ${b.startTime}`)
          return dateA.getTime() - dateB.getTime()
        default:
          return 0
      }
    })
  }, [requests, sortBy, filterBy])

  // ==============================================
  // HELPER FUNCTIONS
  // ==============================================
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const days = ['E dielë', 'E hënë', 'E martë', 'E mërkurë', 'E enjte', 'E premte', 'E shtunë']
    return days[date.getDay()]
  }

  const formatTime = (timeString: string): string => {
    return timeString.slice(0, 5) // HH:MM format
  }

  const getTimeAgo = (dateString: string): string => {
    const now = new Date()
    const requested = new Date(dateString)
    const diffMinutes = Math.floor((now.getTime() - requested.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Tani'
    if (diffMinutes < 60) return `${diffMinutes} min më parë`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} orë më parë`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} ditë më parë`
  }

  const getPriorityBadge = (score: number) => {
    if (score >= 80) {
      return { label: 'VIP', color: 'bg-purple-100 text-purple-800', icon: '👑' }
    } else if (score >= 60) {
      return { label: 'I lartë', color: 'bg-red-100 text-red-800', icon: '🔥' }
    } else if (score >= 40) {
      return { label: 'Mesatar', color: 'bg-yellow-100 text-yellow-800', icon: '⭐' }
    } else {
      return { label: 'Normal', color: 'bg-gray-100 text-gray-800', icon: '👤' }
    }
  }

  const getCustomerTypeBadge = (totalVisits: number) => {
    if (totalVisits === 0) {
      return { label: 'Klient i ri', color: 'bg-blue-100 text-blue-800', icon: '🆕' }
    } else if (totalVisits >= 5) {
      return { label: 'Klient besnik', color: 'bg-green-100 text-green-800', icon: '💎' }
    } else {
      return { label: 'Klient', color: 'bg-gray-100 text-gray-800', icon: '👤' }
    }
  }

  // ==============================================
  // EVENT HANDLERS
  // ==============================================
  const handleToggleExpand = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId)
  }

  // ==============================================
  // EMPTY STATE
  // ==============================================
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="text-gray-400 text-5xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Asnjë kërkesë në pritje</h3>
        <p className="text-gray-600">
          Të gjitha rezervimet janë procesuar. Klientët e rinj do të shfaqen këtu.
        </p>
      </div>
    )
  }

  // ==============================================
  // MAIN RENDER
  // ==============================================
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">⏳ Kërkesat në pritje</h2>
          <p className="text-sm text-gray-600 mt-1">
            {sortedAndFilteredRequests.length} nga {requests.length} kërkesa
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">Të gjitha</option>
            <option value="vip">VIP klientë</option>
            <option value="new">Klientë të rinj</option>
            <option value="returning">Klientë që kthehen</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="priority">Sipas prioritetit</option>
            <option value="time">Sipas kohës së kërkesës</option>
            <option value="date">Sipas datës së rezervimit</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {sortedAndFilteredRequests.map((request) => {
          const priorityBadge = getPriorityBadge(request.priorityScore)
          const customerBadge = getCustomerTypeBadge(request.customer.totalVisits)
          const isExpanded = expandedRequest === request.id

          return (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200"
            >
              {/* Main Request Card */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {/* Customer Info */}
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => onCustomerClick(request)}
                        className="flex items-center hover:text-red-600 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900">
                          {request.customer.firstName} {request.customer.lastName}
                        </h3>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityBadge.color}`}>
                        <span className="mr-1">{priorityBadge.icon}</span>
                        {priorityBadge.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${customerBadge.color}`}>
                        <span className="mr-1">{customerBadge.icon}</span>
                        {customerBadge.label}
                      </span>
                      {request.customer.rating > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐ {request.customer.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Service and Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Shërbimi:</p>
                        <p className="font-medium text-gray-900">{request.service.name}</p>
                        <p className="text-gray-500">{request.service.duration} min • {request.service.price}€</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Koha e kërkuar:</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(request.appointmentDate)}, {request.appointmentDate}
                        </p>
                        <p className="text-gray-500">{formatTime(request.startTime)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Time ago */}
                  <div className="text-right text-sm text-gray-500 ml-4">
                    {getTimeAgo(request.requestedAt)}
                  </div>
                </div>

                {/* Customer Notes Preview */}
                {request.customerNotes && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-blue-800">Shënim nga klienti:</span>
                    </p>
                    <p className="text-sm text-gray-800 mt-1">
                      {request.customerNotes.length > 100 && !isExpanded 
                        ? `${request.customerNotes.slice(0, 100)}...`
                        : request.customerNotes
                      }
                    </p>
                    {request.customerNotes.length > 100 && (
                      <button
                        onClick={() => handleToggleExpand(request.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
                      >
                        {isExpanded ? 'Shfaq më pak' : 'Shfaq më shumë'}
                      </button>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <AppointmentActions
                  appointmentId={request.id}
                  customerName={`${request.customer.firstName} ${request.customer.lastName}`}
                  onAction={onAppointmentAction}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter Results Message */}
      {sortedAndFilteredRequests.length < requests.length && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Po shfaqen {sortedAndFilteredRequests.length} nga {requests.length} kërkesa të filtruara
        </div>
      )}
    </div>
  )
}