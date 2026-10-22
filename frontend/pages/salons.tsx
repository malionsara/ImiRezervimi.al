// frontend/pages/salons.tsx
// Public salons listing page (separate from marketing /salon)

import Layout from '../components/layout/Layout'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Search, Store, ArrowRight, BadgeCheck, Scissors, Sparkles } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

interface Salon {
  id: string
  name: string
  slug: string
  city?: string
  address?: string
  description?: string
  instagram_handle?: string
  category?: 'beauty' | 'barbershop' | 'unisex'
}

const categoryPhotos: Record<string, string> = {
  beauty: '/media/photos/manicure-detail.webp',
  barbershop: '/media/photos/barbershop.webp',
  unisex: '/media/photos/unisex-styling.webp',
}

export default function SalonsListPage() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const res = await fetch('/api/salon/popular?limit=24')
        const data = await res.json()
        if (data.success) setSalons(data.data || [])
      } catch (e) {
        console.error('Failed to load salons', e)
      } finally {
        setLoading(false)
      }
    }
    fetchSalons()
  }, [])

  return (
    <Layout
      title="Sallone"
      description="Shfleto sallonet e disponueshme dhe rezervo online në çdo moment"
      headerVariant="default"
      footerVariant="default"
      backgroundClass="bg-cream"
    >
      <div className="min-h-screen">

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Page heading + search */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent mb-2">
                Zbulo & rezervo
              </p>
              <h1 className="font-display text-3xl sm:text-4xl text-ink tracking-tight">Sallone</h1>
              <p className="text-clay mt-2">Zbulo dhe rezervo në sallone të verifikuara</p>
            </div>
            <div className="w-full md:w-96">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Kërko sipas emrit, qytetit..."
                  className="w-full bg-paper border border-linen rounded pl-11 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-colors"
                />
                <Search
                  size={17}
                  strokeWidth={1.75}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-clay"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-paper rounded-lg border border-linen overflow-hidden">
                  <Skeleton className="h-40 w-full rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : salons.length === 0 ? (
            <div className="bg-paper rounded-lg border border-linen">
              <EmptyState
                icon={Store}
                title="Asnjë sallon i disponueshëm"
                description="Sallonet e reja shfaqen këtu sapo verifikohen."
                action={
                  <Link href="/salon/register" className="inline-flex items-center gap-2 text-accent hover:text-accent-strong font-medium">
                    Regjistro sallonin tënd
                    <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {salons
                .filter((s: any) => {
                  const q = query.trim().toLowerCase()
                  if (!q) return true
                  return (
                    (s.name || '').toLowerCase().includes(q) ||
                    (s.city || '').toLowerCase().includes(q) ||
                    (s.description || '').toLowerCase().includes(q)
                  )
                })
                .map((s: any) => {
                  const category = s.category || 'beauty'
                  const CategoryIcon = category === 'barbershop' ? Scissors : Sparkles
                  return (
                  <Link
                    key={s.id}
                    href={`/${s.slug || 'salon'}`}
                    data-theme={category}
                    className="group bg-paper rounded-lg border border-linen overflow-hidden hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* Photo header with category fallback */}
                    <div className="relative h-40 bg-sand overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={categoryPhotos[category] || categoryPhotos.beauty}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent"></div>
                      {s.instagram_handle && (
                        <div className="absolute top-3 right-3 text-xs bg-paper/90 backdrop-blur text-ink px-2.5 py-1 rounded-full">
                          @{s.instagram_handle}
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center gap-1.5 text-xs bg-ink/50 backdrop-blur text-cream px-2.5 py-1 rounded-full">
                          <CategoryIcon size={12} strokeWidth={1.75} aria-hidden="true" />
                          {category === 'barbershop' ? 'Berber' : category === 'unisex' ? 'Unisex' : 'Bukuri'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="font-display text-lg text-ink leading-tight mb-1">{s.name}</div>
                      <div className="text-sm text-clay">
                        {s.city || ''}{s.city && s.address ? ' • ' : ''}{s.address || ''}
                      </div>

                      {s.description && (
                        <p className="text-sm text-clay line-clamp-2 mt-2">{s.description}</p>
                      )}

                      <div className="mt-4 pt-4 border-t border-linen flex items-center justify-between">
                        <div className="inline-flex items-center gap-1.5 text-xs text-clay">
                          <BadgeCheck size={13} strokeWidth={1.75} className="text-success" aria-hidden="true" />
                          Verifikuar në platformë
                        </div>
                        <span className="inline-flex items-center gap-1 text-accent font-medium text-sm">
                          Rezervo
                          <ArrowRight size={15} strokeWidth={1.75} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )})}
            </div>
          )}
        </main>
      </div>
    </Layout>
  )
}
