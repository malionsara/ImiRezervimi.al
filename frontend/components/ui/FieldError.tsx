import { AlertCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

interface FieldErrorProps {
  message?: string
  className?: string
}

export default function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null
  return (
    <p className={cn('flex items-center gap-1.5 text-sm text-danger mt-1.5', className)} role="alert">
      <AlertCircle size={15} strokeWidth={1.75} aria-hidden="true" />
      {message}
    </p>
  )
}
