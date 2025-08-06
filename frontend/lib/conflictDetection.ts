// frontend/lib/conflictDetection.ts
// Booking conflict detection and resolution system
// Albanian Beauty Salon Booking Platform

import { createClient } from '@supabase/supabase-js';
import { AppointmentWithRelations, TimeSlot } from '../types/database';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==============================================
// TYPES AND INTERFACES
// ==============================================

export interface ConflictDetails {
  id: string;
  type: 'TIME_OVERLAP' | 'DOUBLE_BOOKING' | 'APPROVAL_RACE' | 'AVAILABILITY_BLOCKED';
  severity: 'low' | 'medium' | 'high' | 'critical';
  conflictingAppointments: AppointmentWithRelations[];
  blockedTimeSlots: TimeSlot[];
  description: string;
  resolutionStrategy: ResolutionStrategy;
  createdAt: string;
}

export type ResolutionStrategy = 
  | 'AUTO_APPROVE_CURRENT'
  | 'AUTO_REJECT_CURRENT' 
  | 'MANUAL_REVIEW'
  | 'RESCHEDULE_SUGGESTION';

export interface AtomicApprovalRequest {
  appointmentId: string;
  salonId: string;
  action: 'approve' | 'decline';
  salonNotes?: string;
  checkConflicts: boolean;
}

export interface AtomicApprovalResult {
  success: boolean;
  appointmentId: string;
  action: string;
  conflicts: ConflictDetails[];
  requiresManualResolution: boolean;
  error?: string;
}

export interface AppointmentLock {
  appointmentId: string;
  salonId: string;
  lockedBy: string;
  lockedAt: string;
  expiresAt: string;
}

// ==============================================
// IN-MEMORY LOCK MANAGER
// ==============================================

class LockManager {
  private locks = new Map<string, AppointmentLock>();
  private readonly LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  acquireLock(appointmentId: string, salonId: string, lockedBy: string): boolean {
    const lockKey = `${appointmentId}_${salonId}`;
    const existingLock = this.locks.get(lockKey);
    
    // Check if existing lock is expired
    if (existingLock && new Date(existingLock.expiresAt) < new Date()) {
      this.locks.delete(lockKey);
    }
    
    // If lock exists and not expired, acquisition fails
    if (this.locks.has(lockKey)) {
      return false;
    }
    
    // Acquire new lock
    const lock: AppointmentLock = {
      appointmentId,
      salonId,
      lockedBy,
      lockedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.LOCK_DURATION_MS).toISOString()
    };
    
    this.locks.set(lockKey, lock);
    console.log(`🔒 Acquired lock for appointment ${appointmentId}`);
    return true;
  }
  
  releaseLock(appointmentId: string, salonId: string, lockedBy: string): boolean {
    const lockKey = `${appointmentId}_${salonId}`;
    const lock = this.locks.get(lockKey);
    
    if (!lock || lock.lockedBy !== lockedBy) {
      return false;
    }
    
    this.locks.delete(lockKey);
    console.log(`🔓 Released lock for appointment ${appointmentId}`);
    return true;
  }
  
  isLocked(appointmentId: string, salonId: string): boolean {
    const lockKey = `${appointmentId}_${salonId}`;
    const lock = this.locks.get(lockKey);
    
    if (!lock) return false;
    
    // Check if expired
    if (new Date(lock.expiresAt) < new Date()) {
      this.locks.delete(lockKey);
      return false;
    }
    
    return true;
  }
  
  // Cleanup expired locks periodically
  cleanup(): void {
    const now = new Date();
    for (const [key, lock] of this.locks.entries()) {
      if (new Date(lock.expiresAt) < now) {
        this.locks.delete(key);
        console.log(`🧹 Cleaned up expired lock for ${lock.appointmentId}`);
      }
    }
  }
}

const lockManager = new LockManager();

// Cleanup expired locks every minute
setInterval(() => lockManager.cleanup(), 60 * 1000);

// ==============================================
// CONFLICT DETECTION LOGIC
// ==============================================

