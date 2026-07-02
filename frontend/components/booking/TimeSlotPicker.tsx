// frontend/components/booking/TimeSlotPicker.tsx
// Calendar-based time slot picker for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { useState, useEffect, useMemo, useCallback } from 'react'

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
  'Hënë', 'Martë', 'Mërkurë', 'Enjte', 'Premte', 'Shtunë', 'Diel'
]

const ALBANIAN_DAY_ABBREVIATIONS = [
  'Hë', 'Ma', 'Më', 'En', 'Pr', 'Sh', 'Di'
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
  const fetchAvailableSlots = useCallback(async (date: string): Promise<TimeSlot[]> => {
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
  }, [selectedService, salon.slug])

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
  }, [selectedDate, selectedService, salon, fetchAvailableSlots])

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
    
    // Format date properly to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}` // YYYY-MM-DD format
    
    console.log(`🗓️ Date selected: ${date} -> ${dateString}`)
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
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
          {/* Calendar - Enhanced Layout */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg relative z-10">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
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
                type="button"
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Labels - Enhanced Albanian Localization */}
            <div className="grid grid-cols-7 gap-1 mb-3 border-b border-gray-100 pb-2">
              {ALBANIAN_DAY_ABBREVIATIONS.map((dayAbbr, index) => (
                <div key={dayAbbr} className="p-3 text-center">
                  <div className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    {dayAbbr}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {ALBANIAN_DAYS[index].slice(0, 3)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calendar Days - Enhanced UX */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                const { selectable, reason } = isDateSelectable(date)
                // Fix timezone issue by formatting date without timezone conversion
                const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                const isSelected = selectedDate === dateString
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                const isToday = date.toDateString() === new Date().toDateString()

                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={!selectable}
                    title={reason || (selectable ? `Zgjidh ${ALBANIAN_DAYS[date.getDay()]}, ${date.getDate()} ${ALBANIAN_MONTHS[date.getMonth()]}` : undefined)}
                    className={`
                      relative w-full h-12 text-sm font-semibold rounded-xl transition-all duration-300 calendar-day z-20
                      ${isSelected
                        ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl scale-110 ring-2 ring-red-200'
                        : selectable && isCurrentMonth
                        ? 'hover:bg-red-50 hover:text-red-600 text-gray-900 hover:scale-105 hover:shadow-md border border-transparent hover:border-red-200'
                        : selectable
                        ? 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        : 'text-gray-300 cursor-not-allowed bg-gray-50'
                      }
                      ${isToday && !isSelected ? 'ring-2 ring-orange-400 bg-orange-50 text-orange-600 font-bold' : ''}
                      ${!isCurrentMonth ? 'opacity-40' : ''}
                      ${selectable ? 'transform hover:-translate-y-1' : ''}
                    `}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-base">{date.getDate()}</span>
                      {isToday && !isSelected && (
                        <div className="text-xs text-orange-500 font-bold mt-0.5">Sot</div>
                      )}
                    </div>
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Calendar Legend - Enhanced */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-br from-red-500 to-pink-600 rounded mr-2"></div>
                    <span className="text-gray-700 font-medium">E zgjedhur</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 ring-2 ring-orange-400 bg-orange-50 rounded mr-2"></div>
                    <span className="text-gray-700 font-medium">Sot</span>
                  </div>
                </div>
                <div className="text-gray-500">
                  Maksimumi 10 ditë përpara
                </div>
              </div>
            </div>
          </div>

          {/* Time Slots - Enhanced Layout */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {selectedDate ? formatDate(new Date(selectedDate)) : 'Zgjidhni një datë'}
              </h3>
              {selectedDate && (
                <p className="text-sm text-gray-500">
                  {availableSlots.filter(slot => slot.available).length} nga {availableSlots.length} orë të disponueshme
                </p>
              )}
            </div>

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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot.time}
                      onClick={() => handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      title={slot.reason || (slot.available ? `Rezervo në orën ${slot.time}` : undefined)}
                      className={`
                        relative py-2 px-3 sm:py-4 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 time-slot-btn border
                        ${selectedTime === slot.time
                          ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl scale-110 border-red-400 ring-2 ring-red-200'
                          : slot.available
                          ? 'bg-white text-gray-900 hover:bg-red-50 hover:text-red-600 hover:scale-105 border-gray-200 hover:border-red-300 hover:shadow-md transform hover:-translate-y-1'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100 opacity-60'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm sm:text-base">{slot.time}</span>
                        {!slot.available && slot.reason && (
                          <div className="text-xs mt-1 opacity-75">{slot.reason}</div>
                        )}
                        {slot.available && selectedTime !== slot.time && (
                          <div className="text-xs text-gray-500 mt-1 hidden sm:block">Disponueshëm</div>
                        )}
                      </div>
                      
                      {/* Selected indicator */}
                      {selectedTime === slot.time && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                          <svg className="w-2 h-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Selection Summary */}
      {selectedDate && selectedTime && selectedService && (
        <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-green-800 font-bold text-lg">Rezervimi juaj</h4>
          </div>
          
          <div className="bg-white rounded-xl p-4 space-y-3 text-sm border border-green-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Shërbimi:</span>
              <span className="text-gray-900 font-semibold">{selectedService.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Data:</span>
              <span className="text-gray-900 font-semibold">{formatDate(new Date(selectedDate))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ora:</span>
              <span className="text-gray-900 font-semibold">{selectedTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Kohëzgjatja:</span>
              <span className="text-gray-900 font-semibold">{selectedService.duration_minutes} min</span>
            </div>
            {selectedService.price > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-600">Çmimi:</span>
                <span className="text-green-600 font-bold text-base">{selectedService.price}€</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center text-green-700 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Shtypni "Vazhdo" për të plotësuar të dhënat tuaja.</span>
          </div>
        </div>
      )}
    </div>
  )
}