// frontend/components/salon/ServiceConfig.js
// Service configuration component for salon registration

import { useState, useEffect } from 'react'

export default function ServiceConfig({ data, onChange, onNext, onPrev }) {
  const [services, setServices] = useState(data.services || [])
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration: 30,
    price: '',
    requiresApproval: true
  })
  const [errors, setErrors] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    setServices(data.services || [])
  }, [data.services])

  // Common Albanian beauty services
  const commonServices = [
    { name: 'Manikyr klasik', duration: 30, price: 15 },
    { name: 'Nail Art', duration: 45, price: 25 },
    { name: 'Gel Polish', duration: 40, price: 20 },
    { name: 'Pedikyr', duration: 45, price: 20 },
    { name: 'Ngjyrosje flokësh', duration: 90, price: 35 },
    { name: 'Pre flokësh', duration: 120, price: 45 },
    { name: 'Stilim flokësh', duration: 60, price: 25 },
    { name: 'Trajtim flokësh', duration: 75, price: 30 },
    { name: 'Makyazh', duration: 45, price: 30 },
    { name: 'Depilim me dylbi', duration: 30, price: 18 },
    { name: 'Masazh relaksues', duration: 60, price: 40 },
    { name: 'Trajtim fytyre', duration: 90, price: 35 }
  ]

  const validateService = (service) => {
    const serviceErrors = {}

    if (!service.name.trim()) {
      serviceErrors.name = 'Emri i shërbimit është i detyrueshëm'
    }

    if (!service.duration || service.duration < 15 || service.duration > 480) {
      serviceErrors.duration = 'Kohëzgjatja duhet të jetë midis 15 dhe 480 minutave'
    }

    if (service.price && (isNaN(service.price) || service.price < 0)) {
      serviceErrors.price = 'Çmimi duhet të jetë një numër pozitiv'
    }

    return serviceErrors
  }

  const handleAddService = () => {
    const serviceErrors = validateService(newService)
    
    if (Object.keys(serviceErrors).length > 0) {
      setErrors(serviceErrors)
      return
    }

    const updatedServices = [...services, { 
      ...newService, 
      id: Date.now(), // Temporary ID
      price: newService.price ? parseFloat(newService.price) : null
    }]
    
    setServices(updatedServices)
    onChange({ ...data, services: updatedServices })
    
    // Reset form
    setNewService({
      name: '',
      description: '',
      duration: 30,
      price: '',
      requiresApproval: true
    })
    setErrors({})
    setShowAddForm(false)
  }

  const handleQuickAdd = (service) => {
    const updatedServices = [...services, { 
      ...service, 
      id: Date.now(), // Temporary ID
      description: '',
      requiresApproval: true
    }]
    
    setServices(updatedServices)
    onChange({ ...data, services: updatedServices })
  }

  const handleRemoveService = (index) => {
    const updatedServices = services.filter((_, i) => i !== index)
    setServices(updatedServices)
    onChange({ ...data, services: updatedServices })
  }

  const handleEditService = (index, field, value) => {
    const updatedServices = [...services]
    updatedServices[index] = { 
      ...updatedServices[index], 
      [field]: field === 'price' ? (value ? parseFloat(value) : null) : value
    }
    setServices(updatedServices) 
    onChange({ ...data, services: updatedServices })
  }

  const handleInputChange = (field, value) => {
    setNewService(prev => ({ 
      ...prev, 
      [field]: field === 'duration' ? parseInt(value) || 30 : value
    }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleNext = () => {
    onNext()
  }

  return (
    <div className="bg-paper rounded-lg shadow-soft p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-ink mb-2">Konfigurimi i shërbimeve</h3>
        <p className="text-clay">
          Shtoni shërbimet që ofron salloni juaj. Mund të shtoni më shumë më vonë.
        </p>
      </div>

      {/* Quick Add Common Services */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-ink mb-4">Shërbime të zakonshme</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {commonServices.map((service, index) => (
            <button
              key={index}
              onClick={() => handleQuickAdd(service)}
              className="text-left p-3 border border-linen rounded-lg hover:border-accent/40 hover:bg-accent-soft/60 transition-colors"
            >
              <div className="font-medium text-ink">{service.name}</div>
              <div className="text-sm text-clay">
                {service.duration} min • {service.price}€
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Services */}
      {services.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-ink mb-4">Shërbimet e shtuara</h4>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="border border-linen rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Emri i shërbimit
                    </label>
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => handleEditService(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-linen rounded focus:ring-2 focus:ring-accent/25 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Kohëzgjatja (min)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="480"
                      value={service.duration}
                      onChange={(e) => handleEditService(index, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border border-linen rounded focus:ring-2 focus:ring-accent/25 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Çmimi (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={service.price || ''}
                      onChange={(e) => handleEditService(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-linen rounded focus:ring-2 focus:ring-accent/25 focus:border-transparent"
                      placeholder="Opsionale"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => handleRemoveService(index)}
                      className="px-4 py-2 text-accent hover:text-red-800 hover:bg-accent-soft/60 rounded transition-colors"
                    >
                      Hiq
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-ink mb-1">
                    Përshkrimi (opsional)
                  </label>
                  <textarea
                    value={service.description || ''}
                    onChange={(e) => handleEditService(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-linen rounded focus:ring-2 focus:ring-accent/25 focus:border-transparent"
                    placeholder="Përshkruani shërbimin..."
                  />
                </div>

                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={service.requiresApproval}
                      onChange={(e) => handleEditService(index, 'requiresApproval', e.target.checked)}
                      className="mr-2 rounded border-linen text-accent focus:ring-accent/25"
                    />
                    <span className="text-sm text-ink">Kërkon aprovim manual</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Service */}
      <div className="mb-8">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 text-accent border border-accent/40 rounded-lg hover:bg-accent-soft/60 transition-colors"
          >
            <span className="mr-2">+</span>
            Shto shërbim të personalizuar
          </button>
        ) : (
          <div className="border border-linen rounded-lg p-4">
            <h5 className="font-semibold text-ink mb-4">Shto shërbim të ri</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Emri i shërbimit *
                </label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-accent/25 focus:border-transparent ${
                    errors.name ? 'border-accent' : 'border-linen'
                  }`}
                  placeholder="p.sh. Trajtim special"
                />
                {errors.name && <p className="mt-1 text-sm text-accent">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Kohëzgjatja (min) *
                </label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={newService.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-accent/25 focus:border-transparent ${
                    errors.duration ? 'border-accent' : 'border-linen'
                  }`}
                />
                {errors.duration && <p className="mt-1 text-sm text-accent">{errors.duration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Çmimi (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newService.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-accent/25 focus:border-transparent ${
                    errors.price ? 'border-accent' : 'border-linen'
                  }`}
                  placeholder="Opsionale"
                />
                {errors.price && <p className="mt-1 text-sm text-accent">{errors.price}</p>}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-ink mb-1">
                Përshkrimi (opsional)
              </label>
              <textarea
                value={newService.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-linen rounded focus:ring-2 focus:ring-accent/25 focus:border-transparent"
                placeholder="Përshkruani shërbimin..."
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newService.requiresApproval}
                  onChange={(e) => handleInputChange('requiresApproval', e.target.checked)}
                  className="mr-2 rounded border-linen text-accent focus:ring-accent/25"
                />
                <span className="text-sm text-ink">Kërkon aprovim manual</span>
              </label>
              <p className="text-xs text-clay ml-6">
                Nëse është i aktivizuar, rezervimet për këtë shërbim do të presin aprovimin tuaj
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAddService}
                className="px-4 py-2 bg-accent text-white rounded hover:bg-accent transition-colors"
              >
                Shto shërbimin
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setErrors({})
                  setNewService({
                    name: '',
                    description: '',
                    duration: 30,
                    price: '',
                    requiresApproval: true
                  })
                }}
                className="px-4 py-2 border border-linen text-ink rounded hover:bg-cream transition-colors"
              >
                Anulo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Business Settings */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-ink mb-4">Cilësimet e biznesit</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Rezervime deri në (ditë)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={data.maxAdvanceDays}
              onChange={(e) => onChange({ ...data, maxAdvanceDays: parseInt(e.target.value) || 10 })}
              className="w-full px-3 py-2 border border-linen rounded focus:ring-2 focus:ring-accent/25 focus:border-transparent"
            />
            <p className="text-xs text-clay mt-1">
              Sa ditë përpara mund të rezervojnë klientët
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Anulim minimum (minuta)
            </label>
            <input
              type="number"
              min="0"
              max="1440"
              value={data.minCancellationMinutes}
              onChange={(e) => onChange({ ...data, minCancellationMinutes: parseInt(e.target.value) || 30 })}
              className="w-full px-3 py-2 border border-linen rounded focus:ring-2 focus:ring-accent/25 focus:border-transparent"
            />
            <p className="text-xs text-clay mt-1">
              Koha minimale për anulim pa penalitet
            </p>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.autoApproveVips}
                onChange={(e) => onChange({ ...data, autoApproveVips: e.target.checked })}
                className="mr-2 rounded border-linen text-accent focus:ring-accent/25"
              />
              <span className="text-sm font-medium text-ink">
                Aprovo automatikisht klientët VIP
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mb-8 p-4 bg-accent-soft/40 border border-accent/25 rounded-lg">
        <div className="flex items-start">
          
          <div>
            <h5 className="font-semibold text-blue-900">Këshillë</h5>
            <p className="text-accent-strong text-sm">
              Mund të shtoni, modifikoni ose hiqni shërbimet në çdo kohë nga paneli i kontrollit.
              Çmimet janë opsionale dhe mund t&apos;i vendosni më vonë.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-linen text-ink rounded-lg font-medium hover:bg-cream transition-colors"
        >
          Kthehu prapa
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent transition-colors"
        >
          Vazhdo në rishikim
        </button>
      </div>
    </div>
  )
}