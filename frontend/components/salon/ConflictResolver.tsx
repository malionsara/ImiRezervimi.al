// frontend/components/salon/ConflictResolver.tsx
// Visual conflict resolution interface for salon owners
// Albanian Beauty Salon Booking Platform

import { useState } from 'react';
import { ConflictDetails, ResolutionStrategy, atomicApproval } from '../../lib/conflictDetection';

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

  // Determine suggested resolution strategy
  const suggestedStrategy = conflicts.length > 0 ? conflicts[0].resolutionStrategy : 'MANUAL_REVIEW';
  const hasCriticalConflicts = conflicts.some(c => c.severity === 'critical');
  const hasAutoRejectConflicts = conflicts.some(c => c.resolutionStrategy === 'AUTO_REJECT_CURRENT');

  const strategyConfig = {
    AUTO_APPROVE_CURRENT: {
      label: 'Miratu këtë rezervim',
      description: 'Rezervimi ka prioritet më të lartë se të tjerët',
      icon: '✅',
      color: 'text-green-600 bg-green-50 border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    AUTO_REJECT_CURRENT: {
      label: 'Refuzo këtë rezervim',
      description: 'Konflikt me rezervime të miratuara ose kohë të bllokuar',
      icon: '❌',
      color: 'text-red-600 bg-red-50 border-red-200',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    MANUAL_REVIEW: {
      label: 'Shqyrto manualisht',
      description: 'Kërkon vendim nga saloni për zgjidhjen e konfliktit',
      icon: '👤',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    },
    RESCHEDULE_SUGGESTION: {
      label: 'Sugjero riplanifikim',
      description: 'Ofro kohë alternative për klientin',
      icon: '📅',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const conflictTypeConfig = {
    TIME_OVERLAP: {
      title: 'Mbivendosje kohore',
      description: 'Kërkesat për të njëjtën kohë',
      icon: '⏰',
      color: 'text-orange-600'
    },
    DOUBLE_BOOKING: {
      title: 'Rezervim i dyfishté',
      description: 'Konflikt me rezervim të miratuar',
      icon: '🚫',
      color: 'text-red-600'
    },
    APPROVAL_RACE: {
      title: 'Procesim i njëkohshëm',
      description: 'Rezervimi po përpunohet nga dikush tjetër',
      icon: '⚡',
      color: 'text-purple-600'
    },
    AVAILABILITY_BLOCKED: {
      title: 'Kohë e bllokuar',
      description: 'Koha nuk është e disponueshme',
      icon: '🔒',
      color: 'text-gray-600'
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
        alert(result.error || 'Gabim në zgjidhjen e konfliktit');
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      onResolution(false);
      alert('Gabim në zgjidhjen e konfliktit');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Konflikt në rezervim
                </h2>
                <p className="text-sm text-gray-600">
                  {conflicts.length} konflikt{conflicts.length !== 1 ? 'e' : ''} u gjetën
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 transition-colors"
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
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">{config.icon}</div>
                    <div className="flex-1">
                      <div className={`font-semibold ${config.color}`}>
                        {config.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {config.description}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      conflict.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      conflict.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      conflict.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {conflict.severity === 'critical' ? 'Kritik' :
                       conflict.severity === 'high' ? 'I lartë' :
                       conflict.severity === 'medium' ? 'Mesatar' : 'I ulët'}
                    </div>
                  </div>

                  <div className="text-sm text-gray-700">
                    {conflict.description}
                  </div>

                  {/* Conflicting appointments */}
                  {conflict.conflictingAppointments.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Rezervime në konflikt:
                      </div>
                      {conflict.conflictingAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="bg-gray-50 rounded p-3 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {appointment.customers?.first_name} {appointment.customers?.last_name}
                              </div>
                              <div className="text-gray-600">
                                {appointment.services?.name} - {appointment.start_time}
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status === 'approved' ? 'I miratuar' :
                               appointment.status === 'pending' ? 'Në pritje' : appointment.status}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
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
        <div className="p-6 border-t border-gray-200">
          <div className="space-y-4">
            <div className="text-lg font-semibold text-gray-900">
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
                <div className="text-sm font-medium text-gray-700">
                  Vendimi manual:
                </div>
                
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Shtoni shënime për vendimin tuaj..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 text-sm"
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
                    ✅ Miratu
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStrategy('AUTO_REJECT_CURRENT');
                      handleResolveConflict('AUTO_REJECT_CURRENT');
                    }}
                    disabled={processing}
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    ❌ Refuzo
                  </button>
                </div>
              </div>
            )}

            {/* Critical Conflicts Warning */}
            {hasCriticalConflicts && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-red-600 text-xl">🚨</div>
                  <div className="text-red-800 font-medium">
                    Konflikt kritik
                  </div>
                </div>
                <div className="text-red-700 text-sm mt-1">
                  Ky rezervim nuk mund të miratohet për shkak konfliktesh kritike me rezervime të miratuara.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              ID rezervimi: {appointmentId.slice(0, 8)}...
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                disabled={processing}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Anulo
              </button>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleTimeString('sq-AL')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolver;