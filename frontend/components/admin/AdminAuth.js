// frontend/components/admin/AdminAuth.js
// Admin authentication component

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

export default function AdminAuth({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const checkAuthentication = useCallback(async () => {
    // Check if admin key is in URL query params
    const queryKey = router.query.admin_key
    
    if (queryKey) {
      // Verify the key with the server
      const isValid = await verifyAdminKey(queryKey)
      if (isValid) {
        setIsAuthenticated(true)
        // Store in sessionStorage for this session
        sessionStorage.setItem('admin_authenticated', 'true')
        sessionStorage.setItem('admin_key', queryKey)
      } else {
        setError('Invalid admin key')
      }
    } else {
      // Check if already authenticated in this session
      const sessionAuth = sessionStorage.getItem('admin_authenticated')
      const sessionKey = sessionStorage.getItem('admin_key')
      
      if (sessionAuth === 'true' && sessionKey) {
        const isValid = await verifyAdminKey(sessionKey)
        if (isValid) {
          setIsAuthenticated(true)
        } else {
          // Clear invalid session
          sessionStorage.removeItem('admin_authenticated')
          sessionStorage.removeItem('admin_key')
        }
      }
    }
    
    setIsLoading(false)
  }, [router.query])

  useEffect(() => {
    checkAuthentication()
  }, [checkAuthentication])

  const verifyAdminKey = async (key) => {
    try {
      const response = await fetch('/api/admin/verify-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminKey: key })
      })
      
      const result = await response.json()
      return result.success && result.valid
    } catch (error) {
      console.error('Error verifying admin key:', error)
      return false
    }
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    const isValid = await verifyAdminKey(adminKey)
    if (isValid) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_authenticated', 'true')
      sessionStorage.setItem('admin_key', adminKey)
      
      // Update URL with admin key for future reference
      router.push(`${router.pathname}?admin_key=${adminKey}`, undefined, { shallow: true })
    } else {
      setError('Invalid admin key. Please check your credentials.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_authenticated')
    sessionStorage.removeItem('admin_key')
    router.push(router.pathname)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-4"></div>
          <p className="text-clay">Po verifikohet qasja admin...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-20 w-20 rounded-lg bg-accent flex items-center justify-center shadow-soft">
              <span className="text-2xl font-bold text-white">IR</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-ink">
              Admin Portal
            </h2>
            <p className="mt-2 text-center text-sm text-clay">
              Futni çelësin e admin për të vazhduar
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
            <div>
              <label htmlFor="admin-key" className="sr-only">
                Çelësi Admin
              </label>
              <input
                id="admin-key"
                name="admin-key"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-linen placeholder-gray-500 text-ink focus:outline-none focus:ring-accent/25 focus:border-accent focus:z-10 sm:text-sm"
                placeholder="Çelësi Admin"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-accent-soft/60 border border-accent/25 rounded-lg p-4">
                <p className="text-accent-strong text-sm">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/25 transition-colors"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  🔐
                </span>
                Hyr në Admin Panel
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-clay">
              Nëse nuk keni çelësin e admin, kontaktoni administratorin e sistemit.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render admin content with logout option
  return (
    <>
      {children}
      
      {/* Floating logout button */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleLogout}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-soft text-sm transition-colors"
          title="Dil nga Admin Panel"
        >
          🚪 Dil
        </button>
      </div>
    </>
  )
}