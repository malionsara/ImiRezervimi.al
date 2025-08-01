// frontend/pages/admin/salons.js
// Admin dashboard for managing salon registrations

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/salon'

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
      const response = await fetch('/api/admin/salons/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salonId })
      })

      const result = await response.json()

      if (result.success) {
        alert('Salloni u miratua me sukses!')
        fetchSalons() // Refresh the lists
      } else {
        alert('Gabim në miratimin e sallonit: ' + result.error)
      }
    } catch (error) {
      console.error('Error approving salon:', error)
      alert('Ka ndodhur një gabim gjatë miratimit')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (salonId) => {
    const reason = prompt('Arsyeja e refuzimit (opsionale):')
    if (reason === null) return // User cancelled

    setProcessingId(salonId)
    try {
      const response = await fetch('/api/admin/salons/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salonId, reason })
      })

      const result = await response.json()

      if (result.success) {
        alert('Salloni u refuzua')
        fetchSalons() // Refresh the lists
      } else {
        alert('Gabim në refuzimin e sallonit: ' + result.error)
      }
    } catch (error) {
      console.error('Error rejecting salon:', error)
      alert('Ka ndodhur një gabim gjatë refuzimit')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg animate-pulse">
            <span className="text-2xl font-bold text-white">IR</span>
          </div>
          <p className="text-gray-600">Po ngarkohen sallone...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin - Menaxhimi i Salloneve | ImiRezervimi.al</title>
        <meta name="description" content="Panel administrimi për miratimin e salloneve të reja" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                  <span className="text-xl font-bold text-gray-900">Admin Panel</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Menaxhimi i Salloneve</h1>
            <p className="text-gray-600 mt-2">Shqyrto dhe miratu regjistrime të reja sallonesh</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setSelectedTab('pending')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'pending'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Në pritje ({pendingSalons.length})
                </button>
                <button
                  onClick={() => setSelectedTab('active')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'active'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
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
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📋</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk ka sallone në pritje</h3>
                      <p className="text-gray-500">Të gjitha regjitrimet janë shqyrtuar.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {pendingSalons.map((salon) => (
                        <div key={salon.id} className="bg-gray-50 rounded-lg p-6 border">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-4">{salon.name}</h3>
                              
                              <div className="space-y-3">
                                <div>
                                  <span className="font-medium text-gray-700">URL Slug:</span>
                                  <span className="ml-2 text-blue-600">imirezervimi.al/{salon.slug}</span>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-gray-700">Telefoni:</span>
                                  <span className="ml-2">{salon.phone}</span>
                                </div>
                                
                                {salon.email && (
                                  <div>
                                    <span className="font-medium text-gray-700">Email:</span>
                                    <span className="ml-2">{salon.email}</span>
                                  </div>
                                )}
                                
                                <div>
                                  <span className="font-medium text-gray-700">Adresa:</span>
                                  <span className="ml-2">{salon.address}, {salon.city}</span>
                                </div>
                                
                                {salon.instagram_handle && (
                                  <div>
                                    <span className="font-medium text-gray-700">Instagram:</span>
                                    <span className="ml-2">@{salon.instagram_handle}</span>
                                  </div>
                                )}
                                
                                <div>
                                  <span className="font-medium text-gray-700">Regjistruar:</span>
                                  <span className="ml-2">{formatDate(salon.created_at)}</span>
                                </div>
                                
                                {salon.description && (
                                  <div>
                                    <span className="font-medium text-gray-700">Përshkrimi:</span>
                                    <p className="mt-1 text-gray-600">{salon.description}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Working Hours & Services */}
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3">Oraret e Punës</h4>
                              <div className="space-y-1 mb-6">
                                {formatWorkingHours(salon.working_hours)}
                              </div>

                              {salon.services && salon.services.length > 0 && (
                                <div>
                                  <h4 className="font-bold text-gray-900 mb-3">Shërbimet</h4>
                                  <div className="space-y-2">
                                    {salon.services.map((service, index) => (
                                      <div key={service.id || index} className="bg-white p-3 rounded border">
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium">{service.name}</span>
                                          <div className="text-sm text-gray-500">
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
                          <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-4">
                            <button
                              onClick={() => handleApprove(salon.id)}
                              disabled={processingId === salon.id}
                              className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === salon.id ? 'Po përpunohet...' : '✅ Mirато'}
                            </button>
                            
                            <button
                              onClick={() => handleReject(salon.id)}
                              disabled={processingId === salon.id}
                              className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === salon.id ? 'Po përpunohet...' : '❌ Refuzo'}
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
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🏪</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk ka sallone aktive</h3>
                      <p className="text-gray-500">Mirato disa sallone për t&apos;i parë këtu.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeSalons.map((salon) => (
                        <div key={salon.id} className="bg-white rounded-lg p-6 border shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{salon.name}</h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div>📍 {salon.address}, {salon.city}</div>
                            <div>📞 {salon.phone}</div>
                            {salon.instagram_handle && <div>📸 @{salon.instagram_handle}</div>}
                            <div>📅 {formatDate(salon.created_at)}</div>
                          </div>
                          <div className="mt-4">
                            <Link 
                              href={`/${salon.slug}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
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
    </>
  )
}

// Simple authentication check - replace with your auth system
export async function getServerSideProps() {
  // For now, this is open to anyone - you should add proper admin authentication
  // Example: check for admin session, API key, etc.
  
  return {
    props: {}
  }
}