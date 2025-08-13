// frontend/pages/login-salon.tsx
// Basic salon login page – owners enter email to receive a magic link (placeholder flow)

import Head from 'next/head'
import { useState } from 'react'

export default function SalonLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const requestLink = async () => {
    if (!email) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/salon/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.success) setMessage('Kontrolloni email-in tuaj për linkun e hyrjes.')
      else setMessage(data.error?.message || 'Nuk u dërgua. Provoni përsëri.')
    } catch (e) {
      setMessage('Gabim. Provoni përsëri.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Hyrje për Sallone - ImiRezervimi.al</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hyrje për Sallone</h1>
          <p className="text-gray-600 mb-6">Vendos email-in e sallonit për të marrë një link hyrjeje.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email i sallonit</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="salloni@example.com" />
            </div>
            <button onClick={requestLink} disabled={loading || !email} className="w-full bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 disabled:opacity-50">
              {loading ? 'Duke dërguar...' : 'Dërgo linkun e hyrjes'}
            </button>
            {message && <div className="text-sm text-gray-700">{message}</div>}
          </div>
          <div className="mt-6 text-center">
            <a className="text-sm text-gray-600 hover:text-gray-900" href="/salon/register">Nuk keni llogari? Regjistrohuni →</a>
          </div>
        </div>
      </div>
    </>
  )
}


