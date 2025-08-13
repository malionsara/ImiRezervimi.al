// frontend/pages/index.js
// Enhanced Albanian homepage for ImiRezervimi.al

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

export default function Homepage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-6 shadow-2xl animate-pulse">
            <span className="text-3xl font-bold text-white">IR</span>
          </div>
          <div className="flex space-x-2 justify-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-gray-600 mt-4 text-lg">Po ngarkohet...</p>
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
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-200 to-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          ></div>
          <div 
            className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-red-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delayed"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          ></div>
          <div 
            className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-orange-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"
            style={{ transform: `translateY(${scrollY * 0.4}px)` }}
          ></div>
          
          {/* Floating Icons */}
          <div className="absolute top-32 left-1/4 animate-float-icon">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">💅</span>
            </div>
          </div>
          <div className="absolute top-64 right-1/4 animate-float-icon-delayed">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          <div className="absolute bottom-96 left-1/3 animate-float-icon-slow">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-xl">💄</span>
            </div>
          </div>
        </div>

        {/* Enhanced Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-red-100/50 sticky top-0 z-50 shadow-lg shadow-red-100/25">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <div className="flex items-center group">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center mr-4 shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 p-1">
                  <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">ImiRezervimi</span>
                  <span className="text-lg text-red-500 animate-pulse ml-1">.al</span>
                  <div className="text-xs text-gray-500 -mt-1">Rezervime Online</div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-8">
                <a href="#si-funksionon" className="text-gray-600 hover:text-red-500 transition-all duration-300 relative group py-2 px-4 rounded-lg hover:bg-red-50">
                  Si funksionon
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></span>
                </a>
                <Link href="/salons" className="text-gray-600 hover:text-red-500 transition-all duration-300 relative group py-2 px-4 rounded-lg hover:bg-red-50">
                  Sallone
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></span>
                </Link>
                <Link href="/salon" className="text-gray-600 hover:text-red-500 transition-all duration-300 relative group py-2 px-4 rounded-lg hover:bg-red-50">
                  Për Sallone
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></span>
                </Link>
                <a href="#kontakt" className="text-gray-600 hover:text-red-500 transition-all duration-300 relative group py-2 px-4 rounded-lg hover:bg-red-50">
                  Kontakt
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></span>
                </a>
              </nav>

              {/* CTA */}
              <div className="flex items-center space-x-4">
                <Link href="/login" className="group bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
                  <span className="relative z-10">Identifikohu</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Hero Section */}
        <section className="relative py-32 lg:py-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-red-100 via-pink-100 to-orange-100 border border-red-200/50 mb-12 shadow-lg backdrop-blur-sm animate-fade-in-up">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                <span className="text-red-600 font-semibold text-lg">✨ Platforma #1 për rezervime në Shqipëri ✨</span>
              </div>
              
              {/* Main Heading */}
              <div className="mb-8">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight">
                  Rezervo te salloni yt{' '}
                  <span className="relative inline-block">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 animate-gradient-shift">
                      i preferuar
                    </span>
                  </span>
                </h1>
                
                <p className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-5xl mx-auto leading-relaxed">
                  Platforma e parë shqiptare për rezervime online në sallone bukurie.
                  <br className="hidden md:block" />
                  <span className="text-red-500 font-semibold">Identifikohu me Instagram</span>, rezervo me 1 klik, <span className="text-green-500 font-semibold">konfirmo me WhatsApp</span>.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Link href="/salons" className="group bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white px-10 py-5 rounded-3xl font-bold hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 text-xl relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    <span className="mr-3 text-2xl">🔍</span>
                    Zbulo Sallone
                    <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <button className="group border-3 border-gray-300 text-gray-700 px-10 py-5 rounded-3xl font-bold hover:bg-white hover:border-red-300 hover:text-red-600 transition-all duration-500 text-xl shadow-lg hover:shadow-xl">
                  <span className="flex items-center">
                    <span className="mr-3 text-2xl">📱</span>
                    Shiko Demo
                    <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </span>
                </button>
              </div>

              {/* Enhanced Social Proof */}
              <div className="text-center">
                <p className="mb-8 text-xl text-gray-600">E besueshme nga <span className="text-red-500 font-bold text-2xl">500+</span> sallone të njohura në:</p>
                <div className="flex justify-center space-x-6 flex-wrap gap-4">
                  <div className="flex items-center space-x-3 px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-red-100">
                    <span className="text-2xl">🏢</span>
                    <span className="font-semibold text-gray-700">Tiranë</span>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Aktiv</span>
                  </div>
                  <div className="flex items-center space-x-3 px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-red-100">
                    <span className="text-2xl">🏢</span>
                    <span className="font-semibold text-gray-700">Durrës</span>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Aktiv</span>
                  </div>
                  <div className="flex items-center space-x-3 px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-red-100">
                    <span className="text-2xl">🏢</span>
                    <span className="font-semibold text-gray-700">Vlorë</span>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Aktiv</span>
                  </div>
                  <div className="flex items-center space-x-3 px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-red-100">
                    <span className="text-2xl">🏢</span>
                    <span className="font-semibold text-gray-700">Shkodër</span>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Aktiv</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="si-funksionon" className="py-32 bg-white/80 backdrop-blur-sm relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-2 bg-red-100 text-red-600 rounded-full text-sm font-semibold mb-6">
                SI FUNKSIONON
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Si funksionon ImiRezervimi.al?
              </h2>
              <p className="text-2xl text-gray-600">
                Vetëm <span className="text-red-500 font-bold">3 hapa</span> për rezervimin tuaj
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="relative group">
                <div className="text-center transform group-hover:scale-105 transition-all duration-500">
                  <div className="relative mb-8">
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
                      <span className="text-4xl">📱</span>
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-500">
                      <span className="text-red-600 text-lg font-bold">1</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Zbulo në Instagram</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">Shfleto sallone bukurie në Instagram dhe kliko linkun në bio për të rezervuar</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="text-center transform group-hover:scale-105 transition-all duration-500">
                  <div className="relative mb-8">
                    <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
                      <span className="text-4xl">⏰</span>
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-500">
                      <span className="text-red-600 text-lg font-bold">2</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Rezervo Online</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">Identifikohu me Instagram dhe zgjidh orarin që të përshtat</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="text-center transform group-hover:scale-105 transition-all duration-500">
                  <div className="relative mb-8">
                    <div className="w-28 h-28 bg-gradient-to-br from-pink-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
                      <span className="text-4xl">💬</span>
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-500">
                      <span className="text-red-600 text-lg font-bold">3</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Konfirmo me WhatsApp</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">Merr konfirmimin në WhatsApp dhe kujtesa automatike para takimit</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Salon Owner CTA Section */}
        <section className="py-32 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
              <div className="relative z-10 text-center">
                <div className="mb-8">
                  <div className="inline-block px-6 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-6">
                    PËR PRONARËT E SALLONEVE
                  </div>
                  <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                    Je pronare salloni?
                  </h2>
                  <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                    Bashkohu me <span className="text-purple-500 font-bold">500+ sallone</span> që kanë rritur rezervimet me <span className="text-green-500 font-bold">+150%</span> falë ImiRezervimi.al
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-2xl">📈</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Më shumë rezervime</h3>
                    <p className="text-gray-600">Rezervime 24/7 edhe kur je mbyllur</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Zero thirrje të humbura</h3>
                    <p className="text-gray-600">Konfirmime automatike në WhatsApp</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-2xl">💰</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">30 ditë falas</h3>
                    <p className="text-gray-600">Testo platformën pa asnjë kosto</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link href="/salon" className="group bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white px-10 py-5 rounded-3xl font-bold hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 text-xl relative overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center">
                      <span className="mr-3 text-2xl">🏪</span>
                      Regjistro Sallonin Tënd
                      <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  
                  <Link href="/salon#deshmi" className="group border-3 border-gray-300 text-gray-700 px-10 py-5 rounded-3xl font-bold hover:bg-white hover:border-purple-300 hover:text-purple-600 transition-all duration-500 text-xl shadow-lg hover:shadow-xl">
                    <span className="flex items-center justify-center">
                      <span className="mr-3 text-2xl">⭐</span>
                      Shiko Dëshmi
                      <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials */}
        <section className="py-32 bg-gradient-to-r from-red-50 via-pink-50 to-orange-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-2 bg-green-100 text-green-600 rounded-full text-sm font-semibold mb-6">
                DËSHMI
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Çfarë thonë klientët tanë
              </h2>
              <p className="text-2xl text-gray-600">
                <span className="text-green-500 font-bold">10,000+</span> klienta të kënaqura në të gjithë Shqipërinë
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="group bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Ana Mema</h4>
                      <p className="text-gray-500">Klienti nga Tirana</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed mb-6">
                    &ldquo;Shumë e thjeshtë dhe e shpejtë! Rezervova në sallonin tim të preferuar vetëm me 2 klikime.&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex text-yellow-400 text-xl">
                      ⭐⭐⭐⭐⭐
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      Verifikuar ✓
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="group bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">E</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Eda Kola</h4>
                      <p className="text-gray-500">Klienti nga Durrës</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed mb-6">
                    &ldquo;Më pëlqen shumë që konfirmohet në WhatsApp! Nuk harrohen më takimet.&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex text-yellow-400 text-xl">
                      ⭐⭐⭐⭐⭐
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      Verifikuar ✓
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="group bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Mira Shehu</h4>
                      <p className="text-gray-500">Klienti nga Vlorë</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed mb-6">
                    &ldquo;Perfekt për rezervime të shpejta! Salloni im tani është më i organizuar.&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex text-yellow-400 text-xl">
                      ⭐⭐⭐⭐⭐
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      Verifikuar ✓
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-32 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          
          <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-6">
                GATI PËR TË FILLUAR?
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                Gati për rezervimin tuaj të parë?
              </h2>
              <p className="text-2xl text-white/95 mb-12 leading-relaxed max-w-3xl mx-auto">
                Bashkohu me <span className="font-bold text-yellow-300">10,000+</span> klienta që kanë zgjedhur ImiRezervimi.al për nevojat e tyre të bukurisë
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/login" className="group bg-white text-red-500 px-10 py-5 rounded-3xl font-bold hover:bg-gray-50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 text-xl shadow-2xl relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center">
                  <span className="mr-3 text-2xl">🚀</span>
                  Fillo Tani - FALAS
                  <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
              </Link>
              
              <Link href="/salon" className="group border-3 border-white text-white px-10 py-5 rounded-3xl font-bold hover:bg-white hover:text-red-500 transition-all duration-500 text-xl relative overflow-hidden">
                <span className="flex items-center justify-center">
                  <span className="mr-3 text-2xl">💼</span>
                  Regjistro Sallonin
                  <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
                <div className="text-white/80">Sallone</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">10k+</div>
                <div className="text-white/80">Klienta</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">50k+</div>
                <div className="text-white/80">Rezervime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">4.9★</div>
                <div className="text-white/80">Vlerësim</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="bg-gray-900 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center mr-4 shadow-lg p-1">
                    <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={48} height={48} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold">ImiRezervimi.al</span>
                    <div className="text-sm text-gray-400">Rezervime Online</div>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed text-lg max-w-md">
                  Platforma e parë shqiptare për rezervime online në sallone bukurie. 
                  E bërë me ❤️ për komunitetin shqiptar.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="group w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-red-500 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                    <span className="text-gray-400 group-hover:text-white transition-colors duration-300">📱</span>
                  </a>
                  <a href="#" className="group w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-red-500 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                    <span className="text-gray-400 group-hover:text-white transition-colors duration-300">📱</span>
                  </a>
                  <a href="#" className="group w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-red-500 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                    <span className="text-gray-400 group-hover:text-white transition-colors duration-300">📱</span>
                  </a>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-bold mb-6 text-lg">Shërbime</h4>
                <div className="space-y-3">
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 transform">Rezervime Online</a>
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 transform">WhatsApp Njoftimet</a>
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 transform">Menaxhim Orari</a>
                </div>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-bold mb-6 text-lg">Mbështetje</h4>
                <div className="space-y-3">
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 transform">Kontakt</a>
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 transform">Ndihmë</a>
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 transform">Privatësia</a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-400">© 2025 ImiRezervimi.al. Të gjitha të drejtat e rezervuara.</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-30px, 50px) scale(1.1); }
          66% { transform: translate(20px, -20px) scale(0.9); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(25px, -25px) scale(1.05); }
        }
        
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-icon-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        
        @keyframes float-icon-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite 2s; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite 1s; }
        .animate-float-icon { animation: float-icon 4s ease-in-out infinite; }
        .animate-float-icon-delayed { animation: float-icon-delayed 4s ease-in-out infinite 1s; }
        .animate-float-icon-slow { animation: float-icon-slow 5s ease-in-out infinite 2s; }
        .animate-gradient-shift { 
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
      `}</style>
    </>
  )
}