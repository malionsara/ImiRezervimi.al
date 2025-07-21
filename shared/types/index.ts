// ImiRezervimi.al - Shared TypeScript Types
// Albanian Beauty Salon Booking Platform

// ==============================================
// CORE ENTITIES
// ==============================================

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  instagramId?: string;
  googleId?: string;
  rating: number; // 0-5 stars
  totalVisits: number;
  noShows: number;
  cancellationRate: number;
  accountType: 'guest' | 'social' | 'verified';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Salon {
  id: string;
  name: string;
  slug: string; // for bio links
  description: string;
  phone: string;
  address: string;
  city: string;
  instagramHandle: string;
  workingHours: WorkingHours;
  whatsappNumber: string;
  subscriptionTier: 'free' | 'basic' | 'premium';
  trialEndsAt: Date;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  salonId: string;
  customerId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  duration: number;
  serviceName: string;
  servicePrice: number;
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'no_show' | 'cancelled';
  priorityScore: number;
  customerNotes?: string;
  salonNotes?: string;
  requestedAt: Date;
  respondedAt?: Date;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  nameEn?: string;
  description: string;
  price?: number;
  durationMinutes: number;
  isActive: boolean;
  requiresApproval: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==============================================
// TWILIO & WHATSAPP TYPES
// ==============================================

export interface WhatsAppMessage {
  to: string; // Phone number in +355 format
  body: string;
  mediaUrl?: string;
}

export interface WhatsAppMessageResponse {
  sid: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  errorCode?: string;
  errorMessage?: string;
}

export interface TwilioWebhookPayload {
  MessageSid: string;
  AccountSid: string;
  From: string;
  To: string;
  Body: string;
  MessageStatus: 'sent' | 'delivered' | 'failed' | 'undelivered';
  ErrorCode?: string;
  ErrorMessage?: string;
}

export interface NotificationTemplate {
  type: NotificationType;
  template: (params: Record<string, string>) => string;
}

export type NotificationType = 
  | 'booking_request'
  | 'booking_approved' 
  | 'booking_declined'
  | 'reminder_24h'
  | 'new_request_salon';

export interface Notification {
  id: string;
  customerId?: string;
  salonId?: string;
  appointmentId?: string;
  type: NotificationType;
  phoneNumber: string;
  messageBody: string;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  twilioSid?: string;
  createdAt: Date;
}

// ==============================================
// UTILITY TYPES
// ==============================================

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string; // HH:MM format
  close: string; // HH:MM format
  closed: boolean;
}

export interface TimeSlot {
  date: string;
  startTime: string;
  duration: number;
  status: 'available' | 'booked' | 'blocked';
  blockReason?: string;
}

export interface BookingRequest {
  salonId: string;
  serviceId: string;
  customerId?: string; // null for new customers
  appointmentDate: string;
  startTime: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string; // +355 format
  };
  customerNotes?: string;
}

// ==============================================
// API RESPONSE TYPES
// ==============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ==============================================
// PHONE VERIFICATION TYPES
// ==============================================

export interface VerificationCode {
  phone: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

export interface PhoneVerificationRequest {
  phone: string;
}

export interface PhoneVerificationResponse {
  success: boolean;
  message: string;
  expiresIn: number; // seconds
}

// ==============================================
// ALBANIAN LOCALIZATION
// ==============================================

export interface AlbanianErrorMessages {
  INVALID_PHONE: string;
  SLOT_UNAVAILABLE: string;
  VERIFICATION_FAILED: string;
  NETWORK_ERROR: string;
  RATE_LIMITED: string;
  SALON_CLOSED: string;
  MAX_PENDING: string;
}

export const ALBANIAN_ERRORS: AlbanianErrorMessages = {
  INVALID_PHONE: 'Numri i telefonit duhet të jetë në formatin +355XXXXXXXX',
  SLOT_UNAVAILABLE: 'Kjo orë nuk është më e disponueshme. Zgjidhni një tjetër.',
  VERIFICATION_FAILED: 'Kodi i verifikimit është i gabuar ose ka skaduar.',
  NETWORK_ERROR: 'Problem me lidhjen. Provoni përsëri.',
  RATE_LIMITED: 'Shumë kërkesa. Prisni 1 minutë para se të provoni përsëri.',
  SALON_CLOSED: 'Saloni është i mbyllur në këtë datë.',
  MAX_PENDING: 'Keni arritur limitin e kërkesave në pritje (2 maksimum).'
};