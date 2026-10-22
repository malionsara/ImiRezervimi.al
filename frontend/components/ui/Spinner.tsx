import { cn } from '../../utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
}

export default function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div className="inline-flex flex-col items-center gap-3" role="status">
      <div
        className={cn(
          'animate-spin rounded-full border-accent border-t-transparent',
          sizes[size],
          className
        )}
        aria-hidden="true"
      />
      {label ? <span className="text-sm text-clay">{label}</span> : <span className="sr-only">Po ngarkohet...</span>}
    </div>
  )
}
