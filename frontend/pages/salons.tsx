// frontend/pages/salons.tsx
// Public salons listing page (separate from marketing /salon)

import Layout from '../components/layout/Layout'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Salon {
  id: string
  name: string
  slug: string
  city?: string
  address?: string
  description?: string
  instagram_handle?: string
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
      headerVariant="minimal"
      footerVariant="minimal"
      backgroundClass="bg-gray-50"
    >
      <div className="min-h-screen">

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Page heading + search */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sallone</h1>
              <p className="text-gray-600">Zbulo dhe rezervoni sallone të verifikuara</p>
            </div>
            <div className="w-full md:w-96">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Kërko sipas emrit, qytetit..."
                  className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-white rounded-xl border animate-pulse" />
              ))}
            </div>
          ) : salons.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border">
              <div className="text-5xl mb-4">🏪</div>
              <p className="text-gray-600">Asnjë sallon i disponueshëm</p>
              <div className="mt-6">
                <Link href="/salon/register" className="text-red-600 hover:text-red-700 font-medium">Regjistro sallonin tënd →</Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                .map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/${s.slug || 'salon'}`}
                    className="group bg-white rounded-2xl border p-6 hover:shadow-lg transition-shadow relative overflow-hidden"
                  >
                    {/* Accent background */}
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-tr from-red-50 to-pink-50 rounded-full group-hover:scale-110 transition-transform" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white flex items-center justify-center text-xl shadow">
                            💅
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 leading-tight">{s.name}</div>
                            <div className="text-sm text-gray-600">{s.city || ''}{s.city && s.address ? ' • ' : ''}{s.address || ''}</div>
                          </div>
                        </div>
                        {s.instagram_handle && (
                          <div className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full">@{s.instagram_handle}</div>
                        )}
                      </div>

                      {s.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-2">{s.description}</p>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs text-gray-500">Verifikuar në platformë</div>
                        <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                          Rezervo <span className="transition-transform group-hover:translate-x-1">→</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </main>
      </div>
    </Layout>
  )
}


