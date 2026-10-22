#!/usr/bin/env tsx
/**
 * Seeds the invented demo account used for the Tech Atlas showcase (video + gallery).
 * Re-running replaces the previous demo data: every salon/customer with an @example.com email is deleted first.
 *
 * Refuses to run unless the Supabase URL is local, or its host is listed in SHOWCASE_ALLOWED_HOSTS
 * (for a staging project). Never point this at production.
 *
 *   set -a; source scripts/showcase/devdb/.env.showcase; set +a
 *   npx tsx scripts/seed-demo-data.ts
 */
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ''

function assertNotProduction() {
  if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  const host = new URL(url).hostname
  const local = ['localhost', '127.0.0.1', '::1', 'host.docker.internal'].includes(host)
  const allowed = (process.env.SHOWCASE_ALLOWED_HOSTS || '').split(',').map(s => s.trim()).filter(Boolean)
  const prodMarkers = [process.env.PRODUCTION_SUPABASE_URL, 'imirezervimi.al'].filter(Boolean) as string[]
  if (prodMarkers.some(m => url.includes(m)) || process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    throw new Error(`Refusing to seed: ${url} looks like production`)
  }
  if (!local && !allowed.includes(host)) {
    throw new Error(`Refusing to seed remote database ${host}. Add it to SHOWCASE_ALLOWED_HOSTS only if it is a dev/staging project.`)
  }
}

const tz = 'Europe/Tirane'
const day = (offset: number) => {
  const d = new Date(Date.now() + offset * 86400000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d)
}

const allDays = (open: string, close: string, sunday = true) => Object.fromEntries(
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => [
    d, { open, close, closed: d === 'sunday' ? !sunday : false },
  ]),
)

const SALONS = [
  {
    name: 'Atelier Iris', slug: 'atelier-iris', category: 'beauty', city: 'Tiranë',
    address: 'Rruga Ismail Qemali 27, Blloku', instagram_handle: 'atelier.iris.demo',
    description: 'Studio thonjsh dhe vetullash në Bllok. Manikyr me xhel, pedikyr spa dhe laminim vetullash.',
    phone: '+355690000101', email: 'atelier.iris@example.com', working_hours: allDays('09:00', '20:00'),
    services: [
      ['Manikyr me xhel', 'Formë, kutikulë dhe ngjyrë xhel që zgjat 3 javë.', 20, 60],
      ['Pedikyr spa', 'Banjë me kripëra, peeling dhe masazh i shkurtër.', 25, 60],
      ['Laminim vetullash', 'Formësim dhe fiksim për vetulla të rregullta.', 18, 45],
      ['Manikyr klasik', 'Pastrim, formësim dhe llak i zakonshëm.', 12, 40],
    ],
  },
  {
    name: 'Studio Dafina', slug: 'studio-dafina', category: 'beauty', city: 'Tiranë',
    address: 'Rruga e Durrësit 112', instagram_handle: 'studio.dafina.demo',
    description: 'Ngjyrosje, balayage dhe prerje për flokë të shëndetshëm.',
    phone: '+355690000102', email: 'studio.dafina@example.com', working_hours: allDays('09:00', '19:00'),
    services: [['Balayage', 'Ngjyrosje me dorë të lirë me tonifikim.', 95, 150], ['Prerje dhe fën', 'Prerje me larje dhe stilim.', 18, 45]],
  },
  {
    name: 'Berberi Teuta', slug: 'berberi-teuta', category: 'barbershop', city: 'Durrës',
    address: 'Bulevardi Epidamn 18', instagram_handle: 'berberi.teuta.demo',
    description: 'Prerje klasike, fade dhe rregullim mjekre me brisk.',
    phone: '+355690000103', email: 'berberi.teuta@example.com', working_hours: allDays('10:00', '20:00'),
    services: [['Fade', 'Prerje fade me makinë dhe gërshërë.', 10, 30], ['Mjekër me brisk', 'Peshqir i ngrohtë dhe brisk.', 8, 25]],
  },
  {
    name: 'Lumi Beauty Lounge', slug: 'lumi-beauty-lounge', category: 'beauty', city: 'Vlorë',
    address: 'Lungomare, Rruga Justin Godart 5', instagram_handle: 'lumi.lounge.demo',
    description: 'Trajtime fytyre, makeup dhe qerpikë pranë detit.',
    phone: '+355690000104', email: 'lumi.lounge@example.com', working_hours: allDays('09:00', '19:00'),
    services: [['Trajtim fytyre', 'Pastrim i thellë dhe maskë hidratuese.', 35, 60], ['Makeup për ceremoni', 'Makeup i plotë me qerpikë.', 45, 60]],
  },
  {
    name: 'Nora Nails', slug: 'nora-nails', category: 'beauty', city: 'Shkodër',
    address: 'Rruga Kolë Idromeno 9', instagram_handle: 'nora.nails.demo',
    description: 'Nail art, zgjatime dhe kujdes për duart.',
    phone: '+355690000105', email: 'nora.nails@example.com', working_hours: allDays('09:00', '18:00'),
    services: [['Zgjatim thonjsh', 'Zgjatim me akrilik ose xhel.', 30, 90], ['Nail art', 'Dizajn me dorë për 2–10 thonj.', 12, 30]],
  },
  {
    name: 'Barber Studio Erion', slug: 'barber-studio-erion', category: 'barbershop', city: 'Tiranë',
    address: 'Rruga Myslym Shyri 44', instagram_handle: 'barber.erion.demo',
    description: 'Prerje moderne për burra dhe djem, pa pritje.',
    phone: '+355690000106', email: 'barber.erion@example.com', working_hours: allDays('09:00', '21:00'),
    services: [['Prerje burrash', 'Prerje me larje.', 8, 30], ['Prerje + mjekër', 'Paketa e plotë.', 14, 45]],
  },
] as const

const CUSTOMERS = [
  // [first, last, phone, rating, visits, cancellation rate]. Elona is the filmed customer; the app caps
  // priority at 100, so the others stay under it and her new request sorts first in the salon queue.
  ['Elona', 'Kraja', '+355690000201', 4.9, 23, 0],
  ['Arta', 'Leka', '+355690000202', 4.0, 2, 0.12],
  ['Besa', 'Marku', '+355690000203', 4.5, 6, 0],
  ['Jonida', 'Hysa', '+355690000204', 4.1, 3, 0.12],
  ['Mirela', 'Dervishi', '+355690000205', 4.2, 3, 0],
  ['Sidorela', 'Gjoni', '+355690000206', 4.2, 2, 0.12],
  ['Klaudia', 'Prifti', '+355690000207', 3.9, 2, 0],
] as const

async function main() {
  assertNotProduction()
  const db = createClient(url, key, { auth: { persistSession: false } })
  const must = <T>(r: { data: T; error: any }, what: string) => {
    if (r.error) throw new Error(`${what}: ${r.error.message}`)
    return r.data
  }

  must(await db.from('salons').delete().like('email', '%@example.com'), 'clear salons')
  must(await db.from('customers').delete().like('email', '%@example.com'), 'clear customers')

  const salonIds: Record<string, string> = {}
  const serviceIds: Record<string, { id: string; name: string; price: number; duration: number }[]> = {}
  for (const s of SALONS) {
    const { services, ...row } = s
    const salon = must(await db.from('salons').insert({ ...row, status: 'active', whatsapp_number: row.phone }).select('id').single(), `salon ${s.slug}`) as any
    salonIds[s.slug] = salon.id
    const svc = must(await db.from('services').insert(services.map(([name, description, price, duration_minutes], i) => ({
      salon_id: salon.id, name, description, price, duration_minutes, sort_order: i + 1, is_active: true,
    }))).select('id,name,price,duration_minutes'), `services ${s.slug}`) as any[]
    serviceIds[s.slug] = svc.map(x => ({ id: x.id, name: x.name, price: Number(x.price), duration: x.duration_minutes }))
  }

  const customers = must(await db.from('customers').insert(CUSTOMERS.map(([first_name, last_name, phone, rating, total_visits, cancellation_rate]) => ({
    first_name, last_name, phone, rating, total_visits, cancellation_rate,
    email: `${first_name}.${last_name}`.toLowerCase() + '@example.com',
    account_type: 'social', phone_verified: true, whatsapp_confirmed: true, no_shows: 0,
  }))).select('id,first_name,last_name,email,phone'), 'customers') as any[]
  const byName = Object.fromEntries(customers.map(c => [c.first_name, c]))

  // Activity at the featured salon. Elona (the filmed customer) has no pending request there,
  // so the app's 2-pending-per-salon limit never blocks the take.
  const iris = serviceIds['atelier-iris']
  const appt = (who: string, svc: number, offset: number, time: string, status: string, notes?: string) => ({
    salon_id: salonIds['atelier-iris'], customer_id: byName[who].id, service_id: iris[svc].id,
    service_name: iris[svc].name, service_price: iris[svc].price, duration_minutes: iris[svc].duration,
    appointment_date: day(offset), start_time: time, status, customer_notes: notes ?? null,
    requested_at: new Date(Date.now() - (3 - offset) * 3600_000).toISOString(),
    ...(status !== 'pending' ? { responded_at: new Date().toISOString() } : {}),
  })
  must(await db.from('appointments').insert([
    appt('Jonida', 0, 1, '10:00', 'pending', 'Ngjyrë nude, formë bajame.'),
    appt('Arta', 1, 1, '12:30', 'pending'),
    appt('Sidorela', 2, 2, '11:00', 'pending', 'Hera e parë me laminim.'),
    appt('Klaudia', 3, 3, '17:00', 'pending'),
    appt('Besa', 0, 0, '15:00', 'approved'),
    appt('Mirela', 3, 0, '18:00', 'approved'),
    appt('Elona', 0, 0, '09:30', 'completed'),
  ]), 'appointments')

  const tokens = Array.from({ length: 6 }, () => 'showcase-' + randomBytes(16).toString('hex'))
  must(await db.from('salon_auth_tokens').insert(tokens.map(token => ({
    salon_id: salonIds['atelier-iris'], token, phone: '+355690000101',
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  }))), 'dashboard tokens')

  const out = path.join(process.cwd(), 'scripts', 'showcase', '.demo-session.json')
  writeFileSync(out, JSON.stringify({
    featuredSlug: 'atelier-iris', featuredSalonId: salonIds['atelier-iris'],
    customer: byName['Elona'], dashboardTokens: tokens,
  }, null, 2))
  console.log(`Seeded ${SALONS.length} salons, ${customers.length} customers. Session info: ${path.relative(process.cwd(), out)}`)
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