export async function detectConflicts(
  appointmentId: string,
  includeAvailability = false
): Promise<ConflictDetails[]> {
  console.log(`🔍 Detecting conflicts for appointment ${appointmentId}`);
  
  try {
    // Get appointment details with relations
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        salons (*),
        customers (*),
        services (*)
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      throw new Error(`Appointment not found: ${appointmentId}`);
    }

    const conflicts: ConflictDetails[] = [];

    // Check for time overlaps with other pending appointments
    const timeOverlapConflicts = await detectTimeOverlapConflicts(appointment);
    conflicts.push(...timeOverlapConflicts);

    // Check for double booking with approved appointments
    const doubleBookingConflicts = await detectDoubleBookingConflicts(appointment);
    conflicts.push(...doubleBookingConflicts);

    // Check for approval race conditions
    const raceConflicts = await detectApprovalRaceConflicts(appointment);
    conflicts.push(...raceConflicts);

    // Check blocked time slots if requested
    if (includeAvailability) {
      const availabilityConflicts = await detectAvailabilityConflicts(appointment);
      conflicts.push(...availabilityConflicts);
    }

    console.log(`📊 Found ${conflicts.length} conflicts for appointment ${appointmentId}`);
    return conflicts;

  } catch (error) {
    console.error('❌ Error detecting conflicts:', error);
    throw error;
  }
}

async function detectTimeOverlapConflicts(
  appointment: AppointmentWithRelations
): Promise<ConflictDetails[]> {
  const { data: overlapping, error } = await supabase
    .from('appointments')
    .select(`
      *,
      salons (*),
      customers (*),
      services (*)
    `)
    .eq('salon_id', appointment.salon_id)
    .eq('appointment_date', appointment.appointment_date)
    .eq('status', 'pending')
    .neq('id', appointment.id);

  if (error || !overlapping) return [];

  const conflicts: ConflictDetails[] = [];
  const appointmentStart = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
  const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.services?.duration_minutes || 60) * 60000);

  for (const other of overlapping) {
    const otherStart = new Date(`${other.appointment_date}T${other.start_time}`);
    const otherEnd = new Date(otherStart.getTime() + (other.services?.duration_minutes || 60) * 60000);

    // Check for time overlap
    if (appointmentStart < otherEnd && appointmentEnd > otherStart) {
      conflicts.push({
        id: `overlap_${appointment.id}_${other.id}`,
        type: 'TIME_OVERLAP',
        severity: 'high',
        conflictingAppointments: [other],
        blockedTimeSlots: [],
        description: `Koha e rezervimit mbivendoset me rezervimin e ${other.customers?.first_name} ${other.customers?.last_name}`,
        resolutionStrategy: determineResolutionStrategy(appointment, [other]),
        createdAt: new Date().toISOString()
      });
    }
  }

  return conflicts;
}

async function detectDoubleBookingConflicts(
  appointment: AppointmentWithRelations
): Promise<ConflictDetails[]> {
  const { data: approved, error } = await supabase
    .from('appointments')
    .select(`
      *,
      salons (*),
      customers (*),
      services (*)
    `)
    .eq('salon_id', appointment.salon_id)
    .eq('appointment_date', appointment.appointment_date)
    .eq('status', 'approved')
    .neq('id', appointment.id);

  if (error || !approved) return [];

  const conflicts: ConflictDetails[] = [];
  const appointmentStart = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
  const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.services?.duration_minutes || 60) * 60000);

  for (const other of approved) {
    const otherStart = new Date(`${other.appointment_date}T${other.start_time}`);
    const otherEnd = new Date(otherStart.getTime() + (other.services?.duration_minutes || 60) * 60000);

    if (appointmentStart < otherEnd && appointmentEnd > otherStart) {
      conflicts.push({
        id: `doubleBook_${appointment.id}_${other.id}`,
        type: 'DOUBLE_BOOKING',
        severity: 'critical',
        conflictingAppointments: [other],
        blockedTimeSlots: [],
        description: `Ekziston një rezervim i miratuar për ${other.customers?.first_name} ${other.customers?.last_name} në këtë kohë`,
        resolutionStrategy: 'AUTO_REJECT_CURRENT',
        createdAt: new Date().toISOString()
      });
    }
  }

  return conflicts;
}

