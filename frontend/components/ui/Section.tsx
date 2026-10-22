import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'
import Container from './Container'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: 'cream' | 'sand' | 'paper' | 'ink'
  containerSize?: 'default' | 'narrow' | 'wide'
}

const tones = {
  cream: 'bg-cream',
  sand: 'bg-sand',
  paper: 'bg-paper',
  ink: 'bg-ink text-cream',
}

export default function Section({
  tone = 'cream',
  containerSize = 'default',
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn('py-14 sm:py-20 lg:py-24', tones[tone], className)} {...props}>
      <Container size={containerSize}>{children}</Container>
    </section>
  )
}

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
  dark?: boolean
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  dark = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-10 sm:mb-14 max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            'text-xs font-medium uppercase tracking-[0.2em] mb-3',
            dark ? 'text-cream/60' : 'text-accent'
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight tracking-tight',
          dark ? 'text-cream' : 'text-ink'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn('mt-4 text-base sm:text-lg', dark ? 'text-cream/70' : 'text-clay')}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
