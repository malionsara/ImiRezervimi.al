// frontend/types/database.ts
// Database types matching the actual Supabase schema for ImiRezervimi.al

export type AppointmentStatus = 'pending' | 'approved' | 'declined' | 'completed' | 'no_show' | 'cancelled';
export type AccountType = 'guest' | 'social' | 'verified';
export type AuthProvider = 'instagram' | 'google' | 'phone';
export type SalonStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// Raw database row types (snake_case as they come from DB)
export interface CustomerRow {
  id: string;
  instagram_id?: string;
  google_id?: string;
  email?: string;
  profile_photo_url?: string;
  first_name: string;
  last_name: string;
  phone: string;
  phone_verified: boolean;
  whatsapp_confirmed: boolean;
  account_type: AccountType;
  is_active: boolean;
  last_login?: string;
  rating: number;
  total_visits: number;
  no_shows: number;
  cancellation_rate: number;
  blocked_until?: string;
  spam_score: number;
  created_at: string;
  updated_at: string;
}

export interface SalonRow {
  id: string;
  name: string;
  slug: string;
  description?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  instagram_handle?: string;
  facebook_page?: string;
  website_url?: string;
  status: SalonStatus;
  auto_approve_vips: boolean;
  max_advance_days: number;
  min_cancellation_minutes: number;
  working_hours: Record<string, { open: string; close: string; closed: boolean }>;
  created_at: string;
  updated_at: string;
}

export interface ServiceRow {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  category?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AppointmentRow {
  id: string;
  salon_id: string;
  customer_id: string;
  service_id?: string;
  appointment_date: string; // DATE
  start_time: string; // TIME
  duration_minutes: number;
  service_name: string;
  service_price?: number;
  customer_notes?: string;
  salon_notes?: string;
  status: AppointmentStatus;
  priority_score: number;
  requested_at: string;
  responded_at?: string;
  completed_at?: string;
  reminder_sent?: string;
  created_at: string;
  updated_at: string;
}

// Joined query result types (what we get from queries with joins)
export interface AppointmentWithRelations extends AppointmentRow {
  customers: CustomerRow;
  salons: SalonRow;
  services?: ServiceRow;
}

// API response types (camelCase for frontend consumption)
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

export interface Salon {
  id: string;
  name: string;
  description?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  workingHours: Record<string, { open: string; close: string; closed: boolean }>;
  instagramHandle?: string;
  facebookHandle?: string;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  salonId: string;
  isActive: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  salonId: string;
  serviceId?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  customerNotes?: string;
  salonNotes?: string;
  priorityScore: number;
  requestedAt: string;
  respondedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations (populated by joins)
  customer: Customer;
  salon: Salon;
  service: Service;
}

// ==============================================
// AVAILABILITY MANAGEMENT TYPES
// ==============================================

export type TimeSlotStatus = 'available' | 'blocked' | 'booked'
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

// Raw database row for time_slots table
export interface TimeSlotRow {
  id: string
  salon_id: string
  date: string
  start_time: string
  duration_minutes: number
  status: TimeSlotStatus
  block_reason?: string
  created_at: string
}

// Frontend-friendly time slot interface
export interface TimeSlot {
  id: string
  salonId: string
  date: string
  startTime: string
  endTime: string
  duration: number
  status: TimeSlotStatus
  blockReason?: string
  available: boolean
  createdAt: string
}

// Working hours configuration
export interface WorkingHours {
  [key: string]: {
    open: string
    close: string
    closed: boolean
  }
}

export interface DayHours {
  open: string
  close: string
  closed: boolean
}

// Holiday/special period management
export interface Holiday {
  id: string
  salonId: string
  name: string
  startDate: string
  endDate: string
  description?: string
  createdAt: string
  updatedAt: string
}

// Availability calculation result
export interface AvailabilityResult {
  date: string
  salonName: string
  workingHours: DayHours
  serviceDuration: number
  slots: TimeSlot[]
  totalSlots: number
  availableSlots: number
  blockedSlots: number
  bookedSlots: number
}

// Bulk operations for time slot management
export interface BulkTimeSlotOperation {
  operation: 'block' | 'unblock' | 'delete'
  slots: {
    date: string
    startTime: string
    duration?: number
  }[]
  reason?: string
}

export interface BulkOperationResult {
  success: boolean
  processed: number
  failed: number
  errors: string[]
}

// Calendar view data structure
export interface CalendarDay {
  date: string
  dayOfWeek: DayOfWeek
  isToday: boolean
  isWorkingDay: boolean
  workingHours?: DayHours
  totalSlots: number
  availableSlots: number
  blockedSlots: number
  bookedSlots: number
  appointments: Appointment[]
  holidays: Holiday[]
}

export interface CalendarMonth {
  year: number
  month: number
  monthName: string
  days: CalendarDay[]
  stats: {
    totalWorkingDays: number
    totalAvailableSlots: number
    totalBookedSlots: number
    totalBlockedSlots: number
  }
}

// Availability search and filtering
export interface AvailabilityFilter {
  startDate: string
  endDate: string
  serviceDuration?: number
  onlyAvailable?: boolean
  includeBlockedReason?: boolean
}

export interface AvailabilitySearchResult {
  date: string
  availableSlots: TimeSlot[]
  conflictingAppointments: Appointment[]
  workingHours: DayHours
}

// Performance optimization types
export interface AvailabilityCache {
  salonId: string
  date: string
  data: AvailabilityResult
  cachedAt: string
  expiresAt: string
}

// Configuration types for salon availability settings
export interface SalonAvailabilitySettings {
  salonId: string
  defaultSlotDuration: number // minutes
  bufferBetweenAppointments: number // minutes
  maxAdvanceBookingDays: number
  minCancellationHours: number
  autoApproveRegularCustomers: boolean
  allowSameDayBooking: boolean
  sameDayBookingCutoffHours: number
  breakPeriods: {
    name: string
    startTime: string
    endTime: string
    days: DayOfWeek[]
  }[]
  updatedAt: string
}