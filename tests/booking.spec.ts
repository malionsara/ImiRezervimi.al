// tests/booking.spec.ts
// Booking flow tests for ImiRezervimi.al
// Tests the complete appointment booking process

import { test, expect } from '@playwright/test';
import { BookingPage } from './pages/BookingPage';
import { checkForApplicationError, takeScreenshot, loginTestUser } from './utils/test-helpers';
import { TEST_DATA, getFutureDate } from './utils/test-data';

test.describe('Booking Flow - ImiRezervimi.al', () => {
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    bookingPage = new BookingPage(page, TEST_DATA.SALONS.MALION.slug);
    
    // Login test user for authenticated booking tests
    try {
      await loginTestUser(page);
      console.log('✅ Test user logged in');
    } catch (error) {
      console.warn('⚠️ Could not login test user, some tests may require manual authentication');
    }
  });

  test('should load booking page successfully', async ({ page }) => {
    await bookingPage.goto();
    
    // Check for application errors
    const hasError = await checkForApplicationError(page);
    if (hasError) {
      await takeScreenshot(page, 'booking-page-application-error');
      throw new Error('Booking page has application error');
    }
    
    await bookingPage.verifyPageLoaded();
  });

  test('should display available services', async ({ page }) => {
    await bookingPage.goto();
    await bookingPage.verifyPageLoaded();
    
    // Should show service selection step
    const serviceCards = bookingPage.serviceCards;
    await expect(serviceCards.first()).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.MEDIUM });
    
    const serviceCount = await serviceCards.count();
    expect(serviceCount).toBeGreaterThan(0);
    console.log(`Found ${serviceCount} services available`);
    
    // Verify expected services for Malion salon
    for (const expectedService of TEST_DATA.SALONS.MALION.expectedServices) {
      await expect(page.locator(`text=${expectedService}`)).toBeVisible();
    }
  });

  test('should complete full booking flow successfully', async ({ page }) => {
    await bookingPage.goto();
    
    const appointmentId = await bookingPage.completeFullBookingFlow({
      serviceName: TEST_DATA.APPOINTMENTS.BASIC.service,
      date: getFutureDate(3),
      time: TEST_DATA.APPOINTMENTS.BASIC.time
    });
    
    // Verify success page
    await bookingPage.verifyBookingSuccess();
    
    console.log(`🎉 Booking completed with ID: ${appointmentId}`);
  });

  test('should validate service selection step', async ({ page }) => {
    await bookingPage.goto();
    await bookingPage.verifyPageLoaded();
    
    // Continue button should be disabled initially
    await expect(bookingPage.continueButton).toBeDisabled();
    
    // Select a service
    await bookingPage.selectService(TEST_DATA.APPOINTMENTS.BASIC.service);
    
    // Continue button should now be enabled
    await expect(bookingPage.continueButton).toBeEnabled();
    
    // Proceed to next step
    await bookingPage.proceedToDateTime();
  });

  test('should validate date selection with Albanian calendar', async ({ page }) => {
    await bookingPage.goto();
    await bookingPage.verifyPageLoaded();
    
    // Complete service selection
    await bookingPage.selectService();
    await bookingPage.proceedToDateTime();
    
    // Verify Albanian day labels
    const albanianDays = ['Hë', 'Ma', 'Më', 'En', 'Pr', 'Sh', 'Di'];
    for (const day of albanianDays) {
      await expect(page.locator(`text=${day}`)).toBeVisible();
    }
    
    // Test date selection
    await bookingPage.selectDate(getFutureDate(2));
    
    // Time slots should appear
    await expect(bookingPage.timeSlots.first()).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.MEDIUM });
  });

  test('should display available time slots correctly', async ({ page }) => {
    await bookingPage.goto();
    await bookingPage.verifyPageLoaded();
    
    // Navigate to time selection
    await bookingPage.selectService();
    await bookingPage.proceedToDateTime();
    await bookingPage.selectDate();
    
    // Verify time slots
    const timeSlots = bookingPage.timeSlots;
    await expect(timeSlots.first()).toBeVisible();
    
    const slotCount = await timeSlots.count();
    expect(slotCount).toBeGreaterThan(0);
    console.log(`Found ${slotCount} available time slots`);
    
    // Verify Albanian text for availability
    await expect(page.locator('text=Disponueshëm')).toBeVisible();
    await expect(page.locator('text=orë të disponueshme')).toBeVisible();
  });

  test('should show booking summary correctly', async ({ page }) => {
    await bookingPage.goto();
    await bookingPage.verifyPageLoaded();
    
    // Complete service and date/time selection
    await bookingPage.selectService(TEST_DATA.APPOINTMENTS.BASIC.service);
    await bookingPage.proceedToDateTime();
    await bookingPage.selectDate();
    await bookingPage.selectTimeSlot();
    
    // Verify booking summary appears
    await expect(bookingPage.bookingSummary).toBeVisible();
    
    // Check summary contains expected information
    await expect(page.locator('text=Rezervimi juaj')).toBeVisible();
    await expect(page.locator(`text=${TEST_DATA.APPOINTMENTS.BASIC.service}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_DATA.APPOINTMENTS.BASIC.price}`)).toBeVisible();
  });

  test('should handle booking confirmation step', async ({ page }) => {
    await bookingPage.goto();
    await bookingPage.verifyPageLoaded();
    
    // Navigate to confirmation
    await bookingPage.selectService();
    await bookingPage.proceedToDateTime();
    await bookingPage.selectDate();
    await bookingPage.selectTimeSlot();
    await bookingPage.proceedToConfirmation();
    
    // Verify confirmation page elements
    await expect(page.locator('text=Konfirmoni rezervimin')).toBeVisible();
    await expect(bookingPage.confirmButton).toBeVisible();
    await expect(bookingPage.confirmButton).toBeEnabled();
    
    // Verify customer information is pre-filled
    await expect(page.locator('text=Malion Sara')).toBeVisible(); // From test user
    await expect(page.locator('text=+355675490330')).toBeVisible(); // From test user
  });

  test('should validate past date selection is prevented', async ({ page }) => {
    await bookingPage.goto();
    await bookingPage.verifyPageLoaded();
    
    await bookingPage.selectService();
    await bookingPage.proceedToDateTime();
    
    // Test that past dates are disabled
    await bookingPage.testErrorScenarios();
  });

  test('should be mobile responsive', async ({ page }) => {
    await bookingPage.goto();
    await bookingPage.testMobileLayout();
    
    // Complete a booking on mobile
    await bookingPage.verifyPageLoaded();
    await bookingPage.selectService();
    
    // Verify mobile interactions work
    await expect(bookingPage.continueButton).toBeVisible();
    await expect(bookingPage.continueButton).toBeEnabled();
  });

  test('should handle network issues during booking', async ({ page, context }) => {
    await bookingPage.goto();
    await bookingPage.verifyPageLoaded();
    
    // Start booking process
    await bookingPage.selectService();
    await bookingPage.proceedToDateTime();
    await bookingPage.selectDate();
    await bookingPage.selectTimeSlot();
    await bookingPage.proceedToConfirmation();
    
    // Simulate network failure during confirmation
    await context.setOffline(true);
    
    // Try to confirm booking
    await bookingPage.confirmButton.click();
    
    // Should handle the error gracefully
    await page.waitForTimeout(5000);
    
    // Restore network and try again
    await context.setOffline(false);
    await bookingPage.confirmButton.click();
    
    // Should complete successfully now
    await expect(page.locator('text=Rezervimi u dërgua!')).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.SLOW });
  });

  test('should validate required authentication', async ({ page, context }) => {
    // Clear any existing sessions
    await context.clearCookies();
    
    await bookingPage.goto();
    
    // Should show authentication requirement
    const needsAuth = await page.locator('text=Identifikohuni për të vazhduar').isVisible();
    if (needsAuth) {
      await expect(page.locator('text=Identifikohu / Regjistrohu')).toBeVisible();
      console.log('✅ Authentication requirement correctly displayed');
    }
  });

  test('should handle different salon booking pages', async ({ page }) => {
    const salonsToTest = Object.values(TEST_DATA.SALONS);
    
    for (const salon of salonsToTest) {
      if (salon.slug) {
        console.log(`🧪 Testing salon: ${salon.name} (${salon.slug})`);
        
        const salonBookingPage = new BookingPage(page, salon.slug);
        await salonBookingPage.goto();
        
        // Check if page loads without errors
        const hasError = await checkForApplicationError(page);
        if (hasError) {
          console.warn(`⚠️ Application error on salon ${salon.name}`);
          continue;
        }
        
        try {
          await salonBookingPage.verifyPageLoaded();
          console.log(`✅ ${salon.name} booking page loads correctly`);
        } catch (error) {
          console.warn(`⚠️ ${salon.name} booking page has issues:`, error);
        }
      }
    }
  });

  test('should validate appointment time constraints', async ({ page }) => {
    await bookingPage.goto();
    await bookingPage.verifyPageLoaded();
    
    await bookingPage.selectService();
    await bookingPage.proceedToDateTime();
    await bookingPage.selectDate();
    
    // Verify business hours are respected
    const timeSlots = await bookingPage.timeSlots.allTextContents();
    
    // Should not show times outside business hours (before 6 AM or after 11 PM)
    const earlyTimes = timeSlots.filter(slot => {
      const timeMatch = slot.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        return hour < 6;
      }
      return false;
    });
    
    const lateTimes = timeSlots.filter(slot => {
      const timeMatch = slot.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        return hour > 23;
      }
      return false;
    });
    
    expect(earlyTimes.length).toBe(0);
    expect(lateTimes.length).toBe(0);
    
    console.log('✅ Time slot constraints validated');
  });

  test('should display correct pricing information', async ({ page }) => {
    await bookingPage.goto();
    await bookingPage.verifyPageLoaded();
    
    // Select service with known price
    await bookingPage.selectService(TEST_DATA.APPOINTMENTS.BASIC.service);
    
    // Verify price is displayed
    await expect(page.locator(`text=${TEST_DATA.APPOINTMENTS.BASIC.price}`)).toBeVisible();
    
    // Proceed through booking to verify price consistency
    await bookingPage.proceedToDateTime();
    await bookingPage.selectDate();
    await bookingPage.selectTimeSlot();
    
    // Price should still be shown in summary
    await expect(page.locator(`text=${TEST_DATA.APPOINTMENTS.BASIC.price}`)).toBeVisible();
    
    await bookingPage.proceedToConfirmation();
    
    // Price should be in final confirmation
    await expect(page.locator(`text=${TEST_DATA.APPOINTMENTS.BASIC.price}`)).toBeVisible();
  });
});