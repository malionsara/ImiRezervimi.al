// frontend/pages/salon/index.js
// Marketing-focused salon landing page for Albanian beauty salon platform

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

export default function SalonLanding() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Për Sallone - ImiRezervimi.al | Platforma më e madhe e rezervimeve</title>
        <meta name="description" content="Bashkohuni me 500+ sallone që përdorin ImiRezervimi.al për të rritur rezervimet dhe kënaqësinë e klientëve. Filloni falas sot!" />
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
        </div>

        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-red-100/50 sticky top-0 z-50 shadow-lg shadow-red-100/25">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center group">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center mr-4 shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 p-1">
                  <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">ImiRezervimi</span>
                  <span className="text-lg text-red-500 animate-pulse ml-1">.al</span>
                  <div className="text-xs text-gray-500 -mt-1">Për Sallone</div>
                </div>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-8">
                <a href="#avantazhet" className="text-gray-600 hover:text-red-500 transition-all duration-300 relative group py-2 px-4 rounded-lg hover:bg-red-50">
                  Avantazhet
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></span>
                </a>
                <a href="#si-funksionon" className="text-gray-600 hover:text-red-500 transition-all duration-300 relative group py-2 px-4 rounded-lg hover:bg-red-50">
                  Si funksionon
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></span>
                </a>
                <a href="#deshmi" className="text-gray-600 hover:text-red-500 transition-all duration-300 relative group py-2 px-4 rounded-lg hover:bg-red-50">
                  Dëshmi
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></span>
                </a>
                <a href="#cmimi" className="text-gray-600 hover:text-red-500 transition-all duration-300 relative group py-2 px-4 rounded-lg hover:bg-red-50">
                  Çmimi
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></span>
                </a>
              </nav>

              {/* CTA */}
              <div className="flex items-center space-x-4">
                <Link href="/login-salon" className="group border-2 border-red-500 text-red-500 px-6 py-3 rounded-2xl font-semibold hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                  <span className="relative z-10">Hyr</span>
                </Link>
                <Link href="/salon/register" className="group bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
                  <span className="relative z-10">Fillo Tani</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-32 lg:py-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 border border-green-200/50 mb-12 shadow-lg backdrop-blur-sm animate-fade-in-up">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                <span className="text-green-600 font-semibold text-lg">✨ 500+ sallone aktive në platformë ✨</span>
              </div>
              
              {/* Main Heading */}
              <div className="mb-8">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight">
                  Rrit rezervimet e{' '}
                  <span className="relative inline-block">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 animate-gradient-shift">
                      sallonit tënd
                    </span>
                  </span>
                </h1>
                
                <p className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-5xl mx-auto leading-relaxed">
                  Bashkohu me <span className="text-red-500 font-semibold">platformën #1</span> të rezervimeve në Shqipëri.
                  <br className="hidden md:block" />
                  <span className="text-green-500 font-semibold">Automatizo rezervimet</span>, rrit kënaqësinë e klientëve, <span className="text-blue-500 font-semibold">rritu biznesin</span>.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Link href="/salon/register" className="group bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white px-10 py-5 rounded-3xl font-bold hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 text-xl relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    <span className="mr-3 text-2xl">🚀</span>
                    Fillo Falas Sot
                    <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link href="/login-salon" className="group border-3 border-red-500 text-red-600 px-10 py-5 rounded-3xl font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-500 text-xl shadow-lg hover:shadow-2xl hover:shadow-red-500/30 transform hover:scale-105 hover:-translate-y-2">
                  <span className="flex items-center">
                    <span className="mr-3 text-2xl">🏪</span>
                    Hyr në Dashboard
                    <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </span>
                </Link>
                
                <button className="group border-3 border-gray-300 text-gray-700 px-10 py-5 rounded-3xl font-bold hover:bg-white hover:border-red-300 hover:text-red-600 transition-all duration-500 text-xl shadow-lg hover:shadow-xl">
                  <span className="flex items-center">
                    <span className="mr-3 text-2xl">📞</span>
                    Na Kontakto
                    <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </span>
                </button>
              </div>

              {/* Success Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100">
                  <div className="text-3xl md:text-4xl font-bold text-red-500 mb-2">+150%</div>
                  <div className="text-gray-600 font-medium">Rritje rezervimesh</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                  <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2">-80%</div>
                  <div className="text-gray-600 font-medium">Thirrje të humbura</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
                  <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">4.9★</div>
                  <div className="text-gray-600 font-medium">Vlerësim mesatar</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
                  <div className="text-3xl md:text-4xl font-bold text-purple-500 mb-2">24/7</div>
                  <div className="text-gray-600 font-medium">Rezervime online</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="avantazhet" className="py-32 bg-white/80 backdrop-blur-sm relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-2 bg-red-100 text-red-600 rounded-full text-sm font-semibold mb-6">
                AVANTAZHET
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Pse të zgjedhësh ImiRezervimi.al?
              </h2>
              <p className="text-2xl text-gray-600">
                Platforma që <span className="text-red-500 font-bold">transformon</span> mënyrën se si menaxhon sallonin tënd
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Benefit 1 */}
              <div className="group bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
                    <span className="text-3xl">📈</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Rrit rezervimet</h3>
                  <p className="text-gray-600 leading-relaxed text-lg text-center">
                    Mesatarisht +150% më shumë rezervime brenda 30 ditëve të para. Klientët rezervojnë 24/7 edhe kur je e mbyllur.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="group bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Automatizo procesin</h3>
                  <p className="text-gray-600 leading-relaxed text-lg text-center">
                    Nuk do të humbasësh më thirrje. Konfirmimet automatike në WhatsApp dhe kujtesa për klientët.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="group bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Më shumë klienta</h3>
                  <p className="text-gray-600 leading-relaxed text-lg text-center">
                    Zbulohesh nga mijëra klienta të reja që kërkojnë shërbimet e tua në platformën tonë.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="si-funksionon" className="py-32 bg-gradient-to-r from-red-50 via-pink-50 to-orange-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6">
                SI FUNKSIONON
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Si funksionon për sallonin tënd?
              </h2>
              <p className="text-2xl text-gray-600">
                Vetëm <span className="text-blue-500 font-bold">3 hapa</span> për të filluar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="relative group">
                <div className="text-center transform group-hover:scale-105 transition-all duration-500">
                  <div className="relative mb-8">
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
                      <span className="text-4xl">📝</span>
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-500">
                      <span className="text-red-600 text-lg font-bold">1</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Regjistrohesh falas</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">Plotëso formularin e regjistrimit me informacionet e sallonit dhe shërbimet që ofron</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="text-center transform group-hover:scale-105 transition-all duration-500">
                  <div className="relative mb-8">
                    <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
                      <span className="text-4xl">⚙️</span>
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-500">
                      <span className="text-red-600 text-lg font-bold">2</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Konfiguron orarin</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">Cakton oraret e punës, shërbimet, çmimet dhe të gjitha detajet e sallonit tënd</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="text-center transform group-hover:scale-105 transition-all duration-500">
                  <div className="relative mb-8">
                    <div className="w-28 h-28 bg-gradient-to-br from-pink-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
                      <span className="text-4xl">🚀</span>
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-500">
                      <span className="text-red-600 text-lg font-bold">3</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Fillon të rezervosh</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">Klientët fillojnë të rezervojnë online dhe ti merr konfirmimet automatike në WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="deshmi" className="py-32 bg-white/80 backdrop-blur-sm relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-2 bg-green-100 text-green-600 rounded-full text-sm font-semibold mb-6">
                DËSHMI TË SALLONEVE
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Çfarë thonë sallone si e joja?
              </h2>
              <p className="text-2xl text-gray-600">
                <span className="text-green-500 font-bold">500+</span> sallone të kënaqura në të gjithë Shqipërinë
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="group bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">B</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Beauty Salon &ldquo;Elegance&rdquo;</h4>
                      <p className="text-gray-500">Tirana</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed mb-6">
                    &ldquo;Rezervimet u rritën me 200% brenda 3 muajve! Tani nuk humbasim asnjë rezervim dhe klientët janë super të kënaqura.&rdquo;
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
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">G</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Glam Studio</h4>
                      <p className="text-gray-500">Durrës</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed mb-6">
                    &ldquo;Më pëlqen sistemi automatik i WhatsApp. Tani klientët nuk harrojnë takimet dhe kam më pak anulime.&rdquo;
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
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">R</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Royal Beauty</h4>
                      <p className="text-gray-500">Vlorë</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed mb-6">
                    &ldquo;Fantastike! Klientët e reja vijnë çdo ditë nga platforma. Është investimi më i mirë që kam bërë.&rdquo;
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

        {/* Pricing Section */}
        <section id="cmimi" className="py-32 bg-gradient-to-r from-gray-50 via-white to-gray-50 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-6">
                ÇMIMI
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                E gjitha falas për 30 ditë
              </h2>
              <p className="text-2xl text-gray-600">
                Testo platformën pa asnjë kosto, pastaj vendos nëse do të vazhdosh
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/50 relative overflow-hidden max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5"></div>
              <div className="relative z-10 text-center">
                <div className="mb-8">
                  <div className="text-6xl font-bold text-gray-900 mb-2">FALAS</div>
                  <div className="text-lg text-gray-600">për 30 ditë të para</div>
                </div>
                
                <div className="space-y-4 mb-8 text-left">
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">✓</span>
                    <span className="text-gray-700">Rezervime të pakufizuara</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">✓</span>
                    <span className="text-gray-700">WhatsApp automatik</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">✓</span>
                    <span className="text-gray-700">Menaxhim orari</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">✓</span>
                    <span className="text-gray-700">Mbështetje 24/7</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">✓</span>
                    <span className="text-gray-700">Analytics dhe raporte</span>
                  </div>
                </div>

                <Link href="/salon/register" className="group w-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white py-4 px-8 rounded-2xl font-bold hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-500 transform hover:scale-105 text-lg relative overflow-hidden inline-block">
                  <span className="relative z-10 flex items-center justify-center">
                    <span className="mr-3 text-xl">🚀</span>
                    Fillo Testimin Falas
                    <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>

                <p className="text-sm text-gray-500 mt-4">
                  Nuk kërkohet kartë krediti • Anulo kur të duash
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          
          <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-6">
                GATI PËR TË FILLUAR?
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                Bashkohu me suksesin sot!
              </h2>
              <p className="text-2xl text-white/95 mb-12 leading-relaxed max-w-3xl mx-auto">
                Mijëra sallone kanë zgjedhur ImiRezervimi.al për të rritur biznesin e tyre. Tani është radha jote!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/salon/register" className="group bg-white text-red-500 px-10 py-5 rounded-3xl font-bold hover:bg-gray-50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 text-xl shadow-2xl relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center">
                  <span className="mr-3 text-2xl">🎉</span>
                  Fillo Regjistrimin
                  <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
              </Link>
              
              <a href="tel:+355694567890" className="group border-3 border-white text-white px-10 py-5 rounded-3xl font-bold hover:bg-white hover:text-red-500 transition-all duration-500 text-xl relative overflow-hidden">
                <span className="flex items-center justify-center">
                  <span className="mr-3 text-2xl">📞</span>
                  +355 69 456 7890
                  <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
              </a>
            </div>

            {/* Final Stats */}
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

        {/* Footer */}
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
                    <div className="text-sm text-gray-400">Për Sallone</div>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed text-lg max-w-md">
                  Platforma më e madhe e rezervimeve në Shqipëri. 
                  E bërë me ❤️ për sallone si e joja.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-bold mb-6 text-lg">Për Sallone</h4>
                <div className="space-y-3">
                  <Link href="/salon/register" className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 transform">Regjistrohu</Link>
                  <a href="#avantazhet" className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 transform">Avantazhet</a>
                  <a href="#cmimi" className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 transform">Çmimi</a>
                </div>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-bold mb-6 text-lg">Mbështetje</h4>
                <div className="space-y-3">
                  <a href="tel:+355694567890" className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 transform">+355 69 456 7890</a>
                  <a href="mailto:sallone@imirezervimi.al" className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 transform">sallone@imirezervimi.al</a>
                  <Link href="/" className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 transform">Për Klienta</Link>
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
        .animate-gradient-shift { 
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
      `}</style>
    </>
  )
}