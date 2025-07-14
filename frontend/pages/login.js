// frontend/pages/login.js
// Albanian login page for ImiRezervimi.al

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])
  
  const handleInstagramLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await signIn('facebook', {
        callbackUrl: router.query.callbackUrl || '/dashboard',
        redirect: true // Let NextAuth handle the redirect
      })
      
      if (result?.error) {
        setError('Ka ndodhur një gabim gjatë identifikimit. Provoni përsëri.')
      }
    } catch {
      setError('Ka ndodhur një gabim gjatë identifikimit. Provoni përsëri.')
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
        redirect: false
      })
      
      if (result?.error) {
        setError('Ka ndodhur një gabim gjatë identifikimit. Provoni përsëri.')
      }
    } catch {
      setError('Ka ndodhur një gabim gjatë identifikimit. Provoni përsëri.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Identifikohu - ImiRezervimi.al</title>
        <meta name="description" content="Identifikohu për të rezervuar në sallonin tënd të preferuar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-pink-200 to-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-red-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-orange-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 animate-bounce animation-delay-1000">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">💅</span>
            </div>
          </div>
          <div className="absolute top-40 right-1/4 animate-bounce animation-delay-2000">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          <div className="absolute bottom-40 left-1/3 animate-bounce animation-delay-3000">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">💄</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
          <div className={`max-w-md w-full space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Logo and Header */}
            <div className="text-center">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <span className="text-3xl font-bold text-white">IR</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Mirë se erdhe!
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Identifikohu për të rezervuar në sallonin tënd të preferuar
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 animate-shake">
                  <p className="text-red-600 text-sm text-center font-medium">{error}</p>
                </div>
              )}
              
              {/* Instagram Login Button */}
              <button
                onClick={handleInstagramLogin}
                disabled={loading}
                className="w-full group relative overflow-hidden flex items-center justify-center px-6 py-4 border border-transparent rounded-2xl text-white bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {loading ? (
                  <div className="flex items-center relative z-10">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium">Po ngarkohet...</span>
                  </div>
                ) : (
                  <div className="flex items-center relative z-10">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.160 1.219-5.160s-.312-.623-.312-1.545c0-1.448.839-2.529 1.884-2.529.888 0 1.319.664 1.319 1.46 0 .888-.565 2.216-.857 3.449-.244 1.029.516 1.868 1.532 1.868 1.839 0 3.254-1.941 3.254-4.736 0-2.475-1.776-4.203-4.317-4.203-2.94 0-4.665 2.204-4.665 4.484 0 .887.341 1.839.766 2.357.084.102.096.191.071.295-.078.312-.251 1.025-.285 1.169-.043.184-.142.223-.328.135-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.29-1.155l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                    <span className="font-medium">Vazhdo me Instagram</span>
                    <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </div>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 text-gray-500 font-medium">ose</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full group relative overflow-hidden flex items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-2xl bg-white/90 text-gray-700 hover:bg-white hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50/0 via-gray-50/50 to-gray-50/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="flex items-center relative z-10">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-medium">Vazhdo me Google</span>
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </button>

              {/* Security Badge */}
              <div className="flex items-center justify-center space-x-2 mt-6 p-4 bg-green-50 rounded-2xl border border-green-200">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-green-600 text-sm font-medium">Identifikimi është 100% i sigurt</span>
              </div>

              {/* Terms and Privacy */}
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Duke vazhduar, ju pranoni{' '}
                <a href="/terms" className="text-red-500 hover:text-red-600 font-medium underline underline-offset-2">
                  Kushtet e Përdorimit
                </a>{' '}
                dhe{' '}
                <a href="/privacy" className="text-red-500 hover:text-red-600 font-medium underline underline-offset-2">
                  Politikën e Privatësisë
                </a>
              </p>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Për bizneset?{' '}
                <a href="/salon/signup" className="text-red-500 hover:text-red-600 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all duration-200">
                  Regjistroni sallonin tuaj
                </a>
              </p>
              
              {/* Back to Homepage */}
              <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kthehu në ballina
              </Link>
            </div>
          </div>
        </div>
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
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  )
}