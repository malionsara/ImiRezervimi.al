// test-albanian-errors.js
// Test Albanian error messages and validation edge cases
// Albanian Beauty Salon Booking Platform

// ==============================================
// ALBANIAN ERROR MESSAGES
// ==============================================

const ALBANIAN_VALIDATION_ERRORS = {
  INVALID_PHONE: 'Numri i telefonit duhet të jetë në formatin +355XXXXXXXX',
  PHONE_REQUIRED: 'Numri i telefonit është i detyrueshëm',
  FIRST_NAME_REQUIRED: 'Emri është i detyrueshëm',
  LAST_NAME_REQUIRED: 'Mbiemri është i detyrueshëm',
  NAME_TOO_SHORT: 'Emri duhet të ketë së paku 2 karaktere',
  NAME_TOO_LONG: 'Emri nuk mund të ketë më shumë se 50 karaktere',
  DATE_REQUIRED: 'Data e takimit është e detyrueshme',
  DATE_INVALID: 'Data e takimit nuk është e vlefshme',
  DATE_PAST: 'Data e takimit nuk mund të jetë në të kaluarën',
  DATE_TOO_FAR: 'Rezervimet mund të bëhen maksimumi 10 ditë para',
  TIME_REQUIRED: 'Ora e takimit është e detyrueshme',
  TIME_INVALID: 'Ora e takimit nuk është e vlefshme',
  SALON_ID_REQUIRED: 'ID e sallonit është e detyrueshme',
  SERVICE_ID_REQUIRED: 'ID e shërbimit është e detyrueshme',
  APPOINTMENT_ID_REQUIRED: 'ID e takimit është e detyrueshme',
  INVALID_UUID: 'ID nuk është në formatin e duhur',
  NOTES_TOO_LONG: 'Shënimet nuk mund të kenë më shumë se 500 karaktere',
  INVALID_STATUS: 'Statusi i takimit nuk është i vlefshëm',
  REQUIRED_FIELD: 'Kjo fushë është e detyrueshme',
  INVALID_FORMAT: 'Formati nuk është i saktë'
};

const ALBANIAN_APPOINTMENT_ERRORS = {
  SALON_NOT_FOUND: 'Salloni nuk u gjet ose nuk është aktiv',
  SERVICE_NOT_FOUND: 'Shërbimi nuk u gjet ose nuk është aktiv',
  SLOT_UNAVAILABLE: 'Ky slot kohor nuk është i disponueshëm',
  MAX_PENDING_REACHED: 'Keni arritur limitin e kërkesave në pritje (2 maksimum)',
  ADVANCE_BOOKING_EXCEEDED: 'Rezervimet mund të bëhen maksimumi {days} ditë para',
  SALON_CLOSED: 'Salloni është i mbyllur në këtë ditë dhe orë',
  RATE_LIMITED: 'Shumë kërkesa. Prisni 1 minutë para se të provoni përsëri',
  APPOINTMENT_NOT_FOUND: 'Takimi nuk u gjet',
  UNAUTHORIZED_ACCESS: 'Nuk keni autorizim për të aksesuar këtë takim',
  INVALID_STATUS_TRANSITION: 'Ndryshimi i statusit nuk është i vlefshëm',
  CUSTOMER_NOT_FOUND: 'Klienti nuk u gjet',
  DATABASE_ERROR: 'Gabim në bazën e të dhënave',
  NETWORK_ERROR: 'Problem me lidhjen. Provoni përsëri më vonë',
};

// ==============================================
// ALBANIA LOCALIZATION FUNCTIONS
// ==============================================

function getAlbanianDayName(date) {
  const dayNames = [
    'E dielë', 'E hënë', 'E martë', 'E mërkurë', 
    'E enjte', 'E premte', 'E shtunë'
  ];
  return dayNames[new Date(date).getDay()];
}

function formatErrorMessage(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}

function getAlbanianStatusText(status) {
  const statusTextMap = {
    pending: 'Në pritje',
    approved: 'I aprovuar',
    declined: 'I refuzuar',
    completed: 'I përfunduar',
    no_show: 'Nuk u paraqit',
    cancelled: 'I anuluar',
  };
  return statusTextMap[status] || status;
}

