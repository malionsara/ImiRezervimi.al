import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
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
 * - renders the poster image (LCP-friendly, works with next/image)
 * - swaps in the muted looping video once mounted, unless the user
 *   prefers reduced motion
 */
export default function HeroVideo({ src, poster, alt, className, eager = true }: HeroVideoProps) {
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
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
      <Image
        src={poster}
        alt={alt}
        fill
        priority={eager}
        sizes="100vw"
        className="object-cover"
      />
      {showVideo && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
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
