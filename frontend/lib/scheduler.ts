// frontend/lib/scheduler.ts
// Scheduler utilities for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

/**
 * Call the reminders API endpoint
 * This can be used by external cron services like Vercel Cron or GitHub Actions
 */
export async function triggerReminders(): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      throw new Error('CRON_SECRET environment variable not set');
    }

    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/appointments/reminders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (response.ok) {
      return { success: true, data: result };
    } else {
      return { success: false, error: result.error?.message || 'Unknown error' };
    }

  } catch (error) {
    console.error('Failed to trigger reminders:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Utility to check if an appointment needs a reminder
 * (24 hours before appointment time)
 */
export function shouldSendReminder(appointmentDate: string, appointmentTime: string): boolean {
  const now = new Date();
  const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
  
  // Calculate 24 hours before appointment
  const reminderTime = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
  
  // Should send if current time is past reminder time but before appointment
  return now >= reminderTime && now < appointmentDateTime;
}

/**
 * Format appointment time for reminder messages
 */
export function formatAppointmentTime(date: string, time: string): string {
  const appointmentDate = new Date(date);
  
  const formattedDate = appointmentDate.toLocaleDateString('sq-AL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  
  return `${formattedDate} në orën ${time}`;
}