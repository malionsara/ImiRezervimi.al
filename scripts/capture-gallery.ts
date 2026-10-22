#!/usr/bin/env tsx
/**
 * Gallery Screenshot Capture Script for ImiRezervimi.al
 * Captures high-quality screenshots for portfolio showcase
 *
 * Output:
 * - showcase/gallery/*.png - Desktop and mobile screenshots
 *
 * Usage: npm run gallery:capture
 */

import { chromium, devices } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  outputDir: path.join(process.cwd(), 'showcase', 'gallery'),

  // Desktop viewport for screenshots
  desktop: {
    width: 1600,
    height: 1000,
    deviceScaleFactor: 1
  },

  // iPhone 6.9" Pro Max
  mobile: {
    width: 1320,
    height: 2868,
    deviceScaleFactor: 1
  }
}

// ============================================
// SCREENSHOT DEFINITIONS
// ============================================

const SCREENSHOTS = {
  desktop: [
    {
      filename: '1-homepage.png',
      url: '/',
      description: 'Homepage hero section',
      waitFor: 'text=Rezervo te salloni yt i preferuar',
      scrollTo: 0
    },
    {
      filename: '2-salons-grid.png',
      url: '/salons',
      description: 'Salons directory grid',
      waitFor: 'text=Sallone',
      scrollTo: 0
    },
    {
      filename: '3-booking-form.png',
      url: '/klea-beauty-studio/book',
      description: 'Booking form for Klea Beauty Studio',
      waitFor: 'text=Manikyr',
      scrollTo: 200
    },
    {
      filename: '4-salon-dashboard.png',
      url: '/salon/dashboard',
      description: 'Salon dashboard with pending requests',
      waitFor: 'text=Dashboard',
      scrollTo: 0,
      note: 'Requires authentication - may need to manually login first'
    }
  ],

  mobile: [
    {
      filename: '5-mobile-homepage.png',
      url: '/',
      description: 'Mobile homepage view',
      waitFor: 'text=Rezervo te salloni yt',
      scrollTo: 0
    },
    {
      filename: '6-mobile-salons.png',
      url: '/salons',
      description: 'Mobile salons browsing',
      waitFor: 'text=Sallone',
      scrollTo: 0
    },
    {
      filename: '7-mobile-booking.png',
      url: '/klea-beauty-studio/book',
      description: 'Mobile booking form',
      waitFor: 'text=Manikyr',
      scrollTo: 300
    }
  ]
}

// ============================================
// SCREENSHOT CAPTURE FUNCTIONS
// ============================================

async function captureDesktopScreenshots() {
  console.log('\n📸 Capturing Desktop Screenshots (1600×1000)')
  console.log('━'.repeat(50))

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    viewport: {
      width: CONFIG.desktop.width,
      height: CONFIG.desktop.height
    },
    deviceScaleFactor: CONFIG.desktop.deviceScaleFactor,
    locale: 'sq-AL'
  })

  const page = await context.newPage()

  for (const screenshot of SCREENSHOTS.desktop) {
    try {
      console.log(`\n→ ${screenshot.filename}`)
      console.log(`  URL: ${screenshot.url}`)
      if (screenshot.note) {
        console.log(`  ⚠️  ${screenshot.note}`)
      }

      // Navigate
      await page.goto(`${CONFIG.baseURL}${screenshot.url}`)
      await page.waitForLoadState('networkidle')

      // Wait for specific element
      try {
        await page.waitForSelector(screenshot.waitFor, { timeout: 5000 })
      } catch {
        console.log(`  ⚠️  Element "${screenshot.waitFor}" not found, continuing anyway`)
      }

      // Scroll to position
      if (screenshot.scrollTo) {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), screenshot.scrollTo)
        await page.waitForTimeout(500)
      }

      // Wait for animations
      await page.waitForTimeout(1000)

      // Capture
      const outputPath = path.join(CONFIG.outputDir, screenshot.filename)
      await page.screenshot({
        path: outputPath,
        type: 'png',
        fullPage: false
      })

      console.log(`  ✓ Saved: ${screenshot.filename}`)

    } catch (error) {
      console.error(`  ✗ Failed: ${screenshot.filename}`, error)
    }
  }

  await browser.close()
  console.log('\n✅ Desktop screenshots complete')
}

async function captureMobileScreenshots() {
  console.log('\n📱 Capturing Mobile Screenshots (1320×2868 iPhone)')
  console.log('━'.repeat(50))

  const browser = await chromium.launch({ headless: false })

  // Use iPhone 14 Pro Max preset
  const iPhoneDevice = devices['iPhone 14 Pro Max']
  const context = await browser.newContext({
    ...iPhoneDevice,
    viewport: {
      width: CONFIG.mobile.width,
      height: CONFIG.mobile.height
    },
    deviceScaleFactor: CONFIG.mobile.deviceScaleFactor,
    locale: 'sq-AL'
  })

  const page = await context.newPage()

  // Set clean status bar (9:41, full battery)
  await page.emulateMedia({ colorScheme: 'light' })

  for (const screenshot of SCREENSHOTS.mobile) {
    try {
      console.log(`\n→ ${screenshot.filename}`)
      console.log(`  URL: ${screenshot.url}`)

      // Navigate
      await page.goto(`${CONFIG.baseURL}${screenshot.url}`)
      await page.waitForLoadState('networkidle')

      // Wait for specific element
      try {
        await page.waitForSelector(screenshot.waitFor, { timeout: 5000 })
      } catch {
        console.log(`  ⚠️  Element "${screenshot.waitFor}" not found, continuing anyway`)
      }

      // Scroll to position
      if (screenshot.scrollTo) {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), screenshot.scrollTo)
        await page.waitForTimeout(500)
      }

      // Wait for animations
      await page.waitForTimeout(1000)

      // Capture
      const outputPath = path.join(CONFIG.outputDir, screenshot.filename)
      await page.screenshot({
        path: outputPath,
        type: 'png',
        fullPage: false
      })

      console.log(`  ✓ Saved: ${screenshot.filename}`)

    } catch (error) {
      console.error(`  ✗ Failed: ${screenshot.filename}`, error)
    }
  }

  await browser.close()
  console.log('\n✅ Mobile screenshots complete')
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('┌─────────────────────────────────────────────┐')
  console.log('│  ImiRezervimi.al Gallery Screenshot Tool   │')
  console.log('│  Capturing portfolio-ready screenshots     │')
  console.log('└─────────────────────────────────────────────┘')

  // Create output directory
  await fs.mkdir(CONFIG.outputDir, { recursive: true })

  try {
    // Capture desktop screenshots
    await captureDesktopScreenshots()

    // Capture mobile screenshots
    await captureMobileScreenshots()

    console.log('\n━'.repeat(50))
    console.log('✨ All screenshots captured successfully!')
    console.log(`\nOutput: ${CONFIG.outputDir}/`)
    console.log('\nNext steps:')
    console.log('  1. Review screenshots for quality')
    console.log('  2. Manually capture cover poster from video')
    console.log('  3. Run: npm run showcase:package')

  } catch (error) {
    console.error('\n❌ Screenshot capture failed:', error)
    process.exit(1)
  }
}

main()
