// frontend/components/salon/RegistrationForm.js
// Main salon registration form component with Albanian validation

import { useState, useEffect } from 'react'
import PhotoUpload from './PhotoUpload'

export default function RegistrationForm({ data, onChange, onNext }) {
  const [formData, setFormData] = useState(data)
  const [errors, setErrors] = useState({})
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    setFormData(data)
  }, [data])

  // Albanian phone number validation
  const validatePhone = (phone) => {
    const albanianPhoneRegex = /^\+355[6-9][0-9]{8}$/
    return albanianPhoneRegex.test(phone)
  }

  // Email validation
  const validateEmail = (email) => {
    if (!email) return true // Email is optional
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    return emailRegex.test(email)
  }

  // Slug validation (URL-friendly)
  const validateSlug = (slug) => {
    const slugRegex = /^[a-z0-9_-]+$/
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50
  }

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/-+/g, '_') // Replace hyphens with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
  }

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Emri i sallonit është i detyrueshëm'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'URL slug është i detyrueshëm'
    } else if (!validateSlug(formData.slug)) {
      newErrors.slug = 'URL slug duhet të përmbajë vetëm shkronja të vogla, numra, - dhe _'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Numri i telefonit është i detyrueshëm'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Numri i telefonit duhet të jetë në formatin +355 XX XXX XXXX'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adresa është e detyrueshme'
    }

    // Optional field validations
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Formati i email-it nuk është i saktë'
    }

    if (formData.instagramHandle && !formData.instagramHandle.match(/^[a-zA-Z0-9._]+$/)) {
      newErrors.instagramHandle = 'Instagram handle duhet të përmbajë vetëm shkronja, numra, . dhe _'
    }

    if (formData.websiteUrl && !formData.websiteUrl.match(/^https?:\/\/.+/)) {
      newErrors.websiteUrl = 'Website URL duhet të fillojë me http:// ose https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value }
    
    // Auto-generate slug when name changes
    if (field === 'name' && value) {
      newFormData.slug = generateSlug(value)
    }

    // Format phone number
    if (field === 'phone') {
      let formattedPhone = value.replace(/\D/g, '') // Remove non-digits
      if (formattedPhone.startsWith('355')) {
        formattedPhone = '+' + formattedPhone
      } else if (formattedPhone.startsWith('0')) {
        formattedPhone = '+355' + formattedPhone.substring(1)
      } else if (!formattedPhone.startsWith('+355') && formattedPhone.length > 0) {
        formattedPhone = '+355' + formattedPhone
      }
      newFormData[field] = formattedPhone
    } else {
      newFormData[field] = value
    }

    setFormData(newFormData)
    onChange(newFormData)

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleWorkingHoursChange = (day, field, value) => {
    const newWorkingHours = {
      ...formData.workingHours,
      [day]: {
        ...formData.workingHours[day],
        [field]: value
      }
    }
    
    const newFormData = { ...formData, workingHours: newWorkingHours }
    setFormData(newFormData)
    onChange(newFormData)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsValidating(true)
    
    if (validateForm()) {
      onNext()
    }
    
    setIsValidating(false)
  }

  const dayNames = {
    monday: 'E hënë',
    tuesday: 'E martë', 
    wednesday: 'E mërkurë',
    thursday: 'E enjte',
    friday: 'E premte',
    saturday: 'E shtunë',
    sunday: 'E diel'
  }

  return (
    <div className="bg-paper rounded-lg shadow-soft p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-ink mb-4">Informacionet bazë</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Emri i sallonit *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent ${
                  errors.name ? 'border-accent' : 'border-linen'
                }`}
                placeholder="p.sh. Klea Nails Studio"
              />
              {errors.name && <p className="mt-1 text-sm text-accent">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                URL Slug *
              </label>
              <div className="flex items-center">
                <span className="text-sm text-clay mr-2">imirezervimi.al/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase())}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent ${
                    errors.slug ? 'border-accent' : 'border-linen'
                  }`}
                  placeholder="klea_nails"
                />
              </div>
              {errors.slug && <p className="mt-1 text-sm text-accent">{errors.slug}</p>}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Përshkrimi i sallonit
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-linen rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent"
            placeholder="Përshkruani shërbimet dhe atmosferën e sallonit tuaj..."
          />
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-ink mb-4">Informacionet e kontaktit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Numri i telefonit *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent ${
                  errors.phone ? 'border-accent' : 'border-linen'
                }`}
                placeholder="+355 XX XXX XXXX"
              />
              {errors.phone && <p className="mt-1 text-sm text-accent">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Email (opsional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent ${
                  errors.email ? 'border-accent' : 'border-linen'
                }`}
                placeholder="info@salloni.al"
              />
              {errors.email && <p className="mt-1 text-sm text-accent">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-lg font-semibold text-ink mb-4">Lokacioni</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-2">
                Adresa *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent ${
                  errors.address ? 'border-accent' : 'border-linen'
                }`}
                placeholder="Rruga Barrikadave, Tirana"
              />
              {errors.address && <p className="mt-1 text-sm text-accent">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Qyteti
              </label>
              <select
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-2 border border-linen rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent"
              >
                <option value="Tirana">Tirana</option>
                <option value="Durrës">Durrës</option>
                <option value="Vlorë">Vlorë</option>
                <option value="Shkodër">Shkodër</option>
                <option value="Elbasan">Elbasan</option>
                <option value="Korçë">Korçë</option>
                <option value="Fier">Fier</option>
                <option value="Berat">Berat</option>
                <option value="Gjirokastër">Gjirokastër</option>
                <option value="Kukës">Kukës</option>
                <option value="Lezhë">Lezhë</option>
                <option value="Dibër">Dibër</option>
              </select>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-ink mb-4">Rrjetet sociale (opsionale)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Instagram Handle
              </label>
              <div className="flex items-center">
                <span className="text-sm text-clay mr-2">@</span>
                <input
                  type="text"
                  value={formData.instagramHandle}
                  onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent ${
                    errors.instagramHandle ? 'border-accent' : 'border-linen'
                  }`}
                  placeholder="klea_nails_studio"
                />
              </div>
              {errors.instagramHandle && <p className="mt-1 text-sm text-accent">{errors.instagramHandle}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Facebook Page
              </label>
              <input
                type="text"
                value={formData.facebookPage}
                onChange={(e) => handleInputChange('facebookPage', e.target.value)}
                className="w-full px-4 py-2 border border-linen rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent"
                placeholder="facebook.com/klea.nails"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent ${
                  errors.websiteUrl ? 'border-accent' : 'border-linen'
                }`}
                placeholder="https://salloni.al"
              />
              {errors.websiteUrl && <p className="mt-1 text-sm text-accent">{errors.websiteUrl}</p>}
            </div>
          </div>
        </div>

        {/* Photos */}
        <div>
          <h3 className="text-lg font-semibold text-ink mb-4">Foto të sallonit (opsionale)</h3>
          <PhotoUpload
            photos={formData.photos || []}
            onChange={(photos) => handleInputChange('photos', photos)}
            maxPhotos={5}
          />
        </div>

        {/* Working Hours */}
        <div>
          <h3 className="text-lg font-semibold text-ink mb-4">Oraret e punës</h3>
          <div className="space-y-4">
            {Object.entries(formData.workingHours).map(([day, hours]) => (
              <div key={day} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="w-20 text-sm font-medium text-ink">
                  {dayNames[day]}
                </div>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      onChange={(e) => handleWorkingHoursChange(day, 'closed', !e.target.checked)}
                      className="mr-2 rounded border-linen text-accent focus:ring-accent/25"
                    />
                    <span className="text-sm text-ink">E hapur</span>
                  </label>
                </div>
                {!hours.closed && (
                  <div className="flex items-center gap-2 basis-full sm:basis-auto">
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                      className="min-w-0 flex-1 sm:flex-none px-3 py-1 border border-linen rounded focus:ring-2 focus:ring-accent/25 focus:border-transparent"
                    />
                    <span className="text-clay">-</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                      className="min-w-0 flex-1 sm:flex-none px-3 py-1 border border-linen rounded focus:ring-2 focus:ring-accent/25 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <h3 className="text-lg font-semibold text-ink mb-4">WhatsApp Integration</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.whatsappEnabled}
                  onChange={(e) => handleInputChange('whatsappEnabled', e.target.checked)}
                  className="mr-3 rounded border-linen text-accent focus:ring-accent/25"
                />
                <span className="text-sm font-medium text-ink">
                  Aktivizo njoftimet në WhatsApp
                </span>
              </label>
              <p className="text-sm text-clay mt-1">
                Klientët do të marrin konfirmimet e rezervimeve në WhatsApp
              </p>
            </div>

            {formData.whatsappEnabled && (
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Numri i WhatsApp (opsional)
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  className="w-full md:w-1/2 px-4 py-2 border border-linen rounded-lg focus:ring-2 focus:ring-accent/25 focus:border-transparent"
                  placeholder="+355 XX XXX XXXX"
                />
                <p className="text-sm text-clay mt-1">
                  Lëreni bosh për të përdorur numrin kryesor të telefonit
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isValidating}
            className="px-8 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? 'Po vërtetohet...' : 'Vazhdo në hapin tjetër'}
          </button>
        </div>
      </form>
    </div>
  )
}