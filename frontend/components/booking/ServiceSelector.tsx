// frontend/components/booking/ServiceSelector.tsx
// Service selection component for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { useState } from 'react'
import { Check, Clock, BadgeCheck, FileText, Sparkles, Scissors, Brush, Hand, Eye, Flower2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

// Map a service name to a representative icon
function serviceIcon(name: string): LucideIcon {
  const n = name.toLowerCase()
  if (n.includes('manikyr') || n.includes('nail')) return Hand
  if (n.includes('flok')) return Scissors
  if (n.includes('make')) return Brush
  if (n.includes('masazh')) return Flower2
  if (n.includes('qerpik')) return Eye
  return Sparkles
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
        <h2 className="font-display text-2xl text-ink mb-3">
          Zgjidhni shërbimin që dëshironi
        </h2>
        <p className="text-clay">
          Zgjidhni nga shërbimet e disponueshme për të vazhduar me rezervimin
        </p>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-sand rounded-full flex items-center justify-center mb-4">
            <FileText size={26} strokeWidth={1.75} className="text-clay" aria-hidden="true" />
          </div>
          <h3 className="font-display text-lg text-ink mb-2">
            Nuk ka shërbime të disponueshme
          </h3>
          <p className="text-clay">
            Ky sallon nuk ka shërbime të konfiguruar ende.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5">
          {services.map((service) => {
            const Icon = serviceIcon(service.name)
            const isSelected = selectedService?.id === service.id
            return (
            <div
              key={service.id}
              onClick={() => onServiceSelect(service)}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
              className={`
                group relative cursor-pointer p-4 sm:p-6 rounded-lg border transition-all duration-200 touch-manipulation
                ${isSelected
                  ? 'border-accent bg-accent-soft/50 shadow-soft'
                  : hoveredService === service.id
                  ? 'border-clay/50 bg-paper shadow-soft -translate-y-0.5'
                  : 'border-linen bg-paper hover:border-clay/50 hover:shadow-soft'
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-accent rounded-full flex items-center justify-center shadow-soft">
                  <Check size={15} strokeWidth={2.5} className="text-white" aria-hidden="true" />
                </div>
              )}

              <div className="flex items-start justify-between">
                {/* Service Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold leading-6 text-ink">
                      {service.name}
                    </h3>

                    {/* Price Badge */}
                    <div className={`ml-4 flex-shrink-0 px-3 py-1 rounded-full text-sm font-semibold ${
                      isSelected
                        ? 'bg-accent text-white'
                        : 'bg-sand text-ink'
                    }`}>
                      {formatPrice(service.price)}
                    </div>
                  </div>

                  {/* Description */}
                  {service.description && (
                    <p className="text-sm mb-4 text-clay">
                      {service.description}
                    </p>
                  )}

                  {/* Duration and Additional Info */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock size={15} strokeWidth={1.75} className={isSelected ? 'text-accent' : 'text-clay/70'} aria-hidden="true" />
                      <span className="text-sm text-clay">
                        {formatDuration(service.duration_minutes)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BadgeCheck size={15} strokeWidth={1.75} className={isSelected ? 'text-accent' : 'text-clay/70'} aria-hidden="true" />
                      <span className="text-sm text-clay">
                        Profesional
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Icon */}
                <div className={`ml-6 w-14 h-14 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-accent' : 'bg-sand group-hover:bg-accent-soft'
                }`}>
                  <Icon
                    size={24}
                    strokeWidth={1.5}
                    className={isSelected ? 'text-white' : 'text-accent'}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {/* Next Step Hint */}
      {selectedService && (
        <div className="mt-8 p-4 bg-success/5 border border-success/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Check size={18} strokeWidth={2} className="text-success flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-ink text-sm font-medium">
                Shërbimi &quot;{selectedService.name}&quot; u zgjodh!
              </p>
              <p className="text-clay text-xs mt-1">
                Shtypni &quot;Vazhdo&quot; për të zgjedhur datën dhe orën.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
