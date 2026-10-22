import { chromium } from '@playwright/test'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
const requireFromFrontend = createRequire(path.join(root, 'frontend', 'package.json'))

export const BASE_URL = process.env.SHOWCASE_BASE_URL || 'http://localhost:3000'
export const ROOT = root
export const session = () => JSON.parse(readFileSync(path.join(root, 'scripts/showcase/.demo-session.json'), 'utf8'))

export async function launch() {
  return chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb', '--hide-scrollbars'] })
}

export async function newContext(browser, opts = {}) {
  return browser.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2,
    locale: 'sq-AL', timezoneId: 'Europe/Tirane', colorScheme: 'light', ...opts,
  })
}

// Signs the demo customer in by minting the NextAuth JWT cookie with the local dev secret
// (the same claims the app's jwt callback would set after a Google sign-in).
export async function signInCustomer(context) {
  const { encode } = requireFromFrontend('next-auth/jwt')
  const c = session().customer
  const token = await encode({
    secret: process.env.NEXTAUTH_SECRET,
    token: {
      name: `${c.first_name} ${c.last_name}`, email: c.email, sub: c.id, userId: c.id,
      phone: c.phone, firstName: c.first_name, lastName: c.last_name, isRegistered: true, provider: 'google',
    },
  })
  await context.addCookies([{ name: 'next-auth.session-token', value: token, url: BASE_URL, httpOnly: true, sameSite: 'Lax' }])
}

let tokenIndex = 0
export function nextDashboardToken() {
  const tokens = session().dashboardTokens
  if (tokenIndex >= tokens.length) throw new Error('Out of dashboard tokens, re-run the seed')
  return tokens[tokenIndex++]
}

export async function settle(page, ms = 600) {
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(ms)
}
