// frontend/components/salon/ConflictResolver.tsx
// Visual conflict resolution interface for salon owners
// Albanian Beauty Salon Booking Platform

import { useState } from 'react';
import { ConflictDetails, ResolutionStrategy, atomicApproval } from '../../lib/conflictDetection';
import { AlertModal } from '../ui/ConfirmationModal';
import { useAlertModal } from '../../hooks/useModals';

interface ConflictResolverProps {
  appointmentId: string;
  salonId: string;
  conflicts: ConflictDetails[];
  onResolution: (success: boolean, action?: string) => void;
  onCancel: () => void;
}

const ConflictResolver: React.FC<ConflictResolverProps> = ({
  appointmentId,
  salonId,
  conflicts,
  onResolution,
  onCancel
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<ResolutionStrategy | null>(null);
  const [processing, setProcessing] = useState(false);
  const [manualNotes, setManualNotes] = useState('');
  const alertModal = useAlertModal();

  // Determine suggested resolution strategy
  const suggestedStrategy = conflicts.length > 0 ? conflicts[0].resolutionStrategy : 'MANUAL_REVIEW';
  const hasCriticalConflicts = conflicts.some(c => c.severity === 'critical');
  const hasAutoRejectConflicts = conflicts.some(c => c.resolutionStrategy === 'AUTO_REJECT_CURRENT');

  const strategyConfig = {
    AUTO_APPROVE_CURRENT: {
      label: 'Miratu këtë rezervim',
      description: 'Rezervimi ka prioritet më të lartë se të tjerët',
      icon: '',
      color: 'text-success bg-success/5 border-success/25',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    AUTO_REJECT_CURRENT: {
      label: 'Refuzo këtë rezervim',
      description: 'Konflikt me rezervime të miratuara ose kohë të bllokuar',
      icon: '',
      color: 'text-accent bg-accent-soft/60 border-accent/25',
      buttonColor: 'bg-accent hover:bg-accent-strong'
    },
    MANUAL_REVIEW: {
      label: 'Shqyrto manualisht',
      description: 'Kërkon vendim nga saloni për zgjidhjen e konfliktit',
      icon: '',
      color: 'text-warning bg-yellow-50 border-warning/25',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    },
    RESCHEDULE_SUGGESTION: {
      label: 'Sugjero riplanifikim',
      description: 'Ofro kohë alternative për klientin',
      icon: '',
      color: 'text-accent bg-accent-soft/40 border-accent/25',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const conflictTypeConfig = {
    TIME_OVERLAP: {
      title: 'Mbivendosje kohore',
      description: 'Kërkesat për të njëjtën kohë',
      icon: '⏰',
      color: 'text-warning'
    },
    DOUBLE_BOOKING: {
      title: 'Rezervim i dyfishté',
      description: 'Konflikt me rezervim të miratuar',
      icon: '',
      color: 'text-accent'
    },
    APPROVAL_RACE: {
      title: 'Procesim i njëkohshëm',
      description: 'Rezervimi po përpunohet nga dikush tjetër',
      icon: '',
      color: 'text-purple-600'
    },
    AVAILABILITY_BLOCKED: {
      title: 'Kohë e bllokuar',
      description: 'Koha nuk është e disponueshme',
      icon: '',
      color: 'text-clay'
    }
  };

  const handleResolveConflict = async (strategy: ResolutionStrategy) => {
    if (processing) return;

    setProcessing(true);
    try {
      let action: 'approve' | 'decline' = 'approve';
      let notes = '';

      switch (strategy) {
        case 'AUTO_APPROVE_CURRENT':
          action = 'approve';
          notes = 'Miratuar automatikisht - prioritet më i lartë';
          break;
        case 'AUTO_REJECT_CURRENT':
          action = 'decline';
          notes = 'Refuzuar automatikisht për shkak konfliktesh';
          break;
        case 'MANUAL_REVIEW':
          // For manual review, use the notes provided by salon
          action = selectedStrategy === 'MANUAL_REVIEW' ? 'approve' : 'decline';
          notes = manualNotes || 'Vendim manual nga saloni';
          break;
        case 'RESCHEDULE_SUGGESTION':
          action = 'decline';
          notes = 'Sugjerohet riplanifikim për kohë tjetër';
          break;
      }

      const result = await atomicApproval({
        appointmentId,
        salonId,
        action,
        salonNotes: notes,
        checkConflicts: false // Already checked conflicts
      });

      if (result.success) {
        onResolution(true, result.action);
      } else {
        onResolution(false);
        alertModal.showAlert({
          title: 'Gabim',
          message: result.error || 'Gabim në zgjidhjen e konfliktit',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      onResolution(false);
      alertModal.showAlert({
        title: 'Gabim',
        message: 'Gabim në zgjidhjen e konfliktit',
        variant: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-paper rounded shadow-lifted max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-linen">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl"></div>
              <div>
                <h2 className="text-xl font-bold text-ink">
                  Konflikt në rezervim
                </h2>
                <p className="text-sm text-clay">
                  {conflicts.length} konflikt{conflicts.length !== 1 ? 'e' : ''} u gjetën
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-clay hover:text-ink transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conflict Details */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {conflicts.map((conflict) => {
              const config = conflictTypeConfig[conflict.type];
              return (
                <div
                  key={conflict.id}
                  className="border border-linen rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">{config.icon}</div>
                    <div className="flex-1">
                      <div className={`font-semibold ${config.color}`}>
                        {config.title}
                      </div>
                      <div className="text-sm text-clay">
                        {config.description}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      conflict.severity === 'critical' ? 'bg-accent-soft text-red-800' :
                      conflict.severity === 'high' ? 'bg-warning/10 text-orange-800' :
                      conflict.severity === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-sand text-ink'
                    }`}>
                      {conflict.severity === 'critical' ? 'Kritik' :
                       conflict.severity === 'high' ? 'I lartë' :
                       conflict.severity === 'medium' ? 'Mesatar' : 'I ulët'}
                    </div>
                  </div>

                  <div className="text-sm text-ink">
                    {conflict.description}
                  </div>

                  {/* Conflicting appointments */}
                  {conflict.conflictingAppointments.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-clay uppercase tracking-wide">
                        Rezervime në konflikt:
                      </div>
                      {conflict.conflictingAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="bg-cream rounded p-3 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {appointment.customers?.first_name} {appointment.customers?.last_name}
                              </div>
                              <div className="text-clay">
                                {appointment.services?.name} - {appointment.start_time}
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              appointment.status === 'approved' ? 'bg-success/10 text-success' :
                              appointment.status === 'pending' ? 'bg-warning/10 text-warning' :
                              'bg-sand text-ink'
                            }`}>
                              {appointment.status === 'approved' ? 'I miratuar' :
                               appointment.status === 'pending' ? 'Në pritje' : appointment.status}
                            </div>
                          </div>
                          <div className="text-xs text-clay mt-1">
                            Prioritet: {appointment.priority_score || 0}/100
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution Strategies */}
        <div className="p-6 border-t border-linen">
          <div className="space-y-4">
            <div className="text-lg font-semibold text-ink">
              Zgjidhje të sugjeruara
            </div>

            {/* Suggested Strategy */}
            {suggestedStrategy && (
              <div className={`border-2 rounded-lg p-4 ${strategyConfig[suggestedStrategy].color}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-xl">{strategyConfig[suggestedStrategy].icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold">
                      {strategyConfig[suggestedStrategy].label} (E sugjeruar)
                    </div>
                    <div className="text-sm opacity-75">
                      {strategyConfig[suggestedStrategy].description}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleResolveConflict(suggestedStrategy)}
                  disabled={processing}
                  className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors disabled:opacity-50 ${strategyConfig[suggestedStrategy].buttonColor}`}
                >
                  {processing ? 'Duke procesuar...' : strategyConfig[suggestedStrategy].label}
                </button>
              </div>
            )}

            {/* Manual Review Option */}
            {suggestedStrategy === 'MANUAL_REVIEW' && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-ink">
                  Vendimi manual:
                </div>
                
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Shtoni shënime për vendimin tuaj..."
                  className="w-full p-3 border border-linen rounded-lg resize-none h-20 text-sm"
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSelectedStrategy('MANUAL_REVIEW');
                      handleResolveConflict('MANUAL_REVIEW');
                    }}
                    disabled={processing || !manualNotes.trim()}
                    className="py-2 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    Miratu
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStrategy('AUTO_REJECT_CURRENT');
                      handleResolveConflict('AUTO_REJECT_CURRENT');
                    }}
                    disabled={processing}
                    className="py-2 px-4 bg-accent hover:bg-accent-strong disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    Refuzo
                  </button>
                </div>
              </div>
            )}

            {/* Critical Conflicts Warning */}
            {hasCriticalConflicts && (
              <div className="bg-accent-soft/60 border border-accent/25 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-accent text-xl"></div>
                  <div className="text-red-800 font-medium">
                    Konflikt kritik
                  </div>
                </div>
                <div className="text-accent-strong text-sm mt-1">
                  Ky rezervim nuk mund të miratohet për shkak konfliktesh kritike me rezervime të miratuara.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-linen bg-cream">
          <div className="flex items-center justify-between text-sm text-clay">
            <div>
              ID rezervimi: {appointmentId.slice(0, 8)}...
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                disabled={processing}
                className="text-clay hover:text-ink transition-colors"
              >
                Anulo
              </button>
              <div className="text-xs text-clay">
                {new Date().toLocaleTimeString('sq-AL')}
              </div>
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
    </div>
  );
};

export default ConflictResolver;