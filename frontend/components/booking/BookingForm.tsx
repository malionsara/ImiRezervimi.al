// frontend/components/booking/BookingForm.tsx
// Main booking form component for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { appointmentRequestSchema, CustomerInfo, ALBANIAN_ERRORS } from '../../lib/validation'
import ServiceSelector from './ServiceSelector'
import TimeSlotPicker from './TimeSlotPicker'

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
  description: string
  phone: string
  address: string
  city: string
  instagram_handle: string
  working_hours: { [key: string]: { open: string; close: string; closed: boolean } }
  services: Service[]
}

interface BookingFormProps {
  salon: Salon
  onSuccess?: (appointmentId: string) => void
  onError?: (error: string) => void
  className?: string
}

interface BookingFormData {
  salonId: string
  serviceId: string
  appointmentDate: string
  startTime: string
  customerInfo: CustomerInfo
  customerNotes?: string
  duration?: number
}

type FormStep = 'service' | 'datetime' | 'customer' | 'phone' | 'confirm'

// Helper function to get steps based on authentication and initial phone availability
function getStepsForUser(isAuthenticated: boolean, hasPhoneInitially: boolean): FormStep[] {
  if (isAuthenticated) {
    // Authenticated users: skip customer step, but include phone step if no phone initially
    // Keep the step flow stable - don't change it dynamically during form filling
    return hasPhoneInitially 
      ? ['service', 'datetime', 'confirm'] 
      : ['service', 'datetime', 'phone', 'confirm']
  } else {
    // Guest users: full flow (customer step includes phone)
    return ['service', 'datetime', 'customer', 'confirm']
  }
}