async function detectApprovalRaceConflicts(
  appointment: AppointmentWithRelations
): Promise<ConflictDetails[]> {
  // Check if appointment is locked by another process
  if (lockManager.isLocked(appointment.id, appointment.salon_id)) {
    return [{
      id: `race_${appointment.id}`,
      type: 'APPROVAL_RACE',
      severity: 'medium',
      conflictingAppointments: [],
      blockedTimeSlots: [],
      description: 'Rezervimi është duke u përpunuar nga një proces tjetër',
      resolutionStrategy: 'MANUAL_REVIEW',
      createdAt: new Date().toISOString()
    }];
  }

  return [];
}

async function detectAvailabilityConflicts(
  appointment: AppointmentWithRelations
): Promise<ConflictDetails[]> {
  try {
    // Check for blocked time slots
    const { data: blockedSlots, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('salon_id', appointment.salon_id)
      .eq('date', appointment.appointment_date)
      .eq('status', 'blocked');

    if (error) return [];

    const conflicts: ConflictDetails[] = [];
    const appointmentStart = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
    const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.services?.duration_minutes || 60) * 60000);

    for (const slot of blockedSlots || []) {
      const slotStart = new Date(`${slot.date}T${slot.start_time}`);
      const slotEnd = new Date(slotStart.getTime() + slot.duration_minutes * 60000);

      if (appointmentStart < slotEnd && appointmentEnd > slotStart) {
        conflicts.push({
          id: `blocked_${appointment.id}_${slot.id}`,
          type: 'AVAILABILITY_BLOCKED',
          severity: 'high',
          conflictingAppointments: [],
          blockedTimeSlots: [slot],
          description: `Koha është e bllokuar: ${slot.reason || 'Nuk është e disponueshme'}`,
          resolutionStrategy: 'AUTO_REJECT_CURRENT',
          createdAt: new Date().toISOString()
        });
      }
    }

    return conflicts;
  } catch (error) {
    console.error('Error checking blocked slots:', error);
    return [];
  }
}

function determineResolutionStrategy(
  current: AppointmentWithRelations,
  conflicting: AppointmentWithRelations[]
): ResolutionStrategy {
  const currentPriority = current.priority_score || 0;
  const conflictingPriorities = conflicting.map(a => a.priority_score || 0);
  const maxConflictingPriority = Math.max(...conflictingPriorities);

  if (currentPriority > maxConflictingPriority + 10) {
    return 'AUTO_APPROVE_CURRENT';
  } else if (currentPriority < maxConflictingPriority - 10) {
    return 'AUTO_REJECT_CURRENT';
  } else {
    return 'MANUAL_REVIEW';
  }
}

// ==============================================
// ATOMIC APPROVAL OPERATIONS
// ==============================================

