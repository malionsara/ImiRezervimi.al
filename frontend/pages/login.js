// frontend/pages/login.js
// Albanian login page for ImiRezervimi.al

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  
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
    } catch (err) {
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
    } catch (err) {
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
      
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg">
              <span className="text-2xl font-bold text-white">IR</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mirë se erdhe!
            </h1>
            <p className="text-gray-600">
              Identifikohu për të rezervuar në sallonin tënd të preferuar
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {/* Instagram Login Button */}
            <button
              onClick={handleInstagramLogin}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Po ngarkohet...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.160 1.219-5.160s-.312-.623-.312-1.545c0-1.448.839-2.529 1.884-2.529.888 0 1.319.664 1.319 1.46 0 .888-.565 2.216-.857 3.449-.244 1.029.516 1.868 1.532 1.868 1.839 0 3.254-1.941 3.254-4.736 0-2.475-1.776-4.203-4.317-4.203-2.94 0-4.665 2.204-4.665 4.484 0 .887.341 1.839.766 2.357.084.102.096.191.071.295-.078.312-.251 1.025-.285 1.169-.043.184-.142.223-.328.135-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.29-1.155l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                  Vazhdo me Instagram
                </div>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ose</span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Vazhdo me Google
            </button>

            {/* Terms and Privacy */}
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Duke vazhduar, ju pranoni{' '}
              <a href="/terms" className="text-red-500 hover:text-red-600">
                Kushtet e Përdorimit
              </a>{' '}
              dhe{' '}
              <a href="/privacy" className="text-red-500 hover:text-red-600">
                Politikën e Privatësisë
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Për bizneset?{' '}
              <a href="/salon/signup" className="text-red-500 hover:text-red-600 font-medium">
                Regjistroni sallonin tuaj
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}