// ==============================================
// MAIN BOOKING FORM COMPONENT
// ==============================================
export default function BookingForm({
  salon,
  onSuccess,
  onError,
  className = ''
}: BookingFormProps) {
  // ==============================================
  // SESSION AND AUTHENTICATION
  // ==============================================
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated' && session?.user

  // ==============================================
  // STATE MANAGEMENT
  // ==============================================
  const [currentStep, setCurrentStep] = useState<FormStep>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [initialPhoneStatus, setInitialPhoneStatus] = useState<boolean | null>(null)
  const [stableSteps, setStableSteps] = useState<FormStep[]>(['service', 'datetime', 'customer', 'confirm'])

  // Form management with React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm<BookingFormData>({
    resolver: zodResolver(appointmentRequestSchema),
    mode: 'onBlur',
    defaultValues: {
      salonId: salon.id,
      serviceId: '',
      appointmentDate: '',
      startTime: '',
      customerInfo: {
        firstName: '',
        lastName: '',
        phone: ''
      },
      customerNotes: ''
    }
  })

  // ==============================================
  // AUTO-POPULATE USER DATA AND SET STABLE STEPS
  // ==============================================
  useEffect(() => {
    if (isAuthenticated && session?.user) {
      // Auto-populate form with authenticated user data
      const user = session.user
      
      // Parse name from session
      const fullName = user.name || ''
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Use phone from session if available (from database)
      const phone = (user as any).phone || ''
      const hasPhone = !!phone
      
      // Set initial phone status once and create stable step flow
      if (initialPhoneStatus === null) {
        setInitialPhoneStatus(hasPhone)
        const steps = getStepsForUser(true, hasPhone)
        setStableSteps(steps)
        console.log('✅ Set stable step flow:', steps)
      }
      
      // Set form values
      setValue('customerInfo.firstName', firstName)
      setValue('customerInfo.lastName', lastName) 
      setValue('customerInfo.phone', phone)
      
      console.log('✅ Auto-populated user data:', { firstName, lastName, phone, hasPhone })
    } else if (!isAuthenticated && initialPhoneStatus === null) {
      // Set guest user steps
      setInitialPhoneStatus(false)
      setStableSteps(['service', 'datetime', 'customer', 'confirm'])
    }
  }, [isAuthenticated, session, setValue, initialPhoneStatus])

  // Watch form values for step validation
  const watchedValues = watch()

  // ==============================================
  // STEP VALIDATION
  // ==============================================
  const isStepValid = (step: FormStep): boolean => {
    switch (step) {
      case 'service':
        return !!watchedValues.serviceId && !!selectedService
      case 'datetime':
        return !!watchedValues.appointmentDate && !!watchedValues.startTime
      case 'customer':
        return !!(
          watchedValues.customerInfo?.firstName &&
          watchedValues.customerInfo?.lastName &&
          watchedValues.customerInfo?.phone
        )
      case 'phone':
        return !!(watchedValues.customerInfo?.phone)
      case 'confirm':
        return isValid
      default:
        return false
    }
  }

  // ==============================================
  // STEP NAVIGATION
  // ==============================================
  const goToNextStep = () => {
    if (!isStepValid(currentStep)) return

    // Use stable steps instead of dynamically calculated ones
    const currentIndex = stableSteps.indexOf(currentStep)
    
    if (currentIndex < stableSteps.length - 1) {
      setCurrentStep(stableSteps[currentIndex + 1])
      setSubmitError('')
    }
  }

  const goToPreviousStep = () => {
    // Use stable steps instead of dynamically calculated ones
    const currentIndex = stableSteps.indexOf(currentStep)
    
    if (currentIndex > 0) {
      setCurrentStep(stableSteps[currentIndex - 1])
      setSubmitError('')
    }
  }

  // ==============================================
  // SERVICE SELECTION HANDLER
  // ==============================================
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setValue('serviceId', service.id)
    
    // Remove auto-advance - user must click VAZHDO manually
  }

  // ==============================================
  // TIME SLOT SELECTION HANDLER
  // ==============================================
  const handleTimeSlotSelect = (date: string, time: string) => {
    setValue('appointmentDate', date)
    setValue('startTime', time)
    
    // Remove auto-advance - user must click VAZHDO manually
  }

  // ==============================================
  // FORM SUBMISSION
  // ==============================================
  const onSubmit = async (data: BookingFormData) => {
    if (!selectedService) {
      setSubmitError('Ju lutem zgjidhni një shërbim')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setSuccessMessage('')

    try {
      // Prepare appointment request data
      const appointmentRequest = {
        salonId: salon.id,
        serviceId: data.serviceId,
        appointmentDate: data.appointmentDate,
        startTime: data.startTime,
        customerInfo: data.customerInfo,
        customerNotes: data.customerNotes || undefined,
        duration: selectedService.duration_minutes
      }

      console.log('Submitting appointment request:', appointmentRequest)

      // Submit to API
      const response = await fetch('/api/appointments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentRequest),
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage(result.data.message || 'Rezervimi u dërgua me sukses!')
        
        // Reset form
        reset()
        setSelectedService(null)
        setCurrentStep('service')
        
        // Call success callback
        onSuccess?.(result.data.appointment.id)
        
      } else {
        const errorMessage = result.error?.message || ALBANIAN_ERRORS.INTERNAL_ERROR
        setSubmitError(errorMessage)
        onError?.(errorMessage)
      }

    } catch (error) {
      console.error('Error submitting appointment:', error)
      const errorMessage = 'Ka ndodhur një gabim në dërgimin e rezervimit'
      setSubmitError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ==============================================
  // RENDER STEP INDICATOR
  // ==============================================
  const renderStepIndicator = () => {
    const allSteps = [
      { key: 'service', label: 'Shërbimi', icon: '💅' },
      { key: 'datetime', label: 'Data & Ora', icon: '📅' },
      { key: 'customer', label: 'Të dhënat', icon: '👤' },
      { key: 'phone', label: 'Telefoni', icon: '📱' },
      { key: 'confirm', label: 'Konfirmo', icon: '✅' }
    ]
    
    // Use stable steps instead of dynamic calculation
    const steps = allSteps.filter(step => stableSteps.includes(step.key as FormStep))

    const currentIndex = steps.findIndex(step => step.key === currentStep)

    return (
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            {/* Step Circle */}
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium calendar-day
              ${index <= currentIndex 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                : 'bg-gray-200 text-gray-400'
              }
              ${index === currentIndex ? 'ring-4 ring-red-200' : ''}
            `}>
              {index < currentIndex ? '✓' : step.icon}
            </div>

            {/* Step Label */}
            <div className="ml-3 hidden sm:block">
              <p className={`text-sm font-medium ${
                index <= currentIndex ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                index < currentIndex ? 'bg-red-300' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  // ==============================================
  // RENDER CURRENT STEP CONTENT
  // ==============================================
  const renderStepContent = () => {
    switch (currentStep) {
      case 'service':
        return (
          <ServiceSelector
            services={salon.services}
            selectedService={selectedService}
            onServiceSelect={handleServiceSelect}
            className="mb-6"
          />
        )

      case 'datetime':
        return (
          <TimeSlotPicker
            salon={salon}
            selectedService={selectedService}
            selectedDate={watchedValues.appointmentDate}
            selectedTime={watchedValues.startTime}
            onTimeSlotSelect={handleTimeSlotSelect}
            className="mb-6"
          />
        )

      case 'customer':
        return (
          <div className="space-y-6 mb-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Të dhënat tuaja
              </h3>
              <p className="text-gray-600">
                Plotësoni informacionet për të vazhduar me rezervimin
              </p>
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Emri *
              </label>
              <input
                {...register('customerInfo.firstName')}
                type="text"
                id="firstName"
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-lg
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 
                         focus:border-transparent transition-all duration-200 form-input-mobile"
                placeholder="Emri juaj"
              />
              {errors.customerInfo?.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.customerInfo.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Mbiemri *
              </label>
              <input
                {...register('customerInfo.lastName')}
                type="text"
                id="lastName"
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-lg
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 
                         focus:border-transparent transition-all duration-200 form-input-mobile"
                placeholder="Mbiemri juaj"
              />
              {errors.customerInfo?.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.customerInfo.lastName.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Numri i Telefonit *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">🇦🇱</span>
                </div>
                <input
                  {...register('customerInfo.phone')}
                  type="tel"
                  id="phone"
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-lg
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 
                           focus:border-transparent transition-all duration-200 form-input-mobile"
                  placeholder="+355 69 123 4567"
                />
              </div>
              {errors.customerInfo?.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.customerInfo.phone.message}</p>
              )}
            </div>

            {/* Customer Notes */}
            <div>
              <label htmlFor="customerNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Shënime shtesë (opsionale)
              </label>
              <textarea
                {...register('customerNotes')}
                id="customerNotes"
                rows={3}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-lg
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 
                         focus:border-transparent transition-all duration-200 resize-none form-input-mobile"
                placeholder="Ngjyra e preferuar, kërkesa të veçanta, etj..."
                maxLength={500}
              />
              {errors.customerNotes && (
                <p className="mt-1 text-sm text-red-600">{errors.customerNotes.message}</p>
              )}
            </div>
          </div>
        )

      case 'phone':
        return (
          <div className="space-y-6 mb-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Numri i telefonit
              </h3>
              <p className="text-gray-600">
                Na duhet numri juaj i telefonit për të dërguar njoftimet në WhatsApp
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Numri i telefonit *
              </label>
              <input
                {...register('customerInfo.phone')}
                type="tel"
                id="phone"
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-lg
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 
                         focus:border-transparent transition-all duration-200 form-input-mobile"
                placeholder="+355 69 123 4567"
              />
              {errors.customerInfo?.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.customerInfo.phone.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Format: +355 XX XXX XXXX (numër shqiptar)
              </p>
            </div>

            {/* WhatsApp Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium text-green-800 mb-1">WhatsApp Njoftimet</h4>
                  <p className="text-sm text-green-700">
                    Do të merrni një mesazh konfirmimi në WhatsApp kur salloni të aprovojë rezervimin tuaj.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'confirm':
        return (
          <div className="space-y-6 mb-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Konfirmoni rezervimin
              </h3>
              <p className="text-gray-600">
                Kontrolloni të dhënat para se të dërgoni kërkesën
              </p>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Salloni:</span>
                <span className="font-semibold text-gray-900">{salon.name}</span>
              </div>
              
              {selectedService && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shërbimi:</span>
                  <span className="font-semibold text-gray-900">{selectedService.name}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-semibold text-gray-900">
                  {watchedValues.appointmentDate && new Date(watchedValues.appointmentDate).toLocaleDateString('sq-AL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ora:</span>
                <span className="font-semibold text-gray-900">{watchedValues.startTime}</span>
              </div>
              
              {selectedService?.duration_minutes && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Kohëzgjatja:</span>
                  <span className="font-semibold text-gray-900">{selectedService.duration_minutes} minuta</span>
                </div>
              )}
              
              {selectedService?.price && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Çmimi:</span>
                  <span className="font-semibold text-gray-900">{selectedService.price}€</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4">
                {isAuthenticated && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">
                        Përdorur nga profili juaj i Instagram
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Emri:</span>
                  <span className="font-semibold text-gray-900">
                    {watchedValues.customerInfo?.firstName} {watchedValues.customerInfo?.lastName}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600">Telefoni:</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900">
                      {watchedValues.customerInfo?.phone || 'Nuk është dhënë'}
                    </span>
                  </div>
                </div>
              </div>

              {watchedValues.customerNotes && (
                <div className="border-t border-gray-200 pt-4">
                  <span className="text-gray-600 block mb-1">Shënime:</span>
                  <span className="text-gray-900">{watchedValues.customerNotes}</span>
                </div>
              )}
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Informacion i rëndësishëm
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Rezervimi juaj do të dërgohet për miratim</li>
                      <li>{salon.name} do t&apos;ju kontaktojë brenda 2 orësh</li>
                      <li>Do të merrni një mesazh konfirmimi në WhatsApp</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // ==============================================
  // RENDER NAVIGATION BUTTONS
  // ==============================================
  const renderNavigationButtons = () => {
    return (
      <div className="flex items-center justify-between space-x-4 mt-8">
        {/* Back Button */}
        {currentStep !== 'service' && (
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={isSubmitting}
            className="flex-1 py-3 px-6 border border-gray-300 rounded-xl text-gray-700 
                     font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all duration-200"
          >
            ← Kthehu
          </button>
        )}

        {/* Next/Submit Button */}
        {currentStep === 'confirm' ? (
          <button
            type="submit"
            disabled={!isStepValid(currentStep) || isSubmitting}
            className="flex-1 flex justify-center items-center py-3 px-6 border border-transparent 
                     text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 
                     to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none 
                     focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all duration-200 transform 
                     hover:scale-105 disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Po dërgon...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Dërgo Rezervimin
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={goToNextStep}
            disabled={!isStepValid(currentStep)}
            className="flex-1 py-3 px-6 border border-transparent text-lg font-semibold 
                     rounded-xl text-white bg-gradient-to-r from-red-600 to-pink-600 
                     hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all duration-200 transform 
                     hover:scale-105 disabled:transform-none"
          >
            Vazhdo →
          </button>
        )}
      </div>
    )
  }

  // ==============================================
  // MAIN RENDER
  // ==============================================
  return (
    <div className={`booking-form ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {renderNavigationButtons()}

        {/* Success Message */}
        {successMessage && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-700 text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{submitError}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}