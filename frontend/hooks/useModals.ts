// frontend/hooks/useModals.ts
// Reusable hooks for modal management in ImiRezervimi.al
// Replaces window.alert and window.confirm with proper React modals

import { useState, useCallback } from 'react'

interface ConfirmationState {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  variant: 'danger' | 'warning' | 'info' | 'success'
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

interface AlertState {
  isOpen: boolean
  title: string
  message: string
  variant: 'error' | 'warning' | 'info' | 'success'
  buttonText: string
}

export function useConfirmationModal() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Konfirmo',
    cancelText: 'Anulo',
    variant: 'info',
    onConfirm: () => {},
    onCancel: () => {},
    loading: false
  })

  const showConfirmation = useCallback((options: {
    title: string
    message: string
    onConfirm: () => void | Promise<void>
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info' | 'success'
  }) => {
    setState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Konfirmo',
      cancelText: options.cancelText || 'Anulo',
      variant: options.variant || 'info',
      onConfirm: async () => {
        setState(prev => ({ ...prev, loading: true }))
        try {
          await options.onConfirm()
          setState(prev => ({ ...prev, isOpen: false, loading: false }))
        } catch (error) {
          setState(prev => ({ ...prev, loading: false }))
          throw error
        }
      },
      onCancel: () => setState(prev => ({ ...prev, isOpen: false })),
      loading: false
    })
  }, [])

  const hideConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  return {
    ...state,
    showConfirmation,
    hideConfirmation
  }
}

export function useAlertModal() {
  const [state, setState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    buttonText: 'OK'
  })

  const showAlert = useCallback((options: {
    title: string
    message: string
    variant?: 'error' | 'warning' | 'info' | 'success'
    buttonText?: string
  }) => {
    setState({
      isOpen: true,
      title: options.title,
      message: options.message,
      variant: options.variant || 'info',
      buttonText: options.buttonText || 'OK'
    })
  }, [])

  const hideAlert = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  return {
    ...state,
    showAlert,
    hideAlert
  }
}