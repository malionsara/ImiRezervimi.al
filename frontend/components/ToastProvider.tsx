// components/ToastProvider.tsx
// Toast notification provider for ImiRezervimi.al
// Provides consistent toast notifications across the application

import React from 'react'
import { ToastContainer, toast, TypeOptions } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Toast configuration
const TOAST_CONFIG = {
  position: 'top-right' as const,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light' as const,
}

// Toast utilities with Albanian messages
export const showToast = {
  success: (message: string) => {
    toast.success(`✅ ${message}`, TOAST_CONFIG)
  },
  
  error: (message: string) => {
    toast.error(`❌ ${message}`, {
      ...TOAST_CONFIG,
      autoClose: 7000, // Longer for errors
    })
  },
  
  warning: (message: string) => {
    toast.warning(`⚠️ ${message}`, TOAST_CONFIG)
  },
  
  info: (message: string) => {
    toast.info(`ℹ️ ${message}`, TOAST_CONFIG)
  },

  // Appointment-specific toasts
  appointmentCancelled: () => {
    toast.success('✅ Rezervimi u anulua me sukses!', TOAST_CONFIG)
  },

  appointmentApproved: () => {
    toast.success('🎉 Rezervimi u miratua me sukses!', TOAST_CONFIG)
  },

  appointmentDeclined: () => {
    toast.warning('⚠️ Rezervimi u refuzua', TOAST_CONFIG)
  },

  appointmentRequested: () => {
    toast.success('🎉 Kërkesa për rezervim u dërgua me sukses!', TOAST_CONFIG)
  },

  // Authentication toasts
  loginSuccess: (salonName?: string) => {
    toast.success(`🔑 Mirë se erdhe${salonName ? ` në ${salonName}` : ''}!`, TOAST_CONFIG)
  },

  logoutSuccess: () => {
    toast.info('ℹ️ Dolët me sukses nga dashboard-i', TOAST_CONFIG)
  },

  // Network/System toasts
  networkError: () => {
    toast.error('❌ Problem me lidhjen. Kontrolloni internetin dhe provoni përsëri.', {
      ...TOAST_CONFIG,
      autoClose: 8000,
    })
  },

  serverError: () => {
    toast.error('❌ Problem me serverin. Provoni përsëri pas disa sekondash.', {
      ...TOAST_CONFIG,
      autoClose: 8000,
    })
  }
}

// Custom toast component with loading state
export const showLoadingToast = (message: string = 'Duke u procesuar...') => {
  return toast.loading(`⏳ ${message}`, {
    position: 'top-right',
    theme: 'light',
  })
}

export const updateToast = (toastId: any, message: string, type: TypeOptions = 'success') => {
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'
  
  toast.update(toastId, {
    render: `${icon} ${message}`,
    type,
    isLoading: false,
    autoClose: 5000,
    closeButton: true,
  })
}

// Provider component
interface ToastProviderProps {
  children: React.ReactNode
}

export default function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        limit={5}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="text-sm font-medium"
        style={{
          fontSize: '14px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      />
    </>
  )
}