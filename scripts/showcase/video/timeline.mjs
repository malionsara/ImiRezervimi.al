// Turns the recorder's event log into a per-frame edit: which master frame to show, where the pointer is,
// click presses, camera zoom/pan, URL, and window fades. The Remotion composition only draws this.
export const FPS = 30
export const STAGE = { w: 1920, h: 1200 }
export const WIN = { x: 160, y: 74, w: 1600, bar: 52, pageH: 1000 }
const SCALE = WIN.w / 1440 // recorded CSS px -> page area px

const HOLD_CAPS = {
  'home-hero': 1.5, 'feature-hero': 0.9, 'feature-benefits': 1.2, 'feature-how-it-works': 1.5,
  'salons-list': 0.8, 'booking-form': 0.4, 'confirm-summary': 1.0, 'request-sent': 1.9,
  'salon-queue': 1.0, 'request-approved': 2.3,
}
const WAIT_CAP = 0.3
const SCROLL_SPEED = 1.25
const BASE_SPEED = 1.08
const TARGET = 31
const DISSOLVES = [0.75, 0.5] // website -> booking, booking -> approval
const FADE_IN = 0.7, FADE_OUT = 0.9

const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

function speedIntervals(take, evs, factor) {
  const s0 = take.start, s1 = take.start + take.duration
  const marks = [] // [start, end, speed, priority]
  let lastMoment = null
  const open = {}
  for (const e of evs) {
    if (e.type === 'moment') lastMoment = e.name
    if (e.type.endsWith('-start') && e.type !== 'move-start') open[e.type] = { e, moment: lastMoment }
    if (e.type.endsWith('-end')) {
      const kind = e.type.replace('-end', '')
      const o = open[`${kind}-start`]
      if (!o) continue
      const len = e.t - o.e.t
      if (kind === 'wait') marks.push([o.e.t, e.t, Math.max(3, len / WAIT_CAP), 3])
      if (kind === 'hold') marks.push([o.e.t, e.t, Math.max(1, len / (HOLD_CAPS[o.moment] ?? 0.35)), 2, true])
      if (kind === 'scroll') marks.push([o.e.t, e.t, SCROLL_SPEED * factor, 1])
      delete open[`${kind}-start`]
      lastMoment = kind === 'hold' ? null : lastMoment
    }
  }
  const cuts = [...new Set([s0, s1, ...marks.flatMap(m => [m[0], m[1]])])].filter(t => t >= s0 && t <= s1).sort((a, b) => a - b)
  const out = []
  for (let i = 0; i < cuts.length - 1; i++) {
    const a = cuts[i], b = cuts[i + 1], mid = (a + b) / 2
    const m = marks.filter(m => m[0] <= mid && mid < m[1]).sort((x, y) => y[3] - x[3])[0]
    const speed = m ? (m[4] ? m[2] : m[2]) : BASE_SPEED * factor
    out.push({ a, b, speed })
  }
  return out
}

function buildBlock(take, evs, factor) {
  const iv = speedIntervals(take, evs, factor)
  let o = 0
  for (const x of iv) { x.oa = o; o += (x.b - x.a) / x.speed; x.ob = o }
  const srcToOut = (t) => {
    const x = iv.find(x => t <= x.b) ?? iv.at(-1)
    return x.oa + (clamp(t, x.a, x.b) - x.a) / x.speed
  }
  const outToSrc = (u) => {
    const x = iv.find(x => u <= x.ob) ?? iv.at(-1)
    return x.a + (clamp(u, x.oa, x.ob) - x.oa) * x.speed
  }
  return { take, evs, length: o, srcToOut, outToSrc }
}

function pointerTrack(evs) {
  const pts = evs.filter(e => e.type === 'move' || e.type === 'move-start').map(e => ({ t: e.t, x: e.x, y: e.y }))
  return (t) => {
    if (!pts.length) return null
    if (t <= pts[0].t) return pts[0]
    let i = pts.findIndex(p => p.t > t)
    if (i === -1) return pts.at(-1)
    const p = pts[i - 1], q = pts[i]
    const k = q.t - p.t < 0.06 ? (t - p.t) / (q.t - p.t) : 0
    return { x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k) }
  }
}

function cameraFor(x, y, z) {
  const fx = WIN.x + x * SCALE, fy = WIN.y + WIN.bar + y * SCALE
  let tx = STAGE.w / 2 - fx * z, ty = STAGE.h / 2 - fy * z
  tx = clamp(tx, STAGE.w - (WIN.x + WIN.w) * z, -WIN.x * z)
  ty = clamp(ty, STAGE.h - (WIN.y + WIN.bar + WIN.pageH) * z, -WIN.y * z)
  return { z, tx, ty }
}

function cameraKeys(block, offset) {
  const { evs } = block
  const keys = [{ o: offset, z: 1, tx: 0, ty: 0 }]
  const focuses = []
  evs.forEach((e, i) => {
    if (e.type !== 'focus') return
    const click = evs.slice(i).find(c => c.type === 'click')
    const nextFocusIdx = evs.findIndex((f, j) => j > i && f.type === 'focus')
    const between = evs.slice(i, nextFocusIdx === -1 ? undefined : nextFocusIdx)
    focuses.push({ e, clickOut: offset + block.srcToOut(click.t), stepChange: between.some(b => b.type === 'wait-start') || nextFocusIdx === -1 })
  })
  focuses.forEach((f, i) => {
    const cam = cameraFor(f.e.x, f.e.y, clamp(f.e.zoom, 1.3, 1.6))
    const prev = keys.at(-1)
    const inStart = Math.max(prev.o + 0.05, f.clickOut - 0.85)
    if (prev.z === 1) keys.push({ ...prev, o: inStart })
    keys.push({ o: Math.max(inStart + 0.3, f.clickOut - 0.2), ...cam })
    const holdEnd = f.clickOut + 0.45
    keys.push({ o: holdEnd, ...cam })
    const next = focuses[i + 1]
    if (f.stepChange || !next || next.clickOut - holdEnd > 1.6) keys.push({ o: holdEnd + 0.65, z: 1, tx: 0, ty: 0 })
  })
  return keys
}

