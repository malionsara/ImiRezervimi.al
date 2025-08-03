// frontend/components/booking/ServiceSelector.tsx
// Service selection component for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { useState } from 'react'

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

interface ServiceSelectorProps {
  services: Service[]
  selectedService: Service | null
  onServiceSelect: (service: Service) => void
  className?: string
}

// ==============================================
// SERVICE SELECTOR COMPONENT
// ==============================================
export default function ServiceSelector({
  services,
  selectedService,
  onServiceSelect,
  className = ''
}: ServiceSelectorProps) {
  const [hoveredService, setHoveredService] = useState<string | null>(null)

  // Format duration for display
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${remainingMinutes}min`
  }

  // Format price for display
  const formatPrice = (price: number): string => {
    return `${price.toFixed(0)}€`
  }

  return (
    <div className={`service-selector ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Zgjidhni shërbimin që dëshironi
        </h2>
        <p className="text-gray-600">
          Zgjidhni nga shërbimet e disponueshme për të vazhduar me rezervimin
        </p>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nuk ka shërbime të disponueshme
          </h3>
          <p className="text-gray-600">
            Ky sallon nuk ka shërbime të konfiguruar ende.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => onServiceSelect(service)}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
              className={`
                group relative cursor-pointer service-card
                ${selectedService?.id === service.id
                  ? 'border-red-500 bg-red-50 shadow-lg scale-105'
                  : hoveredService === service.id
                  ? 'border-red-300 bg-red-25 shadow-md scale-102'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
                transform hover:scale-102
              `}
            >
              {/* Selection Indicator */}
              {selectedService?.id === service.id && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div className="flex items-start justify-between">
                {/* Service Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className={`text-lg font-semibold leading-6 ${
                      selectedService?.id === service.id ? 'text-red-900' : 'text-gray-900'
                    }`}>
                      {service.name}
                    </h3>
                    
                    {/* Price Badge */}
                    <div className={`ml-4 flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedService?.id === service.id
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-900 group-hover:bg-red-100 group-hover:text-red-800'
                    }`}>
                      {formatPrice(service.price)}
                    </div>
                  </div>

                  {/* Description */}
                  {service.description && (
                    <p className={`text-sm mb-4 ${
                      selectedService?.id === service.id ? 'text-red-700' : 'text-gray-600'
                    }`}>
                      {service.description}
                    </p>
                  )}

                  {/* Duration and Additional Info */}
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <svg className={`w-4 h-4 mr-2 ${
                        selectedService?.id === service.id ? 'text-red-500' : 'text-gray-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`text-sm ${
                        selectedService?.id === service.id ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        {formatDuration(service.duration_minutes)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <svg className={`w-4 h-4 mr-2 ${
                        selectedService?.id === service.id ? 'text-red-500' : 'text-gray-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`text-sm ${
                        selectedService?.id === service.id ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        Profesional
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Icon/Image Placeholder */}
                <div className={`ml-6 w-16 h-16 rounded-xl flex items-center justify-center ${
                  selectedService?.id === service.id
                    ? 'bg-red-500'
                    : 'bg-gradient-to-br from-pink-100 to-red-100 group-hover:from-pink-200 group-hover:to-red-200'
                }`}>
                  {/* Beauty service icons based on service name */}
                  {service.name.toLowerCase().includes('manikyr') ? (
                    <span className={`text-2xl ${selectedService?.id === service.id ? 'text-white' : 'text-red-500'}`}>
                      💅
                    </span>
                  ) : service.name.toLowerCase().includes('flok') ? (
                    <span className={`text-2xl ${selectedService?.id === service.id ? 'text-white' : 'text-red-500'}`}>
                      💇‍♀️
                    </span>
                  ) : service.name.toLowerCase().includes('nail') ? (
                    <span className={`text-2xl ${selectedService?.id === service.id ? 'text-white' : 'text-red-500'}`}>
                      💅
                    </span>
                  ) : service.name.toLowerCase().includes('make') ? (
                    <span className={`text-2xl ${selectedService?.id === service.id ? 'text-white' : 'text-red-500'}`}>
                      💄
                    </span>
                  ) : service.name.toLowerCase().includes('masazh') ? (
                    <span className={`text-2xl ${selectedService?.id === service.id ? 'text-white' : 'text-red-500'}`}>
                      💆‍♀️
                    </span>
                  ) : service.name.toLowerCase().includes('qerpik') ? (
                    <span className={`text-2xl ${selectedService?.id === service.id ? 'text-white' : 'text-red-500'}`}>
                      👁️
                    </span>
                  ) : (
                    <span className={`text-2xl ${selectedService?.id === service.id ? 'text-white' : 'text-red-500'}`}>
                      ✨
                    </span>
                  )}
                </div>
              </div>

              {/* Hover/Selection Effect */}
              <div className={`
                absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none
                ${selectedService?.id === service.id
                  ? 'bg-gradient-to-r from-red-500/10 to-pink-500/10'
                  : hoveredService === service.id
                  ? 'bg-gradient-to-r from-red-500/5 to-pink-500/5'
                  : ''
                }
              `} />

              {/* Bottom highlight bar for selected service */}
              {selectedService?.id === service.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-b-2xl" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Popular Services Badge */}
      {services.length > 0 && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-red-100 to-pink-100 text-red-800 text-sm font-medium">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Shërbime profesionale me cilësi të lartë
          </div>
        </div>
      )}

      {/* Next Step Hint */}
      {selectedService && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-green-700 text-sm font-medium">
                Shërbimi &quot;{selectedService.name}&quot; u zgjodh!
              </p>
              <p className="text-green-600 text-xs mt-1">
                Shtypni &quot;Vazhdo&quot; për të zgjedhur datën dhe orën.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles for smooth transitions */}
      <style jsx>{`
        .service-selector .group:hover {
          transform: translateY(-2px);
        }
        
        .service-selector .group:active {
          transform: translateY(0px);
        }
        
        @media (max-width: 640px) {
          .service-selector .group {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}