// Captures showcase/gallery/*.png (1600x1000, product only) from the seeded demo account.
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { launch, newContext, signInCustomer, settle, BASE_URL, ROOT, nextDashboardToken } from './lib.mjs'

const OUT = path.join(ROOT, 'showcase/gallery')
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const opts = { viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 }
const shot = (page, name) => page.mouse.move(1599, 999).then(() => page.waitForTimeout(250)).then(() => page.screenshot({ path: path.join(OUT, name), animations: 'disabled' }).then(() => console.log('  ' + name)))

const browser = await launch()
try {
  const anon = await newContext(browser, opts)
  const web = await anon.newPage()
  await web.goto(BASE_URL + '/'); await settle(web, 2500)
  await shot(web, '1-website.png')

  const customer = await newContext(browser, opts)
  await signInCustomer(customer)
  const app = await customer.newPage()
  await app.goto(BASE_URL + '/salons'); await settle(app, 2000)
  await shot(app, '2-salons.png')

  await app.goto(BASE_URL + '/atelier-iris'); await settle(app, 1500)
  await app.getByText('Manikyr me xhel').first().click()
  await app.getByRole('button', { name: /Vazhdo/ }).click()
  await app.getByRole('button', { name: 'Muaji i ardhshëm' }).waitFor()
  const tomorrow = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Tirane' }).format(new Date(Date.now() + 86400000))
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Tirane' }).format(new Date())
  if (tomorrow.slice(5, 7) !== today.slice(5, 7)) await app.getByRole('button', { name: 'Muaji i ardhshëm' }).click()
  await app.getByRole('button', { name: new RegExp(`^${Number(tomorrow.slice(8))}$`) }).click()
  await app.getByRole('button', { name: /^14:00/ }).first().click()
  await settle(app, 500)
  await app.getByText('Zgjidhni datën dhe orën').first().evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40))
  await settle(app, 600)
  await shot(app, '3-booking.png')

  await app.getByRole('button', { name: /Vazhdo/ }).click()
  await app.getByRole('button', { name: /Dërgo/ }).click()
  await app.getByText('Rezervimi u dërgua!').waitFor()
  await settle(app, 800)
  await shot(app, '4-request-sent.png')

  const salon = await newContext(browser, opts)
  const dash = await salon.newPage()
  await dash.goto(BASE_URL + '/salon/auth/verify?token=' + nextDashboardToken())
  await dash.waitForURL(/salon\/dashboard/)
  await dash.getByText('Elona Kraja').first().waitFor()
  await settle(dash, 1500)
  await shot(dash, '5-salon-requests.png')
} finally {
  await browser.close()
}
