// frontend/pages/index.js
// Albanian homepage for ImiRezervimi.al

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Homepage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg animate-pulse">
            <span className="text-2xl font-bold text-white">IR</span>
          </div>
          <p className="text-gray-600">Po ngarkohet...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>ImiRezervimi.al - Rezervime Online për Sallone Bukurie</title>
        <meta name="description" content="Platforma e parë shqiptare për rezervime online në sallone bukurie. Rezervo me Instagram, konfirmo me WhatsApp." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="ImiRezervimi.al - Rezervime Online për Sallone Bukurie" />
        <meta property="og:description" content="Rezervo te salloni yt i preferuar me vetëm 1 klik!" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:url" content="https://imirezervimi.al" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-red-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-lg font-bold text-white">IR</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">ImiRezervimi</span>
                <span className="text-sm text-red-500 ml-2">.al</span>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-8">
                <a href="#features" className="text-gray-600 hover:text-red-500 transition-colors">Si funksionon</a>
                <a href="#salons" className="text-gray-600 hover:text-red-500 transition-colors">Sallone</a>
                <a href="#contact" className="text-gray-600 hover:text-red-500 transition-colors">Kontakt</a>
              </nav>

              {/* CTA */}
              <div className="flex items-center space-x-4">
                <Link href="/login" className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105">
                  Identifikohu
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Rezervo te salloni yt{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                  i preferuar
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Platforma e parë shqiptare për rezervime online në sallone bukurie. 
                Identifikohu me Instagram, rezervo me 1 klik, konfirmo me WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/login" className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 text-lg">
                  🔍 Zbulo Sallone
                </Link>
                <a href="#demo" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all text-lg">
                  📱 Shiko Demo
                </a>
              </div>

              {/* Social Proof */}
              <div className="text-center text-gray-500">
                <p className="mb-4">E besueshme nga sallone të njohura në:</p>
                <div className="flex justify-center space-x-8 text-lg font-medium">
                  <span>🏢 Tiranë</span>
                  <span>🏢 Durrës</span>
                  <span>🏢 Vlorë</span>
                  <span>🏢 Shkodër</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Si funksionon ImiRezervimi.al?
              </h2>
              <p className="text-xl text-gray-600">
                Vetëm 3 hapa për rezervimin tuaj
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Zbulo në Instagram</h3>
                <p className="text-gray-600">
                  Shfleto sallone bukurie në Instagram dhe kliko linkun në bio për të rezervuar
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">⏰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Rezervo Online</h3>
                <p className="text-gray-600">
                  Identifikohu me Instagram dhe zgjidh orarin që të përshtat
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Konfirmo me WhatsApp</h3>
                <p className="text-gray-600">
                  Merr konfirmimin në WhatsApp dhe kujtesa automatike para takimit
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-red-500 to-pink-500">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Gati për rezervimin tuaj të parë?
            </h2>
            <p className="text-xl text-red-100 mb-8">
              Bashkohu me mijëra klienta që kanë zgjedhur ImiRezervimi.al për nevojat e tyre të bukurisë
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="bg-white text-red-500 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all transform hover:scale-105 text-lg">
                🚀 Fillo Tani - FALAS
              </Link>
              <a href="/salon/signup" className="border-2 border-white text-white px-8 py-4 rounded-xl font-medium hover:bg-white hover:text-red-500 transition-all text-lg">
                💼 Regjistro Sallonin
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mr-3">
                    <span className="text-lg font-bold text-white">IR</span>
                  </div>
                  <span className="text-2xl font-bold">ImiRezervimi.al</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Platforma e parë shqiptare për rezervime online në sallone bukurie. 
                  E bërë me ❤️ për komunitetin shqiptar.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">WhatsApp</a>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-bold mb-4">Shërbime</h4>
                <div className="space-y-2 text-gray-400">
                  <a href="#" className="block hover:text-white transition-colors">Rezervime Online</a>
                  <a href="#" className="block hover:text-white transition-colors">WhatsApp Njoftimet</a>
                  <a href="#" className="block hover:text-white transition-colors">Menaxhim Orari</a>
                </div>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-bold mb-4">Mbështetje</h4>
                <div className="space-y-2 text-gray-400">
                  <a href="#" className="block hover:text-white transition-colors">Kontakt</a>
                  <a href="#" className="block hover:text-white transition-colors">Ndihmë</a>
                  <a href="#" className="block hover:text-white transition-colors">Privatësia</a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 ImiRezervimi.al. Të gjitha të drejtat e rezervuara.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}