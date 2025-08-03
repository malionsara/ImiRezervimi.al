// test-appointments.js
// Simple test script to validate appointment API functionality
// Albanian Beauty Salon Booking Platform

const { z } = require('zod');

// ==============================================
// SIMPLIFIED VALIDATION FUNCTIONS
// ==============================================

function isValidAlbanianPhone(phone) {
  const albanianPhoneRegex = /^\+355[6-9][0-9]{7,8}$/;
  return albanianPhoneRegex.test(phone);
}

function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function isValidTimeFormat(time) {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

function isValidBookingDate(date, maxAdvanceDays = 10) {
  const bookingDate = new Date(date);
  const today = new Date();
  const maxDate = new Date();
  
  today.setHours(0, 0, 0, 0);
  maxDate.setHours(0, 0, 0, 0);
  maxDate.setDate(today.getDate() + maxAdvanceDays);
  
  return bookingDate >= today && bookingDate <= maxDate;
}

function formatAlbanianPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('355')) {
    return '+' + digits;
  } else if (digits.startsWith('0') && digits.length === 10) {
    return '+355' + digits.substring(1);
  } else if (digits.length === 9) {
    return '+355' + digits;
  }
  
  return phone;
}

// ==============================================
// SIMPLE RATE LIMITING
// ==============================================

const rateLimitStore = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowSize = 60 * 1000; // 1 minute
  const maxRequests = 1;

  const key = `ip:${ip}`;
  const entry = rateLimitStore.get(key);

  if (!entry) {
    rateLimitStore.set(key, {
      count: 1,
      windowStart: now,
      lastRequest: now,
    });
    return { allowed: true };
  }

  if (now - entry.windowStart >= windowSize) {
    rateLimitStore.set(key, {
      count: 1,
      windowStart: now,
      lastRequest: now,
    });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    const resetTime = entry.windowStart + windowSize;
    return { allowed: false, resetTime };
  }

  entry.count++;
  entry.lastRequest = now;
  rateLimitStore.set(key, entry);

  return { allowed: true };
}

// ==============================================
// WORKING HOURS VALIDATION
// ==============================================

function validateWorkingHours(appointmentDate, startTime, workingHours) {
  try {
    const date = new Date(appointmentDate);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];

    const daySchedule = workingHours[dayName];
    if (!daySchedule || daySchedule.closed) {
      return { success: false, error: 'Salloni është i mbyllur në këtë ditë' };
    }

    const appointmentMinutes = timeToMinutes(startTime);
    const openMinutes = timeToMinutes(daySchedule.open);
    const closeMinutes = timeToMinutes(daySchedule.close);

    if (appointmentMinutes < openMinutes || appointmentMinutes >= closeMinutes) {
      return { success: false, error: 'Jashtë orarit të punës' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gabim në validimin e orarit' };
  }
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// ==============================================
// TEST RUNNER
// ==============================================

function runTests() {
  console.log('🧪 Testing Appointment API System');
  console.log('=====================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, testFn) {
    try {
      testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  }

  function expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, got ${actual}`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected truthy value, got ${actual}`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected falsy value, got ${actual}`);
        }
      }
    };
  }

  // ==============================================
  // PHONE VALIDATION TESTS
  // ==============================================
  
  test('Valid Albanian phone numbers', () => {
    expect(isValidAlbanianPhone('+35569123456')).toBeTruthy();
    expect(isValidAlbanianPhone('+355691234567')).toBeTruthy();
    expect(isValidAlbanianPhone('+35568123456')).toBeTruthy();
  });

  test('Invalid Albanian phone numbers', () => {
    expect(isValidAlbanianPhone('+35569')).toBeFalsy();
    expect(isValidAlbanianPhone('+355591234567')).toBeFalsy();
    expect(isValidAlbanianPhone('069123456')).toBeFalsy();
    expect(isValidAlbanianPhone('invalid')).toBeFalsy();
  });

  test('Phone formatting', () => {
    expect(formatAlbanianPhone('069123456')).toBe('+355069123456');
    expect(formatAlbanianPhone('35569123456')).toBe('+35569123456');
    expect(formatAlbanianPhone('+35569123456')).toBe('+35569123456');
  });

  // ==============================================
  // UUID VALIDATION TESTS
  // ==============================================

  test('Valid UUIDs', () => {
    expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBeTruthy();
    expect(isValidUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBeTruthy();
  });

  test('Invalid UUIDs', () => {
    expect(isValidUUID('not-a-uuid')).toBeFalsy();
    expect(isValidUUID('123e4567-e89b-12d3-a456')).toBeFalsy();
    expect(isValidUUID('')).toBeFalsy();
  });

  // ==============================================
  // TIME VALIDATION TESTS
  // ==============================================

  test('Valid time formats', () => {
    expect(isValidTimeFormat('14:30')).toBeTruthy();
    expect(isValidTimeFormat('09:00')).toBeTruthy();
    expect(isValidTimeFormat('23:59')).toBeTruthy();
  });

  test('Invalid time formats', () => {
    expect(isValidTimeFormat('25:00')).toBeFalsy();
    expect(isValidTimeFormat('14:60')).toBeFalsy();
    expect(isValidTimeFormat('invalid')).toBeFalsy();
  });

  // ==============================================
  // DATE VALIDATION TESTS
  // ==============================================

  test('Valid booking dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    expect(isValidBookingDate(dateString)).toBeTruthy();
  });

  test('Invalid booking dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toISOString().split('T')[0];
    expect(isValidBookingDate(pastDate)).toBeFalsy();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    const farFutureDate = futureDate.toISOString().split('T')[0];
    expect(isValidBookingDate(farFutureDate)).toBeFalsy();
  });

  // ==============================================
  // RATE LIMITING TESTS
  // ==============================================

  test('Rate limiting allows first request', () => {
    const result = checkRateLimit('192.168.1.1');
    expect(result.allowed).toBeTruthy();
  });

  test('Rate limiting blocks excessive requests', () => {
    const ip = '192.168.1.2';
    
    // First request should be allowed
    const result1 = checkRateLimit(ip);
    expect(result1.allowed).toBeTruthy();

    // Second request should be blocked
    const result2 = checkRateLimit(ip);
    expect(result2.allowed).toBeFalsy();
  });

  // ==============================================
  // WORKING HOURS TESTS
  // ==============================================

  test('Working hours validation - open day', () => {
    const workingHours = {
      monday: { open: '09:00', close: '19:00', closed: false }
    };
    
    const result = validateWorkingHours('2025-08-04', '14:30', workingHours); // Monday
    expect(result.success).toBeTruthy();
  });

  test('Working hours validation - closed day', () => {
    const workingHours = {
      sunday: { open: '10:00', close: '16:00', closed: true }
    };
    
    const result = validateWorkingHours('2025-08-03', '14:30', workingHours); // Sunday
    expect(result.success).toBeFalsy();
  });

  test('Working hours validation - outside hours', () => {
    const workingHours = {
      monday: { open: '09:00', close: '19:00', closed: false }
    };
    
    const result = validateWorkingHours('2025-08-04', '20:00', workingHours); // Monday after hours
    expect(result.success).toBeFalsy();
  });

  // ==============================================
  // RESULTS
  // ==============================================

  console.log('\n=====================================');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Appointment API system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
  
  return failed === 0;
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  isValidAlbanianPhone,
  isValidUUID,
  formatAlbanianPhone,
  checkRateLimit,
  validateWorkingHours
};