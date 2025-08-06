// frontend/components/booking/StatusCard.tsx
// Status card component for customer appointment tracking
// Albanian Beauty Salon Booking Platform

import { useState } from 'react';

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

interface StatusCardProps {
  appointment: AppointmentDetails;
  onCancel: () => void;
  cancelling: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ appointment, onCancel, cancelling }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Status configuration
  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '⏳',
      text: 'Në pritje',
      description: 'Saloni do t\'ju përgjigjet brenda 2 orësh'
    },
    approved: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '✅',
      text: 'I aprovuar',
      description: 'Rezervimi juaj është konfirmuar!'
    },
    declined: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '❌',
      text: 'I refuzuar',
      description: 'Saloni nuk mund t\'ju pranojë për këtë kohë'
    },
    completed: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🎉',
      text: 'I përfunduar',
      description: 'Rezervimi është përfunduar me sukses'
    },
    no_show: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '👻',
      text: 'Nuk u paraqit',
      description: 'Nuk jeni paraqitur në rezervim'
    },
    cancelled: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '🚫',
      text: 'I anuluar',
      description: 'Rezervimi është anuluar'
    }
  };

  const currentStatus = statusConfig[appointment.appointment.status];
  const canCancel = ['pending', 'approved'].includes(appointment.appointment.status);

  // Format date in Albanian
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sq-AL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // Remove seconds
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('sq-AL')} L`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Status Header */}
      <div className={`p-6 border-b ${currentStatus.color.replace('text-', 'bg-').replace('-800', '-50')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{currentStatus.icon}</div>
            <div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${currentStatus.color}`}>
                {currentStatus.text}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {currentStatus.description}
              </p>
            </div>
          </div>
          {canCancel && (
            <button
              onClick={onCancel}
              disabled={cancelling}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelling ? 'Duke anuluar...' : 'Anulo'}
            </button>
          )}
        </div>
      </div>

      {/* Appointment Details */}
      <div className="p-6 space-y-6">
        {/* Salon Info */}
        <div className="flex items-start space-x-4">
          <div className="text-2xl">🏪</div>
          <div className="flex-1">
            <div className="font-semibold text-lg text-gray-900">
              {appointment.salon.name}
            </div>
            <div className="text-gray-600">
              📍 {appointment.salon.address}, {appointment.salon.city}
            </div>
            <div className="text-gray-600">
              📞 {appointment.salon.phone}
            </div>
          </div>
        </div>

        {/* Appointment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-xl">📅</div>
              <div>
                <div className="font-medium">Data</div>
                <div className="text-gray-600">{formatDate(appointment.appointment.date)}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-xl">⏰</div>
              <div>
                <div className="font-medium">Ora</div>
                <div className="text-gray-600">{formatTime(appointment.appointment.startTime)}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-xl">💅</div>
              <div>
                <div className="font-medium">Shërbimi</div>
                <div className="text-gray-600">{appointment.service.name}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-xl">💰</div>
              <div>
                <div className="font-medium">Çmimi</div>
                <div className="text-gray-600">{formatPrice(appointment.service.price)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(appointment.appointment.customerNotes || appointment.appointment.salonNotes) && (
          <div className="border-t pt-4 space-y-3">
            {appointment.appointment.customerNotes && (
              <div>
                <div className="font-medium text-gray-900 mb-1">Shënimet tuaja:</div>
                <div className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {appointment.appointment.customerNotes}
                </div>
              </div>
            )}
            
            {appointment.appointment.salonNotes && (
              <div>
                <div className="font-medium text-gray-900 mb-1">Mesazhi nga saloni:</div>
                <div className="text-gray-600 bg-pink-50 p-3 rounded-lg">
                  {appointment.appointment.salonNotes}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Toggle Details */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-left text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="font-medium">Detaje shtesë</span>
            <svg
              className={`w-5 h-5 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDetails && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-gray-700">Kohëzgjatja</div>
                  <div className="text-gray-600">{appointment.service.duration} minuta</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Prioriteti</div>
                  <div className="text-gray-600">{appointment.appointment.priorityScore}/100</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="font-medium text-gray-700">Kërkuar më</div>
                  <div className="text-gray-600">
                    {new Date(appointment.timestamps.requestedAt).toLocaleString('sq-AL')}
                  </div>
                </div>
                
                {appointment.timestamps.respondedAt && (
                  <div>
                    <div className="font-medium text-gray-700">Përgjigjur më</div>
                    <div className="text-gray-600">
                      {new Date(appointment.timestamps.respondedAt).toLocaleString('sq-AL')}
                    </div>
                  </div>
                )}
                
                {appointment.timestamps.completedAt && (
                  <div>
                    <div className="font-medium text-gray-700">Përfunduar më</div>
                    <div className="text-gray-600">
                      {new Date(appointment.timestamps.completedAt).toLocaleString('sq-AL')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusCard;