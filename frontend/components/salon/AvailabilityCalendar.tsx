// frontend/components/salon/AvailabilityCalendar.tsx
// Interactive calendar view for salon availability management
// Albanian Beauty Salon Booking Platform

import { useState, useEffect, useCallback } from 'react'
import {
  CalendarMonth,
  CalendarDay,
  TimeSlot,
  AvailabilityResult,
  BulkTimeSlotOperation,
  DayOfWeek
} from '../../types/database'
import {
  generateCalendarMonth,
  calculateAvailability,
  blockTimeSlot,
  unblockTimeSlot,
  bulkManageTimeSlots,
  formatAlbanianDate,
  getAlbanianDayName
} from '../../lib/availability'
import { AlertModal } from '../ui/ConfirmationModal'
import { useAlertModal } from '../../hooks/useModals'

// ==============================================
// TYPES AND INTERFACES
// ==============================================
interface AvailabilityCalendarProps {
  salonId: string
  onTimeSlotClick?: (slot: TimeSlot) => void
  onDayClick?: (day: CalendarDay) => void
  onSelectionChange?: (selectedSlots: TimeSlot[]) => void
  allowMultiSelect?: boolean
  readOnly?: boolean
  className?: string
}

interface CalendarViewProps {
  month: CalendarMonth
  selectedDate: string | null
  selectedSlots: TimeSlot[]
  onDayClick: (day: CalendarDay) => void
  onTimeSlotClick: (slot: TimeSlot) => void
  allowMultiSelect: boolean
  readOnly: boolean
}

interface DayDetailProps {
  salonId: string
  selectedDay: CalendarDay | null
  onClose: () => void
  onTimeSlotClick: (slot: TimeSlot) => void
  selectedSlots: TimeSlot[]
  allowMultiSelect: boolean
  readOnly: boolean
}

interface BulkActionsProps {
  selectedSlots: TimeSlot[]
  onBulkAction: (operation: BulkTimeSlotOperation) => void
  onClearSelection: () => void
  isLoading: boolean
}

// ==============================================
// CALENDAR COMPONENTS
// ==============================================

/**
 * Calendar month view component
 */
