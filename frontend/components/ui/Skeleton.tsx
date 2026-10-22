import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export default function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded bg-sand', className)}
      aria-hidden="true"
      {...props}
    />
  )
}
