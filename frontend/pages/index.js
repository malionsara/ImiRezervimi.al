// frontend/pages/index.js
// Albanian homepage for ImiRezervimi.al — editorial rebuild

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarCheck, MessageCircle, Scissors, Sparkles } from 'lucide-react'
import Layout, { homeLayout } from '../components/layout/Layout'
import Container from '../components/ui/Container'
import Section, { SectionHeading } from '../components/ui/Section'
import HeroVideo from '../components/ui/HeroVideo'
import Spinner from '../components/ui/Spinner'

function InstagramIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function EditorialPhoto({ src, alt, className = '' }) {
  // Plain img so pages degrade gracefully until generated media lands
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`h-full w-full object-cover ${className}`}
      onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
    />
  )
}

export default function Homepage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Spinner size="lg" label="Po ngarkohet..." />
      </div>
    )
  }

  return (
    <Layout {...homeLayout({
      title: "Rezervime Online për Sallone & Berberi",
      description: "Platforma e parë shqiptare për rezervime online në sallone bukurie dhe berberi. Rezervo me Instagram, konfirmo me WhatsApp."
    })}>
      {/* ============ HERO ============ */}
      <section className="relative min-h-[92vh] flex items-end bg-ink overflow-hidden">
        <HeroVideo
          src="/media/hero/hero-loop.mp4"
          poster="/media/hero/hero-poster.webp"
          alt="Sallon bukurie me dritë natyrale"
          className="absolute inset-0"
        />
        {/* Legibility gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/20 pointer-events-none"></div>

        <Container className="relative pb-16 sm:pb-24 pt-40 w-full">
          <div className="max-w-3xl animate-fade-up">
            <p className="text-cream/70 text-xs sm:text-sm font-medium uppercase tracking-[0.25em] mb-5">
              Platforma e parë shqiptare për rezervime online
            </p>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-cream leading-[1.05] tracking-tight mb-6">
              Rezervo te salloni yt i preferuar
            </h1>
            <p className="text-cream/80 text-lg sm:text-xl leading-relaxed max-w-xl mb-10">
              Identifikohu me Instagram, zgjidh orarin, dhe konfirmo me WhatsApp.
              Pa telefonata, pa pritje.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/salons"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white rounded font-medium text-base hover:bg-accent-strong transition-colors duration-200 btn-touch"
              >
                Zbulo Sallone
                <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
              </Link>
              <Link
                href="/salon"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-cream/30 text-cream rounded font-medium text-base hover:bg-cream/10 transition-colors duration-200 btn-touch"
              >
                Për Sallone & Berberi
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ CATEGORY DUO ============ */}
      <Section tone="cream">
        <SectionHeading
          eyebrow="Zgjidh stilin tënd"
          title="Bukuri dhe berberi, në një vend"
          subtitle="Nga manikyri te prerja klasike — gjej profesionistët më të mirë pranë teje."
        />
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          <Link href="/salons?category=beauty" className="group relative rounded-lg overflow-hidden bg-sand aspect-[4/3] block">
            <EditorialPhoto src="/media/photos/manicure-detail.webp" alt="Manikyr në sallon bukurie" className="transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-cream/70 text-xs uppercase tracking-[0.2em] mb-2">
                <Sparkles size={14} strokeWidth={1.75} aria-hidden="true" />
                Sallone Bukurie
              </div>
              <p className="font-display text-2xl sm:text-3xl text-cream">Flokë, thonj, makeup</p>
            </div>
          </Link>

          <Link href="/salons?category=barbershop" className="group relative rounded-lg overflow-hidden bg-ink aspect-[4/3] block">
            <EditorialPhoto src="/media/photos/barbershop.webp" alt="Berber duke prerë flokë" className="transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-cream/70 text-xs uppercase tracking-[0.2em] mb-2">
                <Scissors size={14} strokeWidth={1.75} aria-hidden="true" />
                Berberi & Sallone për Meshkuj
              </div>
              <p className="font-display text-2xl sm:text-3xl text-cream">Prerje, rroje, styling</p>
            </div>
          </Link>
        </div>
      </Section>

      {/* ============ HOW IT WORKS ============ */}
      <Section tone="paper" id="si-funksionon">
        <SectionHeading
          eyebrow="Si funksionon"
          title="Tre hapa deri te takimi yt"
          subtitle="Vetëm 3 hapa për rezervimin tuaj — nga Instagram te konfirmimi në WhatsApp."
        />
        <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
          {[
            {
              n: '01',
              icon: InstagramIcon,
              title: 'Zbulo në Instagram',
              text: 'Shfleto sallone ose berberi në Instagram dhe kliko linkun në bio për të rezervuar.',
            },
            {
              n: '02',
              icon: CalendarCheck,
              title: 'Rezervo Online',
              text: 'Identifikohu me Instagram dhe zgjidh shërbimin dhe orarin që të përshtatet.',
            },
            {
              n: '03',
              icon: MessageCircle,
              title: 'Konfirmo me WhatsApp',
              text: 'Merr konfirmimin në WhatsApp dhe kujtesa automatike para takimit.',
            },
          ].map((step) => {
            const Icon = step.icon
            return (
              <div key={step.n} className="relative">
                <div className="font-display text-6xl text-linen leading-none mb-4 select-none" aria-hidden="true">
                  {step.n}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center">
                    <Icon size={18} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-xl text-ink">{step.title}</h3>
                </div>
                <p className="text-clay leading-relaxed">{step.text}</p>
              </div>
            )
          })}
        </div>
      </Section>

      {/* ============ EDITORIAL PHOTO STRIP ============ */}
      <section className="bg-cream">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 h-48 sm:h-64 lg:h-80">
          <div className="bg-sand overflow-hidden"><EditorialPhoto src="/media/photos/hair-styling.webp" alt="Stilim flokësh" /></div>
          <div className="bg-linen overflow-hidden"><EditorialPhoto src="/media/photos/products-shelf.webp" alt="Produkte bukurie" /></div>
          <div className="bg-sand overflow-hidden"><EditorialPhoto src="/media/photos/reception-booking.webp" alt="Rezervim në recepsion" /></div>
          <div className="bg-linen overflow-hidden"><EditorialPhoto src="/media/photos/unisex-styling.webp" alt="Stilim unisex" /></div>
        </div>
      </section>

      {/* ============ FOR SALON OWNERS ============ */}
      <Section tone="ink">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeading
              align="left"
              dark
              eyebrow="Për pronarët e salloneve & berberive"
              title="Je pronare salloni ose berberi?"
              subtitle="Kthe ndjekësit e Instagram në klientë të rregullt. Kërkesat të vijnë të organizuara, konfirmimet dërgohen vetë në WhatsApp."
              className="mb-8"
            />
            <ul className="space-y-4 mb-10">
              {[
                'Më shumë rezervime — kërkesa 24/7, edhe kur je e mbyllur',
                'Zero thirrje të humbura — konfirmime automatike në WhatsApp',
                'Orari nën kontrollin tënd — mirato çdo kërkesë me një klik',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-cream/80">
                  <span className="mt-1 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 bg-accent-soft rounded-full"></span>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/salon"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-accent text-white rounded font-medium hover:bg-accent-strong transition-colors duration-200 btn-touch"
              >
                Regjistro Sallonin Tënd
                <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
              </Link>
              <Link
                href="/salon#deshmi"
                className="inline-flex items-center justify-center px-7 py-3.5 border border-cream/30 text-cream rounded font-medium hover:bg-cream/10 transition-colors duration-200 btn-touch"
              >
                Mëso më shumë
              </Link>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden bg-cream/5 aspect-[4/5] hidden lg:block">
            <EditorialPhoto src="/media/photos/salon-interior.webp" alt="Ambient salloni me dritë natyrale" />
          </div>
        </div>
      </Section>

      {/* ============ TESTIMONIALS ============ */}
      <Section tone="sand" id="deshmi">
        <SectionHeading
          eyebrow="Dëshmi"
          title="Çfarë thonë klientët tanë"
        />
        <div className="grid sm:grid-cols-3 gap-5 sm:gap-6">
          {[
            {
              quote: 'Shumë e thjeshtë dhe e shpejtë! Rezervova në sallonin tim të preferuar vetëm me 2 klikime.',
              name: 'Ana M.',
              city: 'Tiranë',
            },
            {
              quote: 'Më pëlqen shumë që konfirmohet në WhatsApp! Nuk harrohen më takimet.',
              name: 'Eda K.',
              city: 'Durrës',
            },
            {
              quote: 'Perfekt për rezervime të shpejta. Salloni im tani është më i organizuar.',
              name: 'Mira S.',
              city: 'Vlorë',
            },
          ].map((t) => (
            <figure key={t.name} className="testimonial bg-paper rounded-lg border border-linen p-6 sm:p-8 flex flex-col">
              <blockquote className="font-display text-lg text-ink leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 pt-4 border-t border-linen text-sm">
                <span className="font-medium text-ink">{t.name}</span>
                <span className="text-clay"> — {t.city}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* ============ FINAL CTA ============ */}
      <Section tone="cream">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-5xl text-ink tracking-tight mb-5">
            Gati për rezervimin tuaj të parë?
          </h2>
          <p className="text-clay text-lg mb-10">
            Zbulo sallonet dhe berberitë më të mira në Shqipëri dhe rezervo online sot.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white rounded font-medium text-base hover:bg-accent-strong transition-colors duration-200 btn-touch"
            >
              Fillo Tani - FALAS
              <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <Link
              href="/salon"
              className="inline-flex items-center justify-center px-8 py-4 border border-linen bg-paper text-ink rounded font-medium text-base hover:border-clay transition-colors duration-200 btn-touch"
            >
              Regjistro Sallonin
            </Link>
          </div>
        </div>
      </Section>
    </Layout>
  )
}
