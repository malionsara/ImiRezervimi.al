import { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/cn'

interface HeroVideoProps {
  src: string
  poster: string
  alt: string
  className?: string
  /** When false, only plays once scrolled into view (for below-fold accent clips) */
  eager?: boolean
}

/**
 * Ambient background video with a poster-first strategy:
 * - renders the poster image first (LCP-friendly)
 * - swaps in the muted looping video once mounted, unless the user
 *   prefers reduced motion
 * - degrades silently (container background shows) while media assets
 *   are missing, so pages can ship ahead of generation
 */
export default function HeroVideo({ src, poster, alt, className, eager = true }: HeroVideoProps) {
  const [showVideo, setShowVideo] = useState(false)
  const [posterOk, setPosterOk] = useState(true)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    if (eager) {
      setShowVideo(true)
      return
    }

    const el = wrapperRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShowVideo(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [eager])

  return (
    <div ref={wrapperRef} className={cn('relative overflow-hidden', className)}>
      {posterOk && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading={eager ? 'eager' : 'lazy'}
          onError={() => setPosterOk(false)}
        />
      )}
      {showVideo && (
        <video
          src={src}
          poster={posterOk ? poster : undefined}
          muted
          loop
          playsInline
          autoPlay
          preload={eager ? 'metadata' : 'none'}
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
