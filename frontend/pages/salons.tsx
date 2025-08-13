// frontend/pages/salons.tsx
// Public salons listing page (separate from marketing /salon)

import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Salon {
  id: string
  name: string
  slug: string
  city?: string
  address?: string
}

export default function SalonsListPage() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)

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
    <>
      <Head>
        <title>Sallone - ImiRezervimi.al</title>
        <meta name="description" content="Shfleto sallonet e disponueshme" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold">ImiRezervimi</Link>
            <Link href="/salon" className="text-sm text-gray-600 hover:text-gray-900">Për Sallone</Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sallone</h1>
            <p className="text-gray-600">Zbulo dhe rezervoni</p>
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
              {salons.map((s: any) => (
                <Link key={s.id} href={`/${s.slug || 'salon'}`} className="bg-white rounded-xl border p-6 hover:shadow-sm transition">
                  <div className="font-semibold text-gray-900">{s.name}</div>
                  <div className="text-sm text-gray-600">{s.city || ''}{s.city && s.address ? ' • ' : ''}{s.address || ''}</div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}


