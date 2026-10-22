// frontend/pages/admin/index.js
// Admin portal entry point

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { getSalonStats } from '../../lib/admin'
import AdminAuth from '../../components/admin/AdminAuth'

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
    <AdminAuth>
      <Head>
        <title>Admin Portal - ImiRezervimi.al</title>
        <meta name="description" content="Panel administrimi për ImiRezervimi.al" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-cream">
        {/* Header */}
        <header className="bg-paper shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center mr-3 shadow-soft">
                    <span className="text-lg font-bold text-white">IR</span>
                  </div>
                  <span className="text-xl font-bold text-ink">Admin Portal</span>
                </Link>
              </div>
              <Link href="/" className="text-clay hover:text-ink px-3 py-2 rounded-md text-sm font-medium">
                Kthehu në faqen kryesore
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink">Admin Portal</h1>
            <p className="text-clay mt-2">Menaxho platformën ImiRezervimi.al</p>
          </div>

          {/* Admin Setup Status */}
          {adminSetup && (
            <>
              {!adminSetup.valid && (
                <div className="bg-accent-soft/60 border border-accent/25 rounded-lg p-6 mb-8">
                  <h2 className="text-lg font-semibold text-red-800 mb-3">Konfigurimi i Admin</h2>
                  <p className="text-accent-strong mb-3">Ka probleme kritike me konfigurimin e admin:</p>
                  <ul className="list-disc list-inside space-y-1 text-accent-strong">
                    {adminSetup.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {adminSetup.valid && !adminSetup.twilioConfigured && (
                <div className="bg-yellow-50 border border-warning/25 rounded-lg p-6 mb-8">
                  <h2 className="text-lg font-semibold text-warning mb-3">Konfigurimi i WhatsApp</h2>
                  <p className="text-yellow-700 mb-3">Admin panel funksionon, por WhatsApp nuk është konfiguruar:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    {adminSetup.twilioIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                  <p className="text-yellow-700 mt-3 text-sm">
                    Njoftime do të shfaqen në console por nuk do të dërgohen në WhatsApp.
                  </p>
                </div>
              )}
              
              {adminSetup.valid && adminSetup.twilioConfigured && (
                <div className="bg-success/5 border border-success/25 rounded-lg p-6 mb-8">
                  <h2 className="text-lg font-semibold text-success mb-3">Konfigurimi Komplet</h2>
                  <p className="text-success">
                    Të gjitha konfigurationet janë në rregull! Admin panel dhe WhatsApp janë gati për përdorim.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Stats Overview */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <p className="text-clay mt-2">Po ngarkohen statistikat...</p>
            </div>
          ) : stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-paper rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-warning/10">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-clay">Në pritje</p>
                    <p className="text-2xl font-bold text-ink">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-paper rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-success/10">
                    <span className="text-2xl"></span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-clay">Aktive</p>
                    <p className="text-2xl font-bold text-ink">{stats.active}</p>
                  </div>
                </div>
              </div>

              <div className="bg-paper rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-accent-soft">
                    <span className="text-2xl"></span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-clay">Total</p>
                    <p className="text-2xl font-bold text-ink">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-paper rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <span className="text-2xl"></span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-clay">7 ditët e fundit</p>
                    <p className="text-2xl font-bold text-ink">{stats.recent}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/salons" className="group bg-paper rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-accent-soft group-hover:bg-red-200 transition-colors">
                  <span className="text-2xl"></span>
                </div>
                <h3 className="text-lg font-semibold text-ink ml-4">Menaxho Sallone</h3>
              </div>
              <p className="text-clay">Shqyrto dhe miratu regjistrimet e reja të salloneve</p>
              {stats && stats.pending > 0 && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning/10 text-warning">
                  {stats.pending} në pritje
                </div>
              )}
            </Link>

            <div className="bg-paper rounded-lg p-6 shadow-sm border opacity-50">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-sand">
                  <span className="text-2xl"></span>
                </div>
                <h3 className="text-lg font-semibold text-ink ml-4">Statistika</h3>
              </div>
              <p className="text-clay">Shiko raportet dhe analizat e platformës</p>
              <div className="mt-3 text-sm text-clay">
                (Së shpejti)
              </div>
            </div>

            <div className="bg-paper rounded-lg p-6 shadow-sm border opacity-50">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-sand">
                  <span className="text-2xl"></span>
                </div>
                <h3 className="text-lg font-semibold text-ink ml-4">Përdoruesit</h3>
              </div>
              <p className="text-clay">Menaxho klientët dhe përdoruesit e platformës</p>
              <div className="mt-3 text-sm text-clay">
                (Së shpejti)
              </div>
            </div>
          </div>

          {/* Quick Setup Guide */}
          <div className="mt-12 bg-accent-soft/40 border border-accent/25 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-accent-strong mb-3">Konfigurimi i shpejtë</h2>
            <div className="space-y-3 text-accent-strong">
              <p>Për të përdorur admin panel-in në mënyrë të sigurt:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                                 <li>Shto <code className="bg-accent-soft px-2 py-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> në .env.local</li>
                <li>Shto <code className="bg-accent-soft px-2 py-1 rounded">ADMIN_SECRET_KEY</code> për sigurinë</li>
                <li>Ekzekuto RLS migration në Supabase</li>
                <li>Testo regjistrimin e salloneve</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    </AdminAuth>
  )
}