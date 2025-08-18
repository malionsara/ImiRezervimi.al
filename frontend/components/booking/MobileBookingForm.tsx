// frontend/components/booking/MobileBookingForm.tsx
// Mobile-optimized booking form for ImiRezervimi.al
// Responsive design with touch-friendly interactions

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { appointmentRequestSchema, CustomerInfo } from '../../lib/validation'

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
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(appointmentRequestSchema)
  })

  // Progress indicator
  const steps = ['service', 'datetime', 'details', 'confirm'] as const
  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  // Generate time slots for selected date
  const generateTimeSlots = (date: string) => {
    if (!selectedService || !date) return []
    
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' })
    const workingHours = salon.working_hours[dayOfWeek]
    
    if (!workingHours || workingHours.closed) return []
    
    const slots = []
    const [openHour, openMin] = workingHours.open.split(':').map(Number)
    const [closeHour, closeMin] = workingHours.close.split(':').map(Number)
    
    let currentTime = new Date()
    currentTime.setHours(openHour, openMin, 0, 0)
    
    const endTime = new Date()
    endTime.setHours(closeHour, closeMin, 0, 0)
    
    while (currentTime < endTime) {
      const timeString = currentTime.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      slots.push(timeString)
      currentTime.setMinutes(currentTime.getMinutes() + 30)
    }
    
    return slots
  }

  const timeSlots = generateTimeSlots(selectedDate)

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')
    
    try {
      const appointmentData = {
        salonId: salon.id,
        serviceId: selectedService?.id,
        appointmentDate: selectedDate,
        startTime: selectedTime,
        customerInfo: session?.user ? {
          firstName: session.user.name?.split(' ')[0] || '',
          lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
          phone: data.phone || ''
        } : {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone
        },
        customerNotes: data.customerNotes || '',
        duration: selectedService?.duration_minutes
      }

      const response = await fetch('/api/appointments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })

      const result = await response.json()
      
      if (result.success) {
        onSuccess?.(result.data.id)
      } else {
        setError(result.error?.message || 'Gabim në dërgimin e kërkesës')
        onError?.(result.error?.message || 'Gabim në dërgimin e kërkesës')
      }
    } catch (err) {
      const errorMsg = 'Gabim në lidhje. Ju lutemi provoni përsëri.'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Step navigation
  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const canContinue = () => {
    switch (currentStep) {
      case 'service':
        return selectedService !== null
      case 'datetime':
        return selectedDate !== '' && selectedTime !== ''
      case 'details':
        return true // Form validation will handle this
      case 'confirm':
        return true
      default:
        return false
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 p-1">
        <div className="bg-white rounded-lg">
          <div 
            className="h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
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
              <div className="space-y-3">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base touch-manipulation"
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ora</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation ${
                          selectedTime === time
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  {timeSlots.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nuk ka orare të disponueshme për këtë datë</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Customer Details */}
          {currentStep === 'details' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detajet tuaja</h3>
              
              {!session && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emri</label>
                      <input
                        {...register('firstName')}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                        placeholder="Emri"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mbiemri</label>
                      <input
                        {...register('lastName')}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                        placeholder="Mbiemri"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numri i telefonit</label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                  placeholder="+355 69 123 4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
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
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Shërbimi:</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">{new Date(selectedDate).toLocaleDateString('sq-AL')}</span>
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
            type="submit"
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
  )
}