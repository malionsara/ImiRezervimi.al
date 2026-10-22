import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid = false, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'form-textarea w-full rounded border-linen bg-paper text-ink placeholder:text-clay/60',
        'text-base sm:text-sm px-4 py-2.5 transition-colors',
        'focus:border-accent focus:ring-2 focus:ring-accent/25',
        invalid && 'border-danger focus:border-danger focus:ring-danger/25',
        className
      )}
      {...props}
    />
  )
})

export default Textarea
