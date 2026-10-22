// frontend/components/salon/AppointmentActions.tsx
// Approve/decline appointment actions with Albanian localization
// Albanian Beauty Salon Booking Platform

import { useState } from 'react'
import { Check, X, PenLine, AlertTriangle } from 'lucide-react'
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
      {/* Action Buttons — approve is the primary action; the rest stay quiet */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Quick Approve */}
        <button
          onClick={handleQuickApprove}
          disabled={loading || disabled}
          className="sm:flex-1 bg-success hover:bg-success/85 text-white px-5 py-2.5 rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Po aprovohet...
            </>
          ) : (
            <>
              <Check size={17} strokeWidth={2} aria-hidden="true" />
              Miratu shpejt
            </>
          )}
        </button>

        {/* Approve with Notes */}
        <button
          onClick={() => setShowApproveModal(true)}
          disabled={loading || disabled}
          className="border border-linen bg-paper hover:border-success hover:text-success text-ink px-5 py-2.5 rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] inline-flex items-center justify-center gap-2"
        >
          <PenLine size={16} strokeWidth={1.75} aria-hidden="true" />
          Miratu + Shënim
        </button>

        {/* Decline */}
        <button
          onClick={() => setShowDeclineModal(true)}
          disabled={loading || disabled}
          className="border border-linen bg-paper hover:border-danger hover:text-danger text-clay px-5 py-2.5 rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] inline-flex items-center justify-center gap-2"
        >
          <X size={16} strokeWidth={1.75} aria-hidden="true" />
          Refuzo
        </button>
      </div>

      {/* Approve with Notes Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-paper rounded-lg border border-linen shadow-lifted max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center mr-3">
                <Check size={20} strokeWidth={2} className="text-success" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-lg text-ink">Miratu rezervimin</h3>
                <p className="text-sm text-clay">{customerName}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-ink mb-2">
                Shënim për klientin (opsional)
              </label>
              <textarea
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                placeholder="P.sh. Jini të gatshëm 10 minuta para kohe..."
                className="w-full p-3 border border-linen rounded resize-none focus:ring-2 focus:ring-success/25 focus:border-success"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-clay mt-1">{approveNotes.length}/500 karaktere</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetApproveModal}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-linen text-ink rounded-lg hover:bg-cream transition-colors disabled:opacity-50"
              >
                Anulo
              </button>
              <button
                onClick={handleApproveWithNotes}
                disabled={loading}
                className="flex-1 bg-success hover:bg-success/85 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
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
          <div className="bg-paper rounded-lg border border-linen shadow-lifted max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-danger/10 rounded-full flex items-center justify-center mr-3">
                <X size={20} strokeWidth={2} className="text-danger" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-lg text-ink">Refuzo rezervimin</h3>
                <p className="text-sm text-clay">{customerName}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-ink mb-2">
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
                      className="mr-3 text-accent focus:ring-accent/25"
                    />
                    <span className="text-sm text-ink">{reason}</span>
                  </label>
                ))}
              </div>

              {declineReason === 'Tjetër...' && (
                <div className="mt-3">
                  <textarea
                    value={customDeclineReason}
                    onChange={(e) => setCustomDeclineReason(e.target.value)}
                    placeholder="Shpjegoni arsyen..."
                    className="w-full p-3 border border-linen rounded-lg resize-none focus:ring-2 focus:ring-accent/25 focus:border-accent"
                    rows={3}
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-clay mt-1">{customDeclineReason.length}/500 karaktere</p>
                </div>
              )}
            </div>

            <div className="bg-warning/5 border border-warning/25 rounded p-3 mb-4">
              <div className="flex">
                <AlertTriangle size={17} strokeWidth={1.75} className="text-warning mr-2 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-ink">Kini kujdes</p>
                  <p className="text-xs text-clay mt-1">
                    Klienti do të marrë një njoftim WhatsApp me arsyen e refuzimit.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetDeclineModal}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-linen text-ink rounded-lg hover:bg-cream transition-colors disabled:opacity-50"
              >
                Anulo
              </button>
              <button
                onClick={handleDecline}
                disabled={loading || !declineReason || (declineReason === 'Tjetër...' && !customDeclineReason.trim())}
                className="flex-1 bg-danger hover:bg-accent-strong text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
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