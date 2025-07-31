// frontend/pages/complete-registration.js
// Phone verification page for completing social login registration

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import WhatsAppVerification from '../components/auth/WhatsAppVerification'

export default function CompleteRegistration() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [existingPhone, setExistingPhone] = useState('')

  const checkExistingPhone = useCallback(async () => {
    if (!session?.user?.tempData?.email) {
      setIsLoading(false)
      return
    }

    try {
      // Check if user exists in database and has a phone number
      const response = await fetch('/api/auth/check-existing-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.tempData.email
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.phone) {
          setExistingPhone(data.phone)
        }
      }
    } catch (error) {
      console.error('Error checking existing phone:', error)
    }
    
    setIsLoading(false)
  }, [session?.user?.tempData?.email])

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

    // Check if user has an existing phone number in database
    checkExistingPhone()
  }, [session, status, router, checkExistingPhone])


  const handleVerificationComplete = async (verifiedPhone) => {
    try {
      // Create complete user record in database with verified phone
      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: verifiedPhone,
          userData: session.user.tempData
        })
      })

      if (response.ok) {
        // Registration complete - redirect to dashboard
        router.push('/dashboard?welcome=true')
      } else {
        throw new Error('Registration failed')
      }
    } catch (error) {
      console.error('Registration completion error:', error)
      // Handle error - could show user-friendly message
    }
  }


  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg animate-pulse p-2">
            <img src="/favicon-96x96.png" alt="ImiRezervimi Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-gray-600">Po ngarkohet...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.tempData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-lg p-2">
            <img src="/favicon-96x96.png" alt="ImiRezervimi Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ka ndodhur një gabim</h1>
          <p className="text-gray-600 mb-6">Të dhënat e regjistrimit nuk u gjetën. Ju lutemi provoni përsëri.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
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

      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-red-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center mr-3 shadow-lg p-1">
                  <img src="/favicon-96x96.png" alt="ImiRezervimi Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-bold text-gray-900">ImiRezervimi.al</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            {/* Welcome Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Mirë se erdhe, {session.user.tempData.name}!
                </h1>
                <p className="text-gray-600">
                  Identifikimi me {session.user.tempData.provider === 'facebook' ? 'Facebook' : 'Google'} u krye me sukses.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-blue-600 text-xl mr-3">📱</span>
                  <div>
                    <h3 className="font-semibold text-blue-900">Hapi i fundit</h3>
                    <p className="text-blue-700 text-sm">
                      Për të përdorur platformën, duhet të verifikosh numrin e WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Verification Component */}
            <WhatsAppVerification
              initialPhone={existingPhone}
              onVerificationComplete={handleVerificationComplete}
              onVerificationError={(error) => {
                console.error('Verification error:', error)
                // Could show user-friendly error message here
              }}
            />

            {/* Info Footer */}
            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm">
                Numri i telefonit do të përdoret për konfirmimet e rezervimeve në WhatsApp
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}