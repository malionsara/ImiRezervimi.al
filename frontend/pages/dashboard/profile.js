// frontend/pages/dashboard/profile.js
// Customer profile management page - ImiRezervimi.al

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Layout, { dashboardLayout } from '../../components/layout/Layout'
import ConfirmationModal from '../../components/ui/ConfirmationModal'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user) {
      const user = session.user
      const nameParts = (user.name || '').split(' ')
      
      setProfile({
        name: user.name,
        email: user.email,
        image: user.image,
        provider: user.provider,
        phone: user.phone || null
      })
      
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: user.phone || '',
        email: user.email || ''
      })
    }
  }, [status, session, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      // TODO: Create API endpoint to update profile
      // const response = await fetch('/api/customers/update-profile', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage('Profili u përditësua me sukses!')
      setIsEditing(false)
      
      // Update local profile state
      setProfile(prev => ({
        ...prev,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone
      }))

    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Gabim në përditësimin e profilit')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
  }

  const confirmDeleteAccount = () => {
    setShowDeleteModal(false)
    // TODO: Implement account deletion
    console.log('Delete account requested')
    // For now just show a message
    setMessage('Kërkesa për fshirjen e llogarisë është dërguar. Do të kontaktoheni së shpejti.')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg animate-pulse p-2">
            <Image src="/favicon-96x96.png" alt="ImiRezervimi Logo" width={64} height={64} />
          </div>
          <p className="text-gray-600">Po ngarkon...</p>
        </div>
      </div>
    )
  }

  if (!session || !profile) return null

  return (
    <Layout {...dashboardLayout({
      title: 'Profili Im - ImiRezervimi.al',
      description: 'Menaxho informacionet e profilit tuaj'
    })}>
      <div className="min-h-screen bg-gray-50 py-8">
        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profili Im</h1>
            <p className="text-gray-600">Menaxho informacionet tuaja personale</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('sukses') 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info Card */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Informacionet Personale</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    ✏️ Ndrysho
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emri
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Emri juaj"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.firstName || 'Pa emër'}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mbiemri
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Mbiemri juaj"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.lastName || 'Pa mbiemër'}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numri i Telefonit
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="+355 69 123 4567"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {formData.phone || (
                        <span className="text-gray-500">Nuk është shtuar</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900 py-2">{profile.email || 'Nuk është disponueshëm'}</p>
                  <p className="text-xs text-gray-500">Email nuk mund të ndryshohet</p>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? 'Po ruhet...' : '💾 Ruaj Ndryshimet'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        // Reset form data
                        const nameParts = (profile.name || '').split(' ')
                        setFormData({
                          firstName: nameParts[0] || '',
                          lastName: nameParts.slice(1).join(' ') || '',
                          phone: profile.phone || '',
                          email: profile.email || ''
                        })
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Anulloje
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Info Sidebar */}
            <div className="space-y-6">
              {/* Account Status */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Statusi i Llogarisë</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    {profile.image && (
                      <Image
                        src={profile.image}
                        alt={profile.name}
                        width={48}
                        height={48}
                        className="rounded-full mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{profile.name}</p>
                      <p className="text-sm text-gray-500">
                        Identifikuar me {profile.provider === 'instagram' ? 'Instagram' : 'Google'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center text-green-600 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Llogari aktive
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Veprime</h3>
                
                <div className="space-y-3">
                  <Link href="/dashboard/bookings">
                    <a className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      📅 Shiko Rezervimet
                    </a>
                  </Link>
                  
                  <Link href="/dashboard/favorites">
                    <a className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      ⭐ Sallone të Preferuara
                    </a>
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    🚪 Dil nga Llogaria
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="font-semibold text-red-900 mb-2">Zonë e Rrezikshme</h3>
                <p className="text-red-700 text-sm mb-4">
                  Fshirja e llogarisë është e përhershme dhe nuk mund të zhbëhet.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                >
                  Fshij Llogarinë
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteAccount}
        title="Fshij llogarinë"
        message={
          <div>
            <p className="mb-2">Jeni të sigurt që doni të fshini llogarinë tuaj?</p>
            <p className="text-sm text-gray-600">
              <strong>Ky veprim nuk mund të zhbëhet</strong> dhe do të humbasni:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
              <li>Të gjitha rezervimet tuaja</li>
              <li>Historikun e rezervimeve</li>
              <li>Sallone të preferuara</li>
              <li>Të gjitha të dhënat personale</li>
            </ul>
          </div>
        }
        confirmText="Po, fshije llogarinë"
        cancelText="Jo, mbaje llogarinë"
        variant="danger"
      />
    </Layout>
  )
}