const CalendarView: React.FC<CalendarViewProps> = ({
  month,
  selectedDate,
  selectedSlots,
  onDayClick,
  onTimeSlotClick,
  allowMultiSelect,
  readOnly
}) => {
  const today = new Date().toISOString().split('T')[0]
  const selectedSlotDates = new Set(selectedSlots.map(slot => slot.date))

  const getDayStatus = (day: CalendarDay) => {
    if (!day.isWorkingDay) return 'closed'
    if (day.date < today) return 'past'
    if (day.availableSlots === 0 && day.totalSlots > 0) return 'full'
    if (day.blockedSlots === day.totalSlots) return 'blocked'
    return 'available'
  }

  const getDayClasses = (day: CalendarDay) => {
    const status = getDayStatus(day)
    const isSelected = selectedDate === day.date
    const hasSelectedSlots = selectedSlotDates.has(day.date)
    
    let classes = 'relative p-2 h-20 border border-gray-100 cursor-pointer transition-all duration-200 '

    // Base status colors
    switch (status) {
      case 'closed':
        classes += 'bg-gray-100 text-gray-400 '
        break
      case 'past':
        classes += 'bg-gray-50 text-gray-300 '
        break
      case 'full':
        classes += 'bg-red-50 text-red-600 '
        break
      case 'blocked':
        classes += 'bg-orange-50 text-orange-600 '
        break
      case 'available':
        classes += 'bg-white text-gray-900 hover:bg-green-50 '
        break
    }

    // Selection states
    if (isSelected) {
      classes += 'ring-2 ring-red-500 bg-red-50 '
    } else if (hasSelectedSlots) {
      classes += 'ring-2 ring-blue-500 bg-blue-50 '
    }

    // Today highlight
    if (day.isToday && status !== 'past') {
      classes += 'font-bold '
    }

    return classes
  }

  return (
    <div className="card overflow-hidden">
      {/* Month header */}
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h3 className="section-title">
          {month.monthName} {month.year}
        </h3>
        <div className="subtitle mt-1">
          {month.stats.totalWorkingDays} ditë pune • {month.stats.totalAvailableSlots} orë të lira
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0">
        {/* Day headers */}
        {['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die'].map((dayName) => (
          <div key={dayName} className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-600 border-b">
            {dayName}
          </div>
        ))}

        {/* Calendar days */}
        {month.days.map((day) => (
          <div
            key={day.date}
            className={getDayClasses(day)}
            onClick={() => !readOnly && onDayClick(day)}
          >
            {/* Day number */}
            <div className="text-sm font-medium mb-1">
              {new Date(day.date).getDate()}
              {day.isToday && (
                <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1">Sot</span>
              )}
            </div>

            {/* Availability indicator */}
            {day.isWorkingDay && (
              <div className="text-xs space-y-1">
                {day.availableSlots > 0 && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                    <span>{day.availableSlots} të lira</span>
                  </div>
                )}
                {day.bookedSlots > 0 && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
                    <span>{day.bookedSlots} të zëna</span>
                  </div>
                )}
                {day.blockedSlots > 0 && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mr-1"></div>
                    <span>{day.blockedSlots} të bllok.</span>
                  </div>
                )}
              </div>
            )}

            {/* Holidays */}
            {day.holidays.length > 0 && (
              <div className="absolute top-1 right-1">
                <span className="text-xs bg-purple-500 text-white rounded px-1">Festë</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 px-4 py-3 border-t">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            <span>Të lira</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
            <span>Të zëna</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
            <span>Të bllokoura</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span>E mbyllur</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Day detail view with time slots
 */
const DayDetail: React.FC<DayDetailProps> = ({
  salonId,
  selectedDay,
  onClose,
  onTimeSlotClick,
  selectedSlots,
  allowMultiSelect,
  readOnly
}) => {
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [showBlockForm, setShowBlockForm] = useState(false)

  const selectedSlotIds = new Set(selectedSlots.map(slot => slot.id))

  // Load availability data for the selected day
  useEffect(() => {
    if (selectedDay && selectedDay.isWorkingDay) {
      loadAvailability()
    }
  }, [selectedDay])

  const loadAvailability = async () => {
    if (!selectedDay) return

    setLoading(true)
    try {
      const result = await calculateAvailability(salonId, selectedDay.date)
      setAvailability(result)
    } catch (error) {
      console.error('Error loading availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSlotAction = async (slot: TimeSlot, action: 'block' | 'unblock') => {
    try {
      if (action === 'block') {
        await blockTimeSlot(salonId, slot.date, slot.startTime, slot.duration, blockReason || 'E bllokuar')
      } else {
        await unblockTimeSlot(salonId, slot.date, slot.startTime)
      }
      
      // Reload availability
      await loadAvailability()
      
      // Reset form
      setShowBlockForm(false)
      setBlockReason('')
      
    } catch (error) {
      console.error(`Error ${action}ing slot:`, error)
      console.error(`Error ${action}ing slot:`, error)
      // TODO: Implement proper modal alert - temporarily commenting out to fix build
      // alertModal.showAlert({
      //   title: 'Gabim',
      //   message: `Gabim në ${action === 'block' ? 'bllokimin' : 'çbllokimin'} e kohës`,
      //   variant: 'error'
      // })
    }
  }

  const getSlotClasses = (slot: TimeSlot) => {
    const isSelected = selectedSlotIds.has(slot.id)
    let classes = 'p-3 border rounded-lg cursor-pointer transition-all duration-200 '

    if (slot.status === 'available') {
      classes += isSelected 
        ? 'bg-green-100 border-green-300 text-green-800' 
        : 'bg-white border-gray-200 hover:bg-green-50 text-gray-900'
    } else if (slot.status === 'blocked') {
      classes += isSelected
        ? 'bg-orange-100 border-orange-300 text-orange-800'
        : 'bg-orange-50 border-orange-200 text-orange-700'
    } else {
      classes += 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
    }

    return classes
  }

  if (!selectedDay) return null

  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {formatAlbanianDate(selectedDay.date)}
          </h3>
          <p className="text-sm text-gray-600">
            {selectedDay.workingHours && 
              `${selectedDay.workingHours.open} - ${selectedDay.workingHours.close}`
            }
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-lg font-semibold text-green-600">{selectedDay.availableSlots}</div>
          <div className="text-sm text-green-700">Të lira</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="text-lg font-semibold text-red-600">{selectedDay.bookedSlots}</div>
          <div className="text-sm text-red-700">Të zëna</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="text-lg font-semibold text-orange-600">{selectedDay.blockedSlots}</div>
          <div className="text-sm text-orange-700">Të bllokoura</div>
        </div>
      </div>

      {/* Time slots */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <p className="text-gray-600 mt-2">Po ngarkohen orët...</p>
        </div>
      ) : availability ? (
        <div className="space-y-4">
          {/* Bulk block form */}
          {!readOnly && showBlockForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Blloko orët</h4>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Arsyeja e bllokimit (opsionale)"
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowBlockForm(false)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Anulo
                </button>
              </div>
            </div>
          )}

          {/* Time slots grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {availability.slots.map((slot) => (
              <div
                key={slot.id}
                className={getSlotClasses(slot)}
                onClick={() => !readOnly && slot.status !== 'booked' && onTimeSlotClick(slot)}
              >
                <div className="text-sm font-medium">{slot.startTime}</div>
                <div className="text-xs text-gray-600">{slot.duration} min</div>
                
                {slot.status === 'blocked' && slot.blockReason && (
                  <div className="text-xs mt-1">{slot.blockReason}</div>
                )}
                
                {slot.status === 'booked' && (
                  <div className="text-xs mt-1">E zënë</div>
                )}

                {/* Quick actions */}
                {!readOnly && slot.status !== 'booked' && (
                  <div className="mt-2 flex gap-1">
                    {slot.status === 'available' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSlotAction(slot, 'block')
                        }}
                        className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                      >
                        Blloko
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSlotAction(slot, 'unblock')
                        }}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Çblloko
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {selectedDay.isWorkingDay ? 'Gabim në ngarkimin e të dhënave' : 'Salloni është i mbyllur në këtë ditë'}
        </div>
      )}
    </div>
  )
}

/**
 * Bulk actions component
 */
const BulkActions: React.FC<BulkActionsProps> = ({
  selectedSlots,
  onBulkAction,
  onClearSelection,
  isLoading
}) => {
  const [reason, setReason] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleBulkBlock = () => {
    const operation: BulkTimeSlotOperation = {
      operation: 'block',
      slots: selectedSlots.map(slot => ({
        date: slot.date,
        startTime: slot.startTime,
        duration: slot.duration
      })),
      reason: reason || 'Bllokuar në grup'
    }
    onBulkAction(operation)
    setShowForm(false)
    setReason('')
  }

  const handleBulkUnblock = () => {
    const operation: BulkTimeSlotOperation = {
      operation: 'unblock',
      slots: selectedSlots.map(slot => ({
        date: slot.date,
        startTime: slot.startTime
      }))
    }
    onBulkAction(operation)
  }

  if (selectedSlots.length === 0) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-blue-900">
          {selectedSlots.length} orë të zgjedhura
        </h4>
        <button
          onClick={onClearSelection}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Pastro zgjedhjen
        </button>
      </div>

      {showForm ? (
        <div className="space-y-3">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Arsyeja e bllokimit"
            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleBulkBlock}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              Blloko të gjitha
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Anulo
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            Blloko
          </button>
          <button
            onClick={handleBulkUnblock}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Çblloko
          </button>
        </div>
      )}
    </div>
  )
}

