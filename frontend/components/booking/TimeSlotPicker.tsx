// frontend/components/booking/TimeSlotPicker.tsx
// Calendar-based time slot picker for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { useState, useEffect, useMemo } from 'react'

// ==============================================
// TYPES AND INTERFACES
// ==============================================
interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
  sort_order: number
}

interface Salon {
  id: string
  name: string
  slug: string
  working_hours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
}

interface TimeSlotPickerProps {
  salon: Salon
  selectedService: Service | null
  selectedDate: string
  selectedTime: string
  onTimeSlotSelect: (date: string, time: string) => void
  className?: string
}

interface TimeSlot {
  time: string
  available: boolean
  reason?: string
}

// ==============================================
// HELPER FUNCTIONS
// ==============================================
const ALBANIAN_DAYS = [
  'Diel', 'Hënë', 'Martë', 'Mërkurë', 'Enjte', 'Premte', 'Shtunë'
]

const ALBANIAN_MONTHS = [
  'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
  'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'
]

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// ==============================================
// TIME SLOT PICKER COMPONENT
// ==============================================
export default function TimeSlotPicker({
  salon,
  selectedService,
  selectedDate,
  selectedTime,
  onTimeSlotSelect,
  className = ''
}: TimeSlotPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Days to show before month starts (from previous month)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // Days to show after month ends (from next month)
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [currentMonth])

  // Check if a date is selectable (not in past, within 10 days, salon open)
  const isDateSelectable = (date: Date): { selectable: boolean; reason?: string } => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    
    // Check if date is in the past
    if (checkDate < today) {
      return { selectable: false, reason: 'Në të kaluarën' }
    }
    
    // Check if date is too far in the future (max 10 days)
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + 10)
    
    if (checkDate > maxDate) {
      return { selectable: false, reason: 'Shumë larg' }
    }
    
    // Check if salon is open on this day
    const dayOfWeek = DAY_KEYS[date.getDay()]
    const dayHours = salon.working_hours[dayOfWeek]
    
    if (!dayHours || dayHours.closed) {
      return { selectable: false, reason: 'Mbyllur' }
    }
    
    return { selectable: true }
  }

  // Fetch available time slots from API
  const fetchAvailableSlots = async (date: string): Promise<TimeSlot[]> => {
    if (!selectedService) return []
    
    try {
      const response = await fetch(
        `/api/salon/${salon.slug}/availability?date=${date}&duration=${selectedService.duration_minutes}`
      )
      
      const data = await response.json()
      
      if (data.success) {
        return data.data.slots || []
      } else {
        console.error('Error fetching availability:', data.error)
        return []
      }
    } catch (error) {
      console.error('Error fetching time slots:', error)
      return []
    }
  }

  // Load available time slots when date changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      setLoadingSlots(true)
      
      fetchAvailableSlots(selectedDate).then(slots => {
        setAvailableSlots(slots)
        setLoadingSlots(false)
      })
    } else {
      setAvailableSlots([])
    }
  }, [selectedDate, selectedService, salon])

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    const { selectable } = isDateSelectable(date)
    if (!selectable) return
    
    const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD format
    onTimeSlotSelect(dateString, '') // Clear time selection when date changes
  }

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      onTimeSlotSelect(selectedDate, time)
    }
  }

  // Format date for display
  const formatDate = (date: Date): string => {
    const day = ALBANIAN_DAYS[date.getDay()]
    const dayNum = date.getDate()
    const month = ALBANIAN_MONTHS[date.getMonth()]
    const year = date.getFullYear()
    
    return `${day}, ${dayNum} ${month} ${year}`
  }

  return (
    <div className={`time-slot-picker ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Zgjidhni datën dhe orën
        </h2>
        <p className="text-gray-600">
          {selectedService ? `${selectedService.name} - ${selectedService.duration_minutes} min` : 'Zgjidhni një shërbim më parë'}
        </p>
      </div>

      {!selectedService ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Zgjidhni një shërbim më parë
          </h3>
          <p className="text-gray-600">
            Për të vazhduar me zgjedhjen e datës dhe orës, duhet të zgjidhni një shërbim.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900">
                {ALBANIAN_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {ALBANIAN_DAYS.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day.slice(0, 2)}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const { selectable, reason } = isDateSelectable(date)
                const isSelected = selectedDate === date.toISOString().split('T')[0]
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                const isToday = date.toDateString() === new Date().toDateString()

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={!selectable}
                    title={reason}
                    className={`
                      relative p-2 text-sm rounded-xl transition-all duration-200 calendar-day
                      ${isSelected
                        ? 'bg-red-500 text-white shadow-lg scale-110'
                        : selectable && isCurrentMonth
                        ? 'hover:bg-red-50 hover:text-red-600 text-gray-900'
                        : selectable
                        ? 'hover:bg-gray-50 text-gray-400'
                        : 'text-gray-300 cursor-not-allowed'
                      }
                      ${isToday && !isSelected ? 'ring-2 ring-red-300' : ''}
                      ${!isCurrentMonth ? 'opacity-50' : ''}
                    `}
                  >
                    {date.getDate()}
                    
                    {isToday && !isSelected && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span>E zgjedhur</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 ring-2 ring-red-300 rounded mr-2"></div>
                <span>Sot</span>
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate ? formatDate(new Date(selectedDate)) : 'Zgjidhni një datë'}
            </h3>

            {!selectedDate ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">
                  Zgjidhni një datë nga kalendari për të parë orët e disponueshme
                </p>
              </div>
            ) : loadingSlots ? (
              <div className="text-center py-8">
                <div className="mx-auto w-8 h-8 mb-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent"></div>
                </div>
                <p className="text-gray-600 text-sm">Po ngarkon orët e disponueshme...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">
                  Nuk ka orë të disponueshme për këtë datë
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    title={slot.reason}
                    className={`
                      py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 time-slot-btn
                      ${selectedTime === slot.time
                        ? 'bg-red-500 text-white shadow-lg scale-105'
                        : slot.available
                        ? 'bg-gray-50 text-gray-900 hover:bg-red-50 hover:text-red-600 hover:scale-105'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {slot.time}
                    {!slot.available && slot.reason && (
                      <div className="text-xs mt-1 opacity-75">{slot.reason}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedDate && selectedTime && selectedService && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h4 className="text-green-800 font-medium">Rezervimi juaj</h4>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">Shërbimi:</span>
              <span className="text-green-800 font-medium">{selectedService.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Data:</span>
              <span className="text-green-800 font-medium">{formatDate(new Date(selectedDate))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Ora:</span>
              <span className="text-green-800 font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Kohëzgjatja:</span>
              <span className="text-green-800 font-medium">{selectedService.duration_minutes} min</span>
            </div>
          </div>
          
          <p className="text-green-600 text-xs mt-3">
            Shtypni &quot;Vazhdo&quot; për të plotësuar të dhënat tuaja.
          </p>
        </div>
      )}
    </div>
  )
}