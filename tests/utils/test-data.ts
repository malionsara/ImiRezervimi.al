// tests/utils/test-data.ts
// Test data for ImiRezervimi.al tests
// Centralized test data management

export const TEST_DATA = {
  // Test user credentials
  USERS: {
    VALID_USER: {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      phone: process.env.TEST_USER_PHONE || '+355675490330',
      firstName: 'Test',
      lastName: 'User'
    },
    SALON_OWNER: {
      email: process.env.TEST_SALON_EMAIL || 'salon@example.com',
      password: process.env.TEST_SALON_PASSWORD || 'SalonPassword123!',
      phone: process.env.TEST_SALON_PHONE || '+355675490331',
      salonName: 'Test Salon',
    }
  },

  // Test salon data
  SALONS: {
    MALION: {
      slug: 'malion',
      name: 'Malion',
      expectedServices: ['Manikyr klasik', 'Nail Art', 'Ngjyrosje flokësh'],
    },
    KLEA_PERMANENT: {
      slug: 'klea-permanent',
      name: 'Klea Permanent',
      expectedServices: [],
    }
  },

  // Test appointment data
  APPOINTMENTS: {
    BASIC: {
      service: 'Manikyr klasik',
      duration: 30,
      price: '15€',
      futureDate: '2025-08-25', // Always use a future date
      time: '14:00',
      notes: 'Test appointment booking'
    }
  },

  // Albanian text constants for validation
  ALBANIAN_TEXT: {
    LOADING: 'Po ngarkon...',
    LOGIN: 'Identifikohu',
    REGISTER: 'Regjistrohu',
    BOOK_APPOINTMENT: 'Rezervo Takimin',
    CONFIRM_BOOKING: 'Konfirmo Rezervimin',
    BOOKING_SUCCESS: 'Rezervimi u dërgua!',
    CHOOSE_SERVICE: 'Zgjidhni shërbimin që dëshironi',
    CHOOSE_DATE_TIME: 'Zgjidhni datën dhe orën',
    SALON_NOT_FOUND: 'Salloni nuk u gjet ose nuk është aktiv',
    INVALID_PHONE: 'Numri i telefonit duhet të jetë në formatin +355XXXXXXXX',
  },

  // Test URLs
  URLS: {
    BASE: process.env.BASE_URL || process.env.TEST_BASE_URL || 'http://localhost:3000',
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    SALONS: '/salons',
    SALON_BOOKING: (slug: string) => `/${slug}`,
    BOOKING_STATUS: (id: string) => `/booking/${id}/status`,
  },

  // Test timeouts
  TIMEOUTS: {
    FAST: 5000,
    MEDIUM: 10000,
    SLOW: 30000,
    VERY_SLOW: 60000,
  }
} as const;

// Generate a future date for testing
export function getFutureDate(daysFromNow: number = 3): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Generate a test phone number
export function generateTestPhone(): string {
  const randomNumber = Math.floor(Math.random() * 90000000) + 10000000; // 8 digits
  return `+355${randomNumber}`;
}

// Generate test email
export function generateTestEmail(): string {
  const timestamp = Date.now();
  return `test.user.${timestamp}@example.com`;
}

// Generate unique test data
export function generateUniqueTestData() {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 10000);
  
  return {
    phone: generateTestPhone(),
    email: generateTestEmail(),
    firstName: `Test`,
    lastName: `User${randomId}`,
    salonName: `Test Salon ${randomId}`,
    appointmentId: `test-appointment-${timestamp}`,
    verificationCode: '123456', // Test code
    timestamp,
    randomId
  };
}