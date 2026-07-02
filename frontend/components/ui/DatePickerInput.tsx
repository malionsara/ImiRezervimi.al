// frontend/components/ui/DatePickerInput.tsx
// Beautiful date picker component using react-datepicker for ImiRezervimi.al
// Mobile-friendly with Albanian localization

import { useState, forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import { CalendarDays } from 'lucide-react'
import 'react-datepicker/dist/react-datepicker.css'

interface DatePickerInputProps {
  selected?: Date | null
  onChange: (date: Date | null) => void
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
  error?: string
  required?: boolean
}

// Custom input component for better styling
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder, className, error, label, required }, ref) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-ink mb-2">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      <input
        ref={ref}
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        readOnly
        className={`
          w-full p-3 border border-linen rounded bg-paper
          focus:ring-2 focus:ring-accent/25 focus:border-accent
          text-base cursor-pointer touch-manipulation
          ${error ? 'border-danger focus:ring-danger/25' : ''}
          ${className || ''}
        `}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <CalendarDays size={18} strokeWidth={1.75} className="text-clay" aria-hidden="true" />
      </div>
    </div>
    {error && (
      <p className="mt-1 text-sm text-danger">{error}</p>
    )}
  </div>
))

CustomInput.displayName = 'CustomInput'

export default function DatePickerInput({
  selected,
  onChange,
  minDate,
  maxDate,
  placeholder = "Zgjidhni datën",
  disabled = false,
  className = "",
  label,
  error,
  required = false
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Albanian day names
  const dayNames = ['Dje', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht']
  const dayNamesShort = ['D', 'H', 'M', 'M', 'E', 'P', 'S']
  const monthNames = [
    'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
    'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'
  ]
  const monthNamesShort = [
    'Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer',
    'Kor', 'Gus', 'Sht', 'Tet', 'Nën', 'Dhj'
  ]

  return (
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={(date) => {
          onChange(date)
          setIsOpen(false)
        }}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        customInput={
          <CustomInput 
            placeholder={placeholder}
            className={className}
            error={error}
            label={label}
            required={required}
          />
        }
        open={isOpen}
        onInputClick={() => !disabled && setIsOpen(true)}
        onClickOutside={() => setIsOpen(false)}
        // Custom Albanian day/month names via formatWeekDay and other props
        formatWeekDay={(nameOfDay) => {
          const dayIndex = ['Së', 'Hë', 'Ma', 'Më', 'Ej', 'Pr', 'Sh'].indexOf(nameOfDay.slice(0, 2))
          return dayIndex >= 0 ? dayNamesShort[dayIndex] : nameOfDay
        }}
        // Custom styling and mobile optimization
        calendarClassName="react-datepicker-mobile"
        popperClassName="react-datepicker-popper-mobile"
        popperPlacement="bottom-start"
        showPopperArrow={false}
        fixedHeight
        // Mobile-friendly props
        shouldCloseOnSelect={true}
        preventOpenOnFocus={true}
        // Highlight today
        todayButton="Sot"
        // Weekend highlighting
        highlightDates={[new Date()]}
        // Format for display
        dateFormat="dd/MM/yyyy"
      />

    </div>
  )
}