function sampleKeys(keys, o) {
  if (o <= keys[0].o) return keys[0]
  for (let i = 1; i < keys.length; i++) {
    if (o <= keys[i].o) {
      const a = keys[i - 1], b = keys[i], k = ease((o - a.o) / (b.o - a.o || 1))
      return { z: lerp(a.z, b.z, k), tx: lerp(a.tx, b.tx, k), ty: lerp(a.ty, b.ty, k) }
    }
  }
  return keys.at(-1)
}

const displayUrl = (u) => { try { const x = new URL(u); return 'imirezervimi.al' + (x.pathname === '/' ? '' : x.pathname) } catch { return 'imirezervimi.al' } }

export function buildEdit(log) {
  const evsOf = (name) => log.events.filter(e => e.take === name)
  let factor = 1, blocks
  for (let pass = 0; pass < 4; pass++) {
    blocks = log.takes.map(t => buildBlock(t, evsOf(t.name), factor))
    const total = blocks.reduce((s, b) => s + b.length, 0) - DISSOLVES.slice(0, blocks.length - 1).reduce((a, b) => a + b, 0)
    factor *= clamp(total / TARGET, 0.85, 1.6)
    if (Math.abs(total - TARGET) < 0.4) break
  }
  let cursor = 0
  blocks.forEach((b, i) => {
    b.outStart = cursor
    cursor += b.length - (DISSOLVES[i] ?? 0)
    b.track = pointerTrack(b.evs)
    b.clicks = b.evs.filter(e => e.type === 'click').map(e => b.outStart + b.srcToOut(e.t))
    b.urls = b.evs.filter(e => e.type === 'url').map(e => ({ o: b.outStart + b.srcToOut(e.t), url: displayUrl(e.url) }))
    b.keys = cameraKeys(b, b.outStart)
  })
  const total = blocks.at(-1).outStart + blocks.at(-1).length
  const nFrames = Math.round(total * FPS)
  const masterFrames = Math.floor(log.duration * FPS) - 1

  const frames = []
  for (let f = 0; f < nFrames; f++) {
    const o = f / FPS
    const layers = []
    blocks.forEach((b, i) => {
      const local = o - b.outStart
      if (local < 0 || local > b.length) return
      const inDis = i > 0 ? DISSOLVES[i - 1] : 0
      const opacity = inDis && local < inDis ? ease(local / inDis) : 1
      const src = b.outToSrc(local)
      const p = b.track(src)
      const sinceClick = b.clicks.filter(c => c <= o + 0.06).map(c => o - c).sort((x, y) => x - y)[0]
      const press = sinceClick !== undefined && sinceClick < 0.24 ? Math.sin(Math.PI * clamp((sinceClick + 0.06) / 0.3, 0, 1)) : 0
      const ripple = sinceClick !== undefined && sinceClick >= 0 && sinceClick < 0.5 ? sinceClick / 0.5 : null
      const url = [...b.urls].reverse().find(u => u.o <= o)?.url ?? b.urls[0]?.url ?? 'imirezervimi.al'
      layers.push({
        frame: clamp(Math.round(src * FPS), 0, masterFrames), opacity: +opacity.toFixed(4), url,
        pointer: p && { x: +(p.x * SCALE).toFixed(2), y: +(p.y * SCALE).toFixed(2), press: +press.toFixed(3), ripple: ripple === null ? null : +ripple.toFixed(3) },
      })
    })
    const active = blocks.filter(b => o >= b.outStart && o <= b.outStart + b.length)
    const cams = active.map(b => sampleKeys(b.keys, o))
    const cam = cams.length === 2 ? { z: Math.min(cams[0].z, cams[1].z), tx: (cams[0].tx + cams[1].tx) / 2, ty: (cams[0].ty + cams[1].ty) / 2 } : cams[0] ?? { z: 1, tx: 0, ty: 0 }
    const fadeIn = ease(o / FADE_IN), fadeOut = ease((total - o) / FADE_OUT)
    const win = Math.min(fadeIn, fadeOut)
    const settle = lerp(0.985, 1, win)
    frames.push({
      layers, opacity: +win.toFixed(4),
      cam: { z: +(cam.z * settle).toFixed(4), tx: +(cam.tx + (1 - settle) * STAGE.w / 2).toFixed(2), ty: +(cam.ty + (1 - settle) * STAGE.h / 2).toFixed(2) },
    })
  }
  const moments = Object.fromEntries(blocks.flatMap(b => b.evs.filter(e => e.type === 'moment').map(e => [e.name, +(b.outStart + b.srcToOut(e.t)).toFixed(2)])))
  return { fps: FPS, durationInFrames: nFrames, frames, moments, factor: +factor.toFixed(3) }
}
