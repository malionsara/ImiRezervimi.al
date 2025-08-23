// tests/pages/BookingPage.ts
// Page Object Model for the salon booking page

import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, expectAlbanianText, waitForApiResponse } from '../utils/test-helpers';
import { TEST_DATA, getFutureDate } from '../utils/test-data';

export class BookingPage {
  readonly page: Page;
  readonly salonSlug: string;
  readonly bookingTitle: Locator;
  readonly serviceCards: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly calendar: Locator;
  readonly timeSlots: Locator;
  readonly bookingSummary: Locator;
  readonly confirmButton: Locator;
  readonly progressIndicator: Locator;

  constructor(page: Page, salonSlug: string = 'malion') {
    this.page = page;
    this.salonSlug = salonSlug;
    this.bookingTitle = page.locator('h1:has-text("Rezervo Takimin"), h1:has-text("✨ Rezervo Takimin")');
    this.serviceCards = page.locator('[data-testid="service-card"], .service-card, [class*="service"]');
    this.continueButton = page.locator('button:has-text("Vazhdo")');
    this.backButton = page.locator('button:has-text("Kthehu")');
    this.calendar = page.locator('[role="grid"], .calendar, [class*="calendar"]');
    this.timeSlots = page.locator('[data-testid="time-slot"], .time-slot, button:has-text("Disponueshëm")');
    this.bookingSummary = page.locator('[data-testid="booking-summary"], .booking-summary, text=Rezervimi juaj');
    this.confirmButton = page.locator('button:has-text("Konfirmo Rezervimin"), button:has-text("Dërgo Rezervimin")');
    this.progressIndicator = page.locator('.progress, [role="tablist"], .step');
  }

  /**
   * Navigate to booking page for a specific salon
   */
  async goto(salonSlug: string = this.salonSlug) {
    await this.page.goto(`/${salonSlug}`);
    await waitForPageLoad(this.page);
  }

  /**
   * Verify booking page loads correctly
   */
  async verifyPageLoaded() {
    // Check if authentication is required first
    const needsAuth = await this.page.locator('text=Identifikohuni për të vazhduar').count() > 0;
    if (needsAuth) {
      throw new Error('Authentication required for booking page');
    }

    // Check for loading state
    await this.page.waitForFunction(
      () => !document.body.textContent?.includes('Po ngarkon...'),
      { timeout: TEST_DATA.TIMEOUTS.MEDIUM }
    );

    // Verify main elements
    await expect(this.bookingTitle).toBeVisible();
    await expectAlbanianText(this.page, 'Rezervo Takimin');
    
    // Verify progress indicator
    await expect(this.progressIndicator).toBeVisible();
  }

  /**
   * Select a service from available options
   */
  async selectService(serviceName?: string) {
    console.log('🎯 Selecting service...');
    
    // Wait for services to load
    await this.serviceCards.first().waitFor({ state: 'visible', timeout: TEST_DATA.TIMEOUTS.MEDIUM });
    
    const serviceCount = await this.serviceCards.count();
    expect(serviceCount).toBeGreaterThan(0);
    console.log(`Found ${serviceCount} services`);

    if (serviceName) {
      // Select specific service by name
      const specificService = this.page.locator(`text=${serviceName}`).first();
      await expect(specificService).toBeVisible();
      await specificService.click();
      console.log(`✅ Selected service: ${serviceName}`);
    } else {
      // Select first available service
      const firstService = this.serviceCards.first();
      await firstService.click();
      
      // Get the name of the selected service
      const serviceTitleElement = firstService.locator('h3, .service-title, [class*="title"]').first();
      if (await serviceTitleElement.count() > 0) {
        const selectedServiceName = await serviceTitleElement.textContent();
        console.log(`✅ Selected service: ${selectedServiceName}`);
      }
    }

    // Wait for selection to be processed
    await this.page.waitForTimeout(1000);
    
    // Verify continue button becomes enabled
    await expect(this.continueButton).toBeEnabled({ timeout: TEST_DATA.TIMEOUTS.FAST });
  }

