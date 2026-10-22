#!/usr/bin/env tsx
/**
 * Showcase Recording Script for ImiRezervimi.al
 * Records the product demo video using Playwright + Chrome DevTools Protocol
 *
 * Output:
 * - showcase/frames/ - Raw JPEG frames at 2880×1800
 * - showcase/events.json - Event log with timestamps
 *
 * Usage: npm run record:showcase
 */

import { chromium, Page, Browser } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'
import { createWriteStream } from 'fs'

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  viewport: {
    width: 1440,
    height: 900
  },
  deviceScaleFactor: 2, // For 2880×1800 recording
  screenshotQuality: 95,
  outputDir: path.join(process.cwd(), 'showcase'),
  framesDir: path.join(process.cwd(), 'showcase', 'frames'),
  fps: 30
}

// ============================================
// EVENT LOGGING
// ============================================

interface RecordingEvent {
  timestamp: number
  type: 'navigate' | 'click' | 'type' | 'scroll' | 'wait' | 'moment'
  description: string
  element?: string
  coordinates?: { x: number, y: number }
  value?: string
}

const events: RecordingEvent[] = []
let startTime: number = 0

function logEvent(event: Omit<RecordingEvent, 'timestamp'>) {
  const timestamp = Date.now() - startTime
  events.push({ timestamp, ...event })
  console.log(`[${(timestamp / 1000).toFixed(2)}s] ${event.description}`)
}

async function saveEvents() {
  const eventsPath = path.join(CONFIG.outputDir, 'events.json')
  await fs.writeFile(eventsPath, JSON.stringify(events, null, 2))
  console.log(`\n✅ Events saved to: ${eventsPath}`)
}

// ============================================
// SMOOTH POINTER MOVEMENT
// ============================================

async function smoothMove(page: Page, fromX: number, fromY: number, toX: number, toY: number, duration: number = 500) {
  const steps = Math.ceil(duration / 16) // ~60fps movement
  const deltaX = (toX - fromX) / steps
  const deltaY = (toY - fromY) / steps

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps
    // Ease in-out cubic
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2

    const x = fromX + deltaX * steps * ease
    const y = fromY + deltaY * steps * ease

    await page.mouse.move(x, y)
    await page.waitForTimeout(16)
  }
}

async function smoothClick(page: Page, selector: string, label: string) {
  const element = await page.locator(selector).first()
  const box = await element.boundingBox()

  if (!box) {
    throw new Error(`Element not found: ${selector}`)
  }

  const targetX = box.x + box.width / 2
  const targetY = box.y + box.height / 2

  // Get current mouse position (approximate from last position or center)
  const fromX = Math.random() * 200 + 200
  const fromY = Math.random() * 200 + 200

  logEvent({
    type: 'click',
    description: label,
    element: selector,
    coordinates: { x: Math.round(targetX), y: Math.round(targetY) }
  })

  // Smooth move to element
  await smoothMove(page, fromX, fromY, targetX, targetY, 600)
  await page.waitForTimeout(300) // Pause before click

  // Click
  await element.click()
  await page.waitForTimeout(400) // Wait after click
}

async function smoothType(page: Page, selector: string, text: string, label: string) {
  await page.click(selector)
  await page.waitForTimeout(200)

  logEvent({
    type: 'type',
    description: label,
    element: selector,
    value: text
  })

  // Type with human-like delays
  for (const char of text) {
    await page.keyboard.type(char)
    await page.waitForTimeout(50 + Math.random() * 100) // 50-150ms per char
  }

  await page.waitForTimeout(300)
}

// ============================================
// SCREENSHOT CAPTURE
// ============================================

let frameCount = 0

async function captureFrame(page: Page, label: string) {
  const framePath = path.join(CONFIG.framesDir, `frame-${String(frameCount).padStart(6, '0')}.jpg`)

  await page.screenshot({
    path: framePath,
    type: 'jpeg',
    quality: CONFIG.screenshotQuality,
    fullPage: false
  })

  logEvent({
    type: 'moment',
    description: `Captured: ${label}`
  })

  frameCount++
  return framePath
}

