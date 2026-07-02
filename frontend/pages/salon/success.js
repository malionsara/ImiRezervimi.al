// frontend/pages/salon/success.js
// Success page after salon registration

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'

export default function SalonSuccess() {
  const router = useRouter()
  const [message, setMessage] = useState('registered')

  useEffect(() => {
    const { message: queryMessage } = router.query
    if (queryMessage) {
      setMessage(queryMessage)
    }
  }, [router.query])

  const getContent = () => {
    switch (message) {
      case 'registered':
        return {
          title: 'Regjistrimi u krye me sukses!',
          subtitle: 'Salloni juaj u regjistrua në platformë',
          description: 'Ekipi ynë do të shqyrtojë aplikimin tuaj dhe do t\'ju kontaktojë brenda 24 orëve. Do të merrni një konfirmim në WhatsApp kur salloni të jetë gati për përdorim.',
          icon: '✓',
          actions: [
            {
              text: 'Kthehu në faqen kryesore',
              href: '/',
              primary: true
            },
            {
              text: 'Mëso më shumë rreth platformës',
              href: '/#features',
              primary: false
            }
          ]
        }
      default:
        return {
          title: 'Sukses!',
          subtitle: 'Operacioni u krye me sukses',
          description: 'Faleminderit që përdorni ImiRezervimi.al',
          icon: '✓',
          actions: [
            {
              text: 'Kthehu në faqen kryesore',
              href: '/',
              primary: true
            }
          ]
        }
    }
  }

  const content = getContent()

  return (
    <>
      <Head>
        <title>Sukses - ImiRezervimi.al</title>
        <meta name="description" content="Operacioni u krye me sukses" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-success">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-green-100/50">
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
        <main className="flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center">
            {/* Success Card */}
            <div className="bg-paper rounded-lg shadow-soft p-8 mb-8">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">{content.icon}</span>
              </div>
              
              <h1 className="text-2xl font-bold text-ink mb-2">
                {content.title}
              </h1>
              
              <h2 className="text-lg text-success font-medium mb-4">
                {content.subtitle}
              </h2>
              
              <p className="text-clay mb-8 leading-relaxed">
                {content.description}
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                {content.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(action.href)}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                      action.primary
                        ? 'bg-success text-white hover:bg-green-600'
                        : 'border border-linen text-ink hover:bg-cream'
                    }`}
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            {message === 'registered' && (
              <div className="bg-accent-soft/40 border border-accent/25 rounded-lg p-4">
                <div className="flex items-start">
                  
                  <div className="text-left">
                    <h3 className="font-semibold text-blue-900 mb-1">Hapat e ardhshëm</h3>
                    <ul className="text-accent-strong text-sm space-y-1">
                      <li>• Shqyrtim nga ekipi ynë (deri në 24 orë)</li>
                      <li>• Konfirmim përmes WhatsApp</li>
                      <li>• Aktivizim i llogarisë së sallonit</li>
                      <li>• Fillim i marrjes së rezervimeve</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-paper border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-clay text-sm">
                © 2025 ImiRezervimi.al - Platforma më e madhe e rezervimeve në Shqipëri
              </p>
              <div className="mt-4 flex justify-center space-x-6">
                <button
                  onClick={() => router.push('/privacy-policy')}
                  className="text-clay/70 hover:text-clay text-sm"
                >
                  Politika e Privatësisë
                </button>
                <button
                  onClick={() => router.push('/terms-of-service')}
                  className="text-clay/70 hover:text-clay text-sm"
                >
                  Kushtet e Shërbimit
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}