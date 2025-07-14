// frontend/pages/index.js
// Albanian homepage for ImiRezervimi.al

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Homepage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 flex items-center justify-center">
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

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-pink-200 to-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-red-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-orange-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-red-100 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg transform hover:scale-105 transition-transform">
                  <span className="text-lg font-bold text-white">IR</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">ImiRezervimi</span>
                <span className="text-sm text-red-500 ml-2 animate-pulse">.al</span>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-8">
                <a href="#features" className="text-gray-600 hover:text-red-500 transition-colors duration-300 relative group">
                  Si funksionon
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="#salons" className="text-gray-600 hover:text-red-500 transition-colors duration-300 relative group">
                  Sallone
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="#contact" className="text-gray-600 hover:text-red-500 transition-colors duration-300 relative group">
                  Kontakt
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </nav>

              {/* CTA */}
              <div className="flex items-center space-x-4">
                <Link href="/login" className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Identifikohu
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 mb-8">
                <span className="text-red-600 font-semibold text-sm">✨ Platforma #1 për rezervime në Shqipëri</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Rezervo te salloni yt{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 animate-gradient-x">
                  i preferuar
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Platforma e parë shqiptare për rezervime online në sallone bukurie. 
                <br className="hidden md:block" />
                <span className="text-red-500 font-semibold">Identifikohu me Instagram</span>, rezervo me 1 klik, <span className="text-green-500 font-semibold">konfirmo me WhatsApp</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/login" className="group bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 text-lg shadow-lg hover:shadow-2xl">
                  <span className="mr-2">🔍</span>
                  Zbulo Sallone
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
                <a href="#demo" className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-medium hover:bg-gray-50 hover:border-red-300 transition-all duration-300 text-lg">
                  <span className="mr-2">📱</span>
                  Shiko Demo
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </a>
              </div>

              {/* Social Proof */}
              <div className="text-center text-gray-500">
                <p className="mb-6 text-lg">E besueshme nga <span className="text-red-500 font-semibold">500+</span> sallone të njohura në:</p>
                <div className="flex justify-center space-x-8 text-lg font-medium">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-full shadow-sm">
                    <span>🏢</span>
                    <span>Tiranë</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-full shadow-sm">
                    <span>🏢</span>
                    <span>Durrës</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-full shadow-sm">
                    <span>🏢</span>
                    <span>Vlorë</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-full shadow-sm">
                    <span>🏢</span>
                    <span>Shkodër</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Si funksionon ImiRezervimi.al?
              </h2>
              <p className="text-xl text-gray-600">
                Vetëm <span className="text-red-500 font-bold">3 hapa</span> për rezervimin tuaj
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <span className="text-3xl">📱</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Zbulo në Instagram</h3>
                <p className="text-gray-600 leading-relaxed">
                  Shfleto sallone bukurie në Instagram dhe kliko linkun në bio për të rezervuar
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <span className="text-3xl">⏰</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Rezervo Online</h3>
                <p className="text-gray-600 leading-relaxed">
                  Identifikohu me Instagram dhe zgjidh orarin që të përshtat
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <span className="text-3xl">💬</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Konfirmo me WhatsApp</h3>
                <p className="text-gray-600 leading-relaxed">
                  Merr konfirmimin në WhatsApp dhe kujtesa automatike para takimit
                </p>
              </div>
            </div>

            {/* Connection lines */}
            <div className="hidden md:block relative mt-8">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-2xl">
                <svg className="w-full h-4" viewBox="0 0 400 20" fill="none">
                  <path d="M50 10 Q200 10 350 10" stroke="#f87171" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Çfarë thonë klientët tanë
              </h2>
              <p className="text-xl text-gray-600">
                Mijëra klienta të kënaqura në të gjithë Shqipërinë
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Ana Mema</h4>
                    <p className="text-gray-500 text-sm">Klienti nga Tirana</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  &ldquo;Shumë e thjeshtë dhe e shpejtë! Rezervova në sallonin tim të preferuar vetëm me 2 klikime.&rdquo;
                </p>
                <div className="flex text-yellow-400 mt-4">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">E</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Eda Kola</h4>
                    <p className="text-gray-500 text-sm">Klienti nga Durrësi</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  &ldquo;Më pëlqen shumë që konfirmohet në WhatsApp! Nuk harrohen më takimet.&rdquo;
                </p>
                <div className="flex text-yellow-400 mt-4">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">M</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Mira Shehu</h4>
                    <p className="text-gray-500 text-sm">Klienti nga Vlora</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  &ldquo;Perfekt për rezervime të shpejta! Salloni im tani është më i organizuar.&rdquo;
                </p>
                <div className="flex text-yellow-400 mt-4">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Gati për rezervimin tuaj të parë?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Bashkohu me <span className="font-bold">10,000+</span> klienta që kanë zgjedhur ImiRezervimi.al për nevojat e tyre të bukurisë
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="group bg-white text-red-500 px-8 py-4 rounded-2xl font-medium hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 text-lg shadow-lg hover:shadow-2xl">
                <span className="mr-2">🚀</span>
                Fillo Tani - FALAS
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              <a href="/salon/signup" className="group border-2 border-white text-white px-8 py-4 rounded-2xl font-medium hover:bg-white hover:text-red-500 transition-all duration-300 text-lg">
                <span className="mr-2">💼</span>
                Regjistro Sallonin
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 relative">
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
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Platforma e parë shqiptare për rezervime online në sallone bukurie. 
                  E bërë me ❤️ për komunitetin shqiptar.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 transform hover:scale-110">Instagram</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 transform hover:scale-110">Facebook</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 transform hover:scale-110">WhatsApp</a>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-bold mb-4">Shërbime</h4>
                <div className="space-y-2 text-gray-400">
                  <a href="#" className="block hover:text-white transition-colors duration-300">Rezervime Online</a>
                  <a href="#" className="block hover:text-white transition-colors duration-300">WhatsApp Njoftimet</a>
                  <a href="#" className="block hover:text-white transition-colors duration-300">Menaxhim Orari</a>
                </div>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-bold mb-4">Mbështetje</h4>
                <div className="space-y-2 text-gray-400">
                  <a href="#" className="block hover:text-white transition-colors duration-300">Kontakt</a>
                  <a href="#" className="block hover:text-white transition-colors duration-300">Ndihmë</a>
                  <a href="#" className="block hover:text-white transition-colors duration-300">Privatësia</a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 ImiRezervimi.al. Të gjitha të drejtat e rezervuara.</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </>
  )
}