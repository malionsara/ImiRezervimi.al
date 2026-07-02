// frontend/pages/login-salon.tsx
// Salon login page - owners enter phone to receive WhatsApp magic link

import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'

export default function SalonLoginPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [magicLink, setMagicLink] = useState<string | null>(null)

  const normalizePhoneNumber = (phoneNumber: string) => {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '')
    
    // If starts with 00, replace with +
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.substring(2)
    }
    
    // If starts with digits but no +, assume Albanian number
    if (/^\d/.test(cleaned) && !cleaned.startsWith('+')) {
      // If starts with 355, add +
      if (cleaned.startsWith('355')) {
        cleaned = '+' + cleaned
      }
      // If starts with 6 or 69, assume it's Albanian mobile without country code
      else if (cleaned.startsWith('6')) {
        cleaned = '+355' + cleaned
      }
    }
    
    return cleaned
  }

  const requestLink = async () => {
    if (!phone.trim()) {
      setMessage({ text: 'Vendosni numrin e telefonit', type: 'error' })
      return
    }

    const normalizedPhone = normalizePhoneNumber(phone.trim())
    
    if (normalizedPhone.length < 8) {
      setMessage({ text: 'Numri i telefonit duhet të jetë i vlefshëm', type: 'error' })
      return
    }

    setLoading(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/salon/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage({ 
          text: data.message || 'Linku i hyrjes u dërgua në WhatsApp. Kontrolloni mesazhet tuaja.', 
          type: 'success' 
        })
        
        // If a magic link was provided directly, store it
        if (data.magicLink) {
          setMagicLink(data.magicLink)
        }
      } else {
        setMessage({ 
          text: data.error?.message || 'Nuk u dërgua. Provoni përsëri.', 
          type: 'error' 
        })
      }
    } catch (e) {
      console.error('Login error:', e)
      setMessage({ text: 'Gabim në lidhje. Provoni përsëri.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      requestLink()
    }
  }

  return (
    <>
      <Head>
        <title>Hyrje për Sallone - ImiRezervimi.al</title>
        <meta name="description" content="Hyni në dashboard-in e sallonit tuaj" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="bg-paper rounded-lg shadow-soft p-8 max-w-md w-full">
          {/* Logo */}
          <div className="mx-auto h-16 w-16 rounded-lg flex items-center justify-center mb-6">
            <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={48} height={48} className="w-full h-full object-contain" />
          </div>
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl text-ink mb-2">Hyrje për Sallone</h1>
            <p className="text-clay">
              Vendosni numrin e telefonit për të marrë një link hyrjeje në WhatsApp
            </p>
          </div>
          
          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Numri i telefonit të sallonit
              </label>
              <input 
                type="tel" 
                className="w-full border border-linen rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent/25 focus:border-accent transition-colors"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="+355 69 123 4567"
                disabled={loading}
              />
              <p className="text-xs text-clay mt-1">
                Formatet e pranuara: +355691234567, 00355691234567, 691234567
              </p>
            </div>
            
            <button 
              onClick={requestLink} 
              disabled={loading || !phone.trim()} 
              className="w-full bg-accent text-white rounded-lg px-4 py-3 hover:bg-accent-strong disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-soft"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Duke dërguar...
                </div>
              ) : (
                <>
                  Dërgo linkun në WhatsApp
                </>
              )}
            </button>
            
            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-success/5 border-success/25 text-success' 
                  : 'bg-accent-soft/60 border-accent/25 text-accent-strong'
              }`}>
                <div className="flex items-center">
                  <div className="mr-2">
                    {message.type === 'success' ? '✓' : '✕'}
                  </div>
                  <div className="text-sm">
                    {message.text}
                  </div>
                </div>
                
                {message.type === 'success' && (
                  <div className="mt-3 p-3 bg-paper rounded border border-success/25">
                    <div>
                      <p className="text-xs text-success font-medium mb-2">Hapat e ardhshëm:</p>
                      <ol className="text-xs text-success space-y-1">
                        <li>1. Hapni WhatsApp në telefon</li>
                        <li>2. Kërkoni mesazhin nga ImiRezervimi.al</li>
                        <li>3. Kliko linkun në mesazh për të hyrë në dashboard</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Registration Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-clay">
              Nuk keni llogari?{' '}
              <a 
                href="/salon/register" 
                className="text-accent hover:text-accent-strong font-medium hover:underline"
              >
                Regjistrohuni këtu
              </a>
            </p>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-cream rounded-lg">
            <div className="flex items-start">
              <div className="text-warning mr-2">•</div>
              <div className="text-xs text-clay">
                <p className="font-medium mb-1">Siguria:</p>
                <ul className="space-y-1">
                  <li>• Linqet e hyrjes skadojnë për 24 orë</li>
                  <li>• Çdo link mund të përdoret vetëm një herë</li>
                  <li>• Mesazhi dërgohet vetëm në WhatsApp</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="mt-6 text-center">
            <p className="text-xs text-clay">
              Probleme? Kontaktoni: support@imirezervimi.al
            </p>
          </div>
        </div>
      </div>
    </>
  )
}