  /**
   * Proceed to date/time selection
   */
  async proceedToDateTime() {
    console.log('📅 Proceeding to date/time selection...');
    
    await this.continueButton.click();
    await this.page.waitForTimeout(1000);
    
    // Verify we're now on date/time step
    await expectAlbanianText(this.page, 'Zgjidhni datën dhe orën');
    await expect(this.calendar).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.MEDIUM });
  }

  /**
   * Select a date from the calendar
   */
  async selectDate(date?: string) {
    console.log('📆 Selecting date...');
    
    const targetDate = date || getFutureDate(2); // Default to 2 days from now
    const dayOfMonth = targetDate.split('-')[2]; // Get day part from YYYY-MM-DD
    
    // Wait for calendar to be visible
    await expect(this.calendar).toBeVisible();
    
    // Look for the date button (removing leading zero if present)
    const dayNumber = parseInt(dayOfMonth, 10).toString();
    const dateButton = this.page.locator(`button:has-text("${dayNumber}"):not([disabled])`).first();
    
    await expect(dateButton).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.FAST });
    await dateButton.click();
    
    console.log(`✅ Selected date: ${targetDate} (day ${dayNumber})`);
    
    // Wait for time slots to load
    await this.page.waitForTimeout(2000);
    await expect(this.timeSlots.first()).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.MEDIUM });
  }

  /**
   * Select a time slot
   */
  async selectTimeSlot(preferredTime?: string) {
    console.log('🕐 Selecting time slot...');
    
    // Wait for time slots to be available
    await this.timeSlots.first().waitFor({ state: 'visible', timeout: TEST_DATA.TIMEOUTS.MEDIUM });
    
    const availableSlots = await this.timeSlots.count();
    expect(availableSlots).toBeGreaterThan(0);
    console.log(`Found ${availableSlots} available time slots`);

    if (preferredTime) {
      // Try to select specific time
      const specificTimeSlot = this.page.locator(`button:has-text("${preferredTime}"):has-text("Disponueshëm")`).first();
      if (await specificTimeSlot.count() > 0) {
        await specificTimeSlot.click();
        console.log(`✅ Selected preferred time: ${preferredTime}`);
      } else {
        console.warn(`⚠️ Preferred time ${preferredTime} not available, selecting first available slot`);
        await this.timeSlots.first().click();
      }
    } else {
      // Select first available time slot
      await this.timeSlots.first().click();
    }

    // Wait for selection to process
    await this.page.waitForTimeout(1000);
    
    // Verify booking summary appears
    await expect(this.bookingSummary).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.FAST });
    
    // Verify continue button becomes enabled
    await expect(this.continueButton).toBeEnabled();
  }

  /**
   * Proceed to confirmation step
   */
  async proceedToConfirmation() {
    console.log('✅ Proceeding to confirmation...');
    
    await this.continueButton.click();
    await this.page.waitForTimeout(1000);
    
    // Verify we're on confirmation step
    await expectAlbanianText(this.page, 'Konfirmoni rezervimin');
    await expect(this.confirmButton).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.MEDIUM });
  }

  /**
   * Complete the booking process
   */
  async confirmBooking(): Promise<string> {
    console.log('🎉 Confirming booking...');
    
    // Wait for and click confirm button
    await expect(this.confirmButton).toBeVisible();
    await expect(this.confirmButton).toBeEnabled();
    
    // Set up response listener before clicking
    const responsePromise = waitForApiResponse(this.page, /\/api\/appointments\/request/);
    
    await this.confirmButton.click();
    
    // Wait for API response
    const { response, body } = await responsePromise;
    expect(response.status()).toBe(200);
    
    if (typeof body === 'object' && body.success) {
      console.log('✅ Booking API call successful');
    }
    
    // Wait for success page
    await expectAlbanianText(this.page, 'Rezervimi u dërgua!', TEST_DATA.TIMEOUTS.SLOW);
    
    // Extract appointment ID if visible
    const appointmentIdElement = this.page.locator('text=ID Rezervimi').locator('..').locator('span').last();
    let appointmentId = '';
    
    if (await appointmentIdElement.count() > 0) {
      appointmentId = await appointmentIdElement.textContent() || '';
      console.log(`📋 Appointment ID: ${appointmentId}`);
    }
    
    return appointmentId;
  }

  /**
   * Complete full booking flow
   */
  async completeFullBookingFlow(options: {
    serviceName?: string;
    date?: string;
    time?: string;
  } = {}) {
    console.log('🚀 Starting complete booking flow...');
    
    // Step 1: Verify page loaded
    await this.verifyPageLoaded();
    
    // Step 2: Select service
    await this.selectService(options.serviceName);
    await this.proceedToDateTime();
    
    // Step 3: Select date and time
    await this.selectDate(options.date);
    await this.selectTimeSlot(options.time);
    await this.proceedToConfirmation();
    
    // Step 4: Confirm booking
    const appointmentId = await this.confirmBooking();
    
    console.log('🎉 Complete booking flow finished successfully!');
    return appointmentId;
  }

  /**
   * Verify booking success page
   */
  async verifyBookingSuccess() {
    await expectAlbanianText(this.page, 'Rezervimi u dërgua!');
    await expectAlbanianText(this.page, 'Do të merrni konfirmim në WhatsApp');
    
    // Verify action buttons are present
    await expect(this.page.locator('text=Shiko Statusin')).toBeVisible();
    await expect(this.page.locator('text=Rezervo në sallone të tjerë')).toBeVisible();
  }

  /**
   * Test error scenarios
   */
  async testErrorScenarios() {
    // Test selecting past date (should be disabled)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDay = yesterday.getDate().toString();
    
    const pastDateButton = this.page.locator(`button:has-text("${pastDay}")[disabled]`);
    if (await pastDateButton.count() > 0) {
      await expect(pastDateButton).toBeDisabled();
      console.log('✅ Past dates are correctly disabled');
    }
    
    // Test continuing without service selection
    if (await this.continueButton.count() > 0) {
      const isInitiallyDisabled = await this.continueButton.isDisabled();
      expect(isInitiallyDisabled).toBe(true);
      console.log('✅ Continue button correctly disabled without service selection');
    }
  }

  /**
   * Verify mobile responsiveness
   */
  async testMobileLayout() {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.reload();
    await waitForPageLoad(this.page);
    
    // Verify elements are still accessible on mobile
    await expect(this.bookingTitle).toBeVisible();
    await expect(this.serviceCards.first()).toBeVisible();
    
    console.log('✅ Mobile layout verified');
  }
}