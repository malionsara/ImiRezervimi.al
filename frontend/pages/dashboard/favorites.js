// frontend/pages/dashboard/favorites.js
// Customer favorite salons page - ImiRezervimi.al

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchFavorites()
    }
  }, [status, router])

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      // TODO: Create API endpoint for user favorites
      // For now, we'll show a placeholder
      setTimeout(() => {
        setFavorites([])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      setLoading(false)
    }
  }

  const handleBookSalon = (salonSlug) => {
    router.push(`/${salonSlug}`)
  }

  const handleRemoveFavorite = async (salonId) => {
    // TODO: Implement remove from favorites
    console.log('Remove from favorites:', salonId)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-lg bg-paper flex items-center justify-center mb-4 shadow-soft animate-pulse p-2">
            <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={64} height={64} />
          </div>
          <p className="text-clay">Po ngarkon...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <>
      <Head>
        <title>Sallone të Preferuara - ImiRezervimi.al</title>
        <meta name="description" content="Sallone që keni shënuar si të preferuara" />
      </Head>

      <div className="min-h-screen bg-cream">
        {/* Header */}
        <header className="bg-paper shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/dashboard">
                  <a className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-paper flex items-center justify-center mr-3 p-1 border">
                      <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={32} height={32} />
                    </div>
                    <span className="text-xl font-bold text-ink">ImiRezervimi</span>
                  </a>
                </Link>
                <span className="ml-4 text-clay/70">•</span>
                <span className="ml-4 text-clay">Sallone të Preferuara</span>
              </div>
              
              <Link href="/dashboard">
                <a className="text-clay hover:text-ink text-sm">
                  ← Kthehu te Dashboard
                </a>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink mb-2">Sallone të Preferuara</h1>
            <p className="text-clay">Sallone që keni shënuar si të preferuara për rezervim të shpejtë</p>
          </div>

          {/* Favorites List */}
          {favorites.length === 0 ? (
            <div className="text-center py-12 bg-paper rounded border">
              <div className="text-clay/70 text-6xl mb-4">⭐</div>
              <h3 className="text-lg font-semibold text-ink mb-2">
                Nuk keni sallone të preferuara ende
              </h3>
              <p className="text-clay mb-6">
                Zbuloni sallone dhe shtojini në listën tuaj të preferuarash për rezervim më të lehtë.
              </p>
              <Link href="/salon">
                <a className="inline-flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-strong transition-colors">
                  Zbulo Sallone
                </a>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((salon) => (
                <div key={salon.id} className="bg-paper rounded shadow-sm p-6 border hover:shadow-md transition-shadow">
                  <div className="w-full h-32 bg-accent rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-clay/70 text-4xl"></span>
                  </div>
                  
                  <h3 className="font-semibold text-ink mb-2">{salon.name}</h3>
                  <p className="text-clay text-sm mb-3">{salon.description}</p>
                  <p className="text-clay text-xs mb-4">{salon.address}, {salon.city}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm text-clay ml-1">4.8</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(salon.id)}
                      className="text-red-400 hover:text-accent text-sm"
                    >
                      Hiq
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleBookSalon(salon.slug)}
                    className="w-full px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent transition-colors"
                  >
                    Rezervo Tani
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tips Section */}
          <div className="mt-12 bg-accent-soft/40 border border-accent/25 rounded p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Këshilla</h3>
            <div className="text-accent-strong text-sm space-y-1">
              <p>• Shtoni sallone në të preferuara për t'i gjetur më lehtë</p>
              <p>• Sallone të preferuara shfaqen në krye të listës gjatë kërkimit</p>
              <p>• Merrni njoftime për ofertat speciale nga sallone të preferuara</p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}