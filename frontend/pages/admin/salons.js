// frontend/pages/admin/salons.js
// Admin dashboard for managing salon registrations

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/salon'
import AdminAuth from '../../components/admin/AdminAuth'
import { showToast } from '../../components/ToastProvider'

export default function AdminSalons() {
  const [pendingSalons, setPendingSalons] = useState([])
  const [activeSalons, setActiveSalons] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('pending')
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchSalons()
  }, [])

  const fetchSalons = async () => {
    setLoading(true)
    try {
      // Fetch pending salons
      const { data: pending, error: pendingError } = await supabase
        .from('salons')
        .select(`
          id,
          name,
          slug,
          phone,
          email,
          address,
          city,
          instagram_handle,
          description,
          status,
          created_at,
          working_hours,
          services:services(id, name, duration_minutes, price)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (pendingError) {
        console.error('Error fetching pending salons:', pendingError)
      } else {
        setPendingSalons(pending || [])
      }

      // Fetch active salons
      const { data: active, error: activeError } = await supabase
        .from('salons')
        .select(`
          id,
          name,
          slug,
          phone,
          email,
          address,
          city,
          instagram_handle,
          status,
          created_at
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (activeError) {
        console.error('Error fetching active salons:', activeError)
      } else {
        setActiveSalons(active || [])
      }
    } catch (error) {
      console.error('Error fetching salons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (salonId) => {
    setProcessingId(salonId)
    try {
      // Get admin key from session storage
      const adminKey = sessionStorage.getItem('admin_key')
      
      const response = await fetch('/api/admin/salons/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salonId, adminKey })
      })

      const result = await response.json()

      if (result.success) {
        showToast.success('Salloni u miratua me sukses!')
        fetchSalons() // Refresh the lists
      } else {
        showToast.error('Gabim në miratimin e sallonit: ' + result.error)
      }
    } catch (error) {
      console.error('Error approving salon:', error)
      showToast.error('Ka ndodhur një gabim gjatë miratimit')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (salonId) => {
    const reason = prompt('Arsyeja e refuzimit (opsionale):')
    if (reason === null) return // User cancelled

    setProcessingId(salonId)
    try {
      // Get admin key from session storage
      const adminKey = sessionStorage.getItem('admin_key')
      
      const response = await fetch('/api/admin/salons/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salonId, reason, adminKey })
      })

      const result = await response.json()

      if (result.success) {
        showToast.warning('Salloni u refuzua')
        fetchSalons() // Refresh the lists
      } else {
        showToast.error('Gabim në refuzimin e sallonit: ' + result.error)
      }
    } catch (error) {
      console.error('Error rejecting salon:', error)
      showToast.error('Ka ndodhur një gabim gjatë refuzimit')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatWorkingHours = (workingHours) => {
    if (!workingHours) return 'Nuk ka informacion'
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Hënë', 'Martë', 'Mërkurë', 'Enjte', 'Premte', 'Shtunë', 'Diel']
    
    return days.map((day, index) => {
      const hours = workingHours[day]
      if (!hours) return null
      
      return (
        <div key={day} className="text-sm">
          <span className="font-medium">{dayNames[index]}:</span>{' '}
          {hours.closed ? 'Mbyllur' : `${hours.open} - ${hours.close}`}
        </div>
      )
    }).filter(Boolean)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-lg bg-accent flex items-center justify-center mb-4 shadow-soft animate-pulse">
            <span className="text-2xl font-bold text-white">IR</span>
          </div>
          <p className="text-clay">Po ngarkohen sallone...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminAuth>
      <Head>
        <title>Admin - Menaxhimi i Salloneve | ImiRezervimi.al</title>
        <meta name="description" content="Panel administrimi për miratimin e salloneve të reja" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                  <span className="text-xl font-bold text-ink">Admin Panel</span>
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
            <h1 className="text-3xl font-bold text-ink">Menaxhimi i Salloneve</h1>
            <p className="text-clay mt-2">Shqyrto dhe miratu regjistrime të reja sallonesh</p>
          </div>

          {/* Tabs */}
          <div className="bg-paper rounded-lg shadow-sm border mb-6">
            <div className="border-b border-linen">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setSelectedTab('pending')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'pending'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-clay hover:text-ink'
                  }`}
                >
                  Në pritje ({pendingSalons.length})
                </button>
                <button
                  onClick={() => setSelectedTab('active')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'active'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-clay hover:text-ink'
                  }`}
                >
                  Aktive ({activeSalons.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {selectedTab === 'pending' ? (
                <div>
                  {pendingSalons.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl"></span>
                      </div>
                      <h3 className="text-lg font-medium text-ink mb-2">Nuk ka sallone në pritje</h3>
                      <p className="text-clay">Të gjitha regjitrimet janë shqyrtuar.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {pendingSalons.map((salon) => (
                        <div key={salon.id} className="bg-cream rounded-lg p-6 border">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div>
                              <h3 className="text-xl font-bold text-ink mb-4">{salon.name}</h3>
                              
                              <div className="space-y-3">
                                <div>
                                  <span className="font-medium text-ink">URL Slug:</span>
                                  <span className="ml-2 text-accent">imirezervimi.al/{salon.slug}</span>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-ink">Telefoni:</span>
                                  <span className="ml-2">{salon.phone}</span>
                                </div>
                                
                                {salon.email && (
                                  <div>
                                    <span className="font-medium text-ink">Email:</span>
                                    <span className="ml-2">{salon.email}</span>
                                  </div>
                                )}
                                
                                <div>
                                  <span className="font-medium text-ink">Adresa:</span>
                                  <span className="ml-2">{salon.address}, {salon.city}</span>
                                </div>
                                
                                {salon.instagram_handle && (
                                  <div>
                                    <span className="font-medium text-ink">Instagram:</span>
                                    <span className="ml-2">@{salon.instagram_handle}</span>
                                  </div>
                                )}
                                
                                <div>
                                  <span className="font-medium text-ink">Regjistruar:</span>
                                  <span className="ml-2">{formatDate(salon.created_at)}</span>
                                </div>
                                
                                {salon.description && (
                                  <div>
                                    <span className="font-medium text-ink">Përshkrimi:</span>
                                    <p className="mt-1 text-clay">{salon.description}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Working Hours & Services */}
                            <div>
                              <h4 className="font-bold text-ink mb-3">Oraret e Punës</h4>
                              <div className="space-y-1 mb-6">
                                {formatWorkingHours(salon.working_hours)}
                              </div>

                              {salon.services && salon.services.length > 0 && (
                                <div>
                                  <h4 className="font-bold text-ink mb-3">Shërbimet</h4>
                                  <div className="space-y-2">
                                    {salon.services.map((service, index) => (
                                      <div key={service.id || index} className="bg-paper p-3 rounded border">
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium">{service.name}</span>
                                          <div className="text-sm text-clay">
                                            {service.duration_minutes} min
                                            {service.price && ` • ${service.price}€`}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-6 pt-6 border-t border-linen flex space-x-4">
                            <button
                              onClick={() => handleApprove(salon.id)}
                              disabled={processingId === salon.id}
                              className="bg-success text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === salon.id ? 'Po përpunohet...' : 'Mirато'}
                            </button>
                            
                            <button
                              onClick={() => handleReject(salon.id)}
                              disabled={processingId === salon.id}
                              className="bg-accent text-white px-6 py-2 rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === salon.id ? 'Po përpunohet...' : 'Refuzo'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {activeSalons.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl"></span>
                      </div>
                      <h3 className="text-lg font-medium text-ink mb-2">Nuk ka sallone aktive</h3>
                      <p className="text-clay">Mirato disa sallone për t&apos;i parë këtu.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeSalons.map((salon) => (
                        <div key={salon.id} className="bg-paper rounded-lg p-6 border shadow-sm">
                          <h3 className="text-lg font-bold text-ink mb-2">{salon.name}</h3>
                          <div className="space-y-2 text-sm text-clay">
                            <div>{salon.address}, {salon.city}</div>
                            <div>{salon.phone}</div>
                            {salon.instagram_handle && <div>@{salon.instagram_handle}</div>}
                            <div>{formatDate(salon.created_at)}</div>
                          </div>
                          <div className="mt-4">
                            <Link 
                              href={`/${salon.slug}`}
                              className="text-accent hover:text-accent-strong font-medium"
                            >
                              Shiko faqen →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AdminAuth>
  )
}