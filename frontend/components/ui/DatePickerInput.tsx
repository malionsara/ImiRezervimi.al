// frontend/components/ui/DatePickerInput.tsx
// Beautiful date picker component using react-datepicker for ImiRezervimi.al
// Mobile-friendly with Albanian localization

import { useState, forwardRef } from 'react'
import DatePicker from 'react-datepicker'
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
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
          w-full p-3 border border-gray-300 rounded-xl 
          focus:ring-2 focus:ring-red-500 focus:border-transparent 
          text-base cursor-pointer touch-manipulation
          bg-white
          ${error ? 'border-red-300 focus:ring-red-500' : ''}
          ${className || ''}
        `}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
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

      {/* Custom CSS for mobile optimization */}
      <style jsx global>{`
        .react-datepicker-mobile {
          font-family: inherit;
          border: none;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          font-size: 16px;
        }

        .react-datepicker-popper-mobile {
          z-index: 9999;
        }

        .react-datepicker-mobile .react-datepicker__header {
          background: linear-gradient(135deg, #ef4444, #ec4899);
          border: none;
          border-radius: 12px 12px 0 0;
          color: white;
          padding: 16px;
        }

        .react-datepicker-mobile .react-datepicker__current-month {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-bottom: 8px;
        }

        .react-datepicker-mobile .react-datepicker__day-names {
          margin-top: 8px;
        }

        .react-datepicker-mobile .react-datepicker__day-name {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          font-size: 14px;
          width: 2.5rem;
          line-height: 2rem;
        }

        .react-datepicker-mobile .react-datepicker__navigation {
          top: 18px;
        }

        .react-datepicker-mobile .react-datepicker__navigation--previous {
          left: 16px;
          border-right-color: white;
        }

        .react-datepicker-mobile .react-datepicker__navigation--next {
          right: 16px;
          border-left-color: white;
        }

        .react-datepicker-mobile .react-datepicker__month-container {
          border-radius: 0 0 12px 12px;
        }

        .react-datepicker-mobile .react-datepicker__month {
          margin: 16px;
        }

        .react-datepicker-mobile .react-datepicker__week {
          margin: 0;
        }

        .react-datepicker-mobile .react-datepicker__day {
          width: 2.5rem;
          line-height: 2.5rem;
          margin: 0;
          border-radius: 8px;
          font-weight: 500;
          font-size: 16px;
          color: #374151;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          cursor: pointer;
        }

        .react-datepicker-mobile .react-datepicker__day:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .react-datepicker-mobile .react-datepicker__day--selected {
          background: linear-gradient(135deg, #ef4444, #ec4899) !important;
          color: white !important;
          font-weight: 600;
        }

        .react-datepicker-mobile .react-datepicker__day--keyboard-selected {
          background: #fef2f2;
          color: #dc2626;
        }

        .react-datepicker-mobile .react-datepicker__day--today {
          background: #dbeafe;
          color: #1d4ed8;
          font-weight: 600;
        }

        .react-datepicker-mobile .react-datepicker__day--disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }

        .react-datepicker-mobile .react-datepicker__day--disabled:hover {
          background: transparent;
          color: #d1d5db;
        }

        .react-datepicker-mobile .react-datepicker__day--outside-month {
          color: #d1d5db;
        }

        .react-datepicker-mobile .react-datepicker__today-button {
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          color: #374151;
          font-weight: 500;
          padding: 8px 16px;
          margin: 16px;
          margin-top: 0;
          cursor: pointer;
          transition: background 0.2s;
        }

        .react-datepicker-mobile .react-datepicker__today-button:hover {
          background: #e5e7eb;
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .react-datepicker-mobile {
            width: 100%;
            max-width: 340px;
          }
          
          .react-datepicker-mobile .react-datepicker__day {
            width: 2rem;
            line-height: 2rem;
            font-size: 14px;
          }
          
          .react-datepicker-mobile .react-datepicker__day-name {
            width: 2rem;
            line-height: 1.5rem;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}