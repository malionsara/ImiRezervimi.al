// __tests__/appointments.test.js
// Comprehensive tests for appointment API system
// Albanian Beauty Salon Booking Platform

const {
  validateBookingRequest,
  validateAppointmentUpdate,
  isValidAlbanianPhone,
  isValidUUID,
  isValidBookingDate,
  formatAlbanianPhone,
  BOOKING_CONSTRAINTS,
  ALBANIAN_VALIDATION_ERRORS
} = require('../lib/validation');

const {
  checkRateLimit,
  validateWorkingHours,
  formatErrorMessage,
  getAlbanianDayName,
  ALBANIAN_APPOINTMENT_ERRORS
} = require('../lib/appointments');

describe('Albanian Phone Validation', () => {
  test('should validate correct Albanian phone numbers', () => {
    const validPhones = [
      '+35569123456',
      '+355691234567',
      '+35568123456',
      '+35567123456'
    ];
    
    validPhones.forEach(phone => {
      expect(isValidAlbanianPhone(phone)).toBe(true);
    });
  });

  test('should reject invalid Albanian phone numbers', () => {
    const invalidPhones = [
      '+35569', // Too short
      '+355691234567890', // Too long
      '+355591234567', // Invalid prefix (59)
      '+35469123456', // Wrong country code
      '069123456', // Missing country code
      '+355 69 123 456', // Contains spaces
      'invalid phone'
    ];
    
    invalidPhones.forEach(phone => {
      expect(isValidAlbanianPhone(phone)).toBe(false);
    });
  });

  test('should format Albanian phone numbers correctly', () => {
    const testCases = [
      { input: '069123456', expected: '+355069123456' },
      { input: '35569123456', expected: '+35569123456' },
      { input: '+35569123456', expected: '+35569123456' },
      { input: '0691234567', expected: '+355691234567' }
    ];
    
    testCases.forEach(({ input, expected }) => {
      expect(formatAlbanianPhone(input)).toBe(expected);
    });
  });
});

