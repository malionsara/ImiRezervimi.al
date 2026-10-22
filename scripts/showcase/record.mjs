// Films the showcase takes with the Chrome DevTools screencast and writes, to scripts/showcase/out/:
//   frames/<take>/*.jpg, events.json (every move/click/scroll/moment, in master-video seconds), master.mp4 (30fps, 2880x1800, CRF 12)
// Needs: the app running at SHOWCASE_BASE_URL on the seeded dev database, NEXTAUTH_SECRET matching the app.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { launch, newContext, signInCustomer, settle, BASE_URL, ROOT, nextDashboardToken } from './lib.mjs'

const OUT = path.join(ROOT, 'scripts/showcase/out')
const VIEW = { w: 1440, h: 900 }
const now = () => Date.now() / 1000
const rand = (a, b) => a + Math.random() * (b - a)
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const events = []
const takes = []
let take = null

function log(type, data = {}) {
  events.push({ take: take?.name, epoch: now(), type, ...data })
}

async function startTake(page, name) {
  const dir = path.join(OUT, 'frames', name)
  mkdirSync(dir, { recursive: true })
  const cdp = await page.context().newCDPSession(page)
  const frames = []
  const writes = []
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
    const file = path.join(dir, `${String(frames.length).padStart(6, '0')}.jpg`)
    frames.push({ file, t: metadata.timestamp })
    writes.push(writeFile(file, Buffer.from(data, 'base64')))
  })
  take = { name, cdp, frames, writes, start: now() }
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: 2880, maxHeight: 1800, everyNthFrame: 1 })
  log('moment', { name: `${name}:start` })
  log('url', { url: page.url() })
  page.on('framenavigated', (f) => { if (take && f === page.mainFrame()) log('url', { url: f.url() }) })
}

async function endTake() {
  log('moment', { name: `${take.name}:end` })
  take.end = now()
  await take.cdp.send('Page.stopScreencast')
  await Promise.all(take.writes)
  takes.push(take)
  console.log(`  ${take.name}: ${take.frames.length} frames over ${(take.end - take.start).toFixed(1)}s`)
  take = null
}

class Hand {
  constructor(page, x = VIEW.w * 0.62, y = VIEW.h * 0.7) { this.page = page; this.x = x; this.y = y }

  async moveTo(x, y) {
    const dist = Math.hypot(x - this.x, y - this.y)
    const dur = Math.min(950, 380 + dist * 0.55)
    const steps = Math.max(12, Math.round(dur / 16))
    // Slight arc, like a wrist, instead of a ruler-straight line.
    const bow = rand(-0.12, 0.12) * dist
    const nx = -(y - this.y) / (dist || 1), ny = (x - this.x) / (dist || 1)
    const cx = (this.x + x) / 2 + nx * bow, cy = (this.y + y) / 2 + ny * bow
    const x0 = this.x, y0 = this.y
    log('move-start', { x: x0, y: y0, toX: x, toY: y })
    for (let i = 1; i <= steps; i++) {
      const t = ease(i / steps), u = 1 - t
      const px = u * u * x0 + 2 * u * t * cx + t * t * x
      const py = u * u * y0 + 2 * u * t * cy + t * t * y
      await this.page.mouse.move(px, py)
      log('move', { x: +px.toFixed(1), y: +py.toFixed(1) })
      await sleep(dur / steps)
    }
    this.x = x; this.y = y
  }

  async scrollBy(dy, label) {
    const dur = Math.min(1600, 500 + Math.abs(dy) * 0.9)
    const steps = Math.round(dur / 16)
    log('scroll-start', { dy, label })
    let done = 0
    for (let i = 1; i <= steps; i++) {
      const target = dy * ease(i / steps)
      await this.page.mouse.wheel(0, target - done)
      done = target
      await sleep(dur / steps)
    }
    await sleep(120)
    log('scroll-end', { label })
  }

