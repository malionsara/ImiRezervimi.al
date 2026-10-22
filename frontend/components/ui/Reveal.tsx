import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface RevealProps {
  children: ReactNode
  /** Stagger delay in ms */
  delay?: number
  className?: string
}

/**
 * Scroll-reveal wrapper: content fades up softly the first time it enters
 * the viewport. Renders visible immediately for users who prefer reduced
 * motion, and during SSR (so content is never hidden without JS).
 */
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Start revealed; flip to hidden only once JS confirms we can animate.
  const [state, setState] = useState<'ssr' | 'hidden' | 'shown'>('ssr')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const el = ref.current
    if (!el) return

    // Already in view on mount (above the fold) — don't hide it.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.9) return

    setState('hidden')
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setState('shown')
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform',
        state === 'hidden' && 'opacity-0 translate-y-6',
        state === 'shown' && 'opacity-100 translate-y-0',
        className
      )}
      style={delay && state !== 'ssr' ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