describe('Booking Request Validation', () => {
  const validBookingData = {
    salonId: '123e4567-e89b-12d3-a456-426614174000',
    serviceId: '123e4567-e89b-12d3-a456-426614174001',
    appointmentDate: '2025-08-10',
    startTime: '14:30',
    customerInfo: {
      firstName: 'Lara',
      lastName: 'Hoxha',
      phone: '+35569123456'
    },
    customerNotes: 'Dua nail art me ngjyra të lehta'
  };

  test('should validate correct booking request', () => {
    const result = validateBookingRequest(validBookingData);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('should reject booking with invalid UUID', () => {
    const invalidData = {
      ...validBookingData,
      salonId: 'invalid-uuid'
    };
    
    const result = validateBookingRequest(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.salonId).toContain('ID nuk është në formatin e duhur');
  });

  test('should reject booking with invalid phone', () => {
    const invalidData = {
      ...validBookingData,
      customerInfo: {
        ...validBookingData.customerInfo,
        phone: 'invalid-phone'
      }
    };
    
    const result = validateBookingRequest(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.['customerInfo.phone']).toBe(ALBANIAN_VALIDATION_ERRORS.INVALID_PHONE);
  });

  test('should reject booking with past date', () => {
    const invalidData = {
      ...validBookingData,
      appointmentDate: '2020-01-01'
    };
    
    const result = validateBookingRequest(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.appointmentDate).toBe(ALBANIAN_VALIDATION_ERRORS.DATE_PAST);
  });

  test('should reject booking too far in advance', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    
    const invalidData = {
      ...validBookingData,
      appointmentDate: futureDate.toISOString().split('T')[0]
    };
    
    const result = validateBookingRequest(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.appointmentDate).toBe(ALBANIAN_VALIDATION_ERRORS.DATE_TOO_FAR);
  });

  test('should reject booking with invalid time format', () => {
    const invalidData = {
      ...validBookingData,
      startTime: '25:00' // Invalid hour
    };
    
    const result = validateBookingRequest(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.startTime).toBeDefined();
  });

  test('should reject booking outside business hours', () => {
    const invalidData = {
      ...validBookingData,
      startTime: '05:00' // Too early
    };
    
    const result = validateBookingRequest(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.startTime).toContain('midis 06:00 dhe 23:00');
  });

  test('should reject booking with empty required fields', () => {
    const invalidData = {
      ...validBookingData,
      customerInfo: {
        firstName: '',
        lastName: '',
        phone: ''
      }
    };
    
    const result = validateBookingRequest(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.['customerInfo.firstName']).toBe(ALBANIAN_VALIDATION_ERRORS.FIRST_NAME_REQUIRED);
    expect(result.errors?.['customerInfo.lastName']).toBe(ALBANIAN_VALIDATION_ERRORS.LAST_NAME_REQUIRED);
    expect(result.errors?.['customerInfo.phone']).toBe(ALBANIAN_VALIDATION_ERRORS.PHONE_REQUIRED);
  });

  test('should handle long customer notes', () => {
    const longNotes = 'A'.repeat(600); // Exceeds 500 character limit
    const invalidData = {
      ...validBookingData,
      customerNotes: longNotes
    };
    
    const result = validateBookingRequest(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.customerNotes).toBe(ALBANIAN_VALIDATION_ERRORS.NOTES_TOO_LONG);
  });
});

describe('Appointment Status Update Validation', () => {
  const validUpdateData = {
    appointmentId: '123e4567-e89b-12d3-a456-426614174000',
    status: 'approved',
    salonNotes: 'Konfirmuam takimin'
  };

  test('should validate correct status update', () => {
    const result = validateAppointmentUpdate(validUpdateData);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('should reject invalid status', () => {
    const invalidData = {
      ...validUpdateData,
      status: 'invalid-status'
    };
    
    const result = validateAppointmentUpdate(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.status).toBe(ALBANIAN_VALIDATION_ERRORS.INVALID_STATUS);
  });

  test('should validate all allowed statuses', () => {
    const validStatuses = ['pending', 'approved', 'declined', 'completed', 'no_show', 'cancelled'];
    
    validStatuses.forEach(status => {
      const data = { ...validUpdateData, status };
      const result = validateAppointmentUpdate(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    // Note: In actual implementation, you'd need to expose a clear method
  });

  test('should allow first request', () => {
    const result = checkRateLimit('192.168.1.1');
    expect(result.allowed).toBe(true);
  });

  test('should allow requests within limit', () => {
    const ip = '192.168.1.2';
    
    // First request should be allowed
    const result1 = checkRateLimit(ip);
    expect(result1.allowed).toBe(true);
  });

  test('should block requests exceeding limit', () => {
    const ip = '192.168.1.3';
    
    // Make requests up to the limit
    for (let i = 0; i < BOOKING_CONSTRAINTS.RATE_LIMIT_REQUESTS_PER_MINUTE; i++) {
      checkRateLimit(ip);
    }
    
    // Next request should be blocked
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
    expect(result.resetTime).toBeDefined();
  });
});

describe('Working Hours Validation', () => {
  const sampleWorkingHours = {
    monday: { open: '09:00', close: '19:00', closed: false },
    tuesday: { open: '09:00', close: '19:00', closed: false },
    wednesday: { open: '09:00', close: '19:00', closed: false },
    thursday: { open: '09:00', close: '19:00', closed: false },
    friday: { open: '09:00', close: '19:00', closed: false },
    saturday: { open: '09:00', close: '17:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: true }
  };

  test('should allow booking during working hours', () => {
    // Monday at 14:30
    const result = validateWorkingHours('2025-08-04', '14:30', sampleWorkingHours);
    expect(result.success).toBe(true);
  });

  test('should reject booking on closed day', () => {
    // Sunday (closed)
    const result = validateWorkingHours('2025-08-03', '14:30', sampleWorkingHours);
    expect(result.success).toBe(false);
    expect(result.error).toBe(ALBANIAN_APPOINTMENT_ERRORS.SALON_CLOSED);
  });

  test('should reject booking before opening hours', () => {
    // Monday at 08:00 (before 09:00)
    const result = validateWorkingHours('2025-08-04', '08:00', sampleWorkingHours);
    expect(result.success).toBe(false);
    expect(result.error).toBe(ALBANIAN_APPOINTMENT_ERRORS.SALON_CLOSED);
  });

  test('should reject booking after closing hours', () => {
    // Monday at 20:00 (after 19:00)
    const result = validateWorkingHours('2025-08-04', '20:00', sampleWorkingHours);
    expect(result.success).toBe(false);
    expect(result.error).toBe(ALBANIAN_APPOINTMENT_ERRORS.SALON_CLOSED);
  });

  test('should handle Saturday different hours', () => {
    // Saturday at 16:30 (after 17:00 close)
    const result = validateWorkingHours('2025-08-02', '16:30', sampleWorkingHours);
    expect(result.success).toBe(false);
    expect(result.error).toBe(ALBANIAN_APPOINTMENT_ERRORS.SALON_CLOSED);
  });
});

describe('Date Validation', () => {
  test('should validate dates within booking window', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    expect(isValidBookingDate(dateString)).toBe(true);
  });

  test('should reject past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];
    
    expect(isValidBookingDate(dateString)).toBe(false);
  });

  test('should reject dates too far in advance', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    const dateString = futureDate.toISOString().split('T')[0];
    
    expect(isValidBookingDate(dateString)).toBe(false);
  });

  test('should handle custom advance days limit', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateString = futureDate.toISOString().split('T')[0];
    
    expect(isValidBookingDate(dateString, 3)).toBe(false);
    expect(isValidBookingDate(dateString, 7)).toBe(true);
  });
});

describe('Albanian Day Names', () => {
  test('should return correct Albanian day names', () => {
    const testDates = [
      { date: '2025-08-03', expected: 'E dielë' },   // Sunday
      { date: '2025-08-04', expected: 'E hënë' },    // Monday
      { date: '2025-08-05', expected: 'E martë' },   // Tuesday
      { date: '2025-08-06', expected: 'E mërkurë' }, // Wednesday
      { date: '2025-08-07', expected: 'E enjte' },   // Thursday
      { date: '2025-08-08', expected: 'E premte' },  // Friday
      { date: '2025-08-09', expected: 'E shtunë' }   // Saturday
    ];
    
    testDates.forEach(({ date, expected }) => {
      expect(getAlbanianDayName(date)).toBe(expected);
    });
  });
});

describe('Error Message Formatting', () => {
  test('should format error messages with dynamic values', () => {
    const template = 'Rezervimet mund të bëhen maksimumi {days} ditë para';
    const values = { days: 10 };
    const result = formatErrorMessage(template, values);
    
    expect(result).toBe('Rezervimet mund të bëhen maksimumi 10 ditë para');
  });

  test('should handle missing values in template', () => {
    const template = 'Rezervimet mund të bëhen maksimumi {days} ditë para dhe {hours} orë';
    const values = { days: 10 };
    const result = formatErrorMessage(template, values);
    
    expect(result).toBe('Rezervimet mund të bëhen maksimumi 10 ditë para dhe {hours} orë');
  });
});

describe('UUID Validation', () => {
  test('should validate correct UUIDs', () => {
    const validUUIDs = [
      '123e4567-e89b-12d3-a456-426614174000',
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    ];
    
    validUUIDs.forEach(uuid => {
      expect(isValidUUID(uuid)).toBe(true);
    });
  });

  test('should reject invalid UUIDs', () => {
    const invalidUUIDs = [
      'not-a-uuid',
      '123e4567-e89b-12d3-a456', // Too short
      '123e4567-e89b-12d3-a456-426614174000-extra', // Too long
      '123e4567_e89b_12d3_a456_426614174000', // Wrong separators
      ''
    ];
    
    invalidUUIDs.forEach(uuid => {
      expect(isValidUUID(uuid)).toBe(false);
    });
  });
});

describe('Albanian Error Messages', () => {
  test('should have all required error messages', () => {
    const requiredErrors = [
      'INVALID_PHONE',
      'SLOT_UNAVAILABLE', 
      'VERIFICATION_FAILED',
      'NETWORK_ERROR',
      'RATE_LIMITED',
      'SALON_CLOSED',
      'MAX_PENDING'
    ];
    
    requiredErrors.forEach(errorKey => {
      expect(ALBANIAN_VALIDATION_ERRORS[errorKey]).toBeDefined();
      expect(ALBANIAN_VALIDATION_ERRORS[errorKey].length).toBeGreaterThan(0);
    });
  });

  test('should have appointment-specific error messages', () => {
    const appointmentErrors = [
      'SALON_NOT_FOUND',
      'SERVICE_NOT_FOUND',
      'SLOT_UNAVAILABLE',
      'MAX_PENDING_REACHED',
      'ADVANCE_BOOKING_EXCEEDED',
      'SALON_CLOSED',
      'APPOINTMENT_NOT_FOUND',
      'UNAUTHORIZED_ACCESS'
    ];
    
    appointmentErrors.forEach(errorKey => {
      expect(ALBANIAN_APPOINTMENT_ERRORS[errorKey]).toBeDefined();
      expect(ALBANIAN_APPOINTMENT_ERRORS[errorKey].length).toBeGreaterThan(0);
    });
  });
});

describe('Business Constraints', () => {
  test('should have all required constraints', () => {
    expect(BOOKING_CONSTRAINTS.MAX_PENDING_PER_CUSTOMER).toBe(2);
    expect(BOOKING_CONSTRAINTS.DEFAULT_MAX_ADVANCE_DAYS).toBe(10);
    expect(BOOKING_CONSTRAINTS.RATE_LIMIT_REQUESTS_PER_MINUTE).toBe(1);
    expect(BOOKING_CONSTRAINTS.BUSINESS_START_HOUR).toBe(6);
    expect(BOOKING_CONSTRAINTS.BUSINESS_END_HOUR).toBe(23);
  });
});

// Integration test scenarios
describe('Integration Test Scenarios', () => {
  test('should handle complete valid booking flow', () => {
    const bookingData = {
      salonId: '123e4567-e89b-12d3-a456-426614174000',
      serviceId: '123e4567-e89b-12d3-a456-426614174001',
      appointmentDate: '2025-08-10',
      startTime: '14:30',
      customerInfo: {
        firstName: 'Lara',
        lastName: 'Hoxha',
        phone: '+35569123456'
      },
      customerNotes: 'Kërkesë speciale për nail art'
    };

    // 1. Validate booking request
    const validationResult = validateBookingRequest(bookingData);
    expect(validationResult.success).toBe(true);

    // 2. Check rate limiting
    const rateLimitResult = checkRateLimit('192.168.1.100');
    expect(rateLimitResult.allowed).toBe(true);

    // 3. Validate working hours
    const workingHours = {
      saturday: { open: '09:00', close: '17:00', closed: false }
    };
    const workingHoursResult = validateWorkingHours(
      bookingData.appointmentDate,
      bookingData.startTime,
      workingHours
    );
    expect(workingHoursResult.success).toBe(true);
  });

  test('should handle multiple validation failures', () => {
    const invalidBookingData = {
      salonId: 'invalid-uuid',
      serviceId: '',
      appointmentDate: '2020-01-01', // Past date
      startTime: '25:00', // Invalid time
      customerInfo: {
        firstName: '',
        lastName: 'H', // Too short
        phone: 'invalid-phone'
      },
      customerNotes: 'A'.repeat(600) // Too long
    };

    const result = validateBookingRequest(invalidBookingData);
    expect(result.success).toBe(false);
    expect(Object.keys(result.errors || {}).length).toBeGreaterThan(5);
  });
});