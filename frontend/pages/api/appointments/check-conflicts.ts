// frontend/pages/api/appointments/check-conflicts.ts
// Real-time conflict detection and atomic approval API
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import { 
  detectConflicts, 
  atomicApproval, 
  acquireAppointmentLock,
  releaseAppointmentLock,
  ConflictDetails,
  AtomicApprovalRequest,
  AtomicApprovalResult 
} from '../../../lib/conflictDetection';

// ==============================================
// API RESPONSE INTERFACES
// ==============================================

interface ConflictCheckResponse {
  success: boolean;
  appointmentId: string;
  conflicts: ConflictDetails[];
  lockAcquired?: boolean;
  error?: string;
}

interface AtomicApprovalResponse {
  success: boolean;
  appointmentId: string;
  action: string;
  conflicts: ConflictDetails[];
  requiresManualResolution: boolean;
  error?: string;
}

interface LockResponse {
  success: boolean;
  appointmentId: string;
  lockReleased?: boolean;
  error?: string;
}

// ==============================================
// MAIN API HANDLER
// ==============================================

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers for real-time updates
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'POST':
        return await handleConflictCheck(req, res);
      case 'PUT':
        return await handleAtomicApproval(req, res);
      case 'DELETE':
        return await handleLockRelease(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Vetëm POST, PUT dhe DELETE request-et janë të lejuara'
        });
    }
  } catch (error) {
    console.error('❌ Conflict detection API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Gabim i brendshëm i serverit'
    });
  }
}

// ==============================================
// CONFLICT CHECK HANDLER (POST)
// ==============================================

async function handleConflictCheck(
  req: NextApiRequest,
  res: NextApiResponse<ConflictCheckResponse>
) {
  const { appointmentId, includeAvailability, acquireLock, salonId } = req.body;

  console.log(`🔍 Conflict check request for appointment ${appointmentId}`);

  // Validation
  if (!appointmentId || typeof appointmentId !== 'string') {
    return res.status(400).json({
      success: false,
      appointmentId: appointmentId || '',
      conflicts: [],
      error: 'ID e rezervimit është e detyrueshme'
    });
  }

  try {
    // Acquire lock if requested
    let lockAcquired = false;
    if (acquireLock && salonId) {
      lockAcquired = acquireAppointmentLock(appointmentId, salonId, `salon_${salonId}`);
      if (!lockAcquired) {
        return res.status(409).json({
          success: false,
          appointmentId,
          conflicts: [],
          lockAcquired: false,
          error: 'Rezervimi është duke u përpunuar nga një proces tjetër'
        });
      }
    }

    // Detect conflicts
    const conflicts = await detectConflicts(appointmentId, includeAvailability || false);

    console.log(`📊 Found ${conflicts.length} conflicts for appointment ${appointmentId}`);

    return res.status(200).json({
      success: true,
      appointmentId,
      conflicts,
      lockAcquired
    });

  } catch (error) {
    console.error('❌ Error in conflict check:', error);
    
    // Release lock if it was acquired
    if (salonId) {
      releaseAppointmentLock(appointmentId, salonId, `salon_${salonId}`);
    }

    return res.status(500).json({
      success: false,
      appointmentId,
      conflicts: [],
      error: error instanceof Error ? error.message : 'Gabim në kontrollin e konflikteve'
    });
  }
}

// ==============================================
// ATOMIC APPROVAL HANDLER (PUT)
// ==============================================

