// frontend/components/booking/MobileBookingForm.tsx
// Mobile-optimized booking form for ImiRezervimi.al
// Responsive design with touch-friendly interactions

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { appointmentRequestSchema, authenticatedAppointmentRequestSchema, CustomerInfo } from '../../lib/validation'
import DatePickerInput from '../ui/DatePickerInput'
import { useRealTimeAvailability, formatLastRefresh, getAvailabilityStatusMessage } from '../../hooks/useRealTimeAvailability'

// Types
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
  description: string
  phone: string
  address: string
  city: string
  instagram_handle: string
  working_hours: { [key: string]: { open: string; close: string; closed: boolean } }
  services: Service[]
}

interface MobileBookingFormProps {
  salon: Salon
  onSuccess?: (appointmentId: string) => void
  onError?: (error: string) => void
}

type FormStep = 'service' | 'datetime' | 'details' | 'confirm'

export default function MobileBookingForm({ salon, onSuccess, onError }: MobileBookingFormProps) {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState<FormStep>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: zodResolver(session?.user ? authenticatedAppointmentRequestSchema : appointmentRequestSchema)
  })

  // Real-time availability hook
  const {
    timeSlots,
    loading: availabilityLoading,
    error: availabilityError,
    lastRefresh,
    refreshAvailability,
    availableSlotCount,
    totalSlotCount,
    isRefreshing
  } = useRealTimeAvailability({
    salonSlug: salon.slug,
    selectedDate,
    selectedService,
    refreshInterval: 45000, // 45 seconds
    enabled: currentStep === 'datetime' && selectedDate !== null
  })

  // Debug form errors
  console.log('Form errors:', errors)

  // Progress indicator - skip details step for authenticated users
  const steps = session?.user 
    ? ['service', 'datetime', 'confirm'] as const
    : ['service', 'datetime', 'details', 'confirm'] as const
  const currentStepIndex = steps.indexOf(currentStep as any)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  // Reset time selection when date changes or when availability updates
  useEffect(() => {
    if (selectedTime && timeSlots.length > 0) {
      // Check if selected time is still available
      const isSelectedTimeStillAvailable = timeSlots.some(
        slot => slot.time === selectedTime && slot.available
      )
      
      if (!isSelectedTimeStillAvailable) {
        console.log('⚠️ Selected time slot is no longer available, clearing selection')
        setSelectedTime('')
      }
    }
  }, [timeSlots, selectedTime])

  // Get availability status message
  const availabilityStatus = getAvailabilityStatusMessage(
    availableSlotCount,
    totalSlotCount,
    availabilityLoading,
    availabilityError
  )

  const onSubmit = async (formData: any) => {
    console.log('🚀 FORM SUBMISSION TRIGGERED!')
    console.log('Form data received:', formData)
    console.log('Selected service:', selectedService)
    console.log('Selected date:', selectedDate)
    console.log('Selected time:', selectedTime)
    console.log('Current session:', session?.user)
    
    // Validate required selections (should not be needed due to step validation, but as safety)
    if (!selectedService) {
      setError('Ju lutem zgjidhni një shërbim')
      return
    }
    
    if (!selectedDate) {
      setError('Ju lutem zgjidhni një datë')
      return
    }
    
    if (!selectedTime) {
      setError('Ju lutem zgjidhni një orë')
      return
    }
    
    // For authenticated users, check if we have required user data
    if (session?.user) {
      if (!session.user.name || !(session.user as any)?.phone) {
        setError('Informacionet e profilit tuaj janë të papërditësuara. Ju lutem kontaktoni mbështetjen.')
        return
      }
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Prepare appointment data in the exact format the API expects
      const appointmentData = {
        salonId: salon.id,
        serviceId: selectedService.id,
        appointmentDate: selectedDate?.toISOString().split('T')[0] || '',
        startTime: selectedTime,
        customerInfo: session?.user ? {
          firstName: session.user.name?.split(' ')[0] || '',
          lastName: session.user.name?.split(' ').slice(1).join(' ') || session.user.name?.split(' ')[0] || '',
          phone: (session.user as any).phone || ''
        } : {
          firstName: formData.customerInfo?.firstName || '',
          lastName: formData.customerInfo?.lastName || '',
          phone: formData.customerInfo?.phone || ''
        },
        customerNotes: formData.customerNotes || '',
        duration: selectedService.duration_minutes
      }

      console.log('📤 Sending appointment data to API:', appointmentData)

      const response = await fetch('/api/appointments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })

      console.log('📥 API Response status:', response.status)
      const result = await response.json()
      console.log('📥 API Response data:', result)
      
      if (result.success) {
        console.log('✅ Booking successful, calling onSuccess callback')
        onSuccess?.(result.data.appointment?.id || result.data.id)
      } else {
        const errorMsg = result.error?.message || 'Gabim në dërgimin e kërkesës për rezervim'
        console.error('❌ API returned error:', errorMsg)
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err) {
      console.error('❌ Network/Runtime error in form submission:', err)
      const errorMsg = 'Gabim në lidhje. Ju lutemi kontrolloni internetin dhe provoni përsëri.'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Step navigation
  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep as any)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as FormStep)
    }
  }

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep as any)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as FormStep)
    }
  }

  const canContinue = () => {
    switch (currentStep) {
      case 'service':
        return selectedService !== null
      case 'datetime':
        return selectedDate !== null && selectedTime !== ''
      case 'details':
        return true // Form validation will handle this when needed
      case 'confirm':
        return true
      default:
        return false
    }
  }

  return (
    <>
      <div className="max-w-md md:max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

      {/* Progress Bar - moved to be below header/within container */}
      <div className="bg-white border-b border-gray-100">
        <div className="h-1 bg-gray-200">
          <div 
            className="h-1 bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Step indicator text */}
        <div className="px-4 py-2 text-center">
          <span className="text-sm text-gray-600">
            Hapi {currentStepIndex + 1} nga {steps.length}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-xl">💅</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">{salon.name}</h2>
            <p className="text-white/80 text-sm">{salon.address}</p>
          </div>
        </div>
        
        {/* Step Indicator */}
        <div className="flex justify-center space-x-2 mt-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStepIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* Step 1: Service Selection */}
          {currentStep === 'service' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Zgjidh shërbimin</h3>
              {/* Responsive services grid - 1 column on mobile, 2 columns on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {salon.services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 touch-manipulation ${
                      selectedService?.id === service.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        {service.description && (
                          <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                        )}
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-red-600 font-medium">{service.price} Lekë</span>
                          <span className="text-gray-500 text-sm">{service.duration_minutes} min</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedService?.id === service.id
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedService?.id === service.id && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 'datetime' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Zgjidh datën dhe orën</h3>
              
              {/* Date Picker */}
              <div>
                <DatePickerInput
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date)
                    setSelectedTime('') // Reset time when date changes
                  }}
                  minDate={new Date()}
                  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  label="Data"
                  placeholder="Zgjidhni datën e rezervimit"
                  required
                />
              </div>

              {/* Availability Status */}
              {selectedDate && (
                <div className={`p-3 rounded-lg border flex items-center justify-between ${
                  availabilityStatus.type === 'error' ? 'bg-red-50 border-red-200' :
                  availabilityStatus.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  availabilityStatus.type === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {availabilityLoading || isRefreshing ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${
                        availabilityStatus.type === 'error' ? 'bg-red-500' :
                        availabilityStatus.type === 'warning' ? 'bg-yellow-500' :
                        availabilityStatus.type === 'success' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}></div>
                    )}
                    <span className={`text-sm font-medium ${
                      availabilityStatus.type === 'error' ? 'text-red-700' :
                      availabilityStatus.type === 'warning' ? 'text-yellow-700' :
                      availabilityStatus.type === 'success' ? 'text-green-700' :
                      'text-blue-700'
                    }`}>
                      {availabilityStatus.message}
                    </span>
                  </div>
                  
                  {/* Refresh button and last update */}
                  <div className="flex items-center space-x-2">
                    {lastRefresh && (
                      <span className="text-xs text-gray-500">
                        {formatLastRefresh(lastRefresh)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={refreshAvailability}
                      disabled={isRefreshing}
                      className="p-1 hover:bg-gray-200 rounded-md transition-colors touch-manipulation disabled:opacity-50"
                      title="Rifresko disponueshmërinë"
                    >
                      <svg className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ora</label>
                  
                  {availabilityLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-600 text-sm">Po kontrollon disponueshmërinë...</p>
                    </div>
                  ) : availabilityError ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <p className="text-red-600 text-sm mb-2">{availabilityError.message}</p>
                      <button
                        type="button"
                        onClick={refreshAvailability}
                        className="text-sm text-red-600 hover:text-red-700 underline"
                      >
                        Provo përsëri
                      </button>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-center">Nuk ka orare të disponueshme për këtë datë</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          title={slot.reason}
                          className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation ${
                            selectedTime === slot.time
                              ? 'bg-red-500 text-white shadow-md'
                              : slot.available
                              ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                          }`}
                        >
                          {slot.time}
                          {!slot.available && slot.reason && (
                            <div className="text-xs mt-1 opacity-75 leading-tight">
                              {slot.reason}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Customer Details - Only for non-authenticated users */}
          {currentStep === 'details' && !session && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detajet tuaja</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emri</label>
                  <input
                    {...register('customerInfo.firstName')}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                    placeholder="Emri"
                  />
                  {errors.customerInfo?.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerInfo.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mbiemri</label>
                  <input
                    {...register('customerInfo.lastName')}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                    placeholder="Mbiemri"
                  />
                  {errors.customerInfo?.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerInfo.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numri i telefonit</label>
                <input
                  {...register('customerInfo.phone')}
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                  placeholder="+355 69 123 4567"
                />
                {errors.customerInfo?.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerInfo.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shënime (opsionale)</label>
                <textarea
                  {...register('customerNotes')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base resize-none"
                  placeholder="Çfarë dëshironi të na tregoni për rezervimin tuaj?"
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 'confirm' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmo rezervimin</h3>
              
              {/* Show user info for authenticated users */}
              {session && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-gray-600 text-sm">{(session.user as any)?.phone || 'Telefoni në profil'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Appointment details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Shërbimi:</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">{selectedDate?.toLocaleDateString('sq-AL') || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ora:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Çmimi:</span>
                  <span className="font-medium text-red-600">{selectedService?.price} Lekë</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kohëzgjatja:</span>
                  <span className="font-medium">{selectedService?.duration_minutes} min</span>
                </div>
              </div>

              {/* Notes field for authenticated users */}
              {session && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shënime (opsionale)</label>
                  <textarea
                    {...register('customerNotes')}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base resize-none"
                    placeholder="Çfarë dëshironi të na tregoni për rezervimin tuaj?"
                  />
                </div>
              )}

              <div className="text-center text-sm text-gray-600 p-4 bg-blue-50 rounded-xl">
                💬 Do të merrni konfirmim në WhatsApp nga salloni
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Navigation Buttons */}
      <div className="p-6 bg-gray-50 flex space-x-3">
        {currentStep !== 'service' && (
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors touch-manipulation"
          >
            ← Mbrapa
          </button>
        )}
        
        {currentStep !== 'confirm' ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canContinue()}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all touch-manipulation ${
              canContinue()
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Vazhdo →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all touch-manipulation ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
            }`}
          >
            {loading ? 'Po dërgohet...' : '✓ Konfirmo Rezervimin'}
          </button>
        )}
        
      </div>
    </div>
    </> 
  )
}