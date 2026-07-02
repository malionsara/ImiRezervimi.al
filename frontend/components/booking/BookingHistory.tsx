// frontend/components/booking/BookingHistory.tsx
// Booking history component for customer appointment tracking
// Albanian Beauty Salon Booking Platform

import { ClipboardList, CalendarDays, Clock, Sparkles } from 'lucide-react';

interface BookingHistoryItem {
  id: string;
  salon_name: string;
  service_name: string;
  appointment_date: string;
  start_time: string;
  status: string;
  created_at: string;
}

interface BookingHistoryProps {
  history: BookingHistoryItem[];
  currentAppointmentId: string;
}

const BookingHistory: React.FC<BookingHistoryProps> = ({ history, currentAppointmentId }) => {
  // Filter out current appointment from history
  const filteredHistory = history.filter(item => item.id !== currentAppointmentId);

  if (filteredHistory.length === 0) {
    return null;
  }

  // Status configuration
  const statusConfig = {
    pending: { color: 'text-warning bg-warning/10', text: 'Në pritje' },
    approved: { color: 'text-success bg-success/10', text: 'I aprovuar' },
    declined: { color: 'text-danger bg-danger/10', text: 'I refuzuar' },
    completed: { color: 'text-accent-strong bg-accent-soft', text: 'I përfunduar' },
    no_show: { color: 'text-clay bg-sand', text: 'Nuk u paraqit' },
    cancelled: { color: 'text-clay bg-sand', text: 'I anuluar' }
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sq-AL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  return (
    <div className="bg-paper rounded-lg border border-linen shadow-soft overflow-hidden">
      <div className="p-6 border-b border-linen">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sand rounded-lg flex items-center justify-center">
            <ClipboardList size={20} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-xl text-ink">Historiku i Rezervimeve</h2>
            <p className="text-sm text-clay">
              {filteredHistory.length} rezervim{filteredHistory.length !== 1 ? 'e' : ''} të tjera
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {filteredHistory.slice(0, 5).map((item) => {
            const statusInfo = getStatusConfig(item.status);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border border-linen rounded hover:bg-cream transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="font-semibold text-ink">{item.salon_name}</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.text}
                    </div>
                  </div>

                  <div className="text-sm text-clay space-y-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles size={13} strokeWidth={1.75} aria-hidden="true" />
                        {item.service_name}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} strokeWidth={1.75} aria-hidden="true" />
                        {formatDate(item.appointment_date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                        {formatTime(item.start_time)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-clay/70">
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredHistory.length > 5 && (
          <div className="mt-6 text-center">
            <button type="button" className="text-accent hover:text-accent-strong font-medium text-sm transition-colors">
              Shiko të gjitha ({filteredHistory.length - 5} më shumë)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