  async ensureVisible(locator) {
    for (let i = 0; i < 4; i++) {
      const box = await locator.boundingBox()
      if (box && box.y >= 90 && box.y + box.height <= VIEW.h - 40) return box
      const dy = Math.round(box.y + box.height / 2 - VIEW.h * 0.55)
      await this.scrollBy(dy, 'bring-into-view')
    }
    return locator.boundingBox()
  }

  async click(locator, label, { zoom = 1.45 } = {}) {
    await locator.waitFor({ state: 'visible' })
    const box = await this.ensureVisible(locator)
    const x = box.x + box.width / 2 + rand(-0.12, 0.12) * Math.min(box.width, 120)
    const y = box.y + box.height / 2 + rand(-0.15, 0.15) * Math.min(box.height, 30)
    log('focus', { label, x: box.x + box.width / 2, y: box.y + box.height / 2, zoom })
    await this.moveTo(x, y)
    await sleep(rand(170, 260))
    log('click', { label, x, y })
    await this.page.mouse.down()
    await sleep(85)
    await this.page.mouse.up()
    await sleep(rand(220, 320))
  }
}

async function waitStep(page, label, fn) {
  log('wait-start', { label })
  await fn()
  await settle(page, 350)
  log('wait-end', { label })
}

async function hold(ms, name) {
  if (name) log('moment', { name })
  log('hold-start', { ms })
  await sleep(ms)
  log('hold-end')
}

function tomorrowInTirane() {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Tirane', year: 'numeric', month: '2-digit', day: '2-digit' })
  const today = fmt.format(new Date()), tomorrow = fmt.format(new Date(Date.now() + 86400000))
  return { day: String(Number(tomorrow.slice(8))), nextMonth: tomorrow.slice(5, 7) !== today.slice(5, 7) }
}

async function websiteTake(browser) {
  const ctx = await newContext(browser)
  const page = await ctx.newPage()
  await page.goto(BASE_URL + '/')
  await settle(page, 2500)
  const hand = new Hand(page)
  await page.mouse.move(hand.x, hand.y)
  await startTake(page, 'website')
  await hold(1700, 'home-hero')
  await hand.click(page.getByRole('link', { name: 'Për Sallone & Berberi' }).first(), 'Për Sallone & Berberi')
  await waitStep(page, 'feature-page-load', () => page.waitForURL('**/salon'))
  await hold(1300, 'feature-hero')
  await hand.scrollBy(820, 'avantazhet')
  await hold(1500, 'feature-benefits')
  await hand.scrollBy(610, 'si-funksionon')
  await hold(1700, 'feature-how-it-works')
  await endTake()
  await ctx.close()
}

async function bookingTake(browser) {
  const ctx = await newContext(browser)
  await signInCustomer(ctx)
  const page = await ctx.newPage()
  await page.goto(BASE_URL + '/salons')
  await settle(page, 1800)
  const hand = new Hand(page, VIEW.w * 0.55, VIEW.h * 0.35)
  await page.mouse.move(hand.x, hand.y)
  await startTake(page, 'booking')
  await hold(1100, 'salons-list')
  await hand.click(page.getByRole('link').filter({ hasText: 'Atelier Iris' }).first(), 'Atelier Iris')
  await waitStep(page, 'salon-load', () => page.getByText('Manikyr me xhel').first().waitFor())
  await hold(700, 'booking-form')
  await hand.click(page.getByText('Manikyr me xhel').first(), 'Manikyr me xhel')
  await hold(500)
  await hand.click(page.getByRole('button', { name: /Vazhdo/ }), 'Vazhdo (shërbimi)', { zoom: 1.3 })
  await waitStep(page, 'calendar', () => page.getByRole('button', { name: 'Muaji i ardhshëm' }).waitFor())
  const { day, nextMonth } = tomorrowInTirane()
  if (nextMonth) await hand.click(page.getByRole('button', { name: 'Muaji i ardhshëm' }), 'Muaji i ardhshëm')
  await hand.click(page.getByRole('button', { name: new RegExp(`^${day}$`) }), `Data ${day}`)
  await waitStep(page, 'slots', () => page.getByRole('button', { name: /^14:00/ }).first().waitFor())
  await hold(400)
  await hand.click(page.getByRole('button', { name: /^14:00/ }).first(), 'Ora 14:00')
  await hand.click(page.getByRole('button', { name: /Vazhdo/ }), 'Vazhdo (ora)', { zoom: 1.3 })
  await waitStep(page, 'confirm', () => page.getByRole('button', { name: /Dërgo/ }).waitFor())
  await hold(1400, 'confirm-summary')
  await hand.click(page.getByRole('button', { name: /Dërgo/ }), 'Dërgo')
  await waitStep(page, 'sent', () => page.getByText('Rezervimi u dërgua!').waitFor())
  await hold(2200, 'request-sent')
  await endTake()
  await ctx.close()
}

