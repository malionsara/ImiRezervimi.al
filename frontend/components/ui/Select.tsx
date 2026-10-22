import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid = false, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        'form-select w-full rounded border-linen bg-paper text-ink',
        'min-h-[44px] text-base sm:text-sm px-4 py-2.5 transition-colors',
        'focus:border-accent focus:ring-2 focus:ring-accent/25',
        invalid && 'border-danger focus:border-danger focus:ring-danger/25',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
})

export default Select
