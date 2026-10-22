// frontend/components/salon/RequestsQueue.tsx
// Pending appointment requests queue with priority sorting
// Albanian Beauty Salon Booking Platform

import { useState, useMemo } from 'react'
import { Star, Inbox, ChevronRight } from 'lucide-react'
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
      return { label: 'VIP', color: 'bg-accent text-white' }
    } else if (score >= 60) {
      return { label: 'I lartë', color: 'bg-accent-soft text-accent-strong' }
    } else if (score >= 40) {
      return { label: 'Mesatar', color: 'bg-warning/10 text-warning' }
    } else {
      return { label: 'Normal', color: 'bg-sand text-clay' }
    }
  }

  const getCustomerTypeBadge = (totalVisits: number) => {
    if (totalVisits === 0) {
      return { label: 'Klient i ri', color: 'bg-accent-soft text-accent-strong' }
    } else if (totalVisits >= 5) {
      return { label: 'Klient besnik', color: 'bg-success/10 text-success' }
    } else {
      return { label: 'Klient', color: 'bg-sand text-clay' }
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
      <div className="bg-paper rounded-lg shadow-soft border border-linen p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sand">
          <Inbox size={22} strokeWidth={1.75} className="text-clay" aria-hidden="true" />
        </div>
        <h3 className="font-display text-lg text-ink mb-2">Asnjë kërkesë në pritje</h3>
        <p className="text-clay">
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
          <h2 className="font-display text-xl text-ink">Kërkesat në pritje</h2>
          <p className="subtitle mt-1">
            {sortedAndFilteredRequests.length} nga {requests.length} kërkesa
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as 'all' | 'vip' | 'new' | 'returning')}
            className="px-3 py-2 border border-linen rounded-lg text-sm focus:ring-2 focus:ring-accent/25 focus:border-accent"
          >
            <option value="all">Të gjitha</option>
            <option value="vip">VIP klientë</option>
            <option value="new">Klientë të rinj</option>
            <option value="returning">Klientë që kthehen</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'priority' | 'time' | 'date')}
            className="px-3 py-2 border border-linen rounded-lg text-sm focus:ring-2 focus:ring-accent/25 focus:border-accent"
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
              className="card hover:shadow-md transition-all duration-200"
            >
              {/* Main Request Card */}
              <div className="card-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {/* Customer Info */}
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => onCustomerClick(request)}
                        className="flex items-center hover:text-accent transition-colors"
                      >
                        <h3 className="font-semibold text-ink">
                          {request.customer.firstName} {request.customer.lastName}
                        </h3>
                        <ChevronRight size={16} strokeWidth={1.75} className="ml-1" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`pill ${priorityBadge.color}`}>
                        {priorityBadge.label}
                      </span>
                      <span className={`pill ${customerBadge.color}`}>
                        {customerBadge.label}
                      </span>
                      {request.customer.rating > 0 && (
                        <span className="pill bg-warning/10 text-warning inline-flex items-center gap-1">
                          <Star size={12} strokeWidth={2} className="fill-warning text-warning" aria-hidden="true" />
                          {request.customer.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Service and Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-clay">Shërbimi:</p>
                        <p className="font-medium text-ink">{request.service.name}</p>
                        <p className="text-clay">{request.service.duration} min • {request.service.price}€</p>
                      </div>
                      <div>
                        <p className="text-clay">Koha e kërkuar:</p>
                        <p className="font-medium text-ink">
                          {formatDate(request.appointmentDate)}, {request.appointmentDate}
                        </p>
                        <p className="text-clay">{formatTime(request.startTime)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Time ago */}
                  <div className="text-right text-sm text-clay ml-4">
                    {getTimeAgo(request.requestedAt)}
                  </div>
                </div>

                {/* Customer Notes Preview */}
                {request.customerNotes && (
                  <div className="mb-4 p-3 bg-accent-soft/40 rounded-lg">
                    <p className="text-sm text-ink">
                      <span className="font-medium text-accent-strong">Shënim nga klienti:</span>
                    </p>
                    <p className="text-sm text-ink mt-1">
                      {request.customerNotes.length > 100 && !isExpanded 
                        ? `${request.customerNotes.slice(0, 100)}...`
                        : request.customerNotes
                      }
                    </p>
                    {request.customerNotes.length > 100 && (
                      <button
                        onClick={() => handleToggleExpand(request.id)}
                        className="text-accent hover:text-accent-strong text-sm font-medium mt-1"
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
        <div className="mt-6 text-center text-sm text-clay">
          Po shfaqen {sortedAndFilteredRequests.length} nga {requests.length} kërkesa të filtruara
        </div>
      )}
    </div>
  )
}