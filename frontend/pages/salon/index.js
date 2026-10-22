// frontend/pages/salon/index.js
// B2B landing for salon & barbershop owners — editorial rebuild

import Link from 'next/link'
import { ArrowRight, CalendarCheck, MessageCircle, Clock, Check, Phone, Settings, Send } from 'lucide-react'
import Layout, { salonLayout } from '../../components/layout/Layout'
import Container from '../../components/ui/Container'
import Section, { SectionHeading } from '../../components/ui/Section'
import HeroVideo from '../../components/ui/HeroVideo'

function EditorialPhoto({ src, alt, className = '' }) {
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

export default function SalonLandingPage() {
  return (
    <Layout {...salonLayout({
      title: "Për Sallone & Berberi",
      description: "Menaxho rezervimet e sallonit tënd në një vend — kërkesat nga Instagram, konfirmimet automatike në WhatsApp. Falas për 30 ditë."
    })}>
      {/* ============ HERO ============ */}
      <section className="relative min-h-[85vh] flex items-end bg-ink overflow-hidden">
        <div className="absolute inset-0">
          <EditorialPhoto
            src="/media/photos/salon-interior.webp"
            alt="Ambient salloni me stacione stilimi"
            className="opacity-70"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/50 to-ink/30 pointer-events-none"></div>

        <Container className="relative pb-16 sm:pb-24 pt-40 w-full">
          <div className="max-w-3xl animate-fade-up">
            <p className="text-cream/70 text-xs sm:text-sm font-medium uppercase tracking-[0.25em] mb-5">
              Për pronarët e salloneve & berberive
            </p>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-cream leading-[1.05] tracking-tight mb-6">
              Salloni yt, i rezervuar plotësisht
            </h1>
            <p className="text-cream/80 text-lg sm:text-xl leading-relaxed max-w-xl mb-10">
              Kthe ndjekësit e Instagram në klientë të rregullt. Kërkesat të vijnë
              të organizuara, konfirmimet dërgohen vetë në WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/salon/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white rounded font-medium text-base hover:bg-accent-strong transition-colors duration-200 btn-touch"
              >
                Fillo Tani - FALAS
                <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
              </Link>
              <Link
                href="/login-salon"
                className="inline-flex items-center justify-center px-8 py-4 border border-cream/30 text-cream rounded font-medium text-base hover:bg-cream/10 transition-colors duration-200 btn-touch"
              >
                Hyr në llogarinë tënde
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ ADVANTAGES ============ */}
      <Section tone="cream" id="avantazhet">
        <SectionHeading
          eyebrow="Avantazhet"
          title="Pse sallonet zgjedhin ImiRezervimi"
          subtitle="Më pak kohë në telefon, më shumë kohë me klientët."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {[
            {
              icon: CalendarCheck,
              title: 'Rezervime 24/7',
              text: 'Klientët rezervojnë edhe kur salloni është i mbyllur. Ti i miraton kur të duash.',
            },
            {
              icon: MessageCircle,
              title: 'WhatsApp automatik',
              text: 'Konfirmimet dhe kujtesat dërgohen vetë. Zero thirrje të humbura, më pak mungesa.',
            },
            {
              icon: Clock,
              title: 'Orari nën kontroll',
              text: 'Cakto oraret e punës, shërbimet dhe çmimet. Çdo kërkesë miratohet me një klik.',
            },
          ].map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="bg-paper rounded-lg border border-linen p-7 sm:p-8">
                <span className="inline-flex w-11 h-11 rounded-full bg-accent-soft items-center justify-center mb-5">
                  <Icon size={20} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
                </span>
                <h3 className="font-display text-xl text-ink mb-2">{f.title}</h3>
                <p className="text-clay leading-relaxed">{f.text}</p>
              </div>
            )
          })}
        </div>
      </Section>

      {/* ============ HOW IT WORKS (owners) ============ */}
      <Section tone="ink" id="si-funksionon">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeading
              align="left"
              dark
              eyebrow="Si funksionon"
              title="Nga regjistrimi te rezervimi i parë"
              className="mb-10"
            />
            <div className="space-y-8">
              {[
                {
                  n: '01',
                  icon: Settings,
                  title: 'Konfiguro sallonin',
                  text: 'Cakton oraret e punës, shërbimet, çmimet dhe të gjitha detajet e sallonit tënd.',
                },
                {
                  n: '02',
                  icon: Send,
                  title: 'Vendos linkun në bio',
                  text: 'Merr linkun tënd personal dhe vendose në bio të Instagram. Kaq.',
                },
                {
                  n: '03',
                  icon: Check,
                  title: 'Mirato kërkesat',
                  text: 'Kërkesat të vijnë në dashboard. Ti i miraton dhe klienti njoftohet në WhatsApp.',
                },
              ].map((step) => {
                const Icon = step.icon
                return (
                  <div key={step.n} className="flex gap-5">
                    <span className="font-display text-2xl text-cream/30 select-none w-10 shrink-0" aria-hidden="true">
                      {step.n}
                    </span>
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <Icon size={17} strokeWidth={1.75} className="text-accent-soft" aria-hidden="true" />
                        <h3 className="font-display text-lg text-cream">{step.title}</h3>
                      </div>
                      <p className="text-cream/60 leading-relaxed">{step.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden bg-cream/5 aspect-[4/5] hidden lg:block">
            <HeroVideo
              src="/media/clips/scissors.mp4"
              poster="/media/clips/scissors-poster.webp"
              alt="Gërshërë berberi në lëvizje të ngadaltë"
              className="absolute inset-0"
              eager={false}
            />
          </div>
        </div>
      </Section>

      {/* ============ TESTIMONIALS ============ */}
      <Section tone="paper" id="deshmi">
        <SectionHeading
          eyebrow="Dëshmi"
          title="Çfarë thonë pronarët"
        />
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {[
            {
              quote: 'Tani nuk humbasim asnjë rezervim dhe klientet janë super të kënaqura. Gjithçka është më e organizuar.',
              name: 'Pronare salloni',
              city: 'Tiranë',
            },
            {
              quote: 'Klientët rezervojnë direkt nga Instagrami dhe mua më vjen kërkesa gati. Më kursen orë të tëra në telefon.',
              name: 'Pronar berberi',
              city: 'Durrës',
            },
          ].map((t, i) => (
            <figure key={i} className="testimonial bg-cream rounded-lg border border-linen p-7 sm:p-9 flex flex-col">
              <blockquote className="font-display text-lg sm:text-xl text-ink leading-relaxed flex-1">
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

      {/* ============ PRICING ============ */}
      <Section tone="sand" id="cmimi">
        <SectionHeading
          eyebrow="Çmimi"
          title="E gjitha falas për 30 ditë"
          subtitle="Testo platformën pa asnjë kosto, pastaj vendos nëse do të vazhdosh."
        />
        <div className="bg-paper rounded-lg border border-linen shadow-soft p-8 sm:p-12 max-w-lg mx-auto text-center">
          <div className="mb-8">
            <div className="font-display text-5xl sm:text-6xl text-ink mb-2">FALAS</div>
            <div className="text-clay">për 30 ditët e para</div>
          </div>

          <ul className="space-y-3.5 mb-10 text-left max-w-xs mx-auto">
            {[
              'Rezervime të pakufizuara',
              'WhatsApp automatik',
              'Menaxhim orari',
              'Mbështetje 24/7',
              'Analytics dhe raporte',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check size={17} strokeWidth={2} className="text-success shrink-0" aria-hidden="true" />
                <span className="text-ink">{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/salon/register"
            className="inline-flex w-full items-center justify-center gap-2 px-8 py-4 bg-accent text-white rounded font-medium text-base hover:bg-accent-strong transition-colors duration-200 btn-touch"
          >
            Fillo Testimin Falas
            <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
          </Link>

          <p className="text-sm text-clay mt-4">
            Nuk kërkohet kartë krediti • Anulo kur të duash
          </p>
        </div>
      </Section>

      {/* ============ FINAL CTA ============ */}
      <Section tone="cream">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-5xl text-ink tracking-tight mb-5">
            Gati të rrisësh sallonin tënd?
          </h2>
          <p className="text-clay text-lg mb-10">
            Regjistrohu sot dhe merr rezervimin e parë online brenda ditës.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/salon/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white rounded font-medium text-base hover:bg-accent-strong transition-colors duration-200 btn-touch"
            >
              Regjistro Sallonin Tënd
              <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <a
              href="tel:+355694567890"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-linen bg-paper text-ink rounded font-medium text-base hover:border-clay transition-colors duration-200 btn-touch"
            >
              <Phone size={18} strokeWidth={1.75} aria-hidden="true" />
              Na telefono
            </a>
          </div>
        </div>
      </Section>
    </Layout>
  )
}