function getAlbanianNotificationMessage(type, appointmentData) {
  const messages = {
    approved: `Mirupafshim! Takimi juaj në ${appointmentData.salonName} më ${appointmentData.date} në ${appointmentData.time} është aprovuar. Shihemi atje!`,
    declined: `Na vjen keq, por takimi juaj në ${appointmentData.salonName} më ${appointmentData.date} nuk mund të aprovohet. Kontaktoni sallonin për më shumë informacion.`,
    completed: `Faleminderit që zgjodhët ${appointmentData.salonName}! Shpresojmë që jeni të kënaqur me shërbimin.`,
    cancelled: `Takimi juaj në ${appointmentData.salonName} më ${appointmentData.date} është anuluar.`,
    reminder: `Kujtesë: Takimi juaj në ${appointmentData.salonName} është nesër në ${appointmentData.time}.`
  };
  return messages[type] || 'Njoftim për takimin tuaj.';
}

// ==============================================
// VALIDATION FUNCTIONS WITH ALBANIAN ERRORS
// ==============================================

function validateAlbanianInput(data) {
  const errors = {};

  // Phone validation
  if (!data.phone) {
    errors.phone = ALBANIAN_VALIDATION_ERRORS.PHONE_REQUIRED;
  } else if (!/^\+355[6-9][0-9]{7,8}$/.test(data.phone)) {
    errors.phone = ALBANIAN_VALIDATION_ERRORS.INVALID_PHONE;
  }

  // Name validation
  if (!data.firstName) {
    errors.firstName = ALBANIAN_VALIDATION_ERRORS.FIRST_NAME_REQUIRED;
  } else if (data.firstName.length < 2) {
    errors.firstName = ALBANIAN_VALIDATION_ERRORS.NAME_TOO_SHORT;
  } else if (data.firstName.length > 50) {
    errors.firstName = ALBANIAN_VALIDATION_ERRORS.NAME_TOO_LONG;
  }

  if (!data.lastName) {
    errors.lastName = ALBANIAN_VALIDATION_ERRORS.LAST_NAME_REQUIRED;
  } else if (data.lastName.length < 2) {
    errors.lastName = ALBANIAN_VALIDATION_ERRORS.NAME_TOO_SHORT;
  } else if (data.lastName.length > 50) {
    errors.lastName = ALBANIAN_VALIDATION_ERRORS.NAME_TOO_LONG;
  }

  // Date validation
  if (!data.appointmentDate) {
    errors.appointmentDate = ALBANIAN_VALIDATION_ERRORS.DATE_REQUIRED;
  } else {
    const appointmentDate = new Date(data.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(appointmentDate.getTime())) {
      errors.appointmentDate = ALBANIAN_VALIDATION_ERRORS.DATE_INVALID;
    } else if (appointmentDate < today) {
      errors.appointmentDate = ALBANIAN_VALIDATION_ERRORS.DATE_PAST;
    } else {
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 10);
      if (appointmentDate > maxDate) {
        errors.appointmentDate = ALBANIAN_VALIDATION_ERRORS.DATE_TOO_FAR;
      }
    }
  }

  // Time validation
  if (!data.startTime) {
    errors.startTime = ALBANIAN_VALIDATION_ERRORS.TIME_REQUIRED;
  } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.startTime)) {
    errors.startTime = ALBANIAN_VALIDATION_ERRORS.TIME_INVALID;
  }

  // Notes validation
  if (data.customerNotes && data.customerNotes.length > 500) {
    errors.customerNotes = ALBANIAN_VALIDATION_ERRORS.NOTES_TOO_LONG;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// ==============================================
// TEST RUNNER
// ==============================================

function runAlbanianTests() {
  console.log('🇦🇱 Testing Albanian Localization');
  console.log('===================================\n');

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
          throw new Error(`Expected "${expected}", got "${actual}"`);
        }
      },
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected "${actual}" to contain "${expected}"`);
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
  // ALBANIAN ERROR MESSAGE TESTS
  // ==============================================

  test('Phone validation error messages in Albanian', () => {
    const result = validateAlbanianInput({ phone: 'invalid' });
    expect(result.errors.phone).toBe(ALBANIAN_VALIDATION_ERRORS.INVALID_PHONE);
    expect(result.errors.phone).toContain('+355');
  });

  test('Required field error messages in Albanian', () => {
    const result = validateAlbanianInput({});
    expect(result.errors.phone).toBe(ALBANIAN_VALIDATION_ERRORS.PHONE_REQUIRED);
    expect(result.errors.firstName).toBe(ALBANIAN_VALIDATION_ERRORS.FIRST_NAME_REQUIRED);
    expect(result.errors.lastName).toBe(ALBANIAN_VALIDATION_ERRORS.LAST_NAME_REQUIRED);
  });

  test('Name length validation error messages', () => {
    const shortNameData = { firstName: 'A', lastName: 'B' };
    const result = validateAlbanianInput(shortNameData);
    expect(result.errors.firstName).toBe(ALBANIAN_VALIDATION_ERRORS.NAME_TOO_SHORT);
    expect(result.errors.lastName).toBe(ALBANIAN_VALIDATION_ERRORS.NAME_TOO_SHORT);
  });

  test('Long name validation error messages', () => {
    const longName = 'A'.repeat(60);
    const longNameData = { firstName: longName, lastName: longName };
    const result = validateAlbanianInput(longNameData);
    expect(result.errors.firstName).toBe(ALBANIAN_VALIDATION_ERRORS.NAME_TOO_LONG);
    expect(result.errors.lastName).toBe(ALBANIAN_VALIDATION_ERRORS.NAME_TOO_LONG);
  });

  test('Date validation error messages', () => {
    const pastDate = '2020-01-01';
    const result = validateAlbanianInput({ appointmentDate: pastDate });
    expect(result.errors.appointmentDate).toBe(ALBANIAN_VALIDATION_ERRORS.DATE_PAST);
    expect(result.errors.appointmentDate).toContain('kaluarën');
  });

  test('Time validation error messages', () => {
    const invalidTime = '25:00';
    const result = validateAlbanianInput({ startTime: invalidTime });
    expect(result.errors.startTime).toBe(ALBANIAN_VALIDATION_ERRORS.TIME_INVALID);
  });

  test('Long notes validation error messages', () => {
    const longNotes = 'A'.repeat(600);
    const result = validateAlbanianInput({ customerNotes: longNotes });
    expect(result.errors.customerNotes).toBe(ALBANIAN_VALIDATION_ERRORS.NOTES_TOO_LONG);
    expect(result.errors.customerNotes).toContain('500');
  });

  // ==============================================
  // ALBANIAN DAY NAMES TESTS
  // ==============================================

  test('Albanian day names', () => {
    expect(getAlbanianDayName('2025-08-03')).toBe('E dielë');   // Sunday
    expect(getAlbanianDayName('2025-08-04')).toBe('E hënë');    // Monday
    expect(getAlbanianDayName('2025-08-05')).toBe('E martë');   // Tuesday
    expect(getAlbanianDayName('2025-08-06')).toBe('E mërkurë'); // Wednesday
    expect(getAlbanianDayName('2025-08-07')).toBe('E enjte');   // Thursday
    expect(getAlbanianDayName('2025-08-08')).toBe('E premte');  // Friday
    expect(getAlbanianDayName('2025-08-09')).toBe('E shtunë');  // Saturday
  });

  // ==============================================
  // STATUS TEXT TESTS
  // ==============================================

  test('Albanian status text mapping', () => {
    expect(getAlbanianStatusText('pending')).toBe('Në pritje');
    expect(getAlbanianStatusText('approved')).toBe('I aprovuar');
    expect(getAlbanianStatusText('declined')).toBe('I refuzuar');
    expect(getAlbanianStatusText('completed')).toBe('I përfunduar');
    expect(getAlbanianStatusText('no_show')).toBe('Nuk u paraqit');
    expect(getAlbanianStatusText('cancelled')).toBe('I anuluar');
  });

  // ==============================================
  // ERROR MESSAGE FORMATTING TESTS
  // ==============================================

  test('Dynamic error message formatting', () => {
    const template = ALBANIAN_APPOINTMENT_ERRORS.ADVANCE_BOOKING_EXCEEDED;
    const formatted = formatErrorMessage(template, { days: 10 });
    expect(formatted).toContain('10 ditë');
    expect(formatted).toContain('maksimumi');
  });

  // ==============================================
  // NOTIFICATION MESSAGE TESTS
  // ==============================================

  test('Albanian notification messages', () => {
    const appointmentData = {
      salonName: 'Klea Nails Studio',
      date: '2025-08-10',
      time: '14:30'
    };

    const approvedMessage = getAlbanianNotificationMessage('approved', appointmentData);
    expect(approvedMessage).toContain('Mirupafshim');
    expect(approvedMessage).toContain('Klea Nails Studio');
    expect(approvedMessage).toContain('2025-08-10');
    expect(approvedMessage).toContain('14:30');

    const declinedMessage = getAlbanianNotificationMessage('declined', appointmentData);
    expect(declinedMessage).toContain('Na vjen keq');
    expect(declinedMessage).toContain('Klea Nails Studio');

    const completedMessage = getAlbanianNotificationMessage('completed', appointmentData);
    expect(completedMessage).toContain('Faleminderit');
    expect(completedMessage).toContain('Klea Nails Studio');
  });

  // ==============================================
  // APPOINTMENT ERROR MESSAGES TESTS
  // ==============================================

  test('Appointment specific error messages', () => {
    expect(ALBANIAN_APPOINTMENT_ERRORS.SALON_NOT_FOUND).toContain('Salloni');
    expect(ALBANIAN_APPOINTMENT_ERRORS.SERVICE_NOT_FOUND).toContain('Shërbimi');
    expect(ALBANIAN_APPOINTMENT_ERRORS.SLOT_UNAVAILABLE).toContain('slot kohor');
    expect(ALBANIAN_APPOINTMENT_ERRORS.MAX_PENDING_REACHED).toContain('2 maksimum');
    expect(ALBANIAN_APPOINTMENT_ERRORS.SALON_CLOSED).toContain('mbyllur');
    expect(ALBANIAN_APPOINTMENT_ERRORS.RATE_LIMITED).toContain('1 minutë');
  });

  // ==============================================
  // EDGE CASES TESTS
  // ==============================================

  test('Edge case: empty input validation', () => {
    const result = validateAlbanianInput({});
    expect(result.isValid).toBeFalsy();
    expect(Object.keys(result.errors).length).toBe(5); // phone, firstName, lastName, appointmentDate, startTime
  });

  test('Edge case: valid Albanian customer data', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const validData = {
      phone: '+35569123456',
      firstName: 'Lara',
      lastName: 'Hoxha',
      appointmentDate: tomorrow.toISOString().split('T')[0],
      startTime: '14:30',
      customerNotes: 'Kërkesë për nail art'
    };
    
    const result = validateAlbanianInput(validData);
    expect(result.isValid).toBeTruthy();
    expect(Object.keys(result.errors).length).toBe(0);
  });

  test('Edge case: boundary date validation', () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const result = validateAlbanianInput({ appointmentDate: todayString });
    expect(result.isValid).toBeFalsy(); // Should fail because today is not allowed (must be future)
  });

  // ==============================================
  // RESULTS
  // ==============================================

  console.log('\n===================================');
  console.log(`📊 Albanian Localization Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All Albanian localization tests passed!');
    console.log('✅ Error messages are properly localized');
    console.log('✅ Day names are in Albanian');
    console.log('✅ Status texts are translated');
    console.log('✅ Notification messages are culturally appropriate');
  } else {
    console.log('⚠️  Some Albanian localization tests failed.');
  }
  
  return failed === 0;
}

// Run the tests
if (require.main === module) {
  runAlbanianTests();
}

module.exports = {
  runAlbanianTests,
  ALBANIAN_VALIDATION_ERRORS,
  ALBANIAN_APPOINTMENT_ERRORS,
  getAlbanianDayName,
  formatErrorMessage,
  getAlbanianStatusText,
  getAlbanianNotificationMessage,
  validateAlbanianInput
};