// frontend/pages/salon/demo-dashboard.tsx
// Demo page for testing salon dashboard components
// This can be removed after testing is complete

import { useState } from 'react'
import Head from 'next/head'
import RequestsQueue from '../../components/salon/RequestsQueue'
import CustomerDetails from '../../components/salon/CustomerDetails'
import AppointmentActions from '../../components/salon/AppointmentActions'
import { AlertModal } from '../../components/ui/ConfirmationModal'
import { useAlertModal } from '../../hooks/useModals'

// Mock data for testing
const mockRequests = [
  {
    id: '1',
    customer: {
      id: '1',
      firstName: 'Ana',
      lastName: 'Hoxha',
      phone: '+35569123456',
      rating: 4.8,
      totalVisits: 12,
      priorityScore: 85
    },
    service: {
      id: '1',
      name: 'Manikyr klasik',
      duration: 30,
      price: 15
    },
    appointmentDate: '2024-01-25',
    startTime: '10:00',
    customerNotes: 'Preferoj ngjyra të errëta dhe dizajn minimal',
    requestedAt: '2024-01-24T14:30:00Z',
    priorityScore: 85
  },
  {
    id: '2',
    customer: {
      id: '2',
      firstName: 'Marinela',
      lastName: 'Gjoka',
      phone: '+35569987654',
      rating: 0,
      totalVisits: 0,
      priorityScore: 25
    },
    service: {
      id: '2',
      name: 'Nail Art',
      duration: 45,
      price: 25
    },
    appointmentDate: '2024-01-25',
    startTime: '14:30',
    customerNotes: undefined,
    requestedAt: '2024-01-24T16:15:00Z',
    priorityScore: 25
  }
]

export default function DemoDashboard() {
  const [selectedCustomer, setSelectedCustomer] = useState<unknown>(null)
  const alertModal = useAlertModal()

  const handleCustomerClick = (request: unknown) => {
    setSelectedCustomer(request)
  }

  const handleAppointmentAction = (appointmentId: string, action: 'approve' | 'decline', notes?: string) => {
    console.log(`${action} appointment ${appointmentId}`, notes)
    alertModal.showAlert({
      title: 'Sukses',
      message: `Rezervimi u ${action === 'approve' ? 'miratua' : 'refuzua'} me sukses!`,
      variant: 'success'
    })
  }

  return (
    <>
      <Head>
        <title>Demo - Salon Dashboard | ImiRezervimi.al</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Demo - Salon Dashboard</h1>
            <p className="text-gray-600 mt-2">Test the salon dashboard components</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Requests Queue */}
            <div className="lg:col-span-2">
              <RequestsQueue
                requests={mockRequests}
                onCustomerClick={handleCustomerClick}
                onAppointmentAction={handleAppointmentAction}
              />
            </div>

            {/* Right Column - Customer Details */}
            <div className="lg:col-span-1">
              {selectedCustomer ? (
                <CustomerDetails
                  customer={(selectedCustomer as any)?.customer || selectedCustomer}
                  onClose={() => setSelectedCustomer(null)}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
                  <div className="text-gray-400 text-4xl mb-4">👤</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Detajet e klientit</h3>
                  <p className="text-gray-600 text-sm">
                    Kliko mbi një kërkesë për të parë detajet e klientit.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Standalone Action Buttons Demo */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Demo - Appointment Actions</h2>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <AppointmentActions
                appointmentId="demo-1"
                customerName="Ana Hoxha"
                onAction={handleAppointmentAction}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={alertModal.hideAlert}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        buttonText={alertModal.buttonText}
      />
    </>
  )
}