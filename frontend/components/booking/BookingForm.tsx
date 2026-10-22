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
import { Check, ChevronLeft, ChevronRight, Send, Sparkles, CalendarDays, User, Smartphone, Info, Clock, AlertTriangle, X, Search, MessageCircle } from 'lucide-react'

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
    trigger,
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
        const finalResult = hasRequiredFields || isValid
        console.log('🔥 CONFIRM STEP VALIDATION RESULT:', finalResult)
        console.log('🔥 hasRequiredFields:', hasRequiredFields)
        console.log('🔥 isValid:', isValid)
        return finalResult
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
    
    // Force trigger validation to update form state
    trigger(['serviceId'])
    
    console.log('💅 Service selected:', service.name, service.id)
    
    // Remove auto-advance - user must click VAZHDO manually
  }

  // ==============================================
  // TIME SLOT SELECTION HANDLER
  // ==============================================
  const handleTimeSlotSelect = (date: string, time: string) => {
    setValue('appointmentDate', date)
    setValue('startTime', time)
    
    // Force trigger validation to update form state
    trigger(['appointmentDate', 'startTime'])
    
    console.log('🕐 Time slot selected:', { date, time })
    
    // Remove auto-advance - user must click VAZHDO manually
  }

  // ==============================================
  // ENSURE FORM VALUES ARE SET (LEGACY - NOW USING DIRECT API)
  // ==============================================
  const ensureFormValuesAreSet = async () => {
    console.log('🚨 Setting form values and triggering validation...')
    
    // Set all required form values using setValue
    setValue('salonId', salon.id)
    setValue('serviceId', selectedService?.id || '')
    setValue('appointmentDate', watchedValues.appointmentDate || '')
    setValue('startTime', watchedValues.startTime || '')
    setValue('duration', selectedService?.duration_minutes || 0)
    
    // Trigger validation for all required fields
    const isFormValid = await trigger(['salonId', 'serviceId', 'appointmentDate', 'startTime', 'customerInfo'])
    
    console.log('✅ Form validation result:', {
      isFormValid,
      currentErrors: errors,
      formData: watch()
    })
    
    return isFormValid
  }

  // ==============================================
  // FORM SUBMISSION
  // ==============================================
  const onSubmit = async (data: BookingFormData) => {
    console.log('🎯 onSubmit FUNCTION CALLED!')
    console.log('📊 Form data received:', data)
    console.log('📊 Current errors:', errors)
    console.log('📊 Form is valid:', isValid)
    
    if (!selectedService) {
      console.log('❌ No selected service!')
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
  // RENDER STEP INDICATOR - Mobile Optimized
  // ==============================================
  const renderStepIndicator = () => {
    const allSteps = [
      { key: 'service', label: 'Shërbimi', icon: Sparkles },
      { key: 'datetime', label: 'Data & Ora', icon: CalendarDays },
      { key: 'customer', label: 'Të dhënat', icon: User },
      { key: 'phone', label: 'Telefoni', icon: Smartphone },
      { key: 'confirm', label: 'Konfirmo', icon: Check }
    ]
    
    // Use stable steps instead of dynamic calculation
    const steps = allSteps.filter(step => stableSteps.includes(step.key as FormStep))

    const currentIndex = steps.findIndex(step => step.key === currentStep)

    return (
      <div className="mb-8 sm:mb-12 relative z-0 overflow-hidden">
        {/* Progress Bar - Mobile Optimized */}
        <div className="relative mb-4 sm:mb-8 z-0">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-linen rounded-full transform -translate-y-1/2 z-0"></div>
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-accent rounded-full transform -translate-y-1/2 transition-all duration-500 ease-out z-0"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Step Indicators - Mobile Optimized */}
        <div className="flex justify-between relative z-0 overflow-visible">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            return (
            <div key={step.key} className="flex flex-col items-center relative z-0">
              {/* Step Circle - Mobile Optimized */}
              <div className={`
                flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300
                ${index <= currentIndex
                  ? 'bg-accent text-white shadow-soft'
                  : 'bg-paper border border-linen text-clay/60'
                }
                ${index === currentIndex ? 'ring-2 ring-accent/25' : ''}
              `}>
                {index < currentIndex ? (
                  <Check size={18} strokeWidth={2.5} aria-hidden="true" />
                ) : (
                  <StepIcon size={18} strokeWidth={1.75} aria-hidden="true" />
                )}
              </div>

              {/* Step Label - Mobile Optimized */}
              <div className="mt-2 sm:mt-3 text-center">
                <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  index <= currentIndex ? 'text-accent' : 'text-clay'
                }`}>
                  {step.label}
                </p>
              </div>
            </div>
          )})}
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
              <h3 className="font-display text-xl text-ink mb-2">
                Të dhënat tuaja
              </h3>
              <p className="text-clay">
                Plotësoni informacionet për të vazhduar me rezervimin
              </p>
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-ink mb-2">
                Emri *
              </label>
              <input
                {...register('customerInfo.firstName')}
                type="text"
                id="firstName"
                className="block w-full px-4 py-3 border border-linen bg-paper rounded text-base
                         placeholder:text-clay/60 focus:outline-none focus:ring-2 focus:ring-accent/25
                         focus:border-accent transition-all duration-200 form-input-mobile"
                placeholder="Emri juaj"
              />
              {errors.customerInfo?.firstName && (
                <p className="mt-1 text-sm text-danger">{errors.customerInfo.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-ink mb-2">
                Mbiemri *
              </label>
              <input
                {...register('customerInfo.lastName')}
                type="text"
                id="lastName"
                className="block w-full px-4 py-3 border border-linen bg-paper rounded text-base
                         placeholder:text-clay/60 focus:outline-none focus:ring-2 focus:ring-accent/25
                         focus:border-accent transition-all duration-200 form-input-mobile"
                placeholder="Mbiemri juaj"
              />
              {errors.customerInfo?.lastName && (
                <p className="mt-1 text-sm text-danger">{errors.customerInfo.lastName.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-ink mb-2">
                Numri i Telefonit *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-clay text-sm font-medium">+355</span>
                </div>
                <input
                  {...register('customerInfo.phone')}
                  type="tel"
                  id="phone"
                  className="block w-full pl-14 pr-4 py-3 border border-linen bg-paper rounded text-base
                           placeholder:text-clay/60 focus:outline-none focus:ring-2 focus:ring-accent/25
                           focus:border-accent transition-all duration-200 form-input-mobile"
                  placeholder="+355 69 123 4567"
                />
              </div>
              {errors.customerInfo?.phone && (
                <p className="mt-1 text-sm text-danger">{errors.customerInfo.phone.message}</p>
              )}
            </div>

            {/* Customer Notes */}
            <div>
              <label htmlFor="customerNotes" className="block text-sm font-medium text-ink mb-2">
                Shënime shtesë (opsionale)
              </label>
              <textarea
                {...register('customerNotes')}
                id="customerNotes"
                rows={3}
                className="block w-full px-4 py-3 border border-linen bg-paper rounded text-base
                         placeholder:text-clay/60 focus:outline-none focus:ring-2 focus:ring-accent/25
                         focus:border-accent transition-all duration-200 resize-none form-input-mobile"
                placeholder="Ngjyra e preferuar, kërkesa të veçanta, etj..."
                maxLength={500}
              />
              {errors.customerNotes && (
                <p className="mt-1 text-sm text-danger">{errors.customerNotes.message}</p>
              )}
            </div>
          </div>
        )

      case 'phone':
        return (
          <div className="space-y-6 mb-6">
            <div className="text-center mb-6">
              <h3 className="font-display text-xl text-ink mb-2">
                Numri i telefonit
              </h3>
              <p className="text-clay">
                Na duhet numri juaj i telefonit për të dërguar njoftimet në WhatsApp
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-ink mb-2">
                Numri i telefonit *
              </label>
              <input
                {...register('customerInfo.phone')}
                type="tel"
                id="phone"
                className="block w-full px-4 py-3 border border-linen bg-paper rounded text-base
                         placeholder:text-clay/60 focus:outline-none focus:ring-2 focus:ring-accent/25
                         focus:border-accent transition-all duration-200 form-input-mobile"
                placeholder="+355 69 123 4567"
              />
              {errors.customerInfo?.phone && (
                <p className="mt-1 text-sm text-danger">{errors.customerInfo.phone.message}</p>
              )}
              <p className="mt-2 text-sm text-clay">
                Format: +355 XX XXX XXXX (numër shqiptar)
              </p>
            </div>

            {/* WhatsApp Info */}
            <div className="bg-success/5 border border-success/20 rounded p-4">
              <div className="flex items-start gap-3">
                <MessageCircle size={18} strokeWidth={1.75} className="text-success mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-medium text-ink mb-1">WhatsApp Njoftimet</h4>
                  <p className="text-sm text-clay">
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
              <h3 className="font-display text-xl text-ink mb-2">
                Konfirmoni rezervimin
              </h3>
              <p className="text-clay">
                Kontrolloni të dhënat para se të dërgoni kërkesën
              </p>
            </div>

            {/* Booking Summary */}
            <div className="bg-paper border border-linen rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-clay">Salloni:</span>
                <span className="font-semibold text-ink">{salon.name}</span>
              </div>

              {selectedService && (
                <div className="flex items-center justify-between">
                  <span className="text-clay">Shërbimi:</span>
                  <span className="font-semibold text-ink">{selectedService.name}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-clay">Data:</span>
                <span className="font-semibold text-ink">
                  {watchedValues.appointmentDate && new Date(watchedValues.appointmentDate).toLocaleDateString('sq-AL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-clay">Ora:</span>
                <span className="font-semibold text-ink">{watchedValues.startTime}</span>
              </div>

              {selectedService?.duration_minutes && (
                <div className="flex items-center justify-between">
                  <span className="text-clay">Kohëzgjatja:</span>
                  <span className="font-semibold text-ink">{selectedService.duration_minutes} minuta</span>
                </div>
              )}

              {selectedService?.price && (
                <div className="flex items-center justify-between">
                  <span className="text-clay">Çmimi:</span>
                  <span className="font-display font-semibold text-accent text-lg">{selectedService.price}€</span>
                </div>
              )}

              <div className="border-t border-linen pt-4">
                {isAuthenticated && (
                  <div className="bg-success/5 border border-success/20 rounded p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Check size={16} strokeWidth={2} className="text-success shrink-0" aria-hidden="true" />
                      <span className="text-sm font-medium text-ink">
                        Përdorur nga profili juaj i Instagram
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-clay">Emri:</span>
                  <span className="font-semibold text-ink">
                    {watchedValues.customerInfo?.firstName} {watchedValues.customerInfo?.lastName}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-clay">Telefoni:</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-ink">
                      {watchedValues.customerInfo?.phone || 'Nuk është dhënë'}
                    </span>
                  </div>
                </div>
              </div>

              {watchedValues.customerNotes && (
                <div className="border-t border-linen pt-4">
                  <span className="text-clay block mb-1">Shënime:</span>
                  <span className="text-ink">{watchedValues.customerNotes}</span>
                </div>
              )}
            </div>

            {/* Important Notice */}
            <div className="bg-accent-soft/60 border border-accent/15 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Info size={18} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-ink">
                    Informacion i rëndësishëm
                  </h3>
                  <div className="mt-2 text-sm text-clay">
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
  // RENDER NAVIGATION BUTTONS - Mobile Optimized
  // ==============================================
  const renderNavigationButtons = () => {
    return (
      <div className="flex items-center justify-between space-x-3 sm:space-x-6 mt-6 sm:mt-12">
        {/* Back Button - Mobile Optimized */}
        {currentStep !== 'service' && (
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={isSubmitting}
            className="group flex items-center justify-center py-3 px-4 sm:py-3.5 sm:px-7 bg-paper border border-linen rounded text-ink
                     font-medium hover:border-clay focus:outline-none focus:ring-2
                     focus:ring-accent/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-touch"
          >
            <ChevronLeft size={18} strokeWidth={1.75} className="sm:mr-2 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
            <span className="hidden sm:inline">Kthehu</span>
          </button>
        )}

        {/* Next/Submit Button - Mobile Optimized */}
        {currentStep === 'confirm' ? (
          <button
            type="button"
            onClick={async () => {
              console.log('🚨 DIRECT API SUBMISSION - BYPASSING REACT HOOK FORM')
              
              if (isSubmitting) return
              
              // Ensure all form fields are properly set before validation
              setValue('salonId', salon.id)
              if (selectedService?.id) {
                setValue('serviceId', selectedService.id)
                setValue('duration', selectedService.duration_minutes)
              }
              
              // Trigger form validation to ensure all fields are updated
              await trigger()
              
              // Get current values after ensuring they're set
              const currentValues = watch()
              
              // Validate required fields manually
              const requiredFieldsPresent = !!(
                currentValues.salonId &&
                selectedService?.id &&
                currentValues.appointmentDate &&
                currentValues.startTime &&
                currentValues.customerInfo?.firstName &&
                currentValues.customerInfo?.lastName &&
                currentValues.customerInfo?.phone
              )
              
              console.log('📋 Direct API submission validation:', {
                salonId: currentValues.salonId,
                serviceId: selectedService?.id,
                appointmentDate: currentValues.appointmentDate,
                startTime: currentValues.startTime,
                firstName: currentValues.customerInfo?.firstName,
                lastName: currentValues.customerInfo?.lastName,
                phone: currentValues.customerInfo?.phone,
                requiredFieldsPresent,
                formIsValid: isValid,
                hasErrors: Object.keys(errors).length > 0,
                errors: errors
              })
              
              if (!requiredFieldsPresent) {
                console.log('❌ Required fields missing')
                setSubmitError('Ju lutem plotësoni të gjitha fushat e kërkuara')
                return
              }
              
              // Direct API call
              setIsSubmitting(true)
              setSubmitError('')
              
              try {
                const appointmentRequest = {
                  salonId: currentValues.salonId || salon.id,
                  serviceId: selectedService.id,
                  appointmentDate: currentValues.appointmentDate,
                  startTime: currentValues.startTime,
                  customerInfo: currentValues.customerInfo,
                  customerNotes: currentValues.customerNotes || undefined,
                  duration: selectedService.duration_minutes
                }
                
                console.log('📤 Sending direct API request:', appointmentRequest)
                
                const response = await fetch('/api/appointments/request', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(appointmentRequest),
                })
                
                const result = await response.json()
                console.log('📨 Direct API response:', result)
                
                if (result.success) {
                  setSuccessMessage(result.data.message || 'Rezervimi u dërgua me sukses!')
                  
                  // Reset form
                  reset()
                  setSelectedService(null)
                  setCurrentStep('service')
                  
                  // Call success callback
                  onSuccess?.(result.data.appointment.id)
                  
                } else {
                  // Check if it's a pending limit error
                  if (result.error?.code === 'MAX_PENDING_EXCEEDED' || 
                      result.error?.code === 'MAX_PENDING_PER_SALON_EXCEEDED' ||
                      result.error?.message?.includes('Mund të keni maksimumi 2 rezervime në pritje') ||
                      result.error?.message?.includes('pending limit')) {
                    setSubmitError('PENDING_LIMIT_REACHED')
                  } else {
                    const errorMessage = result.error?.message || 'Ka ndodhur një gabim'
                    setSubmitError(errorMessage)
                  }
                  onError?.(result.error?.message || 'Ka ndodhur një gabim')
                }
                
              } catch (error) {
                console.error('❌ Direct API submission error:', error)
                const errorMessage = 'Ka ndodhur një gabim në dërgimin e rezervimit'
                setSubmitError(errorMessage)
                onError?.(errorMessage)
              } finally {
                setIsSubmitting(false)
              }
            }}
            disabled={!isStepValid(currentStep) || isSubmitting}
            className="group flex-1 flex justify-center items-center py-3 px-4 sm:py-3.5 sm:px-7 bg-accent
                     hover:bg-accent-strong rounded text-white text-base font-semibold
                     focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors duration-200 btn-touch"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2 sm:mr-3"></div>
                <span className="text-sm sm:text-base">Po dërgon...</span>
              </>
            ) : (
              <>
                <Send size={18} strokeWidth={1.75} className="mr-2" aria-hidden="true" />
                <span className="text-sm sm:text-base">Dërgo</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={goToNextStep}
            disabled={!isStepValid(currentStep)}
            className="group flex-1 flex items-center justify-center py-3 px-4 sm:py-3.5 sm:px-7 bg-accent
                     hover:bg-accent-strong rounded text-white text-base font-semibold
                     focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors duration-200 btn-touch"
          >
            <span className="mr-1 sm:mr-2 text-sm sm:text-base">Vazhdo</span>
            <ChevronRight size={18} strokeWidth={1.75} className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
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
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-paper rounded-lg border border-linen shadow-soft overflow-hidden">
          {/* Hidden form fields to ensure React Hook Form has all required data */}
          <input {...register('salonId')} type="hidden" />
          <input {...register('serviceId')} type="hidden" />
          <input {...register('appointmentDate')} type="hidden" />
          <input {...register('startTime')} type="hidden" />
          <input {...register('duration')} type="hidden" />
          
          {/* Header Section - Mobile Optimized */}
          <div className="bg-ink p-4 sm:p-8 text-cream">
            <div className="text-center">
              <h1 className="font-display text-xl sm:text-3xl mb-1 sm:mb-2">Rezervo Takimin</h1>
              <p className="text-cream/70 text-sm sm:text-base">Zgjidh shërbimin dhe orarin që të përshtatet më së miri</p>
            </div>
          </div>

          {/* Form Content - Mobile Optimized */}
          <div className="p-4 sm:p-8">
            {/* Form values are set programmatically via setValue() before submission */}

            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Step Content - Mobile Optimized */}
            <div className="min-h-[300px] sm:min-h-[500px] bg-cream rounded-lg p-4 sm:p-8 mb-4 sm:mb-8 relative z-10">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            {renderNavigationButtons()}
          </div>

          {/* Success Message - Mobile Optimized */}
          {successMessage && (
            <div className="mx-4 sm:mx-8 mb-4 sm:mb-8 p-4 sm:p-6 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3 sm:mr-4">
                  <div className="w-9 h-9 bg-success rounded-full flex items-center justify-center">
                    <Check size={18} strokeWidth={2.5} className="text-white" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-ink mb-1">Sukses!</h3>
                  <p className="text-clay font-medium text-sm sm:text-base">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message - Mobile Optimized */}
          {submitError && (
            <div className="mx-4 sm:mx-8 mb-4 sm:mb-8">
              {submitError === 'PENDING_LIMIT_REACHED' ? (
                // Special UI for pending limit error - Mobile Optimized
                <div className="p-4 sm:p-8 bg-warning/5 border border-warning/25 rounded-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Clock size={24} strokeWidth={1.75} className="text-warning" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-lg sm:text-2xl text-ink mb-2">Limit i rezervimeve për këtë sallon u arrit</h3>
                    <p className="text-clay font-medium mb-4 sm:mb-6 text-sm sm:text-base">
                      Keni arritur limitin maksimal të rezervimeve në pritje për këtë sallon (2). Ju lutemi menaxhoni rezervimet ekzistuese me këtë sallon para se të bëni një të re, ose provoni me sallone të tjerë.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                      <button
                        onClick={() => window.location.href = '/dashboard/bookings'}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 bg-accent text-white rounded font-medium hover:bg-accent-strong transition-colors text-sm sm:text-base btn-touch"
                      >
                        <CalendarDays size={16} strokeWidth={1.75} aria-hidden="true" />
                        Shiko Rezervimet e Mia
                      </button>
                      <button
                        onClick={() => window.location.href = '/salons'}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 bg-paper border border-linen text-ink rounded font-medium hover:border-clay transition-colors text-sm sm:text-base btn-touch"
                      >
                        <Search size={16} strokeWidth={1.75} aria-hidden="true" />
                        Zbulo Sallone të Tjerë
                      </button>
                      <button
                        onClick={() => setSubmitError('')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 text-clay rounded font-medium hover:text-ink hover:bg-sand transition-colors text-sm sm:text-base btn-touch"
                      >
                        <X size={16} strokeWidth={1.75} aria-hidden="true" />
                        Mbyll
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular error message - Mobile Optimized
                <div className="p-4 sm:p-6 bg-danger/5 border border-danger/25 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3 sm:mr-4">
                      <div className="w-9 h-9 bg-danger/10 rounded-full flex items-center justify-center">
                        <AlertTriangle size={18} strokeWidth={1.75} className="text-danger" aria-hidden="true" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-ink mb-1">Gabim</h3>
                      <p className="text-clay font-medium text-sm sm:text-base">{submitError}</p>
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