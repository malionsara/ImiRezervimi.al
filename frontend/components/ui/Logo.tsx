import Image from 'next/image'
import Link from 'next/link'
import { cn } from '../../utils/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  withWordmark?: boolean
  tagline?: string
  href?: string
  dark?: boolean
  className?: string
}

const sizes = {
  sm: { img: 32, text: 'text-lg' },
  md: { img: 40, text: 'text-xl' },
  lg: { img: 56, text: 'text-2xl' },
}

export default function Logo({
  size = 'md',
  withWordmark = true,
  tagline,
  href = '/',
  dark = false,
  className,
}: LogoProps) {
  const s = sizes[size]

  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src="/brand/logo.png"
        alt="ImiRezervimi"
        width={s.img}
        height={s.img}
        className="rounded-sm"
        priority
      />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className={cn('font-display font-semibold tracking-tight', s.text, dark ? 'text-cream' : 'text-ink')}>
            ImiRezervimi
            <span className="text-accent">.al</span>
          </span>
          {tagline && (
            <span className={cn('text-[0.65rem] mt-1 tracking-wide', dark ? 'text-cream/60' : 'text-clay')}>
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center" aria-label="ImiRezervimi.al">
        {content}
      </Link>
    )
  }
  return content
}
