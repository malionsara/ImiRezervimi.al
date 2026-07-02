import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid = false, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'form-input w-full rounded border-linen bg-paper text-ink placeholder:text-clay/60',
        'min-h-[44px] text-base sm:text-sm px-4 py-2.5 transition-colors',
        'focus:border-accent focus:ring-2 focus:ring-accent/25',
        invalid && 'border-danger focus:border-danger focus:ring-danger/25',
        className
      )}
      {...props}
    />
  )
})

export default Input
