// frontend/pages/admin/index.js
// Admin portal entry point

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { getSalonStats } from '../../lib/admin'

export default function AdminPortal() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adminSetup, setAdminSetup] = useState(null)

  useEffect(() => {
    // Check admin setup via API
    fetchAdminSetup()

    // Fetch stats
    fetchStats()
  }, [])

  const fetchAdminSetup = async () => {
    try {
      const response = await fetch('/api/admin/setup-status')
      const result = await response.json()
      
      if (result.success) {
        setAdminSetup(result.data)
      } else {
        console.error('Failed to check admin setup:', result.error)
        setAdminSetup({
          valid: false,
          issues: ['Failed to check admin configuration']
        })
      }
    } catch (error) {
      console.error('Error fetching admin setup:', error)
      setAdminSetup({
        valid: false,
        issues: ['Failed to connect to admin setup endpoint']
      })
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await getSalonStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Admin Portal - ImiRezervimi.al</title>
        <meta name="description" content="Panel administrimi për ImiRezervimi.al" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg">
                    <span className="text-lg font-bold text-white">IR</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Admin Portal</span>
                </Link>
              </div>
              <Link href="/" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Kthehu në faqen kryesore
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-600 mt-2">Menaxho platformën ImiRezervimi.al</p>
          </div>

          {/* Admin Setup Status */}
          {adminSetup && (
            <>
              {!adminSetup.valid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                  <h2 className="text-lg font-semibold text-red-800 mb-3">❌ Konfigurimi i Admin</h2>
                  <p className="text-red-700 mb-3">Ka probleme kritike me konfigurimin e admin:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-700">
                    {adminSetup.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {adminSetup.valid && !adminSetup.twilioConfigured && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <h2 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Konfigurimi i WhatsApp</h2>
                  <p className="text-yellow-700 mb-3">Admin panel funksionon, por WhatsApp nuk është konfiguruar:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    {adminSetup.twilioIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                  <p className="text-yellow-700 mt-3 text-sm">
                    💡 Njoftime do të shfaqen në console por nuk do të dërgohen në WhatsApp.
                  </p>
                </div>
              )}
              
              {adminSetup.valid && adminSetup.twilioConfigured && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                  <h2 className="text-lg font-semibold text-green-800 mb-3">✅ Konfigurimi Komplet</h2>
                  <p className="text-green-700">
                    Të gjitha konfigurationet janë në rregull! Admin panel dhe WhatsApp janë gati për përdorim.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Stats Overview */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <p className="text-gray-600 mt-2">Po ngarkohen statistikat...</p>
            </div>
          ) : stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Në pritje</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aktive</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">7 ditët e fundit</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/salons" className="group bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                  <span className="text-2xl">🏪</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-4">Menaxho Sallone</h3>
              </div>
              <p className="text-gray-600">Shqyrto dhe miratu regjistrimet e reja të salloneve</p>
              {stats && stats.pending > 0 && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  {stats.pending} në pritje
                </div>
              )}
            </Link>

            <div className="bg-white rounded-lg p-6 shadow-sm border opacity-50">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-gray-100">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-4">Statistika</h3>
              </div>
              <p className="text-gray-600">Shiko raportet dhe analizat e platformës</p>
              <div className="mt-3 text-sm text-gray-500">
                (Së shpejti)
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border opacity-50">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-gray-100">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-4">Përdoruesit</h3>
              </div>
              <p className="text-gray-600">Menaxho klientët dhe përdoruesit e platformës</p>
              <div className="mt-3 text-sm text-gray-500">
                (Së shpejti)
              </div>
            </div>
          </div>

          {/* Quick Setup Guide */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">🚀 Konfigurimi i shpejtë</h2>
            <div className="space-y-3 text-blue-700">
              <p>Për të përdorur admin panel-in në mënyrë të sigurt:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                                 <li>Shto <code className="bg-blue-100 px-2 py-1 rounded">SUPABASE_SERVICE_KEY</code> në .env.local</li>
                <li>Shto <code className="bg-blue-100 px-2 py-1 rounded">ADMIN_SECRET_KEY</code> për sigurinë</li>
                <li>Ekzekuto RLS migration në Supabase</li>
                <li>Testo regjistrimin e salloneve</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}