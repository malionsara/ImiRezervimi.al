// frontend/pages/booking/[id]/status.tsx
// Customer booking status page for appointment tracking
// Albanian Beauty Salon Booking Platform

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import StatusCard from '../../../components/booking/StatusCard';
import BookingHistory from '../../../components/booking/BookingHistory';

// Initialize Supabase client for real-time updates
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AppointmentDetails {
  id: string;
  salon: {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  appointment: {
    date: string;
    startTime: string;
    status: 'pending' | 'approved' | 'declined' | 'completed' | 'no_show' | 'cancelled';
    priorityScore: number;
    customerNotes?: string;
    salonNotes?: string;
  };
  timestamps: {
    requestedAt: string;
    respondedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface BookingHistoryItem {
  id: string;
  salon_name: string;
  service_name: string;
  appointment_date: string;
  start_time: string;
  status: string;
  created_at: string;
}

export default function BookingStatusPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Fetch appointment details
  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/appointments/${id}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error?.message || 'Rezervimi nuk u gjet');
          return;
        }

        setAppointment(data.data);
        
        // Fetch booking history for this customer
        if (data.data.customer?.phone) {
          await fetchBookingHistory(data.data.customer.phone);
        }
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Gabim në ngarkimin e të dhënave');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [id]);

  // Real-time subscription for appointment status updates
  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const subscription = supabase
      .channel(`appointment-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'appointments',
        filter: `id=eq.${id}`
      }, (payload) => {
        console.log('📡 Real-time appointment update:', payload);
        
        if (appointment) {
          setAppointment(prev => prev ? {
            ...prev,
            appointment: {
              ...prev.appointment,
              status: payload.new.status,
              salonNotes: payload.new.salon_notes
            },
            timestamps: {
              ...prev.timestamps,
              respondedAt: payload.new.responded_at,
              completedAt: payload.new.completed_at,
              updatedAt: payload.new.updated_at
            }
          } : null);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id, appointment]);

  const fetchBookingHistory = async (customerPhone: string) => {
    try {
      const response = await fetch(`/api/customers/booking-history?phone=${encodeURIComponent(customerPhone)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBookingHistory(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching booking history:', err);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment || cancelling) return;

    const confirmed = window.confirm(
      'Jeni të sigurt që doni të anuloni këtë rezervim? Ky veprim nuk mund të zhbëhet.'
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
          salonNotes: 'Anuluar nga klienti',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAppointment(prev => prev ? {
          ...prev,
          appointment: {
            ...prev.appointment,
            status: 'cancelled'
          }
        } : null);
        
        alert('Rezervimi u anulua me sukses.');
      } else {
        alert(data.error?.message || 'Gabim në anulimin e rezervimit');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Gabim në anulimin e rezervimit. Provoni përsëri.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Duke ngarkuar të dhënat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Gabim</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Kthehu Mbrapa
          </button>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-gray-400 text-5xl mb-4">📅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Rezervimi nuk u gjet</h1>
          <p className="text-gray-600 mb-6">
            Rezervimi që kërkoni nuk ekziston ose është fshirë.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Kthehu në faqen kryesore
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Statusi i Rezervimit - ImiRezervimi.al</title>
        <meta name="description" content="Shikoni statusin e rezervimit tuaj në ImiRezervimi.al" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-pink-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Statusi i Rezervimit</h1>
                  <p className="text-sm text-gray-600">ID: {appointment.id.slice(0, 8)}...</p>
                </div>
              </div>
              <div className="text-2xl">💅</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Status Card */}
          <StatusCard
            appointment={appointment}
            onCancel={handleCancelAppointment}
            cancelling={cancelling}
          />

          {/* Booking History */}
          {bookingHistory.length > 0 && (
            <BookingHistory
              history={bookingHistory}
              currentAppointmentId={appointment.id}
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t mt-12">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center">
            <div className="text-gray-600 mb-2">
              Për ndihmë ose pyetje, kontaktoni:
            </div>
            <div className="text-pink-600 font-semibold">
              📱 WhatsApp: +355 69 123 4567
            </div>
            <div className="text-gray-500 text-sm mt-4">
              © 2025 ImiRezervimi.al - Platforma për rezervime në sallonet e bukurisë
            </div>
          </div>
        </div>
      </div>
    </>
  );
}