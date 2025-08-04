// shared/types.ts
// Shared types for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

// ==============================================
// TWILIO WHATSAPP TYPES
// ==============================================

export interface WhatsAppMessageResponse {
  sid: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
}

export type NotificationType = 
  | 'booking_request'
  | 'booking_approved' 
  | 'booking_declined'
  | 'reminder_24h'
  | 'new_request_salon';

// ==============================================
// APPOINTMENT TYPES
// ==============================================

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  rating: number;
  totalVisits: number;
  priorityScore: number;
  instagramUsername?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number; // in Albanian Lek
  salonId: string;
  isActive: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Salon {
  id: string;
  name: string;
  description?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  workingHours: WorkingHours;
  services: Service[];
  rating: number;
  totalReviews: number;
  isActive: boolean;
  instagramHandle?: string;
  facebookHandle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export interface Appointment {
  id: string;
  customerId: string;
  salonId: string;
  serviceId: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: AppointmentStatus;
  customerNotes?: string;
  salonNotes?: string;
  priorityScore: number;
  requestedAt: string;
  respondedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  customer: Customer;
  salon: Salon;
  service: Service;
}

export type AppointmentStatus = 
  | 'pending'
  | 'approved'
  | 'declined'
  | 'completed'
  | 'no_show'
  | 'cancelled';

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

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==============================================
// BOOKING FLOW TYPES
// ==============================================

export interface BookingRequest {
  salonId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  duration?: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    instagramUsername?: string;
  };
  customerNotes?: string;
}

export interface BookingResponse {
  appointment: Appointment;
  message: string;
  estimatedResponse: string;
  priority: number;
}

// ==============================================
// DASHBOARD TYPES
// ==============================================

export interface DashboardStats {
  pendingCount: number;
  todayCount: number;
  weeklyBookings: number;
  monthlyRevenue: number;
  averageRating: number;
  totalCustomers: number;
}

export interface DashboardData {
  pendingRequests: Appointment[];
  todaySchedule: Appointment[];
  recentActivity: Appointment[];
  salon: Salon;
  stats: DashboardStats;
}

// ==============================================
// NOTIFICATION TYPES
// ==============================================

export interface NotificationLog {
  id: string;
  type: NotificationType;
  phone: string;
  message: string;
  twilioSid?: string;
  status: 'sent' | 'delivered' | 'failed' | 'read';
  error?: string;
  appointmentId?: string;
  salonId?: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  template: string;
  variables: string[];
  language: 'sq' | 'en'; // Albanian or English
}

// ==============================================
// VALIDATION TYPES
// ==============================================

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// ==============================================
// PRIORITY SCORING TYPES
// ==============================================

export interface PriorityFactors {
  customerRating: number; // 0-5 stars
  totalVisits: number; // Number of previous visits
  bookingTime: number; // Hours before appointment
  servicePrice: number; // Price of service in Lek
  isRepeatCustomer: boolean;
  hasSpecialRequests: boolean;
  customerLoyalty: number; // Calculated loyalty score
}

export interface PriorityScore {
  total: number; // 0-100
  factors: PriorityFactors;
  tier: 'low' | 'medium' | 'high' | 'vip';
}

// ==============================================
// SEARCH AND FILTER TYPES
// ==============================================

export interface SearchFilters {
  city?: string;
  service?: string;
  date?: string;
  time?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: 'morning' | 'afternoon' | 'evening';
}

export interface SearchResult {
  salons: Salon[];
  total: number;
  filters: SearchFilters;
}

// ==============================================
// ANALYTICS TYPES
// ==============================================

export interface BookingAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  revenue: number;
  averageBookingValue: number;
  popularServices: Array<{
    serviceId: string;
    serviceName: string;
    bookingCount: number;
  }>;
  busyHours: Array<{
    hour: number;
    bookingCount: number;
  }>;
  customerRetention: number; // Percentage
}

// ==============================================
// ERROR TYPES
// ==============================================

export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  timestamp: string;
}

export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'APPOINTMENT_CONFLICT'
  | 'SALON_NOT_FOUND'
  | 'SERVICE_NOT_FOUND'
  | 'CUSTOMER_NOT_FOUND'
  | 'INVALID_PHONE_NUMBER'
  | 'TWILIO_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR';