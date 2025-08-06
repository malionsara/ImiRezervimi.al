// frontend/components/booking/BookingHistory.tsx
// Booking history component for customer appointment tracking
// Albanian Beauty Salon Booking Platform

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
    pending: { color: 'text-yellow-600 bg-yellow-100', icon: '⏳', text: 'Në pritje' },
    approved: { color: 'text-green-600 bg-green-100', icon: '✅', text: 'I aprovuar' },
    declined: { color: 'text-red-600 bg-red-100', icon: '❌', text: 'I refuzuar' },
    completed: { color: 'text-blue-600 bg-blue-100', icon: '🎉', text: 'I përfunduar' },
    no_show: { color: 'text-gray-600 bg-gray-100', icon: '👻', text: 'Nuk u paraqit' },
    cancelled: { color: 'text-gray-600 bg-gray-100', icon: '🚫', text: 'I anuluar' }
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">📋</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Historiku i Rezervimeve</h2>
            <p className="text-sm text-gray-600">
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
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="font-semibold text-gray-900">{item.salon_name}</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      <span className="mr-1">{statusInfo.icon}</span>
                      {statusInfo.text}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-4">
                      <span>💅 {item.service_name}</span>
                      <span>📅 {formatDate(item.appointment_date)}</span>
                      <span>⏰ {formatTime(item.start_time)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredHistory.length > 5 && (
          <div className="mt-6 text-center">
            <button className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors">
              Shiko të gjitha ({filteredHistory.length - 5} më shumë)
            </button>
          </div>
        )}

        {filteredHistory.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📅</div>
            <div className="text-gray-600">Nuk keni rezervime të tjera</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;