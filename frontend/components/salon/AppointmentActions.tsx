// frontend/components/salon/AppointmentActions.tsx
// Approve/decline appointment actions with Albanian localization
// Albanian Beauty Salon Booking Platform

import { useState } from 'react'
import { showToast } from '../ToastProvider'

// ==============================================
// TYPES AND INTERFACES
// ==============================================
interface AppointmentActionsProps {
  appointmentId: string
  customerName: string
  onAction: (appointmentId: string, action: 'approve' | 'decline', notes?: string) => void
  disabled?: boolean
}

// ==============================================
// APPOINTMENT ACTIONS COMPONENT
// ==============================================
export default function AppointmentActions({ 
  appointmentId, 
  customerName, 
  onAction, 
  disabled = false 
}: AppointmentActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [approveNotes, setApproveNotes] = useState('')
  const [customDeclineReason, setCustomDeclineReason] = useState('')

  // Predefined decline reasons in Albanian
  const declineReasons = [
    'Salloni është i mbyllur në atë kohë',
    'Koha është e zënë',
    'Shërbimi nuk është i disponueshëm',
    'Është e nevojshme të rindërtohet orarı',
    'Arsye personale',
    'Tjetër...'
  ]

  // ==============================================
  // EVENT HANDLERS
  // ==============================================
  const handleQuickApprove = async () => {
    if (loading || disabled) return
    
    try {
      setLoading(true)
      await onAction(appointmentId, 'approve')
    } catch (error) {
      console.error('Error approving appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveWithNotes = async () => {
    if (loading || disabled) return
    
    try {
      setLoading(true)
      await onAction(appointmentId, 'approve', approveNotes.trim() || undefined)
      setShowApproveModal(false)
      setApproveNotes('')
    } catch (error) {
      console.error('Error approving appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    if (loading || disabled) return
    
    const notes = declineReason === 'Tjetër...' 
      ? customDeclineReason.trim() 
      : declineReason
    
    if (!notes) {
      showToast.warning('Ju lutemi zgjidhni një arsye për refuzimin')
      return
    }
    
    try {
      setLoading(true)
      await onAction(appointmentId, 'decline', notes)
      setShowDeclineModal(false)
      setDeclineReason('')
      setCustomDeclineReason('')
    } catch (error) {
      console.error('Error declining appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetDeclineModal = () => {
    setShowDeclineModal(false)
    setDeclineReason('')
    setCustomDeclineReason('')
  }

  const resetApproveModal = () => {
    setShowApproveModal(false)
    setApproveNotes('')
  }

  // ==============================================
  // MAIN RENDER
  // ==============================================
  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Quick Approve */}
        <button
          onClick={handleQuickApprove}
          disabled={loading || disabled}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed touch-manipulation min-h-[48px] flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Po aprovohet...
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Miratu shpejt
            </>
          )}
        </button>

        {/* Approve with Notes */}
        <button
          onClick={() => setShowApproveModal(true)}
          disabled={loading || disabled}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed touch-manipulation min-h-[48px] flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Miratu + Shënim
        </button>

        {/* Decline */}
        <button
          onClick={() => setShowDeclineModal(true)}
          disabled={loading || disabled}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed touch-manipulation min-h-[48px] flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Refuzo
        </button>
      </div>

      {/* Approve with Notes Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Miratu rezervimin</h3>
                <p className="text-sm text-gray-600">{customerName}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shënim për klientin (opsional)
              </label>
              <textarea
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                placeholder="P.sh. Jini të gatshëm 10 minuta para kohe..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{approveNotes.length}/500 karaktere</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetApproveModal}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Anulo
              </button>
              <button
                onClick={handleApproveWithNotes}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Miratu rezervimin'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Refuzo rezervimin</h3>
                <p className="text-sm text-gray-600">{customerName}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arsyeja e refuzimit *
              </label>
              <div className="space-y-2">
                {declineReasons.map((reason) => (
                  <label key={reason} className="flex items-center">
                    <input
                      type="radio"
                      name="declineReason"
                      value={reason}
                      checked={declineReason === reason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      className="mr-3 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>

              {declineReason === 'Tjetër...' && (
                <div className="mt-3">
                  <textarea
                    value={customDeclineReason}
                    onChange={(e) => setCustomDeclineReason(e.target.value)}
                    placeholder="Shpjegoni arsyen..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{customDeclineReason.length}/500 karaktere</p>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Kini kujdes</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Klienti do të marrë një njoftim WhatsApp me arsyen e refuzimit.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetDeclineModal}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Anulo
              </button>
              <button
                onClick={handleDecline}
                disabled={loading || !declineReason || (declineReason === 'Tjetër...' && !customDeclineReason.trim())}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Refuzo rezervimin'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}