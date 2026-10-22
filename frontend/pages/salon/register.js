// frontend/pages/salon/register.js
// Salon registration page for beauty salons to join the platform

import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout, { authLayout } from '../../components/layout/Layout'
import RegistrationForm from '../../components/salon/RegistrationForm'
import ServiceConfig from '../../components/salon/ServiceConfig'

export default function SalonRegister() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [registrationData, setRegistrationData] = useState({
    // Basic Info
    name: '',
    slug: '',
    description: '',
    phone: '',
    email: '',
    
    // Location
    address: '',
    city: 'Tirana',
    
    // Social Media
    instagramHandle: '',
    facebookPage: '',
    websiteUrl: '',
    
    // Settings
    autoApproveVips: false,
    maxAdvanceDays: 10,
    minCancellationMinutes: 30,
    
    // Working Hours
    workingHours: {
      monday: { open: '09:00', close: '19:00', closed: false },
      tuesday: { open: '09:00', close: '19:00', closed: false },
      wednesday: { open: '09:00', close: '19:00', closed: false },
      thursday: { open: '09:00', close: '19:00', closed: false },
      friday: { open: '09:00', close: '19:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    
    // Services
    services: [],
    
    // Photos
    photos: [],
    
    // WhatsApp
    whatsappNumber: '',
    whatsappEnabled: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const totalSteps = 3

  const handleDataChange = (newData) => {
    setRegistrationData(prev => ({ ...prev, ...newData }))
  }

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitRegistration = async () => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/salon/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })

      if (response.ok) {
        // Registration successful
        router.push('/salon/success?message=registered')
      } else {
        const errorData = await response.json()
        setSubmitError(errorData.error?.message || 'Regjistrimi dështoi. Ju lutemi provoni përsëri.')
      }
    } catch (error) {
      console.error('Registration submission error:', error)
      setSubmitError('Ka ndodhur një gabim. Ju lutemi provoni përsëri.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Informacionet bazë'
      case 2:
        return 'Konfigurimi i shërbimeve'
      case 3:
        return 'Rishikimi dhe konfirmimi'
      default:
        return 'Regjistrimi i sallonit'
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RegistrationForm
            data={registrationData}
            onChange={handleDataChange}
            onNext={handleNextStep}
          />
        )
      case 2:
        return (
          <ServiceConfig
            data={registrationData}
            onChange={handleDataChange}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        )
      case 3:
        return (
          <div className="bg-paper rounded-lg shadow-soft p-8">
            <h3 className="text-xl font-bold text-ink mb-6">Rishikoni informacionet</h3>
            
            {/* Review Section */}
            <div className="space-y-6 mb-8">
              <div>
                <h4 className="font-semibold text-ink mb-2">Informacionet bazë</h4>
                <div className="bg-cream rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Emri:</span> {registrationData.name}</p>
                  <p><span className="font-medium">Telefoni:</span> {registrationData.phone}</p>
                  <p><span className="font-medium">Adresa:</span> {registrationData.address}, {registrationData.city}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-ink mb-2">Shërbimet</h4>
                <div className="bg-cream rounded-lg p-4">
                  {registrationData.services.length > 0 ? (
                    <ul className="space-y-1">
                      {registrationData.services.map((service, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{service.name}</span>
                          <span>{service.duration} min - {service.price ? `${service.price}€` : 'Pa çmim'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-clay">Nuk janë shtuar shërbime ende</p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="mb-6 p-4 bg-accent-soft/60 border border-accent/25 rounded-lg">
                <p className="text-accent">{submitError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handlePrevStep}
                className="flex-1 px-6 py-3 border border-linen text-ink rounded-lg font-medium hover:bg-cream transition-colors"
              >
                Kthehu prapa
              </button>
              <button
                onClick={handleSubmitRegistration}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Po dërgohet...' : 'Konfirmo regjistrimin'}
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Layout {...authLayout({
      title: "Regjistrimi i Sallonit",
      description: "Regjistroni sallonin tuaj në platformën më të madhe të rezervimeve në Shqipëri"
    })}>
      <div className="min-h-screen">

        {/* Progress Bar */}
        <div className="bg-paper border-b">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ink">Hapi {currentStep} nga {totalSteps}</span>
              <span className="text-sm font-medium text-ink">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-linen rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ink mb-2">
              Regjistrimi i Sallonit
            </h1>
            <h2 className="text-xl text-clay mb-4">
              {getStepTitle()}
            </h2>
            <p className="text-clay">
              Bashkohuni me mijëra sallone që përdorin ImiRezervimi.al për të menaxhuar rezervimet e tyre
            </p>
          </div>

          {/* Step Content */}
          {renderStep()}
        </main>

      </div>
    </Layout>
  )
}