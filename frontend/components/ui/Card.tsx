import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export default function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-paper rounded-lg border border-linen shadow-soft',
        interactive &&
          'transition-all duration-300 hover:shadow-lifted hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pt-5 sm:px-6 sm:pt-6', className)} {...props} />
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-5 sm:px-6 sm:py-6', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-5 pb-5 sm:px-6 sm:pb-6 pt-4 border-t border-linen', className)}
      {...props}
    />
  )
}
