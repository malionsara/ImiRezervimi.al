import React from 'react'
import { AbsoluteFill, Composition, OffthreadVideo, registerRoot, Sequence, staticFile, useCurrentFrame } from 'remotion'

const STAGE_BG = '#0b0b0c'
const WIN = { x: 160, y: 74, w: 1600, bar: 52, pageH: 1000 }

const Pointer = ({ x, y, press, ripple }) => (
  <>
    {ripple !== null && (
      <div style={{
        position: 'absolute', left: x, top: y, width: 64, height: 64, marginLeft: -32, marginTop: -32, borderRadius: '50%',
        background: 'rgba(26, 22, 20, 0.16)', border: '2px solid rgba(26, 22, 20, 0.28)',
        transform: `scale(${0.25 + ripple * 0.9})`, opacity: 1 - ripple,
      }} />
    )}
    <svg width="30" height="30" viewBox="0 0 24 24" style={{
      position: 'absolute', left: x - 5, top: y - 3, transform: `scale(${1 - press * 0.16})`, transformOrigin: '5px 3px',
      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))', overflow: 'visible',
    }}>
      <path d="M5 3 L5 19.5 L9.3 15.6 L12.1 21.6 L14.8 20.4 L12.1 14.6 L17.9 14.6 Z" fill="#111" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  </>
)

const Window = ({ url, children }) => (
  <div style={{
    position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.bar + WIN.pageH, borderRadius: 14, overflow: 'hidden',
    background: '#fff', boxShadow: '0 40px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)',
  }}>
    <div style={{
      height: WIN.bar, background: '#f2efea', borderBottom: '1px solid #e2ddd5', display: 'flex', alignItems: 'center', position: 'relative',
    }}>
      <div style={{ display: 'flex', gap: 9, marginLeft: 22 }}>
        {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 13, height: 13, borderRadius: '50%', background: c }} />)}
      </div>
      <div style={{
        position: 'absolute', left: '50%', top: 10, transform: 'translateX(-50%)', height: 32, minWidth: 460, padding: '0 18px',
        borderRadius: 9, background: '#e6e1d9', color: '#3d3a36', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        font: '500 15px/1 -apple-system, "Segoe UI", Inter, Helvetica, Arial, sans-serif', letterSpacing: 0.1,
      }}>
        <svg width="12" height="14" viewBox="0 0 12 14"><rect x="1" y="6" width="10" height="7.5" rx="1.6" fill="#7a746c" /><path d="M3.3 6V4.3a2.7 2.7 0 0 1 5.4 0V6" stroke="#7a746c" strokeWidth="1.5" fill="none" /></svg>
        {url}
      </div>
    </div>
    <div style={{ position: 'relative', width: WIN.w, height: WIN.pageH, overflow: 'hidden', background: '#f9f7f3' }}>{children}</div>
  </div>
)

export const Showcase = ({ frames }) => {
  const f = useCurrentFrame()
  const d = frames[f]
  const top = d.layers.reduce((a, l) => (l.opacity >= (a?.opacity ?? 0) ? l : a), null)
  return (
    <AbsoluteFill style={{ background: STAGE_BG }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: d.opacity, transformOrigin: '0 0',
        transform: `translate(${d.cam.tx}px, ${d.cam.ty}px) scale(${d.cam.z})`,
      }}>
        <Window url={top?.url ?? 'imirezervimi.al'}>
          {d.layers.map((l, i) => (
            <div key={i} style={{ position: 'absolute', inset: 0, opacity: l.opacity }}>
              {/* Offsetting the sequence makes the video's local frame equal l.frame (Freeze clamps to the composition length). */}
              <Sequence from={f - l.frame} layout="none">
                <OffthreadVideo src={staticFile('master.mp4')} muted style={{ width: WIN.w, height: WIN.pageH, display: 'block' }} />
              </Sequence>
              {l.pointer && <Pointer {...l.pointer} />}
            </div>
          ))}
        </Window>
      </div>
    </AbsoluteFill>
  )
}

const Root = () => (
  <Composition
    id="Showcase" component={Showcase} fps={30} width={1920} height={1200} durationInFrames={1}
    defaultProps={{ frames: [] }}
    calculateMetadata={({ props }) => ({ durationInFrames: props.frames.length })}
  />
)
registerRoot(Root)