// ==============================================
// MAIN COMPONENT
// ==============================================
export default function AvailabilityCalendar({
  salonId,
  onTimeSlotClick,
  onDayClick,
  onSelectionChange,
  allowMultiSelect = false,
  readOnly = false,
  className = ''
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth | null>(null)
  const alertModal = useAlertModal()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  // Load calendar data
  const loadCalendarMonth = useCallback(async () => {
    setLoading(true)
    try {
      const month = await generateCalendarMonth(
        salonId,
        currentDate.getFullYear(),
        currentDate.getMonth()
      )
      setCalendarMonth(month)
    } catch (error) {
      console.error('Error loading calendar:', error)
    } finally {
      setLoading(false)
    }
  }, [salonId, currentDate])

  useEffect(() => {
    loadCalendarMonth()
  }, [loadCalendarMonth])

  // Event handlers
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date)
    setSelectedDay(day)
    if (onDayClick) {
      onDayClick(day)
    }
  }

  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (readOnly) return

    let newSelection: TimeSlot[]

    if (allowMultiSelect) {
      const isSelected = selectedSlots.some(s => s.id === slot.id)
      if (isSelected) {
        newSelection = selectedSlots.filter(s => s.id !== slot.id)
      } else {
        newSelection = [...selectedSlots, slot]
      }
    } else {
      newSelection = [slot]
    }

    setSelectedSlots(newSelection)
    
    if (onSelectionChange) {
      onSelectionChange(newSelection)
    }
    
    if (onTimeSlotClick) {
      onTimeSlotClick(slot)
    }
  }

  const handleBulkAction = async (operation: BulkTimeSlotOperation) => {
    setBulkLoading(true)
    try {
      await bulkManageTimeSlots(salonId, operation)
      setSelectedSlots([])
      await loadCalendarMonth()
      
      if (onSelectionChange) {
        onSelectionChange([])
      }
    } catch (error) {
      console.error('Error in bulk operation:', error)
      // TODO: Implement proper modal alert - temporarily commenting out to fix build
      // alertModal.showAlert({
      //   title: 'Gabim',
      //   message: 'Gabim në operacionin në grup',
      //   variant: 'error'
      // })
    } finally {
      setBulkLoading(false)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
    setSelectedDate(null)
    setSelectedDay(null)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Kalendari i disponueshmërisë
        </h2>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            Sot
          </button>
          
          <button
            onClick={() => navigateMonth('next')}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {!readOnly && allowMultiSelect && (
        <BulkActions
          selectedSlots={selectedSlots}
          onBulkAction={handleBulkAction}
          onClearSelection={() => {
            setSelectedSlots([])
            if (onSelectionChange) onSelectionChange([])
          }}
          isLoading={bulkLoading}
        />
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar view */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <p className="text-gray-600 mt-2">Po ngarkohet kalendari...</p>
            </div>
          ) : calendarMonth ? (
            <CalendarView
              month={calendarMonth}
              selectedDate={selectedDate}
              selectedSlots={selectedSlots}
              onDayClick={handleDayClick}
              onTimeSlotClick={handleTimeSlotClick}
              allowMultiSelect={allowMultiSelect}
              readOnly={readOnly}
            />
          ) : (
            <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
              Gabim në ngarkimin e kalendarit
            </div>
          )}
        </div>

        {/* Day detail */}
        <div className="lg:col-span-1">
          {selectedDay ? (
            <DayDetail
              salonId={salonId}
              selectedDay={selectedDay}
              onClose={() => {
                setSelectedDate(null)
                setSelectedDay(null)
              }}
              onTimeSlotClick={handleTimeSlotClick}
              selectedSlots={selectedSlots}
              allowMultiSelect={allowMultiSelect}
              readOnly={readOnly}
            />
          ) : (
            <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="font-medium text-gray-900 mb-2">Zgjidhni një ditë</h3>
              <p className="text-sm">
                Klikoni mbi një ditë në kalendar për të parë orët e disponueshme.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={alertModal.hideAlert}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        buttonText={alertModal.buttonText}
      />
    </div>
  )
}