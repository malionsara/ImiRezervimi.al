// frontend/components/booking/StatusCard.tsx
// Status card component for customer appointment tracking
// Albanian Beauty Salon Booking Platform

import { useState } from 'react';
import { Clock, Check, X, PartyPopper, UserX, Ban, Store, MapPin, Phone, CalendarDays, Sparkles, Banknote, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

interface StatusConfig {
  badge: string;
  headerBg: string;
  iconColor: string;
  icon: LucideIcon;
  text: string;
  description: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ appointment, onCancel, cancelling }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Status configuration
  const statusConfig: Record<AppointmentDetails['appointment']['status'], StatusConfig> = {
    pending: {
      badge: 'bg-warning/10 text-warning border-warning/25',
      headerBg: 'bg-warning/5',
      iconColor: 'text-warning',
      icon: Clock,
      text: 'Në pritje',
      description: 'Saloni do t\'ju përgjigjet brenda 2 orësh'
    },
    approved: {
      badge: 'bg-success/10 text-success border-success/25',
      headerBg: 'bg-success/5',
      iconColor: 'text-success',
      icon: Check,
      text: 'I aprovuar',
      description: 'Rezervimi juaj është konfirmuar!'
    },
    declined: {
      badge: 'bg-danger/10 text-danger border-danger/25',
      headerBg: 'bg-danger/5',
      iconColor: 'text-danger',
      icon: X,
      text: 'I refuzuar',
      description: 'Saloni nuk mund t\'ju pranojë për këtë kohë'
    },
    completed: {
      badge: 'bg-accent-soft text-accent-strong border-accent/25',
      headerBg: 'bg-accent-soft/50',
      iconColor: 'text-accent',
      icon: PartyPopper,
      text: 'I përfunduar',
      description: 'Rezervimi është përfunduar me sukses'
    },
    no_show: {
      badge: 'bg-sand text-clay border-linen',
      headerBg: 'bg-sand/60',
      iconColor: 'text-clay',
      icon: UserX,
      text: 'Nuk u paraqit',
      description: 'Nuk jeni paraqitur në rezervim'
    },
    cancelled: {
      badge: 'bg-sand text-clay border-linen',
      headerBg: 'bg-sand/60',
      iconColor: 'text-clay',
      icon: Ban,
      text: 'I anuluar',
      description: 'Rezervimi është anuluar'
    }
  };

  const currentStatus = statusConfig[appointment.appointment.status];
  const StatusIcon = currentStatus.icon;
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
    <div className="bg-paper rounded-lg border border-linen shadow-soft overflow-hidden">
      {/* Status Header */}
      <div className={`p-6 border-b border-linen ${currentStatus.headerBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon size={28} strokeWidth={1.75} className={currentStatus.iconColor} aria-hidden="true" />
            <div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${currentStatus.badge}`}>
                {currentStatus.text}
              </div>
              <p className="text-sm text-clay mt-1">
                {currentStatus.description}
              </p>
            </div>
          </div>
          {canCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling}
              className="bg-danger text-white px-4 py-2 rounded font-medium hover:bg-accent-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors btn-touch"
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
          <div className="w-10 h-10 bg-sand rounded-lg flex items-center justify-center shrink-0">
            <Store size={20} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="font-display font-semibold text-lg text-ink">
              {appointment.salon.name}
            </div>
            <div className="text-clay flex items-center gap-1.5 mt-1">
              <MapPin size={14} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
              {appointment.salon.address}, {appointment.salon.city}
            </div>
            <div className="text-clay flex items-center gap-1.5 mt-0.5">
              <Phone size={14} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
              {appointment.salon.phone}
            </div>
          </div>
        </div>

        {/* Appointment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CalendarDays size={18} strokeWidth={1.75} className="text-accent shrink-0" aria-hidden="true" />
              <div>
                <div className="font-medium text-ink">Data</div>
                <div className="text-clay">{formatDate(appointment.appointment.date)}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock size={18} strokeWidth={1.75} className="text-accent shrink-0" aria-hidden="true" />
              <div>
                <div className="font-medium text-ink">Ora</div>
                <div className="text-clay">{formatTime(appointment.appointment.startTime)}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Sparkles size={18} strokeWidth={1.75} className="text-accent shrink-0" aria-hidden="true" />
              <div>
                <div className="font-medium text-ink">Shërbimi</div>
                <div className="text-clay">{appointment.service.name}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Banknote size={18} strokeWidth={1.75} className="text-accent shrink-0" aria-hidden="true" />
              <div>
                <div className="font-medium text-ink">Çmimi</div>
                <div className="text-clay">{formatPrice(appointment.service.price)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(appointment.appointment.customerNotes || appointment.appointment.salonNotes) && (
          <div className="border-t border-linen pt-4 space-y-3">
            {appointment.appointment.customerNotes && (
              <div>
                <div className="font-medium text-ink mb-1">Shënimet tuaja:</div>
                <div className="text-clay bg-cream p-3 rounded">
                  {appointment.appointment.customerNotes}
                </div>
              </div>
            )}

            {appointment.appointment.salonNotes && (
              <div>
                <div className="font-medium text-ink mb-1">Mesazhi nga saloni:</div>
                <div className="text-clay bg-accent-soft/50 p-3 rounded">
                  {appointment.appointment.salonNotes}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Toggle Details */}
        <div className="border-t border-linen pt-4">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-left text-clay hover:text-ink transition-colors"
          >
            <span className="font-medium">Detaje shtesë</span>
            <ChevronDown
              size={18}
              strokeWidth={1.75}
              className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {showDetails && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-ink">Kohëzgjatja</div>
                  <div className="text-clay">{appointment.service.duration} minuta</div>
                </div>
                <div>
                  <div className="font-medium text-ink">Prioriteti</div>
                  <div className="text-clay">{appointment.appointment.priorityScore}/100</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="font-medium text-ink">Kërkuar më</div>
                  <div className="text-clay">
                    {new Date(appointment.timestamps.requestedAt).toLocaleString('sq-AL')}
                  </div>
                </div>

                {appointment.timestamps.respondedAt && (
                  <div>
                    <div className="font-medium text-ink">Përgjigjur më</div>
                    <div className="text-clay">
                      {new Date(appointment.timestamps.respondedAt).toLocaleString('sq-AL')}
                    </div>
                  </div>
                )}

                {appointment.timestamps.completedAt && (
                  <div>
                    <div className="font-medium text-ink">Përfunduar më</div>
                    <div className="text-clay">
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
