#!/usr/bin/env tsx
/**
 * Demo Data Seed Script for ImiRezervimi.al Showcase
 * Creates realistic Albanian beauty salon demo data for portfolio video
 *
 * SAFETY: Refuses to run against production database
 * Usage: npm run seed:demo -- --force-demo
 */

import { createClient } from '@supabase/supabase-js'

// ============================================
// SAFETY CHECKS
// ============================================
const PRODUCTION_URLS = [
  'imirezervimi.al',
  'imirezervimi.com',
  '.supabase.co/rest/v1/rpc', // Production Supabase pattern
]

function isProductionDatabase(url: string): boolean {
  return PRODUCTION_URLS.some(prod => url.toLowerCase().includes(prod))
}

// ============================================
// CONFIGURATION
// ============================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  process.exit(1)
}

// Safety check
if (isProductionDatabase(supabaseUrl)) {
  console.error('⚠️  PRODUCTION DATABASE DETECTED!')
  console.error('This script refuses to run against production.')
  console.error(`Database URL: ${supabaseUrl}`)
  process.exit(1)
}

// Require --force-demo flag
if (!process.argv.includes('--force-demo')) {
  console.error('⚠️  This script creates demo data and requires --force-demo flag')
  console.error('Usage: tsx scripts/seed-demo-data.ts --force-demo')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// DEMO DATA DEFINITIONS
// ============================================

const DEMO_SALONS = [
  {
    name: 'Klea Beauty Studio',
    slug: 'klea-beauty-studio',
    description: 'Sallon modern i bukurisë në zemër të Tiranës. Specialisht për thonj dhe vetulla.',
    phone: '+355682234567',
    email: 'info@kleabeauty.example.com',
    address: 'Rruga e Kavajës 145, Tiranë',
    city: 'Tiranë',
    instagram_handle: 'klea.beauty.al',
    status: 'active',
    working_hours: {
      monday: { open: '09:00', close: '19:00', closed: false },
      tuesday: { open: '09:00', close: '19:00', closed: false },
      wednesday: { open: '09:00', close: '19:00', closed: false },
      thursday: { open: '09:00', close: '19:00', closed: false },
      friday: { open: '09:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false }
    },
    services: [
      { name: 'Manikyr', duration_minutes: 45, price: 15, sort_order: 1 },
      { name: 'Pedikyr', duration_minutes: 60, price: 20, sort_order: 2 },
      { name: 'Ngjyrosje Flokësh', duration_minutes: 90, price: 35, sort_order: 3 },
      { name: 'Prerje Flokësh', duration_minutes: 30, price: 10, sort_order: 4 },
      { name: 'Vetullat', duration_minutes: 20, price: 8, sort_order: 5 }
    ]
  },
  {
    name: "Sara's Nails & Spa",
    slug: 'saras-nails-spa',
    description: 'Ekspert për thonj dhe spa në Bllok. Ambiente relaksuese dhe profesionale.',
    phone: '+355682345678',
    email: 'contact@sarasnails.example.com',
    address: 'Blloku, Rruga Pjeter Bogdani 12',
    city: 'Tiranë',
    instagram_handle: 'saras_nails_tirana',
    status: 'active',
    services: [
      { name: 'Manikyr Klasik', duration_minutes: 45, price: 12, sort_order: 1 },
      { name: 'Manikyr me Xhel', duration_minutes: 60, price: 18, sort_order: 2 },
      { name: 'Pedikyr me Spa', duration_minutes: 75, price: 25, sort_order: 3 },
      { name: 'Masazh Duarsh', duration_minutes: 30, price: 15, sort_order: 4 }
    ]
  },
  {
    name: 'Diva Hair Salon',
    slug: 'diva-hair-salon',
    description: 'Salloni më i njohur në Durrës për stilime dhe ngjyrosje profesionale.',
    phone: '+355682456789',
    email: 'hello@divahair.example.com',
    address: 'Rruga Taulantia 89, Durrës',
    city: 'Durrës',
    instagram_handle: 'divahair.durres',
    status: 'active',
    services: [
      { name: 'Prerje dhe Stilim', duration_minutes: 45, price: 15, sort_order: 1 },
      { name: 'Ngjyrosje e Plotë', duration_minutes: 120, price: 45, sort_order: 2 },
      { name: 'Balayage', duration_minutes: 150, price: 60, sort_order: 3 },
      { name: 'Trajtim Keratinë', duration_minutes: 90, price: 40, sort_order: 4 }
    ]
  },
  {
    name: 'Glam Studio Tirana',
    slug: 'glam-studio-tirana',
    description: 'Studio e plotë e bukurisë me shërbime premium për gra moderne.',
    phone: '+355682567890',
    email: 'info@glamstudio.example.com',
    address: '21 Dhjetori, Pranë Pazarit të Ri',
    city: 'Tiranë',
    instagram_handle: 'glamstudio.al',
    status: 'active',
    services: [
      { name: 'Makeup Profesional', duration_minutes: 60, price: 30, sort_order: 1 },
      { name: 'Vetullat dhe Qerpikët', duration_minutes: 30, price: 12, sort_order: 2 },
      { name: 'Trajtim Fytyre', duration_minutes: 75, price: 35, sort_order: 3 }
    ]
  },
  {
    name: 'Elegance Beauty Lounge',
    slug: 'elegance-beauty-lounge',
    description: 'Salloni më elegant në Vlorë, me shërbime ekskluzive bukurie.',
    phone: '+355682678901',
    email: 'contact@elegance.example.com',
    address: 'Rruga Ismail Qemali 23, Vlorë',
    city: 'Vlorë',
    instagram_handle: 'elegance.vlore',
    status: 'active',
    services: [
      { name: 'Manikyr Premium', duration_minutes: 60, price: 20, sort_order: 1 },
      { name: 'Pedikyr Premium', duration_minutes: 75, price: 28, sort_order: 2 },
      { name: 'Massage Relaksues', duration_minutes: 60, price: 35, sort_order: 3 }
    ]
  }
]

const DEMO_CUSTOMER = {
  first_name: 'Elona',
  last_name: 'Hoxha',
  phone: '+355692345678',
  email: 'elona.hoxha@example.com',
  instagram_id: 'elona_beauty_al',
  profile_photo_url: 'https://i.pravatar.cc/150?img=45',
  account_type: 'social',
  phone_verified: true,
  whatsapp_confirmed: true,
  rating: 4.8,
  total_visits: 12,
  no_shows: 0,
  cancellation_rate: 0,
  is_active: true
}

// ============================================
// SEED FUNCTIONS
// ============================================

async function clearDemoData() {
  console.log('🧹 Cleaning existing demo data...')

  // Delete in reverse order of dependencies
  await supabase.from('appointments').delete().ilike('customer_notes', '%demo%')
  await supabase.from('services').delete().match({ name: 'Manikyr' })
  await supabase.from('customers').delete().eq('email', DEMO_CUSTOMER.email)
  await supabase.from('salons').delete().in('slug', DEMO_SALONS.map(s => s.slug))

  console.log('✅ Cleaned existing demo data')
}

async function seedSalons() {
  console.log('💅 Seeding demo salons...')

  for (const salonData of DEMO_SALONS) {
    const { services, ...salonInfo } = salonData

    // Insert salon
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .insert(salonInfo)
      .select()
      .single()

    if (salonError) {
      console.error(`❌ Failed to create salon ${salonData.name}:`, salonError)
      continue
    }

    console.log(`  ✓ Created: ${salon.name}`)

    // Insert services for this salon
    const servicesWithSalonId = services.map(service => ({
      ...service,
      salon_id: salon.id,
      is_active: true
    }))

    const { error: servicesError } = await supabase
      .from('services')
      .insert(servicesWithSalonId)

    if (servicesError) {
      console.error(`❌ Failed to create services for ${salonData.name}:`, servicesError)
    } else {
      console.log(`    + ${services.length} services`)
    }
  }

  console.log('✅ Salons seeded successfully')
}

async function seedCustomer() {
  console.log('👤 Seeding demo customer...')

  const { data: customer, error } = await supabase
    .from('customers')
    .insert(DEMO_CUSTOMER)
    .select()
    .single()

  if (error) {
    console.error('❌ Failed to create customer:', error)
    return null
  }

  console.log(`  ✓ Created: ${customer.first_name} ${customer.last_name}`)
  return customer
}

async function seedExistingAppointments(customerId: string) {
  console.log('📅 Seeding existing appointments...')

  // Get Klea Beauty Studio
  const { data: salon } = await supabase
    .from('salons')
    .select('id, name')
    .eq('slug', 'klea-beauty-studio')
    .single()

  if (!salon) {
    console.error('❌ Klea Beauty Studio not found')
    return
  }

  // Get Pedikyr service
  const { data: service } = await supabase
    .from('services')
    .select('id, name, price, duration_minutes')
    .eq('salon_id', salon.id)
    .eq('name', 'Pedikyr')
    .single()

  if (!service) {
    console.error('❌ Pedikyr service not found')
    return
  }

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const appointments = [
    // Approved appointment for today at 10:00
    {
      salon_id: salon.id,
      customer_id: customerId,
      service_id: service.id,
      appointment_date: today.toISOString().split('T')[0],
      start_time: '10:00',
      duration_minutes: service.duration_minutes,
      service_name: service.name,
      service_price: service.price,
      customer_notes: 'Demo appointment - Today morning',
      status: 'approved',
      priority_score: 8.5,
      responded_at: new Date().toISOString()
    },
    // Approved appointment for today at 16:00
    {
      salon_id: salon.id,
      customer_id: customerId,
      service_id: service.id,
      appointment_date: today.toISOString().split('T')[0],
      start_time: '16:00',
      duration_minutes: service.duration_minutes,
      service_name: service.name,
      service_price: service.price,
      customer_notes: 'Demo appointment - Today afternoon',
      status: 'approved',
      priority_score: 7.2,
      responded_at: new Date().toISOString()
    },
    // Completed appointment yesterday
    {
      salon_id: salon.id,
      customer_id: customerId,
      service_id: service.id,
      appointment_date: yesterday.toISOString().split('T')[0],
      start_time: '14:00',
      duration_minutes: service.duration_minutes,
      service_name: service.name,
      service_price: service.price,
      customer_notes: 'Demo appointment - Completed yesterday',
      status: 'completed',
      priority_score: 8.0,
      responded_at: yesterday.toISOString(),
      completed_at: yesterday.toISOString()
    }
  ]

  const { error } = await supabase.from('appointments').insert(appointments)

  if (error) {
    console.error('❌ Failed to create appointments:', error)
  } else {
    console.log(`  ✓ Created ${appointments.length} existing appointments`)
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('┌─────────────────────────────────────────────┐')
  console.log('│  ImiRezervimi.al Demo Data Seed Script     │')
  console.log('│  ⚠️  DEMO DATA ONLY - NOT FOR PRODUCTION   │')
  console.log('└─────────────────────────────────────────────┘')
  console.log('')
  console.log(`Database: ${supabaseUrl}`)
  console.log('')

  try {
    // Step 1: Clear existing demo data
    await clearDemoData()

    // Step 2: Seed salons and services
    await seedSalons()

    // Step 3: Seed customer
    const customer = await seedCustomer()

    // Step 4: Seed existing appointments
    if (customer) {
      await seedExistingAppointments(customer.id)
    }

    console.log('')
    console.log('✨ Demo data seeded successfully!')
    console.log('')
    console.log('Demo Accounts:')
    console.log('  Customer: elona.hoxha@example.com (+355692345678)')
    console.log('  Salons: 5 Albanian beauty salons in Tiranë, Durrës, Vlorë')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Start dev server: npm run dev')
    console.log('  2. Run recording script: npm run record:showcase')
    console.log('')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

main()
