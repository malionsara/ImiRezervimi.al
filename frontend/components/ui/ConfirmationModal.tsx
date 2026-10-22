// frontend/components/ui/ConfirmationModal.tsx
// Reusable confirmation modal component for ImiRezervimi.al
// Replaces window.confirm with beautiful, accessible modals

import { ReactNode } from 'react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  loading?: boolean
  icon?: ReactNode
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmo',
  cancelText = 'Anulo',
  variant = 'info',
  loading = false,
  icon
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      iconBg: 'bg-danger/10',
      iconColor: 'text-danger',
      confirmButton: 'bg-danger hover:bg-accent-strong focus:ring-danger',
      defaultIcon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.93L13.732 4.242a2 2 0 00-3.464 0L3.34 16.07c-.77 1.263.192 2.93 1.732 2.93z" />
        </svg>
      )
    },
    warning: {
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      confirmButton: 'bg-warning hover:bg-warning/80 focus:ring-warning',
      defaultIcon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.93L13.732 4.242a2 2 0 00-3.464 0L3.34 16.07c-.77 1.263.192 2.93 1.732 2.93z" />
        </svg>
      )
    },
    info: {
      iconBg: 'bg-accent-soft',
      iconColor: 'text-accent',
      confirmButton: 'bg-accent hover:bg-accent-strong focus:ring-accent',
      defaultIcon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    success: {
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      confirmButton: 'bg-success hover:bg-success/80 focus:ring-success',
      defaultIcon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  }

  const styles = variantStyles[variant]

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="bg-paper rounded-lg border border-linen max-w-md w-full p-6 shadow-lifted transform transition-all duration-200 scale-100">
        {/* Header with Icon and Title */}
        <div className="flex items-start mb-4">
          <div className={`w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0 mr-4`}>
            <div className={styles.iconColor}>
              {icon || styles.defaultIcon}
            </div>
          </div>
          <div className="flex-1">
            <h3 id="modal-title" className="font-display text-lg text-ink mb-1">
              {title}
            </h3>
            <div id="modal-description" className="text-clay text-sm">
              {typeof message === 'string' ? (
                <p>{message}</p>
              ) : (
                message
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 border border-linen text-ink rounded hover:bg-sand transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`w-full sm:w-auto px-4 py-2 text-white rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center ${styles.confirmButton} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Po processet...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Alert Modal for simple notifications (replaces window.alert)
interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string | ReactNode
  variant?: 'error' | 'warning' | 'info' | 'success'
  buttonText?: string
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  buttonText = 'OK'
}: AlertModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    error: {
      iconBg: 'bg-danger/10',
      iconColor: 'text-danger',
      button: 'bg-danger hover:bg-accent-strong',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      button: 'bg-warning hover:bg-warning/80',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.93L13.732 4.242a2 2 0 00-3.464 0L3.34 16.07c-.77 1.263.192 2.93 1.732 2.93z" />
        </svg>
      )
    },
    info: {
      iconBg: 'bg-accent-soft',
      iconColor: 'text-accent',
      button: 'bg-accent hover:bg-accent-strong',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    success: {
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      button: 'bg-success hover:bg-success/80',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  }

  const styles = variantStyles[variant]

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-description"
    >
      <div className="bg-paper rounded-lg border border-linen max-w-md w-full p-6 shadow-lifted transform transition-all duration-200 scale-100">
        {/* Header with Icon and Title */}
        <div className="flex items-start mb-4">
          <div className={`w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0 mr-4`}>
            <div className={styles.iconColor}>
              {styles.icon}
            </div>
          </div>
          <div className="flex-1">
            <h3 id="alert-title" className="font-display text-lg text-ink mb-1">
              {title}
            </h3>
            <div id="alert-description" className="text-clay text-sm">
              {typeof message === 'string' ? (
                <p>{message}</p>
              ) : (
                message
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-white rounded transition-colors font-medium ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}