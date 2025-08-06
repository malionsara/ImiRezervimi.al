// frontend/components/salon/WorkingHoursConfig.tsx
// Salon working hours configuration interface
// Albanian Beauty Salon Booking Platform

import { useState, useEffect } from 'react'
import { WorkingHours, DayHours, DayOfWeek } from '../../types/database'
import { updateWorkingHours, getAlbanianDayName } from '../../lib/availability'

// ==============================================
// TYPES AND INTERFACES
// ==============================================
interface WorkingHoursConfigProps {
  salonId: string
  initialWorkingHours: WorkingHours
  onSave: (workingHours: WorkingHours) => void
  onCancel?: () => void
  isLoading?: boolean
}

interface TimeInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

// ==============================================
// COMPONENTS
// ==============================================

/**
 * Time input component with validation
 */
const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, placeholder = "09:00", disabled = false }) => {
  const [localValue, setLocalValue] = useState(value)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    const valid = timeRegex.test(newValue) || newValue === ''
    setIsValid(valid)

    if (valid) {
      onChange(newValue)
    }
  }

  return (
    <input
      type="time"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
        isValid 
          ? 'border-gray-300' 
          : 'border-red-300 bg-red-50'
      } ${
        disabled 
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
          : 'bg-white'
      }`}
    />
  )
}

// ==============================================
// MAIN COMPONENT
// ==============================================
export default function WorkingHoursConfig({
  salonId,
  initialWorkingHours,
  onSave,
  onCancel,
  isLoading = false
}: WorkingHoursConfigProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHours>(initialWorkingHours)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Days configuration with Albanian names
  const days: { key: DayOfWeek; name: string; shortName: string }[] = [
    { key: 'monday', name: 'E hënë', shortName: 'Hën' },
    { key: 'tuesday', name: 'E martë', shortName: 'Mar' },
    { key: 'wednesday', name: 'E mërkurë', shortName: 'Mër' },
    { key: 'thursday', name: 'E enjte', shortName: 'Enj' },
    { key: 'friday', name: 'E premte', shortName: 'Pre' },
    { key: 'saturday', name: 'E shtunë', shortName: 'Sht' },
    { key: 'sunday', name: 'E dielë', shortName: 'Die' }
  ]

  // ==============================================
  // EFFECTS
  // ==============================================
  useEffect(() => {
    setWorkingHours(initialWorkingHours)
    setHasChanges(false)
  }, [initialWorkingHours])

  // ==============================================
  // EVENT HANDLERS
  // ==============================================
  const handleDayToggle = (day: DayOfWeek) => {
    const updated = {
      ...workingHours,
      [day]: {
        ...workingHours[day],
        closed: !workingHours[day].closed
      }
    }
    setWorkingHours(updated)
    setHasChanges(true)

    // Clear any errors for this day
    if (errors[day]) {
      const newErrors = { ...errors }
      delete newErrors[day]
      setErrors(newErrors)
    }
  }

  const handleTimeChange = (day: DayOfWeek, field: 'open' | 'close', value: string) => {
    const updated = {
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [field]: value
      }
    }
    setWorkingHours(updated)
    setHasChanges(true)

    // Validate the change
    validateDayHours(day, updated[day])
  }

  const validateDayHours = (day: DayOfWeek, dayHours: DayHours) => {
    const newErrors = { ...errors }

    if (!dayHours.closed) {
      // Validate open/close times
      if (!dayHours.open || !dayHours.close) {
        newErrors[day] = 'Koha e hapjes dhe mbylljes është e detyrueshme'
      } else if (dayHours.open >= dayHours.close) {
        newErrors[day] = 'Koha e hapjes duhet të jetë para kohës së mbylljes'
      } else {
        delete newErrors[day]
      }
    } else {
      delete newErrors[day]
    }

    setErrors(newErrors)
  }

  const validateAllDays = (): boolean => {
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    for (const day of days) {
      const dayHours = workingHours[day.key]
      if (!dayHours.closed) {
        if (!dayHours.open || !dayHours.close) {
          newErrors[day.key] = 'Koha e hapjes dhe mbylljes është e detyrueshme'
          hasErrors = true
        } else if (dayHours.open >= dayHours.close) {
          newErrors[day.key] = 'Koha e hapjes duhet të jetë para kohës së mbylljes'
          hasErrors = true
        }
      }
    }

    setErrors(newErrors)
    return !hasErrors
  }

  const handleSave = async () => {
    if (!validateAllDays()) {
      return
    }

    setSaving(true)
    try {
      await updateWorkingHours(salonId, workingHours)
      onSave(workingHours)
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving working hours:', error)
      alert('Gabim në ruajtjen e orëve të punës. Ju lutemi provoni përsëri.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setWorkingHours(initialWorkingHours)
    setHasChanges(false)
    setErrors({})
    if (onCancel) {
      onCancel()
    }
  }

  const handleCopyToAll = (sourceDay: DayOfWeek) => {
    const sourceHours = workingHours[sourceDay]
    const updated = { ...workingHours }
    
    days.forEach(day => {
      if (day.key !== sourceDay) {
        updated[day.key] = { ...sourceHours }
      }
    })
    
    setWorkingHours(updated)
    setHasChanges(true)
  }

  const handleSetCommonHours = (preset: 'weekdays' | 'weekend' | 'everyday') => {
    const updated = { ...workingHours }

    switch (preset) {
      case 'weekdays':
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
          updated[day as DayOfWeek] = { open: '09:00', close: '18:00', closed: false }
        });
        ['saturday', 'sunday'].forEach(day => {
          updated[day as DayOfWeek] = { open: '10:00', close: '16:00', closed: false }
        })
        break
      case 'weekend':
        ['saturday', 'sunday'].forEach(day => {
          updated[day as DayOfWeek] = { open: '10:00', close: '16:00', closed: false }
        })
        break
      case 'everyday':
        days.forEach(day => {
          updated[day.key] = { open: '09:00', close: '18:00', closed: false }
        })
        break
    }

    setWorkingHours(updated)
    setHasChanges(true)
  }

  // ==============================================
  // RENDER
  // ==============================================
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Orët e punës</h3>
          <p className="text-sm text-gray-600 mt-1">
            Konfiguroni orët e punës për secilën ditë të javës
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSetCommonHours('weekdays')}
            className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            disabled={saving || isLoading}
          >
            Ditët e javës
          </button>
          <button
            onClick={() => handleSetCommonHours('everyday')}
            className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            disabled={saving || isLoading}
          >
            Çdo ditë
          </button>
        </div>
      </div>

      {/* Days configuration */}
      <div className="space-y-4">
        {days.map((day) => {
          const dayHours = workingHours[day.key]
          const hasError = errors[day.key]

          return (
            <div
              key={day.key}
              className={`border rounded-lg p-4 transition-colors ${
                hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Day name and toggle */}
                <div className="flex items-center gap-4">
                  <div className="w-16">
                    <span className="font-medium text-gray-900">{day.name}</span>
                    <span className="block text-xs text-gray-500 md:hidden">{day.shortName}</span>
                  </div>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!dayHours.closed}
                      onChange={() => handleDayToggle(day.key)}
                      disabled={saving || isLoading}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {dayHours.closed ? 'E mbyllur' : 'E hapur'}
                    </span>
                  </label>
                </div>

                {/* Time inputs */}
                {!dayHours.closed && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 hidden sm:inline">Nga:</span>
                      <TimeInput
                        value={dayHours.open}
                        onChange={(value) => handleTimeChange(day.key, 'open', value)}
                        disabled={saving || isLoading}
                      />
                    </div>
                    
                    <span className="text-gray-400">-</span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 hidden sm:inline">Deri:</span>
                      <TimeInput
                        value={dayHours.close}
                        onChange={(value) => handleTimeChange(day.key, 'close', value)}
                        disabled={saving || isLoading}
                      />
                    </div>

                    {/* Copy to all button */}
                    <button
                      onClick={() => handleCopyToAll(day.key)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Kopjo për të gjitha ditët"
                      disabled={saving || isLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Error message */}
              {hasError && (
                <div className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {hasError}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary and actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        {/* Working days summary */}
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">Ditët e punës:</span>{' '}
          {days
            .filter(day => !workingHours[day.key].closed)
            .map(day => day.shortName)
            .join(', ') || 'Asnjë ditë e zgjedhur'}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          {onCancel && (
            <button
              onClick={handleCancel}
              disabled={saving || isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anulo
            </button>
          )}
          
          <button
            onClick={handleSave}
            disabled={saving || isLoading || !hasChanges || Object.keys(errors).length > 0}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Po ruhet...
              </>
            ) : (
              'Ruaj ndryshimet'
            )}
          </button>
        </div>

        {/* Help text */}
        <div className="mt-4 text-xs text-gray-500">
          <p>💡 Këshilla: Përdorni butonat e kopjimit për të aplikuar të njëjtat orë në ditë të ndryshme.</p>
          <p>⚠️ Ndryshimet do të aplikohen vetëm për rezervimet e ardhshme.</p>
        </div>
      </div>
    </div>
  )
}