// Capture frames for duration at target FPS
async function captureForDuration(page: Page, durationMs: number, label: string) {
  const frameInterval = 1000 / CONFIG.fps
  const frames = Math.ceil(durationMs / frameInterval)

  logEvent({
    type: 'wait',
    description: `Recording ${label} for ${durationMs}ms`
  })

  for (let i = 0; i < frames; i++) {
    await captureFrame(page, `${label} frame ${i + 1}/${frames}`)
    await page.waitForTimeout(frameInterval)
  }
}

// ============================================
// RECORDING SCRIPT
// ============================================

async function recordShowcase() {
  console.log('┌─────────────────────────────────────────────┐')
  console.log('│  ImiRezervimi.al Showcase Recording        │')
  console.log('│  Recording at 2880×1800 @ 30fps            │')
  console.log('└─────────────────────────────────────────────┘\n')

  // Create output directories
  await fs.mkdir(CONFIG.framesDir, { recursive: true })

  let browser: Browser | null = null

  try {
    // Launch browser
    browser = await chromium.launch({
      headless: false, // Show browser for visual feedback
      args: [
        '--disable-blink-features=AutomationControlled',
        '--window-size=1440,900'
      ]
    })

    const context = await browser.newContext({
      viewport: CONFIG.viewport,
      deviceScaleFactor: CONFIG.deviceScaleFactor,
      locale: 'sq-AL', // Albanian locale
      timezoneId: 'Europe/Tirane'
    })

    const page = await context.newPage()

    // Start timing
    startTime = Date.now()

    // ============================================
    // ACT 1: HOMEPAGE (8 seconds)
    // ============================================

    console.log('\n🎬 ACT 1: Homepage')

    await page.goto(CONFIG.baseURL)
    logEvent({ type: 'navigate', description: 'Navigate to homepage', value: CONFIG.baseURL })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Wait for animations
    await page.waitForTimeout(1000)
    await captureFrame(page, 'Homepage loaded')

    // Hold on hero section
    await captureForDuration(page, 2000, 'Homepage hero')

    // Scroll to show features
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }))
    logEvent({ type: 'scroll', description: 'Scroll to features section' })
    await captureForDuration(page, 1500, 'Features section')

    // Scroll back to CTA
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    await page.waitForTimeout(800)

    // Click "Zbulo Sallone"
    await smoothClick(page, 'a[href="/salons"]', 'Click "Zbulo Sallone" button')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    // ============================================
    // ACT 2: SALONS DIRECTORY (7 seconds)
    // ============================================

    console.log('\n🎬 ACT 2: Salons Directory')

    await captureFrame(page, 'Salons page loaded')
    await captureForDuration(page, 1500, 'Salons grid view')

    // Show search interaction
    await page.click('input[placeholder*="Kërko"]')
    await page.waitForTimeout(400)
    await captureFrame(page, 'Search box focused')

    // Type and clear search (just to show it works)
    await page.type('input[placeholder*="Kërko"]', 'Tir', { delay: 100 })
    await page.waitForTimeout(600)
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Backspace')
    await page.waitForTimeout(400)

    // Scroll to see more salons
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }))
    logEvent({ type: 'scroll', description: 'Scroll through salons' })
    await captureForDuration(page, 1200, 'Browsing salons')

    // Click on Klea Beauty Studio
    await smoothClick(page, 'a[href="/klea-beauty-studio"]', 'Click "Klea Beauty Studio" card')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // ============================================
    // ACT 3: BOOKING FORM (10 seconds)
    // ============================================

    console.log('\n🎬 ACT 3: Booking Form')

    await captureFrame(page, 'Booking page loaded')
    await captureForDuration(page, 1500, 'Salon profile view')

    // Scroll to services
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }))
    await page.waitForTimeout(600)

    // Select "Manikyr" service
    const manikyrButton = page.locator('button:has-text("Manikyr")').first()
    if (await manikyrButton.count() > 0) {
      await smoothClick(page, 'button:has-text("Manikyr")', 'Select "Manikyr" service')
      await captureFrame(page, 'Service selected')
    }

    // Fill form fields (if they exist)
    await page.waitForTimeout(800)

    // Name
    const nameInput = page.locator('input[name="firstName"], input[placeholder*="Emri"]').first()
    if (await nameInput.count() > 0) {
      await smoothType(page, 'input[name="firstName"], input[placeholder*="Emri"]', 'Elona', 'Type first name')
    }

    // Last name
    const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="Mbiemri"]').first()
    if (await lastNameInput.count() > 0) {
      await smoothType(page, 'input[name="lastName"], input[placeholder*="Mbiemri"]', 'Hoxha', 'Type last name')
    }

    // Phone
    const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first()
    if (await phoneInput.count() > 0) {
      await smoothType(page, 'input[name="phone"], input[type="tel"]', '+355692345678', 'Type phone number')
    }

    // Date (tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]

    const dateInput = page.locator('input[type="date"]').first()
    if (await dateInput.count() > 0) {
      await page.fill('input[type="date"]', dateStr)
      logEvent({ type: 'type', description: 'Select date (tomorrow)', value: dateStr })
      await page.waitForTimeout(400)
    }

    // Time
    const timeInput = page.locator('select:has(option:has-text("14:00")), input[type="time"]').first()
    if (await timeInput.count() > 0) {
      await page.selectOption('select:has(option:has-text("14:00"))', '14:00')
      logEvent({ type: 'click', description: 'Select time 14:00' })
      await page.waitForTimeout(400)
    }

    // Notes
    const notesInput = page.locator('textarea[name="notes"], textarea[placeholder*="shënime"]').first()
    if (await notesInput.count() > 0) {
      await smoothType(page, 'textarea[name="notes"], textarea[placeholder*="shënime"]', 'Preferoj ngjyrë të kuqe', 'Type customer notes')
    }

    await captureFrame(page, 'Form filled completely')
    await page.waitForTimeout(800)

    // Submit form
    const submitButton = page.locator('button[type="submit"]:has-text("Dërgo"), button:has-text("Rezervo")').first()
    if (await submitButton.count() > 0) {
      await smoothClick(page, 'button[type="submit"]:has-text("Dërgo"), button:has-text("Rezervo")', 'Click "Dërgo Kërkesën" button')
      await page.waitForTimeout(2000) // Wait for submission
      await captureFrame(page, 'Request submitted - success message')
      await captureForDuration(page, 1500, 'Success confirmation')
    }

    // ============================================
    // ACT 4: SALON DASHBOARD (5 seconds)
    // ============================================

    console.log('\n🎬 ACT 4: Salon Dashboard')

    // Navigate to salon dashboard
    // Note: This would require authentication in production
    // For demo, we'll navigate directly

    logEvent({ type: 'moment', description: '--- Cut to Salon Dashboard ---' })
    await page.waitForTimeout(1000)

    // Try to navigate to dashboard (may need salon ID)
    try {
      await page.goto(`${CONFIG.baseURL}/salon/dashboard`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      await captureFrame(page, 'Salon dashboard loaded')
      await captureForDuration(page, 1500, 'Dashboard view')

      // Look for pending requests
      const pendingRequest = page.locator('text="Elona Hoxha"').first()
      if (await pendingRequest.count() > 0) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
        await captureFrame(page, 'Pending request visible')
        await page.waitForTimeout(600)

        // Click approve button
        const approveButton = page.locator('button:has-text("Aprovo")').first()
        if (await approveButton.count() > 0) {
          await smoothClick(page, 'button:has-text("Aprovo")', 'Click "Aprovo" button')
          await page.waitForTimeout(1500)
          await captureFrame(page, 'Appointment approved - confirmation')
          await captureForDuration(page, 1500, 'Success message')
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not access salon dashboard (authentication required)')
      logEvent({ type: 'moment', description: 'Dashboard access skipped (auth required)' })
    }

    // ============================================
    // FINALE
    // ============================================

    console.log('\n✨ Recording complete!')
    console.log(`\nCaptured ${frameCount} frames`)
    console.log(`Total duration: ${((Date.now() - startTime) / 1000).toFixed(1)}s`)

    // Save events log
    await saveEvents()

    console.log('\nNext steps:')
    console.log('  1. Review frames in showcase/frames/')
    console.log('  2. Run Remotion edit: npm run edit:showcase')
    console.log('  3. Generate gallery screenshots')

  } catch (error) {
    console.error('\n❌ Recording failed:', error)
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

recordShowcase().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
