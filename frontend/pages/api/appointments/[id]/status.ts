// frontend/pages/api/appointments/[id]/status.ts
// Update appointment status API endpoint (approve/decline)
// Albanian Beauty Salon Booking Platform

import { NextApiRequest, NextApiResponse } from 'next';
import {
  updateAppointmentStatus,
  validateSalon,
  ALBANIAN_APPOINTMENT_ERRORS,
} from '../../../../lib/appointments';
import {
  validateAppointmentUpdate,
  AppointmentUpdateData,
  isValidUUID,
} from '../../../../lib/validation';

interface ApiResponse {
  success: boolean;
  data?: {
    appointmentId: string;
    status: string;
    statusText: string;
    message: string;
    updatedAt: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Vetëm kërkesat PUT janë të lejuara',
      },
    });
  }

  try {
    const { id } = req.query;

    // ==============================================
    // INPUT VALIDATION
    // ==============================================

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_APPOINTMENT_ID',
          message: 'ID e takimit është e detyrueshme',
        },
      });
    }

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_APPOINTMENT_ID',
          message: 'ID e takimit nuk është në formatin e duhur',
        },
      });
    }

    // ==============================================
    // AUTHORIZATION
    // ==============================================

    // Extract salon ID from request body or headers
    // In a real app, this would come from authentication tokens
    const salonId = req.body.salonId || req.headers['x-salon-id'];
    
    if (!salonId || !isValidUUID(salonId)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_SALON_AUTH',
          message: 'Autorizimi i sallonit është i detyrueshëm',
        },
      });
    }

    // Validate salon exists and is active
    const salonValidation = await validateSalon(salonId);
    if (!salonValidation.success) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SALON_NOT_AUTHORIZED',
          message: 'Salloni nuk është i autorizuar ose nuk është aktiv',
        },
      });
    }

    // ==============================================
    // REQUEST VALIDATION
    // ==============================================

    // Prepare validation data
    const updateData = {
      appointmentId: id,
      status: req.body.status,
      salonNotes: req.body.salonNotes,
    };

    const validationResult = validateAppointmentUpdate(updateData);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Të dhënat e dërguara nuk janë të vlefshme',
          details: validationResult.errors,
        },
      });
    }

    const validatedData: AppointmentUpdateData = validationResult.data!;

    // Additional security checks
    const userAgent = req.headers['user-agent'] || '';
    if (userAgent.length < 10) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'SUSPICIOUS_REQUEST',
          message: 'Kërkesë e dyshimtë. Provoni përsëri më vonë.',
        },
      });
    }

    console.log(`Status update request for appointment ${id} by salon ${salonId}`);

    // ==============================================
    // UPDATE APPOINTMENT STATUS
    // ==============================================

    const updateResult = await updateAppointmentStatus(
      id,
      validatedData,
      salonId
    );

    if (!updateResult.success) {
      let statusCode = 500;
      let errorCode = 'INTERNAL_ERROR';

      if (updateResult.error === ALBANIAN_APPOINTMENT_ERRORS.APPOINTMENT_NOT_FOUND) {
        statusCode = 404;
        errorCode = 'APPOINTMENT_NOT_FOUND';
      } else if (updateResult.error === ALBANIAN_APPOINTMENT_ERRORS.INVALID_STATUS_TRANSITION) {
        statusCode = 400;
        errorCode = 'INVALID_STATUS_TRANSITION';
      }

      return res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: updateResult.error!,
        },
      });
    }

    const appointment = updateResult.appointment!;

    // ==============================================
    // SUCCESS RESPONSE
    // ==============================================

    const statusTextMap: Record<string, string> = {
      pending: 'Në pritje',
      approved: 'I aprovuar',
      declined: 'I refuzuar',
      completed: 'I përfunduar',
      no_show: 'Nuk u paraqit',
      cancelled: 'I anuluar',
    };

    const statusMessages: Record<string, string> = {
      approved: 'Takimi është aprovuar me sukses.',
      declined: 'Takimi është refuzuar.',
      completed: 'Takimi është shënuar si i përfunduar.',
      no_show: 'Takimi është shënuar si "nuk u paraqit".',
      cancelled: 'Takimi është anuluar.',
    };

    console.log(`Appointment ${id} status updated to ${appointment.status}`);

    // Send notification to customer (async, non-blocking)
    sendCustomerNotification(appointment, validatedData.status)
      .catch(error => console.error('Error sending customer notification:', error));

    return res.status(200).json({
      success: true,
      data: {
        appointmentId: appointment.id,
        status: appointment.status,
        statusText: statusTextMap[appointment.status] || appointment.status,
        message: statusMessages[appointment.status] || 'Statusi i takimit u përditësua me sukses.',
        updatedAt: appointment.updated_at,
      },
    });

  } catch (error: unknown) {
    console.error('Update appointment status error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Gabim i brendshëm i serverit';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ka ndodhur një gabim në përditësimin e statusit.',
        details: process.env.NODE_ENV === 'development' 
          ? { error: errorMessage, stack: errorStack } 
          : undefined,
      },
    });
  }
}

// ==============================================
// HELPER FUNCTIONS
// ==============================================

/**
 * Sends notification to customer about status change
 */
async function sendCustomerNotification(
  appointment: any,
  newStatus: string
): Promise<void> {
  try {
    // This would integrate with WhatsApp/SMS service
    const notificationMessages: Record<string, string> = {
      approved: `Mirupafshim! Takimi juaj në ${appointment.salon_name} më ${appointment.appointment_date} në ${appointment.start_time} është aprovuar. Shihemi atje!`,
      declined: `Na vjen keq, por takimi juaj në ${appointment.salon_name} më ${appointment.appointment_date} nuk mund të aprovohet. Kontaktoni sallonin për më shumë informacion.`,
      completed: `Faleminderit që zgjodhët ${appointment.salon_name}! Shpresojmë që jeni të kënaqur me shërbimin.`,
      cancelled: `Takimi juaj në ${appointment.salon_name} më ${appointment.appointment_date} është anuluar.`,
    };

    const message = notificationMessages[newStatus];
    if (message) {
      console.log(`Customer notification sent for appointment ${appointment.id}: ${newStatus}`);
      // Here you would call your WhatsApp/SMS service
    }
  } catch (error) {
    console.error('Error sending customer notification:', error);
    // Don't fail the request if notification fails
  }
}

/**
 * Logs status change for analytics
 */
function logStatusChange(data: {
  appointmentId: string;
  salonId: string;
  oldStatus: string;
  newStatus: string;
  timestamp: string;
}): void {
  // In production, send to analytics service
  console.log('Status change logged:', {
    appointment: data.appointmentId,
    salon: data.salonId,
    transition: `${data.oldStatus} -> ${data.newStatus}`,
    timestamp: data.timestamp,
  });
}

/**
 * Updates salon metrics based on status change
 */
async function updateSalonMetrics(
  salonId: string,
  status: string
): Promise<void> {
  try {
    // This would update salon performance metrics
    // e.g., response time, approval rate, etc.
    console.log(`Salon metrics updated for ${salonId}: ${status}`);
  } catch (error) {
    console.error('Error updating salon metrics:', error);
    // Don't fail the request if metrics update fails
  }
}