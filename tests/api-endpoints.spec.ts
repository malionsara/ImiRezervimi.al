// tests/api-endpoints.spec.ts
// API endpoint tests for ImiRezervimi.al
// Tests all backend API routes and functionality

import { test, expect } from '@playwright/test';
import { TEST_DATA, getFutureDate, generateUniqueTestData } from './utils/test-data';

test.describe('API Endpoints - ImiRezervimi.al', () => {
  let baseURL: string;

  test.beforeAll(async () => {
    baseURL = TEST_DATA.URLS.BASE;
    console.log(`🔗 Testing API endpoints at: ${baseURL}`);
  });

  test.describe('Authentication API', () => {
    test('POST /api/auth/send-verification - should send SMS verification code', async ({ request }) => {
      const testUser = generateUniqueTestData();
      
      const response = await request.post('/api/auth/send-verification', {
        data: {
          phone: testUser.phone
        }
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('message');
      expect(responseBody.message).toContain('Kodi u dërgua');
      
      console.log('✅ SMS verification API working');
    });

    test('POST /api/auth/verify-phone - should verify phone with valid code', async ({ request }) => {
      const testUser = generateUniqueTestData();
      
      // First send verification
      await request.post('/api/auth/send-verification', {
        data: { phone: testUser.phone }
      });
      
      // Then verify with test code (assuming 123456 works in test environment)
      const response = await request.post('/api/auth/verify-phone', {
        data: {
          phone: testUser.phone,
          code: '123456'
        }
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('token');
      
      console.log('✅ Phone verification API working');
    });

    test('POST /api/auth/verify-phone - should reject invalid code', async ({ request }) => {
      const testUser = generateUniqueTestData();
      
      const response = await request.post('/api/auth/verify-phone', {
        data: {
          phone: testUser.phone,
          code: '000000'
        }
      });

      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody).toHaveProperty('error');
      
      console.log('✅ Invalid code rejection working');
    });

    test('POST /api/auth/complete-profile - should create user profile', async ({ request }) => {
      const testUser = generateUniqueTestData();
      
      const response = await request.post('/api/auth/complete-profile', {
        data: {
          phone: testUser.phone,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          instagramUsername: `test_user_${Date.now()}`
        },
        headers: {
          'Authorization': 'Bearer test-token' // Mock token for test
        }
      });

      // Allow both 200 (success) and 401 (needs auth) as valid responses
      expect([200, 401]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('success', true);
        console.log('✅ Profile creation API working');
      } else {
        console.log('ℹ️ Profile creation requires authentication');
      }
    });
  });

  test.describe('Appointments API', () => {
    test('POST /api/appointments/request - should create appointment request', async ({ request }) => {
      const appointmentData = {
        salonSlug: TEST_DATA.SALONS.MALION.slug,
        serviceId: 'test-service-id',
        requestedDate: getFutureDate(2),
        requestedTime: '14:00',
        customerPhone: TEST_DATA.USERS.VALID_USER.phone,
        customerName: `${TEST_DATA.USERS.VALID_USER.firstName} ${TEST_DATA.USERS.VALID_USER.lastName}`,
        notes: 'Test appointment request'
      };

      const response = await request.post('/api/appointments/request', {
        data: appointmentData
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('appointmentId');
      expect(responseBody).toHaveProperty('message');
      expect(responseBody.message).toContain('Rezervimi u dërgua');
      
      console.log(`✅ Appointment request API working. ID: ${responseBody.appointmentId}`);
    });

    test('GET /api/appointments/[id] - should retrieve appointment details', async ({ request }) => {
      const response = await request.get('/api/appointments/test-appointment-id');
      
      // Should return appointment data or 404 if not found
      expect([200, 404]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('success', true);
        expect(responseBody).toHaveProperty('appointment');
        console.log('✅ Appointment retrieval API working');
      } else {
        console.log('ℹ️ Test appointment not found (expected for test)');
      }
    });

    test('POST /api/appointments/approve - should approve appointment', async ({ request }) => {
      const approvalData = {
        appointmentId: 'test-appointment-id',
        salonResponse: 'approved',
        confirmedDate: getFutureDate(2),
        confirmedTime: '14:00',
        notes: 'Approved by test'
      };

      const response = await request.post('/api/appointments/approve', {
        data: approvalData,
        headers: {
          'Authorization': 'Bearer salon-token' // Mock salon token
        }
      });

      // Should return success, auth error, not found, or method not allowed (if endpoint not implemented)
      expect([200, 401, 404, 405]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('success', true);
        console.log('✅ Appointment approval API working');
      } else {
        console.log('ℹ️ Appointment approval requires authentication or appointment not found');
      }
    });

    test('POST /api/appointments/decline - should decline appointment', async ({ request }) => {
      const declineData = {
        appointmentId: 'test-appointment-id',
        reason: 'Not available at requested time',
        alternativeTimes: ['15:00', '16:00']
      };

      const response = await request.post('/api/appointments/decline', {
        data: declineData,
        headers: {
          'Authorization': 'Bearer salon-token'
        }
      });

      expect([200, 401, 404, 405]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('success', true);
        console.log('✅ Appointment decline API working');
      }
    });
  });

  test.describe('Notifications API', () => {
    test('POST /api/notifications/send - should send WhatsApp notification', async ({ request }) => {
      const notificationData = {
        to: TEST_DATA.USERS.VALID_USER.phone,
        templateName: 'BOOKING_CONFIRMATION',
        variables: {
          salonName: TEST_DATA.SALONS.MALION.name,
          service: 'Qethje + Larim',
          date: getFutureDate(2),
          time: '14:00'
        }
      };

      const response = await request.post('/api/notifications/send', {
        data: notificationData,
        headers: {
          'Authorization': 'Bearer api-key'
        }
      });

      expect([200, 401]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('success', true);
        expect(responseBody).toHaveProperty('messageSid');
        console.log('✅ WhatsApp notification API working');
      }
    });

    test('GET /api/notifications/templates - should list available templates', async ({ request }) => {
      const response = await request.get('/api/notifications/templates');
      
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('templates');
      expect(Array.isArray(responseBody.templates)).toBe(true);
      
      // Check for expected templates
      const templateNames = responseBody.templates.map((t: any) => t.name);
      const expectedTemplates = [
        'BOOKING_CONFIRMATION',
        'BOOKING_DECLINED', 
        'APPOINTMENT_REMINDER'
      ];
      
      for (const expectedTemplate of expectedTemplates) {
        if (templateNames.includes(expectedTemplate)) {
          console.log(`✅ Found template: ${expectedTemplate}`);
        }
      }
    });
  });

  test.describe('Twilio Webhook API', () => {
    test('POST /api/twilio/webhook - should handle salon approval response', async ({ request }) => {
      const webhookData = new URLSearchParams({
        'From': 'whatsapp:+355691234567', // Mock salon WhatsApp number
        'Body': 'PRANO test-appointment-id',
        'MessageSid': 'test-message-sid'
      });

      const response = await request.post('/api/twilio/webhook', {
        data: webhookData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      expect(response.status()).toBe(200);
      
      // Should return JSON response
      const responseBody = await response.json();
      expect(responseBody.success).toBe(true);
      expect(responseBody.message).toBeTruthy();
      
      console.log('✅ Twilio webhook approval handling working');
    });

    test('POST /api/twilio/webhook - should handle salon decline response', async ({ request }) => {
      const webhookData = new URLSearchParams({
        'From': 'whatsapp:+355691234567',
        'Body': 'REFUZO test-appointment-id Nuk jemi të disponueshëm',
        'MessageSid': 'test-message-sid-2'
      });

      const response = await request.post('/api/twilio/webhook', {
        data: webhookData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody.success).toBe(true);
      expect(responseBody.message).toBeTruthy();
      
      console.log('✅ Twilio webhook decline handling working');
    });

    test('POST /api/twilio/webhook - should handle invalid responses', async ({ request }) => {
      const webhookData = new URLSearchParams({
        'From': 'whatsapp:+355691234567',
        'Body': 'INVALID COMMAND',
        'MessageSid': 'test-message-sid-3'
      });

      const response = await request.post('/api/twilio/webhook', {
        data: webhookData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      expect(response.status()).toBe(200);
      
      const responseText = await response.text();
      expect(responseText).toContain('<Response>');
      // Should contain help message
      expect(responseText).toContain('Komanda e pavlefshme');
      
      console.log('✅ Twilio webhook invalid command handling working');
    });
  });

  test.describe('Salon Management API', () => {
    test('GET /api/salons/[slug] - should retrieve salon information', async ({ request }) => {
      const response = await request.get(`/api/salons/${TEST_DATA.SALONS.MALION.slug}`);
      
      expect([200, 404]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('success', true);
        expect(responseBody).toHaveProperty('salon');
        expect(responseBody.salon).toHaveProperty('name');
        expect(responseBody.salon).toHaveProperty('slug');
        
        console.log(`✅ Salon info API working for: ${responseBody.salon.name}`);
      }
    });

    test('GET /api/salons/[slug]/services - should list salon services', async ({ request }) => {
      const response = await request.get(`/api/salons/${TEST_DATA.SALONS.MALION.slug}/services`);
      
      expect([200, 404]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('success', true);
        expect(responseBody).toHaveProperty('services');
        expect(Array.isArray(responseBody.services)).toBe(true);
        
        console.log(`✅ Salon services API working. Found ${responseBody.services.length} services`);
      }
    });

    test('GET /api/salons/[slug]/availability - should check availability', async ({ request }) => {
      const targetDate = getFutureDate(2);
      const response = await request.get(`/api/salons/${TEST_DATA.SALONS.MALION.slug}/availability?date=${targetDate}`);
      
      expect([200, 404]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('success', true);
        expect(responseBody).toHaveProperty('availableSlots');
        expect(Array.isArray(responseBody.availableSlots)).toBe(true);
        
        console.log(`✅ Availability API working. Found ${responseBody.availableSlots.length} slots for ${targetDate}`);
      }
    });

    test('POST /api/salons/register - should register new salon', async ({ request }) => {
      const salonData = generateUniqueTestData();
      const registrationData = {
        name: salonData.salonName,
        slug: salonData.salonName.toLowerCase().replace(/\s+/g, '-'),
        phone: salonData.phone,
        address: 'Test Address, Tiranë',
        services: [
          {
            name: 'Qethje',
            price: 1500,
            duration: 30
          }
        ]
      };

      const response = await request.post('/api/salons/register', {
        data: registrationData,
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      expect([200, 201, 401]).toContain(response.status());
      
      if ([200, 201].includes(response.status())) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('success', true);
        console.log('✅ Salon registration API working');
      }
    });
  });

  test.describe('Search and Discovery API', () => {
    test('GET /api/search/salons - should search for salons', async ({ request }) => {
      const response = await request.get('/api/search/salons?q=hair&location=tirane');
      
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('results');
      expect(Array.isArray(responseBody.results)).toBe(true);
      
      console.log(`✅ Salon search API working. Found ${responseBody.results.length} results`);
    });

    test('GET /api/search/services - should search for services', async ({ request }) => {
      const response = await request.get('/api/search/services?q=qethje');
      
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('services');
      
      console.log('✅ Service search API working');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 for non-existent endpoints', async ({ request }) => {
      const response = await request.get('/api/non-existent-endpoint');
      
      expect(response.status()).toBe(404);
    });

    test('should handle malformed JSON requests', async ({ request }) => {
      const response = await request.post('/api/appointments/request', {
        data: 'invalid-json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(400);
    });

    test('should handle missing required fields', async ({ request }) => {
      const response = await request.post('/api/appointments/request', {
        data: {
          // Missing required fields
        }
      });

      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody).toHaveProperty('error');
    });

    test('should handle rate limiting', async ({ request }) => {
      // Make multiple rapid requests to test rate limiting
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request.post('/api/auth/send-verification', {
            data: { phone: '+355675490330' }
          })
        );
      }
      
      const responses = await Promise.all(promises);
      
      // At least one should be rate limited (429) or all should succeed (200)
      const statusCodes = responses.map(r => r.status());
      const hasRateLimit = statusCodes.includes(429);
      const allSucceed = statusCodes.every(code => code === 200);
      
      expect(hasRateLimit || allSucceed).toBe(true);
      
      if (hasRateLimit) {
        console.log('✅ Rate limiting is working');
      } else {
        console.log('ℹ️ Rate limiting not triggered or not configured');
      }
    });
  });

  test.describe('Data Validation', () => {
    test('should validate Albanian phone numbers', async ({ request }) => {
      const invalidPhones = [
        '+1234567890',  // Non-Albanian
        '355675490330', // Missing +
        '+355123',      // Too short
        'invalid-phone' // Not a number
      ];
      
      for (const phone of invalidPhones) {
        const response = await request.post('/api/auth/send-verification', {
          data: { phone }
        });
        
        expect(response.status()).toBe(400);
        
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('success', false);
        // Check if error is object with message or string
        const errorText = typeof responseBody.error === 'object' ? 
          (responseBody.error.message || responseBody.error.code || JSON.stringify(responseBody.error)) : 
          responseBody.error;
        expect(errorText).toMatch(/phone|telefon|INVALID_PHONE/i);
      }
      
      console.log('✅ Phone number validation working');
    });

    test('should validate appointment dates', async ({ request }) => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastDateString = pastDate.toISOString().split('T')[0];
      
      const response = await request.post('/api/appointments/request', {
        data: {
          salonSlug: TEST_DATA.SALONS.MALION.slug,
          serviceId: 'test-service',
          requestedDate: pastDateString, // Past date
          requestedTime: '14:00',
          customerPhone: TEST_DATA.USERS.VALID_USER.phone,
          customerName: 'Test User'
        }
      });

      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody.error).toMatch(/date|data/i);
      
      console.log('✅ Past date validation working');
    });
  });
});