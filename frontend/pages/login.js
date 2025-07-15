// frontend/pages/login.js
// Enhanced Albanian login page for ImiRezervimi.al

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  const handleInstagramLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await signIn('facebook', {
        callbackUrl: router.query.callbackUrl || '/dashboard',
        redirect: true
      })
      
      if (result?.error) {
        setError('Ka ndodhur një gabim gjatë identifikimit. Ju lutemi provoni përsëri.')
      }
    } catch {
      setError('Ka ndodhur një gabim gjatë identifikimit. Ju lutemi provoni përsëri.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await signIn('google', {
        callbackUrl: router.query.callbackUrl || '/dashboard',
        redirect: true
      })
      
      if (result?.error) {
        setError('Ka ndodhur një gabim gjatë identifikimit. Ju lutemi provoni përsëri.')
      }
    } catch {
      setError('Ka ndodhur një gabim gjatë identifikimit. Ju lutemi provoni përsëri.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Identifikohu - ImiRezervimi.al</title>
        <meta name="description" content="Identifikohu me Instagram ose Google për të rezervuar në sallonin tënd të preferuar." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated Gradient Orbs */}
          <div 
            className="absolute w-96 h-96 bg-gradient-to-r from-pink-200 to-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
            style={{ 
              left: `${20 + mousePosition.x * 0.02}%`, 
              top: `${10 + mousePosition.y * 0.02}%` 
            }}
          ></div>
          <div 
            className="absolute w-96 h-96 bg-gradient-to-r from-red-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delayed"
            style={{ 
              right: `${10 + mousePosition.x * 0.015}%`, 
              top: `${30 + mousePosition.y * 0.01}%` 
            }}
          ></div>
          <div 
            className="absolute w-96 h-96 bg-gradient-to-r from-orange-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"
            style={{ 
              left: `${30 + mousePosition.x * 0.01}%`, 
              bottom: `${-10 + mousePosition.y * 0.005}%` 
            }}
          ></div>

          {/* Floating Icons */}
          <div className="absolute top-20 left-10 animate-float-icon">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">📱</span>
            </div>
          </div>
          <div className="absolute top-32 right-20 animate-float-icon-delayed">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💄</span>
            </div>
          </div>
          <div className="absolute bottom-32 left-16 animate-float-icon-slow">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-xl">✨</span>
            </div>
          </div>
          <div className="absolute bottom-40 right-32 animate-float-icon">
            <div className="w-18 h-18 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">💅</span>
            </div>
          </div>

          {/* Geometric Shapes */}
          <div className="absolute top-1/4 right-1/4 animate-spin-slow">
            <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-400 rounded-lg opacity-60"></div>
          </div>
          <div className="absolute bottom-1/3 left-1/4 animate-spin-reverse">
            <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-60"></div>
          </div>
          <div className="absolute top-1/2 left-10 animate-bounce-slow">
            <div className="w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-sm opacity-60"></div>
          </div>
        </div>

        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-red-100/50 relative z-50 shadow-lg shadow-red-100/25">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center group">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center mr-4 shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 p-1">
                  <img src="/favicon-96x96.png" alt="ImiRezervimi Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">ImiRezervimi</span>
                  <span className="text-lg text-red-500 animate-pulse ml-1">.al</span>
                  <div className="text-xs text-gray-500 -mt-1">Rezervime Online</div>
                </div>
              </Link>

              {/* Back to Homepage */}
              <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kthehu në ballina
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative">
          <div className={`max-w-md w-full space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Welcome Header */}
            <div className="text-center">
              {/* Logo Circle */}
              <div className="mx-auto h-20 w-20 rounded-3xl bg-white flex items-center justify-center mb-8 shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-500 group p-2">
                <img src="/favicon-96x96.png" alt="ImiRezervimi Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              
              {/* Welcome Text */}
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Mirë se erdhe! ✨
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Identifikohu për të rezervuar në sallonin tënd të preferuar
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center space-x-2 mb-8">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-8 h-1 bg-gray-200 rounded-full">
                  <div className="w-4 h-1 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              </div>
            </div>

            {/* Login Buttons */}
            <div className="space-y-6">
              {/* Instagram Login Button */}
              <button
                onClick={handleInstagramLogin}
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-5 px-6 border border-transparent text-lg font-semibold rounded-3xl text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:from-purple-700 hover:via-pink-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-center">
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                      <span>Po ngarkohet...</span>
                    </div>
                  ) : (
                    <>
                      {/* Instagram Icon */}
                      <div className="flex items-center justify-center w-8 h-8 mr-4 bg-white/20 rounded-lg backdrop-blur-sm">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      Vazhdo me Instagram
                      <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </>
                  )}
                </div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-6 bg-gradient-to-r from-pink-50 via-red-50 to-orange-50 text-gray-500 font-medium">ose</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-5 px-6 border-2 border-gray-300 text-lg font-semibold rounded-3xl text-gray-700 bg-white hover:bg-gray-50 hover:border-red-300 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl overflow-hidden"
              >
                <div className="relative flex items-center">
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-600 border-t-transparent mr-3"></div>
                      <span>Po ngarkohet...</span>
                    </div>
                  ) : (
                    <>
                      {/* Google Icon */}
                      <svg className="w-6 h-6 mr-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Vazhdo me Google
                      <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </>
                  )}
                </div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </button>
            </div>

            {/* Security Badge */}
            <div className="text-center mt-8">
              <div className="inline-flex items-center px-6 py-3 bg-green-50 border border-green-200 rounded-2xl shadow-sm">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium text-sm">Identifikimi është 100% i sigurt</span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl shadow-sm animate-shake">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="text-center text-sm text-gray-500 space-y-2">
              <p>Duke vazhduar, ju pranoni</p>
              <div className="flex justify-center space-x-4">
                <Link href="#" className="text-red-500 hover:text-red-600 transition-colors duration-200 hover:underline">
                  Kushtet e Përdorimit
                </Link>
                <span>dhe</span>
                <Link href="#" className="text-red-500 hover:text-red-600 transition-colors duration-200 hover:underline">
                  Politikën e Privatësisë
                </Link>
              </div>
            </div>

            {/* Fun Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-2xl font-bold text-red-500">500+</div>
                <div className="text-xs text-gray-600">Sallone</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-2xl font-bold text-green-500">10k+</div>
                <div className="text-xs text-gray-600">Klienta</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-2xl font-bold text-blue-500">4.9★</div>
                <div className="text-xs text-gray-600">Vlerësim</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>
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
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0px); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite 2s; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite 1s; }
        .animate-float-icon { animation: float-icon 4s ease-in-out infinite; }
        .animate-float-icon-delayed { animation: float-icon-delayed 4s ease-in-out infinite 1s; }
        .animate-float-icon-slow { animation: float-icon-slow 5s ease-in-out infinite 2s; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 6s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </>
  )
}