async function handleAtomicApproval(
  req: NextApiRequest,
  res: NextApiResponse<AtomicApprovalResponse>
) {
  const { appointmentId, salonId, action, salonNotes, checkConflicts } = req.body;

  console.log(`⚡ Atomic ${action} request for appointment ${appointmentId}`);

  // Validation
  if (!appointmentId || typeof appointmentId !== 'string') {
    return res.status(400).json({
      success: false,
      appointmentId: appointmentId || '',
      action: action || '',
      conflicts: [],
      requiresManualResolution: false,
      error: 'ID e rezervimit është e detyrueshme'
    });
  }

  if (!salonId || typeof salonId !== 'string') {
    return res.status(400).json({
      success: false,
      appointmentId,
      action: action || '',
      conflicts: [],
      requiresManualResolution: false,
      error: 'ID e salonit është e detyrueshme'
    });
  }

  if (!['approve', 'decline'].includes(action)) {
    return res.status(400).json({
      success: false,
      appointmentId,
      action: action || '',
      conflicts: [],
      requiresManualResolution: false,
      error: 'Veprimi duhet të jetë "approve" ose "decline"'
    });
  }

  try {
    // Build atomic approval request
    const approvalRequest: AtomicApprovalRequest = {
      appointmentId,
      salonId,
      action: action as 'approve' | 'decline',
      salonNotes,
      checkConflicts: checkConflicts !== false // Default to true
    };

    // Execute atomic approval
    const result: AtomicApprovalResult = await atomicApproval(approvalRequest);

    const statusCode = result.success ? 200 : 
                      result.requiresManualResolution ? 409 : 400;

    console.log(`${result.success ? '✅' : '❌'} Atomic ${action} ${result.success ? 'completed' : 'failed'} for appointment ${appointmentId}`);

    return res.status(statusCode).json({
      success: result.success,
      appointmentId: result.appointmentId,
      action: result.action,
      conflicts: result.conflicts,
      requiresManualResolution: result.requiresManualResolution,
      error: result.error
    });

  } catch (error) {
    console.error('❌ Error in atomic approval:', error);

    return res.status(500).json({
      success: false,
      appointmentId,
      action,
      conflicts: [],
      requiresManualResolution: false,
      error: error instanceof Error ? error.message : 'Gabim në aprovimin atomik'
    });
  }
}

// ==============================================
// LOCK RELEASE HANDLER (DELETE)
// ==============================================

async function handleLockRelease(
  req: NextApiRequest,
  res: NextApiResponse<LockResponse>
) {
  const { appointmentId, salonId } = req.body;

  console.log(`🔓 Lock release request for appointment ${appointmentId}`);

  // Validation
  if (!appointmentId || typeof appointmentId !== 'string') {
    return res.status(400).json({
      success: false,
      appointmentId: appointmentId || '',
      error: 'ID e rezervimit është e detyrueshme'
    });
  }

  if (!salonId || typeof salonId !== 'string') {
    return res.status(400).json({
      success: false,
      appointmentId,
      error: 'ID e salonit është e detyrueshme'
    });
  }

  try {
    const lockReleased = releaseAppointmentLock(appointmentId, salonId, `salon_${salonId}`);

    if (!lockReleased) {
      return res.status(404).json({
        success: false,
        appointmentId,
        lockReleased: false,
        error: 'Lock nuk u gjet ose nuk jeni i autorizuar ta lironi'
      });
    }

    console.log(`🔓 Lock released for appointment ${appointmentId}`);

    return res.status(200).json({
      success: true,
      appointmentId,
      lockReleased: true
    });

  } catch (error) {
    console.error('❌ Error releasing lock:', error);

    return res.status(500).json({
      success: false,
      appointmentId,
      error: error instanceof Error ? error.message : 'Gabim në lirimin e lock-ut'
    });
  }
}

// ==============================================
// REQUEST VALIDATION HELPERS
// ==============================================

function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function sanitizeString(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}

// ==============================================
// ALBANIAN ERROR MESSAGES
// ==============================================

export const API_ERROR_MESSAGES = {
  MISSING_APPOINTMENT_ID: 'ID e rezervimit është e detyrueshme',
  MISSING_SALON_ID: 'ID e salonit është e detyrueshme',
  INVALID_ACTION: 'Veprimi duhet të jetë "approve" ose "decline"',
  APPOINTMENT_LOCKED: 'Rezervimi është duke u përpunuar nga një proces tjetër',
  LOCK_NOT_FOUND: 'Lock nuk u gjet ose nuk jeni i autorizuar',
  CONFLICT_DETECTION_FAILED: 'Gabim në kontrollin e konflikteve',
  ATOMIC_APPROVAL_FAILED: 'Gabim në aprovimin atomik',
  LOCK_RELEASE_FAILED: 'Gabim në lirimin e lock-ut',
  INTERNAL_ERROR: 'Gabim i brendshëm i serverit',
  METHOD_NOT_ALLOWED: 'Metoda nuk është e lejueshme',
  INVALID_UUID: 'ID nuk është në formatin e duhur',
  UNAUTHORIZED: 'Nuk jeni i autorizuar për këtë veprim'
} as const;