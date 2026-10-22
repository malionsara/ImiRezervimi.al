/**
 * Remotion Composition for ImiRezervimi.al Showcase Video
 * Edits raw footage into polished showcase with browser chrome and animations
 *
 * Usage: npx remotion render src/index.tsx Showcase showcase/showcase-1920x1200.mp4
 */

import { Composition } from 'remotion'
import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile
} from 'remotion'

// ============================================
// CONFIGURATION
// ============================================

const SCENE_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1200,
  durationInFrames: 30 * 30, // 30 seconds at 30fps

  // Browser window dimensions
  browser: {
    width: 1600,
    titleBarHeight: 52,
    borderRadius: 12
  },

  // Stage background
  stageColor: '#0a0a0a',

  // Timing
  fadeInDuration: 0.5, // seconds
  fadeOutDuration: 0.5,

  // URLs for different sections
  urls: {
    homepage: 'imirezervimi.al',
    salons: 'imirezervimi.al/salons',
    booking: 'imirezervimi.al/klea-beauty-studio',
    dashboard: 'imirezervimi.al/salon/dashboard'
  }
}

// ============================================
// SCENE BREAKDOWN (in frames)
// ============================================

const SCENES = {
  homepage: { start: 0, duration: 240 }, // 8 seconds
  salons: { start: 240, duration: 210 }, // 7 seconds
  booking: { start: 450, duration: 300 }, // 10 seconds
  dashboard: { start: 750, duration: 150 } // 5 seconds
}

// ============================================
// BROWSER CHROME COMPONENT
// ============================================

interface BrowserChromeProps {
  url: string
  children: React.ReactNode
}

const BrowserChrome: React.FC<BrowserChromeProps> = ({ url, children }) => {
  return (
    <div
      style={{
        width: SCENE_CONFIG.browser.width,
        background: 'white',
        borderRadius: SCENE_CONFIG.browser.borderRadius,
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          height: SCENE_CONFIG.browser.titleBarHeight,
          background: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          justifyContent: 'space-between',
        }}
      >
        {/* Window controls */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#ff5f57',
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#febc2e',
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#28c840',
            }}
          />
        </div>

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            marginLeft: 60,
            marginRight: 60,
            height: 28,
            background: 'white',
            borderRadius: 6,
            border: '1px solid #d0d0d0',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            fontSize: 13,
            color: '#666',
          }}
        >
          <span style={{ marginRight: 8, opacity: 0.5 }}>🔒</span>
          {url}
        </div>

        <div style={{ width: 60 }} /> {/* Spacer */}
      </div>

      {/* Page content */}
      <div
        style={{
          width: '100%',
          height: SCENE_CONFIG.height - SCENE_CONFIG.browser.titleBarHeight - 100,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ============================================
// ANIMATED POINTER COMPONENT
// ============================================

interface PointerProps {
  x: number
  y: number
  clicking?: boolean
}

const AnimatedPointer: React.FC<PointerProps> = ({ x, y, clicking }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const scale = clicking
    ? spring({
        frame: frame % 10,
        fps,
        config: { damping: 15, mass: 0.1 },
      }) * 0.9
    : 1

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.9)',
        border: '2px solid rgba(0, 0, 0, 0.3)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        transform: `translate(-50%, -50%) scale(${scale})`,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {clicking && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            transform: 'translate(-50%, -50%)',
            animation: 'ripple 0.6s ease-out',
          }}
        />
      )}
    </div>
  )
}

// ============================================
// CAMERA ZOOM LOGIC
// ============================================

function getCameraScale(frame: number): number {
  // Zoom in during booking form (frames 500-650)
  if (frame >= 500 && frame <= 650) {
    const progress = (frame - 500) / 150
    return interpolate(progress, [0, 0.3, 0.7, 1], [1, 1.4, 1.4, 1], {
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  }

  // Zoom in during approval (frames 780-850)
  if (frame >= 780 && frame <= 850) {
    const progress = (frame - 780) / 70
    return interpolate(progress, [0, 0.3, 0.7, 1], [1, 1.5, 1.5, 1], {
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  }

  return 1
}

// ============================================
// MAIN SHOWCASE COMPOSITION
// ============================================

export const ShowcaseVideo: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // Calculate camera zoom
  const cameraScale = getCameraScale(frame)

  // Fade in/out
  const fadeInFrames = SCENE_CONFIG.fadeInDuration * fps
  const fadeOutFrames = SCENE_CONFIG.fadeOutDuration * fps

  const opacity = interpolate(
    frame,
    [0, fadeInFrames, durationInFrames - fadeOutFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // Determine current scene and URL
  let currentURL = SCENE_CONFIG.urls.homepage
  if (frame >= SCENES.salons.start && frame < SCENES.booking.start) {
    currentURL = SCENE_CONFIG.urls.salons
  } else if (frame >= SCENES.booking.start && frame < SCENES.dashboard.start) {
    currentURL = SCENE_CONFIG.urls.booking
  } else if (frame >= SCENES.dashboard.start) {
    currentURL = SCENE_CONFIG.urls.dashboard
  }

  return (
    <AbsoluteFill
      style={{
        background: SCENE_CONFIG.stageColor,
        opacity,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${cameraScale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <BrowserChrome url={currentURL}>
          {/* Page content placeholder */}
          {/* In production, this would load the actual recorded frames */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              color: '#ec4899',
              fontWeight: 'bold',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {frame < SCENES.salons.start && '🏠 Homepage'}
            {frame >= SCENES.salons.start && frame < SCENES.booking.start && '💅 Sallone'}
            {frame >= SCENES.booking.start && frame < SCENES.dashboard.start && '📝 Rezervo'}
            {frame >= SCENES.dashboard.start && '📊 Dashboard'}
          </div>
        </BrowserChrome>
      </div>

      {/* Animated pointer - position based on scene */}
      {frame > 60 && (
        <AnimatedPointer
          x={SCENE_CONFIG.width / 2}
          y={SCENE_CONFIG.height / 2}
          clicking={frame % 60 < 10}
        />
      )}
    </AbsoluteFill>
  )
}

// ============================================
// REMOTION COMPOSITION REGISTRATION
// ============================================

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Showcase"
        component={ShowcaseVideo}
        durationInFrames={SCENE_CONFIG.durationInFrames}
        fps={SCENE_CONFIG.fps}
        width={SCENE_CONFIG.width}
        height={SCENE_CONFIG.height}
      />
    </>
  )
}
