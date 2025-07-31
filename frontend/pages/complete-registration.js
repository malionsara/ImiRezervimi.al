// frontend/pages/complete-registration.js
// Phone verification page for completing social login registration

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function CompleteRegistration() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState('')

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


  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Handle different input formats
    if (digits.startsWith('355')) {
      return '+' + digits
    } else if (digits.startsWith('0')) {
      return '+355' + digits.substring(1)
    } else if (digits.length > 0 && !digits.startsWith('355')) {
      return '+355' + digits
    }
    
    return digits ? '+355' : ''
  }

  // Validate Albanian phone number
  const isValidPhone = (phone) => {
    return /^\+355[0-9]{8,9}$/.test(phone)
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const handleVerificationComplete = async () => {
    if (!phoneNumber.trim()) {
      alert('Ju lutem shkruani numrin e telefonit')
      return
    }

    if (!isValidPhone(phoneNumber)) {
      alert('Numri i telefonit duhet të jetë në formatin +355XXXXXXXX')
      return
    }

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

            {/* Temporary Simple Phone Input - TODO: Use PhoneVerification component after build fix */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verifikimi i Telefonit</h3>
              <p className="text-gray-600 mb-6">
                Do t&apos;ju dërgojmë një kod verifikimi në SMS
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">🇦🇱</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="+355 69 123 4567"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button 
                  onClick={handleVerificationComplete}
                  disabled={!isValidPhone(phoneNumber)}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Plotëso Regjistrimin
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Kjo është një version i thjeshtuar. PhoneVerification komponenti do të riparohet së shpejti.
              </p>
            </div>

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