import type { LabelHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export default function Label({ className, required = false, children, ...props }: LabelProps) {
  return (
    <label className={cn('block text-sm font-medium text-ink mb-1.5', className)} {...props}>
      {children}
      {required && <span className="text-accent ml-0.5">*</span>}
    </label>
  )
}
