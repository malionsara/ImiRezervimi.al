// frontend/pages/salon/auth/verify.tsx
// Magic link verification page for salon authentication

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'

export default function SalonAuthVerify() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const { token } = router.query
    
    if (!token || typeof token !== 'string') {
      setStatus('error')
      setMessage('Token-i i hyrjes mungon ose është i pavlefshëm')
      return
    }

    // The API will handle the verification and redirect automatically
    // This page is just for fallback/error cases
    verifyToken(token)
  }, [router.query])

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (status === 'success' && countdown === 0) {
      // Should already be redirected by API, but fallback
      window.location.href = '/salon/dashboard'
    }
  }, [status, countdown])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/salon/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      const data = await response.json()
      
      if (data.success) {
        setStatus('success')
        setMessage('Hyrja u krye me sukses! Po ridrejtoheni...')
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push(data.data.redirectUrl)
        }, 2000)
      } else {
        setStatus('error')
        setMessage(data.error?.message || 'Gabim në verifikimin e token-it')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('Gabim në lidhje me serverin. Provoni përsëri.')
    }
  }

  const handleRetry = () => {
    router.push('/login-salon')
  }

  return (
    <>
      <Head>
        <title>Verifikim Hyrjeje - ImiRezervimi.al</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="bg-paper rounded-lg shadow-soft p-8 max-w-md w-full text-center">
          {/* Logo */}
          <div className="mx-auto h-16 w-16 rounded-lg bg-accent flex items-center justify-center mb-6 shadow-soft">
            <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={48} height={48} className="w-full h-full object-contain" />
          </div>

          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-ink mb-2">Po verifikohet...</h1>
              <p className="text-clay">Ju lutemi prisni ndërsa verifikojmë linkun tuaj të hyrjes.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-success text-6xl mb-6">✓</div>
              <h1 className="text-2xl font-bold text-success mb-2">Hyrja e suksesshme!</h1>
              <p className="text-clay mb-4">{message}</p>
              <div className="bg-success/5 border border-success/25 rounded-lg p-4">
                <p className="text-success text-sm">
                  Po ridrejtoheni në dashboard pas {countdown} sekondash...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-accent text-6xl mb-6">✕</div>
              <h1 className="text-2xl font-bold text-red-800 mb-2">Gabim në hyrje</h1>
              <p className="text-clay mb-6">{message}</p>
              
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-accent text-white rounded-lg px-4 py-3 hover:bg-accent transition-colors font-medium"
                >
                  Provo përsëri hyrjen
                </button>
                
                <div className="text-sm text-clay">
                  <p>Probleme të tjera?</p>
                  <p>Kontaktoni: support@imirezervimi.al</p>
                </div>
              </div>
            </>
          )}

          {/* Security Note */}
          <div className="mt-8 p-4 bg-cream rounded-lg">
            <div className="flex items-start">
              <div className="text-warning mr-2">!</div>
              <div className="text-xs text-clay text-left">
                <p className="font-medium mb-1">Siguria:</p>
                <ul className="space-y-1">
                  <li>• Linqet e hyrjes skadojnë për 24 orë</li>
                  <li>• Çdo link mund të përdoret vetëm një herë</li>
                  <li>• Mos e ndani linkun me të tjerë</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}