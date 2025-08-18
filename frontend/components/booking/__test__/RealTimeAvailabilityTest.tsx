// frontend/components/booking/__test__/RealTimeAvailabilityTest.tsx
// Test component for real-time availability functionality
// For manual testing during development

import { useState } from 'react'
import { useRealTimeAvailability, formatLastRefresh, getAvailabilityStatusMessage } from '../../../hooks/useRealTimeAvailability'

// Mock salon and service data for testing
const MOCK_SALON = {
  id: 'test-salon-id',
  name: 'Test Salon',
  slug: 'test-salon-slug',
  working_hours: {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: true }
  }
}

const MOCK_SERVICE = {
  id: 'test-service-id',
  name: 'Test Service',
  duration_minutes: 60
}

export default function RealTimeAvailabilityTest() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [selectedService, setSelectedService] = useState<typeof MOCK_SERVICE | null>(MOCK_SERVICE)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [enabled, setEnabled] = useState(true)

  const {
    timeSlots,
    loading,
    error,
    lastRefresh,
    refreshAvailability,
    availableSlotCount,
    totalSlotCount,
    isRefreshing
  } = useRealTimeAvailability({
    salonSlug: MOCK_SALON.slug,
    selectedDate,
    selectedService,
    refreshInterval: 10000, // 10 seconds for testing
    enabled
  })

  const availabilityStatus = getAvailabilityStatusMessage(
    availableSlotCount,
    totalSlotCount,
    loading,
    error
  )

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (value) {
      setSelectedDate(new Date(value))
      setSelectedTime('') // Reset time selection
    } else {
      setSelectedDate(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Real-Time Availability Test
      </h1>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Duration
          </label>
          <select
            value={selectedService?.duration_minutes || 60}
            onChange={(e) => setSelectedService({
              ...MOCK_SERVICE,
              duration_minutes: parseInt(e.target.value)
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>120 minutes</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Auto-refresh
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enabled</span>
            <button
              onClick={refreshAvailability}
              disabled={isRefreshing}
              className="ml-4 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Display */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-900">Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600">Loading</div>
            <div className="text-lg font-semibold">
              {loading ? 'Yes' : 'No'}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600">Refreshing</div>
            <div className="text-lg font-semibold">
              {isRefreshing ? 'Yes' : 'No'}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600">Available Slots</div>
            <div className="text-lg font-semibold">
              {availableSlotCount}/{totalSlotCount}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600">Last Refresh</div>
            <div className="text-sm">
              {lastRefresh ? formatLastRefresh(lastRefresh) : 'Never'}
            </div>
          </div>
        </div>
      </div>

      {/* Availability Status */}
      <div className="mb-6">
        <div className={`p-3 rounded-lg border ${
          availabilityStatus.type === 'error' ? 'bg-red-50 border-red-200' :
          availabilityStatus.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          availabilityStatus.type === 'success' ? 'bg-green-50 border-green-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              availabilityStatus.type === 'error' ? 'bg-red-500' :
              availabilityStatus.type === 'warning' ? 'bg-yellow-500' :
              availabilityStatus.type === 'success' ? 'bg-green-500' :
              'bg-blue-500'
            }`}></div>
            <span className={`font-medium ${
              availabilityStatus.type === 'error' ? 'text-red-700' :
              availabilityStatus.type === 'warning' ? 'text-yellow-700' :
              availabilityStatus.type === 'success' ? 'text-green-700' :
              'text-blue-700'
            }`}>
              {availabilityStatus.message}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-red-700">Error</h2>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">
              <strong>Code:</strong> {error.code}
            </div>
            <div className="text-sm text-red-600">
              <strong>Message:</strong> {error.message}
            </div>
            {error.details ? (
              <div className="text-xs text-red-500 mt-2">
                <strong>Details:</strong> {JSON.stringify(error.details)}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Time Slots Display */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-900">Time Slots</h2>
        {timeSlots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {loading ? 'Loading time slots...' : 'No time slots available'}
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
                title={slot.reason}
                className={`p-2 rounded-md text-sm font-medium transition-all ${
                  selectedTime === slot.time
                    ? 'bg-blue-500 text-white'
                    : slot.available
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-red-100 text-red-600 cursor-not-allowed'
                }`}
              >
                {slot.time}
                {!slot.available && slot.reason && (
                  <div className="text-xs mt-1 opacity-75">
                    {slot.reason}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Time Display */}
      {selectedTime && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">Selected Time</h3>
          <div className="text-blue-800">
            <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Service Duration:</strong> {selectedService?.duration_minutes} minutes</p>
          </div>
        </div>
      )}
    </div>
  )
}