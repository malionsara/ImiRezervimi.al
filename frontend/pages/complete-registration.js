// frontend/pages/complete-registration.js
// Phone verification page for completing social login registration

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import WhatsAppVerification from '../components/auth/WhatsAppVerification'
import { showToast } from '../components/ToastProvider'

export default function CompleteRegistration() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [verificationError, setVerificationError] = useState('')

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (status === 'unauthenticated') {
      // Not logged in - redirect to login
      router.push('/login')
      return
    }

    if (session?.user?.isRegistered) {
      // Already registered - redirect to dashboard
      router.push('/dashboard')
      return
    }

    // User is ready for phone verification
    // No additional loading needed
  }, [session, status, router])


  // Handle successful phone verification
  const handleVerificationComplete = async (phone) => {
    setIsLoading(true)
    try {
      // Create complete user record in database with verified phone
      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phone,
          userData: session.user.tempData
        })
      })

      if (response.ok) {
        // Registration complete - refresh session to update isRegistered status
        console.log('✅ Registration completed, refreshing session...')
        
        // Update session to trigger JWT callback refresh
        await update()
        
        // Small delay to ensure session is updated
        setTimeout(() => {
          router.push('/dashboard?welcome=true')
        }, 500)
      } else {
        const errorData = await response.json()
        console.error('Registration failed:', errorData)
        showToast.error(errorData.error?.message || 'Regjistrimi dështoi. Ju lutemi provoni përsëri.')
        throw new Error('Registration failed')
      }
    } catch (error) {
      console.error('Registration completion error:', error)
      // Handle error - could show user-friendly message
      if (error.message !== 'Registration failed') {
        showToast.error('Ka ndodhur një gabim. Ju lutemi provoni përsëri.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle verification errors
  const handleVerificationError = (error) => {
    setVerificationError(error)
    console.error('Verification error:', error)
  }


  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-lg bg-paper flex items-center justify-center mb-4 shadow-soft animate-pulse p-2">
            <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={64} height={64} className="w-full h-full object-contain" />
          </div>
          <p className="text-clay">Po ngarkohet...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.tempData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mx-auto h-16 w-16 rounded-lg bg-paper flex items-center justify-center mb-6 shadow-soft p-2">
            <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={64} height={64} className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-ink mb-4">Ka ndodhur një gabim</h1>
          <p className="text-clay mb-6">Të dhënat e regjistrimit nuk u gjetën. Ju lutemi provoni përsëri.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent transition-colors"
          >
            Kthehu te identifikimi
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Plotëso Regjistrimin - ImiRezervimi.al</title>
        <meta name="description" content="Plotëso regjistrimin duke verifikuar numrin e telefonit" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-cream">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-linen/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-paper flex items-center justify-center mr-3 shadow-soft p-1">
                  <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={40} height={40} className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-bold text-ink">ImiRezervimi.al</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            {/* Welcome Card */}
            <div className="bg-paper rounded-lg shadow-soft p-8 mb-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-success">✓</span>
                </div>
                <h1 className="text-2xl font-bold text-ink mb-2">
                  Mirë se erdhe, {session.user.tempData.name}!
                </h1>
                <p className="text-clay">
                  Identifikimi me {session.user.tempData.provider === 'facebook' ? 'Facebook' : 'Google'} u krye me sukses.
                </p>
              </div>

              <div className="bg-accent-soft/40 border border-accent/25 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-accent text-xl mr-3">•</span>
                  <div>
                    <h3 className="font-semibold text-blue-900">Hapi i fundit</h3>
                    <p className="text-accent-strong text-sm">
                      Për të përdorur platformën, duhet të verifikosh numrin e WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Verification Component */}
            <div className="bg-paper rounded-lg shadow-soft p-8">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 rounded-lg bg-accent-soft flex items-center justify-center mb-4 animate-pulse">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <p className="text-clay">Po plotësohet regjistrimi...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-ink mb-2">Verifikimi i WhatsApp</h3>
                    <p className="text-clay">
                      Do t&apos;ju dërgojmë një kod verifikimi në WhatsApp për të plotësuar regjistrimin.
                    </p>
                  </div>
                  
                  <WhatsAppVerification
                    onVerificationComplete={handleVerificationComplete}
                    onError={handleVerificationError}
                    className="space-y-4"
                  />
                  
                  {verificationError && (
                    <div className="mt-4 p-3 bg-accent-soft/60 border border-accent/25 rounded-lg">
                      <p className="text-accent text-sm">{verificationError}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Info Footer */}
            <div className="text-center mt-6">
              <p className="text-clay text-sm">
                Numri i telefonit do të përdoret për konfirmimet e rezervimeve në WhatsApp
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}