export async function atomicApproval(
  request: AtomicApprovalRequest
): Promise<AtomicApprovalResult> {
  const { appointmentId, salonId, action, salonNotes, checkConflicts } = request;
  
  console.log(`⚡ Starting atomic ${action} for appointment ${appointmentId}`);
  
  try {
    // Acquire lock first
    const lockAcquired = lockManager.acquireLock(appointmentId, salonId, `salon_${salonId}`);
    
    if (!lockAcquired) {
      return {
        success: false,
        appointmentId,
        action,
        conflicts: [],
        requiresManualResolution: false,
        error: 'Rezervimi është duke u përpunuar nga një proces tjetër'
      };
    }

    let conflicts: ConflictDetails[] = [];

    // Check for conflicts if requested
    if (checkConflicts && action === 'approve') {
      conflicts = await detectConflicts(appointmentId, true);
      
      // Handle automatic resolution
      const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
      if (criticalConflicts.length > 0) {
        lockManager.releaseLock(appointmentId, salonId, `salon_${salonId}`);
        return {
          success: false,
          appointmentId,
          action,
          conflicts: criticalConflicts,
          requiresManualResolution: true,
          error: 'Ekzistojnë konflikte kritike që kërkojnë zgjidhje manuale'
        };
      }

      // Check for auto-reject conflicts
      const autoRejectConflicts = conflicts.filter(c => c.resolutionStrategy === 'AUTO_REJECT_CURRENT');
      if (autoRejectConflicts.length > 0) {
        // Auto-reject current appointment
        await updateAppointmentStatus(appointmentId, 'declined', 'Refuzuar automatikisht për shkak konfliktesh');
        lockManager.releaseLock(appointmentId, salonId, `salon_${salonId}`);
        
        return {
          success: true,
          appointmentId,
          action: 'declined',
          conflicts: autoRejectConflicts,
          requiresManualResolution: false
        };
      }
    }

    // Proceed with the requested action
    const statusResult = await updateAppointmentStatus(appointmentId, action, salonNotes);
    
    if (!statusResult.success) {
      lockManager.releaseLock(appointmentId, salonId, `salon_${salonId}`);
      return {
        success: false,
        appointmentId,
        action,
        conflicts,
        requiresManualResolution: false,
        error: statusResult.error as string
      };
    }

    // Release lock
    lockManager.releaseLock(appointmentId, salonId, `salon_${salonId}`);
    
    console.log(`✅ Atomic ${action} completed for appointment ${appointmentId}`);
    
    return {
      success: true,
      appointmentId,
      action,
      conflicts,
      requiresManualResolution: conflicts.some(c => c.resolutionStrategy === 'MANUAL_REVIEW')
    };

  } catch (error) {
    // Ensure lock is released on error
    lockManager.releaseLock(appointmentId, salonId, `salon_${salonId}`);
    
    console.error(`❌ Atomic ${action} failed:`, error);
    return {
      success: false,
      appointmentId,
      action,
      conflicts: [],
      requiresManualResolution: false,
      error: error instanceof Error ? error.message : 'Gabim i papritur'
    };
  }
}

// Helper function to update appointment status
async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
  salonNotes?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const updates: any = {
      status,
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (salonNotes) {
      updates.salon_notes = salonNotes;
    }

    if (status === 'approved') {
      updates.approved_at = new Date().toISOString();
    } else if (status === 'declined') {
      updates.declined_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Gabim në përditësimin e statusit' 
    };
  }
}

// ==============================================
// LOCK MANAGEMENT UTILITIES
// ==============================================

export function acquireAppointmentLock(
  appointmentId: string,
  salonId: string,
  lockedBy: string
): boolean {
  return lockManager.acquireLock(appointmentId, salonId, lockedBy);
}

export function releaseAppointmentLock(
  appointmentId: string,
  salonId: string,
  lockedBy: string
): boolean {
  return lockManager.releaseLock(appointmentId, salonId, lockedBy);
}

export function isAppointmentLocked(
  appointmentId: string,
  salonId: string
): boolean {
  return lockManager.isLocked(appointmentId, salonId);
}

// ==============================================
// ALBANIAN ERROR MESSAGES
// ==============================================

export const CONFLICT_MESSAGES = {
  TIME_OVERLAP: 'Koha e rezervimit mbivendoset me rezervime të tjera',
  DOUBLE_BOOKING: 'Ekziston një rezervim i miratuar për këtë kohë',
  APPROVAL_RACE: 'Disa rezervime po përpunohen në të njëjtën kohë',
  AVAILABILITY_BLOCKED: 'Koha është e bllokuar dhe nuk është e disponueshme',
  APPOINTMENT_LOCKED: 'Rezervimi është duke u përpunuar nga një proces tjetër',
  AUTO_RESOLUTION_FAILED: 'Zgjidhja automatike e konfliktit dështoi',
  MANUAL_RESOLUTION_REQUIRED: 'Kërkohet zgjidhje manuale e konfliktit',
  CRITICAL_CONFLICT: 'Konflikt kritik që nuk mund të zgjidhet automatikisht',
  PRIORITY_CONFLICT: 'Konflikt prioriteti midis rezervimeve',
  CONCURRENT_MODIFICATION: 'Rezervimi është modifikuar nga dikush tjetër'
} as const;