// frontend/pages/booking/[id]/status.tsx
// Customer booking status page for appointment tracking
// Albanian Beauty Salon Booking Platform

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, AlertTriangle, CalendarDays, Smartphone } from 'lucide-react';
import StatusCard from '../../../components/booking/StatusCard';
import BookingHistory from '../../../components/booking/BookingHistory';
import { showToast, showLoadingToast, updateToast } from '../../../components/ToastProvider';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import Logo from '../../../components/ui/Logo';

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
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  const handleCancelAppointment = () => {
    if (!appointment || cancelling) return;
    setShowCancelModal(true);
  };

  const confirmCancelAppointment = async () => {
    if (!appointment || cancelling) return;

    setShowCancelModal(false);

    const toastId = showLoadingToast('Duke anuluar rezervimin...');

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
        
        updateToast(toastId, 'Rezervimi u anulua me sukses!', 'success');
      } else {
        updateToast(toastId, data.error?.message || 'Gabim në anulimin e rezervimit', 'error');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      updateToast(toastId, 'Gabim në anulimin e rezervimit. Provoni përsëri.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mx-auto mb-4"></div>
          <p className="text-clay">Duke ngarkuar të dhënat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="bg-paper rounded-lg border border-linen shadow-soft p-8 max-w-md w-full text-center">
          <div className="mx-auto w-14 h-14 bg-danger/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={26} strokeWidth={1.75} className="text-danger" aria-hidden="true" />
          </div>
          <h1 className="font-display text-xl text-ink mb-2">Gabim</h1>
          <p className="text-clay mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-accent text-white px-6 py-2.5 rounded font-medium hover:bg-accent-strong transition-colors btn-touch"
          >
            Kthehu Mbrapa
          </button>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="bg-paper rounded-lg border border-linen shadow-soft p-8 max-w-md w-full text-center">
          <div className="mx-auto w-14 h-14 bg-sand rounded-full flex items-center justify-center mb-4">
            <CalendarDays size={26} strokeWidth={1.75} className="text-clay" aria-hidden="true" />
          </div>
          <h1 className="font-display text-xl text-ink mb-2">Rezervimi nuk u gjet</h1>
          <p className="text-clay mb-6">
            Rezervimi që kërkoni nuk ekziston ose është fshirë.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-accent text-white px-6 py-2.5 rounded font-medium hover:bg-accent-strong transition-colors btn-touch"
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

      <div className="min-h-screen bg-cream">
        {/* Header */}
        <div className="bg-paper border-b border-linen">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.back()}
                  className="text-clay hover:text-ink transition-colors btn-touch p-1"
                  aria-label="Kthehu mbrapa"
                >
                  <ArrowLeft size={22} strokeWidth={1.75} aria-hidden="true" />
                </button>
                <div>
                  <h1 className="font-display text-xl text-ink">Statusi i Rezervimit</h1>
                  <p className="text-sm text-clay">ID: {appointment.id.slice(0, 8)}...</p>
                </div>
              </div>
              <Logo size="sm" withWordmark={false} />
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
        <div className="bg-paper border-t border-linen mt-12">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center">
            <div className="text-clay mb-2">
              Për ndihmë ose pyetje, kontaktoni:
            </div>
            <div className="text-accent font-semibold inline-flex items-center gap-2">
              <Smartphone size={16} strokeWidth={1.75} aria-hidden="true" />
              WhatsApp: +355 69 123 4567
            </div>
            <div className="text-clay/70 text-sm mt-4">
              © 2025 ImiRezervimi.al - Platforma për rezervime në sallonet e bukurisë
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelAppointment}
        title="Anulo rezervimin"
        message="Jeni të sigurt që doni të anuloni këtë rezervim? Ky veprim nuk mund të zhbëhet."
        confirmText="Po, anulo"
        cancelText="Jo, mbaje"
        variant="danger"
        loading={cancelling}
      />
    </>
  );
}