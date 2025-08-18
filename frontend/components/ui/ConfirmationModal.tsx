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
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmButton: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
      defaultIcon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.93L13.732 4.242a2 2 0 00-3.464 0L3.34 16.07c-.77 1.263.192 2.93 1.732 2.93z" />
        </svg>
      )
    },
    warning: {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      confirmButton: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
      defaultIcon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.93L13.732 4.242a2 2 0 00-3.464 0L3.34 16.07c-.77 1.263.192 2.93 1.732 2.93z" />
        </svg>
      )
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmButton: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
      defaultIcon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    success: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      confirmButton: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
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
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-200 scale-100">
        {/* Header with Icon and Title */}
        <div className="flex items-start mb-4">
          <div className={`w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0 mr-4`}>
            <div className={styles.iconColor}>
              {icon || styles.defaultIcon}
            </div>
          </div>
          <div className="flex-1">
            <h3 id="modal-title" className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            <div id="modal-description" className="text-gray-600 text-sm">
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
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`w-full sm:w-auto px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center ${styles.confirmButton} focus:outline-none focus:ring-2 focus:ring-offset-2`}
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
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      button: 'bg-red-500 hover:bg-red-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      button: 'bg-yellow-500 hover:bg-yellow-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.93L13.732 4.242a2 2 0 00-3.464 0L3.34 16.07c-.77 1.263.192 2.93 1.732 2.93z" />
        </svg>
      )
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      button: 'bg-blue-500 hover:bg-blue-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    success: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      button: 'bg-green-500 hover:bg-green-600',
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
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-200 scale-100">
        {/* Header with Icon and Title */}
        <div className="flex items-start mb-4">
          <div className={`w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0 mr-4`}>
            <div className={styles.iconColor}>
              {styles.icon}
            </div>
          </div>
          <div className="flex-1">
            <h3 id="alert-title" className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            <div id="alert-description" className="text-gray-600 text-sm">
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
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}