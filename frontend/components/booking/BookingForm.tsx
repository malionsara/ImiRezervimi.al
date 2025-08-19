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
// UTILITY FUNCTIONS
// ==============================================
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
    mode: 'onChange',
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
      customerNotes: '',
      duration: undefined
    }
  })

  // ==============================================
  // AUTO-POPULATE USER DATA AND SET STABLE STEPS
  // ==============================================
  useEffect(() => {
    // Always set salonId first
    setValue('salonId', salon.id)
    
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
  }, [isAuthenticated, session, setValue, initialPhoneStatus, salon.id])

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
        // Manual validation check for debugging
        const hasRequiredFields = !!(
          watchedValues.salonId &&
          watchedValues.serviceId &&
          watchedValues.appointmentDate &&
          watchedValues.startTime &&
          watchedValues.customerInfo?.firstName &&
          watchedValues.customerInfo?.lastName &&
          watchedValues.customerInfo?.phone &&
          selectedService?.duration_minutes
        )
        
        console.log('🔍 Confirm step validation:', {
          isValid,
          hasRequiredFields,
          hasErrors: Object.keys(errors).length > 0,
          errorDetails: errors,
          watchedValues: {
            salonId: watchedValues.salonId,
            serviceId: watchedValues.serviceId,
            appointmentDate: watchedValues.appointmentDate,
            startTime: watchedValues.startTime,
            customerInfo: watchedValues.customerInfo,
            duration: watchedValues.duration,
            customerNotes: watchedValues.customerNotes
          },
          selectedService: selectedService?.name,
          phoneValidation: {
            phone: watchedValues.customerInfo?.phone,
            phoneLength: watchedValues.customerInfo?.phone?.length,
            phoneRegexTest: /^\+355[0-9]{8,9}$/.test(watchedValues.customerInfo?.phone || '')
          }
        })
        
        // Also log individual field validation
        if (!isValid) {
          console.log('❌ Form validation failed. Detailed errors:')
          Object.entries(errors).forEach(([field, error]) => {
            console.log(`  - ${field}:`, error?.message || error)
          })
          
          // Try to validate each field manually
          console.log('🧪 Manual field validation:')
          console.log('- salonId:', !!watchedValues.salonId)
          console.log('- serviceId:', !!watchedValues.serviceId)
          console.log('- appointmentDate:', !!watchedValues.appointmentDate)
          console.log('- startTime:', !!watchedValues.startTime)
          console.log('- firstName:', !!watchedValues.customerInfo?.firstName)
          console.log('- lastName:', !!watchedValues.customerInfo?.lastName)
          console.log('- phone:', watchedValues.customerInfo?.phone)
          console.log('- duration:', watchedValues.duration)
        }
        
        // TEMPORARY: Use manual validation as fallback
        return hasRequiredFields || isValid
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
    setValue('duration', service.duration_minutes) // Set duration for validation
    
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
  // ENSURE FORM VALUES ARE SET
  // ==============================================
  const ensureFormValuesAreSet = () => {
    // Set all required form values using setValue
    setValue('salonId', salon.id)
    setValue('serviceId', selectedService?.id || '')
    setValue('appointmentDate', watchedValues.appointmentDate || '')
    setValue('startTime', watchedValues.startTime || '')
    setValue('duration', selectedService?.duration_minutes || 0)
    
    console.log('🔧 Form values set manually:', {
      salonId: salon.id,
      serviceId: selectedService?.id,
      appointmentDate: watchedValues.appointmentDate,
      startTime: watchedValues.startTime,
      duration: selectedService?.duration_minutes
    })
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
      // Get current form values (fallback to watched values if form data is missing)
      const currentValues = watch()
      
      // Prepare appointment request data - use form data or fallback to current state
      const appointmentRequest = {
        salonId: data.salonId || salon.id,
        serviceId: data.serviceId || selectedService.id,
        appointmentDate: data.appointmentDate || currentValues.appointmentDate,
        startTime: data.startTime || currentValues.startTime,
        customerInfo: data.customerInfo,
        customerNotes: data.customerNotes || undefined,
        duration: selectedService.duration_minutes
      }

      console.log('📋 Form submission data comparison:', {
        formData: data,
        watchedValues: currentValues,
        finalRequest: appointmentRequest,
        selectedService: selectedService?.name
      })

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
        // Check if it's a pending limit error (per salon or global)
        if (result.error?.code === 'MAX_PENDING_EXCEEDED' || 
            result.error?.code === 'MAX_PENDING_PER_SALON_EXCEEDED' ||
            result.error?.message?.includes('Mund të keni maksimumi 2 rezervime në pritje') ||
            result.error?.message?.includes('pending limit')) {
          setSubmitError('PENDING_LIMIT_REACHED')
        } else {
          const errorMessage = result.error?.message || ALBANIAN_ERRORS.INTERNAL_ERROR
          setSubmitError(errorMessage)
        }
        onError?.(result.error?.message || ALBANIAN_ERRORS.INTERNAL_ERROR)
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
      <div className="mb-12">
        {/* Progress Bar */}
        <div className="relative mb-8">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full transform -translate-y-1/2 transition-all duration-500 ease-out"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between relative">
          {steps.map((step, index) => (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              {/* Step Circle */}
              <div className={`
                flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold transition-all duration-300 transform
                ${index <= currentIndex 
                  ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg scale-110' 
                  : 'bg-white border-2 border-gray-300 text-gray-400 hover:border-gray-400'
                }
                ${index === currentIndex ? 'ring-4 ring-red-200 ring-opacity-50 animate-pulse' : ''}
              `}>
                {index < currentIndex ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xl">{step.icon}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center">
                <p className={`text-sm font-semibold transition-colors duration-300 ${
                  index <= currentIndex ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </p>
                {index === currentIndex && (
                  <div className="mt-1 w-2 h-2 bg-red-500 rounded-full mx-auto animate-bounce"></div>
                )}
              </div>
            </div>
          ))}
        </div>
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
      <div className="flex items-center justify-between space-x-6 mt-12">
        {/* Back Button */}
        {currentStep !== 'service' && (
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={isSubmitting}
            className="group flex items-center justify-center py-4 px-8 bg-white border-2 border-gray-300 rounded-2xl text-gray-700 
                     font-semibold hover:border-red-300 hover:text-red-600 focus:outline-none focus:ring-4 
                     focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 
                     transform hover:scale-105 disabled:transform-none shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kthehu
          </button>
        )}

        {/* Next/Submit Button */}
        {currentStep === 'confirm' ? (
          <button
            type="button"
            onClick={() => {
              ensureFormValuesAreSet()
              // Trigger form submission programmatically
              handleSubmit(onSubmit)()
            }}
            disabled={!isStepValid(currentStep) || isSubmitting}
            className="group flex-1 flex justify-center items-center py-4 px-8 bg-gradient-to-r from-red-600 to-pink-600 
                     hover:from-red-700 hover:to-pink-700 rounded-2xl text-white text-lg font-bold
                     focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all duration-300 transform 
                     hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl
                     relative overflow-hidden"
          >
            {/* Animated background shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                <span className="relative">Po dërgon rezervimin...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span className="relative">🎉 Dërgo Rezervimin</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={goToNextStep}
            disabled={!isStepValid(currentStep)}
            className="group flex-1 flex items-center justify-center py-4 px-8 bg-gradient-to-r from-red-600 to-pink-600 
                     hover:from-red-700 hover:to-pink-700 rounded-2xl text-white text-lg font-semibold
                     focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all duration-300 transform 
                     hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl
                     relative overflow-hidden"
          >
            {/* Animated background shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <span className="relative mr-2">Vazhdo</span>
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  // ==============================================
  // MAIN RENDER
  // ==============================================
  return (
    <div className={`booking-form ${className} min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-8 text-white">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">✨ Rezervo Takimin</h1>
              <p className="text-red-100 text-lg">Zgjidh shërbimin dhe orarin që të përshtatet më së miri</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Form values are set programmatically via setValue() before submission */}

            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Step Content */}
            <div className="min-h-[500px] bg-gray-50 rounded-2xl p-8 mb-8 shadow-inner">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            {renderNavigationButtons()}
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mx-8 mb-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg animate-pulse">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">🎉 Sukses!</h3>
                  <p className="text-green-100 font-medium">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="mx-8 mb-8">
              {submitError === 'PENDING_LIMIT_REACHED' ? (
                // Special UI for pending limit error
                <div className="p-8 bg-gradient-to-r from-orange-400 to-yellow-500 text-white rounded-2xl shadow-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">⏳ Limit i rezervimeve për këtë sallon u arrit</h3>
                    <p className="text-orange-100 font-medium mb-6 text-lg">
                      Keni arritur limitin maksimal të rezervimeve në pritje për këtë sallon (2). Ju lutemi menaxhoni rezervimet ekzistuese me këtë sallon para se të bëni një të re, ose provoni me sallone të tjerë.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => window.location.href = '/dashboard/bookings'}
                        className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors shadow-lg"
                      >
                        📅 Shiko Rezervimet e Mia
                      </button>
                      <button
                        onClick={() => window.location.href = '/salon'}
                        className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors shadow-lg"
                      >
                        🔍 Zbulo Sallone të Tjerë
                      </button>
                      <button
                        onClick={() => setSubmitError('')}
                        className="px-6 py-3 bg-orange-600 bg-opacity-20 text-white rounded-xl font-semibold hover:bg-opacity-30 transition-colors border border-white border-opacity-30"
                      >
                        ✕ Mbyll
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular error message
                <div className="p-6 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl shadow-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">⚠️ Gabim</h3>
                      <p className="text-red-100 font-medium">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}