async function approvalTake(browser) {
  const ctx = await newContext(browser)
  const page = await ctx.newPage()
  await page.goto(BASE_URL + '/salon/auth/verify?token=' + nextDashboardToken())
  await page.waitForURL(/salon\/dashboard/, { timeout: 30000 })
  await page.getByRole('button', { name: /Miratu shpejt/ }).first().waitFor()
  await settle(page, 1500)
  const firstCard = await page.getByRole('button', { name: /Miratu shpejt/ }).first()
    .locator('xpath=ancestor::div[.//text()[contains(., "Shërbimi")]][1]').innerText()
  if (!firstCard.includes('Elona Kraja')) throw new Error('Filmed request is not first in the queue:\n' + firstCard.slice(0, 200))
  const hand = new Hand(page, VIEW.w * 0.72, VIEW.h * 0.55)
  await page.mouse.move(hand.x, hand.y)
  await startTake(page, 'approval')
  await hold(1500, 'salon-queue')
  await hand.click(page.getByRole('button', { name: /Miratu shpejt/ }).first(), 'Miratu shpejt')
  await waitStep(page, 'approved', () => page.getByText('Rezervimi u miratua me sukses').waitFor())
  await hold(2400, 'request-approved')
  await endTake()
  await ctx.close()
}

function encodeMaster() {
  const lines = ['ffconcat version 1.0']
  let offset = 0
  const takeInfo = []
  for (const t of takes) {
    const first = t.frames[0].t
    const end = Math.max(t.end, t.frames.at(-1).t + 1 / 30)
    t.frames.forEach((f, i) => {
      const next = i + 1 < t.frames.length ? t.frames[i + 1].t : end
      lines.push(`file '${f.file}'`, `duration ${Math.max(0.001, next - f.t).toFixed(4)}`)
    })
    takeInfo.push({ name: t.name, start: offset, duration: end - first, firstFrameEpoch: first, frames: t.frames.length })
    offset += end - first
  }
  lines.push(`file '${takes.at(-1).frames.at(-1).file}'`)
  writeFileSync(path.join(OUT, 'frames.ffconcat'), lines.join('\n'))
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.ffconcat'),
    '-vf', 'fps=30,scale=2880:1800:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '12',
    '-movflags', '+faststart', path.join(OUT, 'master.mp4')], { stdio: 'inherit' })

  const byName = Object.fromEntries(takeInfo.map(t => [t.name, t]))
  const timed = events.filter(e => e.take).map(e => {
    const t = byName[e.take]
    return { t: +(t.start + e.epoch - t.firstFrameEpoch).toFixed(4), ...e }
  })
  writeFileSync(path.join(OUT, 'events.json'), JSON.stringify({
    master: 'master.mp4', fps: 30, viewport: { width: VIEW.w, height: VIEW.h, deviceScaleFactor: 2 },
    duration: offset, takes: takeInfo, events: timed,
  }, null, 1))
  console.log(`master.mp4: ${offset.toFixed(1)}s, ${timed.length} events`)
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const browser = await launch()
try {
  console.log('Recording takes…')
  await websiteTake(browser)
  await bookingTake(browser)
  await approvalTake(browser)
} finally {
  await browser.close()
}
encodeMaster()
