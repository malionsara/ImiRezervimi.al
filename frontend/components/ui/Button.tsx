import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded transition-colors duration-200 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:opacity-50 disabled:pointer-events-none touch-manipulation'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-strong',
  secondary: 'bg-ink text-cream hover:bg-ink/85',
  outline: 'border border-linen bg-paper text-ink hover:border-clay hover:bg-sand/50',
  ghost: 'text-ink hover:bg-sand/70',
  danger: 'bg-danger text-white hover:bg-accent-strong',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3.5 py-2 min-h-[36px]',
  md: 'text-sm sm:text-base px-5 py-2.5 min-h-[44px]',
  lg: 'text-base px-7 py-3.5 min-h-[48px]',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
  className?: string
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type LinkButtonProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

const Button = forwardRef<HTMLButtonElement, ButtonProps | LinkButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, className, children, ...props },
  ref
) {
  const classes = cn(base, variants[variant], sizes[size], className)

  if ('href' in props && typeof props.href === 'string') {
    const { href, ...anchorProps } = props as LinkButtonProps
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    )
  }

  const { type = 'button', disabled, ...buttonProps } = props as ButtonProps
  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...buttonProps}
    >
      {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
})

export default Button
