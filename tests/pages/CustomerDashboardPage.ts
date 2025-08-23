// tests/pages/CustomerDashboardPage.ts
// Page Object Model for customer dashboard and booking history

import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, expectAlbanianText } from '../utils/test-helpers';
import { TEST_DATA } from '../utils/test-data';

export class CustomerDashboardPage {
  readonly page: Page;
  readonly dashboardTitle: Locator;
  readonly profileSection: Locator;
  readonly bookingHistorySection: Locator;
  readonly upcomingAppointmentsSection: Locator;
  readonly bookingHistoryCards: Locator;
  readonly profileTab: Locator;
  readonly historyTab: Locator;
  readonly newBookingButton: Locator;
  readonly statusFilters: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardTitle = page.locator('h1:has-text("Dashboard"), h1:has-text("Përshëndetje"), h1:has-text("Krye")');
    this.profileSection = page.locator('text=Profili Im').locator('..').first();
    this.bookingHistorySection = page.locator('text=Historia e Rezervimeve').locator('..').first();
    this.upcomingAppointmentsSection = page.locator('text=Takimet e ardhshme').locator('..').first();
    this.bookingHistoryCards = page.locator('[data-testid="booking-card"], .booking-card, .appointment-card');
    this.profileTab = page.locator('text=Profili, text=Profile, [href*="profile"]').first();
    this.historyTab = page.locator('text=Historia, text=History, [href*="history"]').first();
    this.newBookingButton = page.locator('button:has-text("Rezervo tani"), button:has-text("Rezervim i ri")');
    this.statusFilters = page.locator('[data-testid="status-filter"], .status-filter');
  }

  /**
   * Navigate to customer dashboard
   */
  async goto() {
    await this.page.goto(TEST_DATA.URLS.CUSTOMER_DASHBOARD);
    await waitForPageLoad(this.page);
  }

  /**
   * Verify dashboard loads correctly
   */
  async verifyDashboardLoaded() {
    // Check if authentication is required
    const needsAuth = await this.page.locator('text=Identifikohuni për të vazhduar').count() > 0;
    if (needsAuth) {
      throw new Error('Authentication required for customer dashboard');
    }

    // Wait for loading to finish
    await this.page.waitForFunction(
      () => !document.body.textContent?.includes('Po ngarkon...'),
      { timeout: TEST_DATA.TIMEOUTS.MEDIUM }
    );

    // Verify main dashboard elements
    const dashboardIndicators = [
      this.dashboardTitle,
      this.page.locator('text=Përshëndetje'),
      this.page.locator('text=Dashboard'),
      this.page.locator('text=Profili Im')
    ];

    let foundIndicator = false;
    for (const indicator of dashboardIndicators) {
      if (await indicator.count() > 0) {
        await expect(indicator).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.MEDIUM });
        foundIndicator = true;
        break;
      }
    }

    expect(foundIndicator).toBe(true);
    console.log('✅ Customer dashboard loaded successfully');
  }

  /**
   * Navigate to profile section
   */
  async navigateToProfile() {
    console.log('👤 Navigating to profile...');
    
    if (await this.profileTab.count() > 0) {
      await this.profileTab.click();
      await this.page.waitForTimeout(2000);
    }
    
    // Verify profile section is visible
    await expectAlbanianText(this.page, 'Profili Im');
  }

  /**
   * Navigate to booking history section
   */
  async navigateToBookingHistory() {
    console.log('📚 Navigating to booking history...');
    
    if (await this.historyTab.count() > 0) {
      await this.historyTab.click();
      await this.page.waitForTimeout(2000);
    } else {
      // Try scrolling to history section
      const historySection = this.page.locator('text=Historia e Rezervimeve');
      if (await historySection.count() > 0) {
        await historySection.scrollIntoViewIfNeeded();
      }
    }
    
    // Wait for booking cards to load
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get profile information
   */
  async getProfileInfo() {
    const profile = {
      name: '',
      phone: '',
      email: ''
    };

    if (await this.profileSection.count() > 0) {
      try {
        // Extract name
        const nameElement = this.profileSection.locator('text=Emri:').locator('..').first();
        if (await nameElement.count() > 0) {
          const nameText = await nameElement.textContent();
          profile.name = nameText?.replace('Emri:', '').trim() || '';
        }

        // Extract phone
        const phoneElement = this.profileSection.locator('text=Telefoni:, text=+355').first();
        if (await phoneElement.count() > 0) {
          const phoneText = await phoneElement.textContent();
          profile.phone = phoneText?.replace('Telefoni:', '').trim() || phoneText || '';
        }

        // Extract email if available
        const emailElement = this.profileSection.locator('text=Email:').locator('..').first();
        if (await emailElement.count() > 0) {
          const emailText = await emailElement.textContent();
          profile.email = emailText?.replace('Email:', '').trim() || '';
        }

      } catch (error) {
        console.warn('⚠️ Could not extract complete profile info:', error);
      }
    }

    return profile;
  }

  /**
   * Get booking history summary
   */
  async getBookingHistorySummary() {
    await this.navigateToBookingHistory();
    
    const summary = {
      total: 0,
      pending: 0,
      approved: 0,
      declined: 0,
      completed: 0
    };

    const cards = this.bookingHistoryCards;
    summary.total = await cards.count();

    if (summary.total > 0) {
      // Count by status
      const statusCounts = await Promise.all([
        cards.locator('text=Në pritje').count(),
        cards.locator('text=Aprovuar').count(), 
        cards.locator('text=Refuzuar').count(),
        cards.locator('text=Përfunduar').count()
      ]);

      [summary.pending, summary.approved, summary.declined, summary.completed] = statusCounts;
    }

    console.log(`📊 Booking Summary: ${summary.total} total, ${summary.pending} pending, ${summary.approved} approved`);
    return summary;
  }

  /**
   * Filter bookings by status
   */
  async filterBookingsByStatus(status: 'Të gjitha' | 'Në pritje' | 'Aprovuar' | 'Refuzuar' | 'Përfunduar') {
    console.log(`🔍 Filtering bookings by status: ${status}`);
    
    const filterButton = this.page.locator(`button:has-text("${status}"), text=${status}`).first();
    
    if (await filterButton.count() > 0) {
      await filterButton.click();
      await this.page.waitForTimeout(1500);
      
      // Count filtered results
      const filteredCards = this.bookingHistoryCards;
      const count = await filteredCards.count();
      
      console.log(`Found ${count} bookings with status: ${status}`);
      return count;
    }
    
    return 0;
  }

  /**
   * Get details of a specific booking
   */
  async getBookingDetails(cardIndex: number = 0) {
    const cards = this.bookingHistoryCards;
    const cardCount = await cards.count();
    
    if (cardIndex >= cardCount) {
      throw new Error(`Booking index ${cardIndex} out of range. Only ${cardCount} bookings available.`);
    }
    
    const card = cards.nth(cardIndex);
    const details = {
      salon: '',
      service: '',
      date: '',
      time: '',
      status: '',
      price: ''
    };

    try {
      // Extract salon name
      const salonElement = card.locator('text=Salloni:').locator('..').first();
      if (await salonElement.count() > 0) {
        const salonText = await salonElement.textContent();
        details.salon = salonText?.replace('Salloni:', '').trim() || '';
      }

      // Extract service
      const serviceElement = card.locator('text=Shërbimi:').locator('..').first();
      if (await serviceElement.count() > 0) {
        const serviceText = await serviceElement.textContent();
        details.service = serviceText?.replace('Shërbimi:', '').trim() || '';
      }

      // Extract date
      const dateElement = card.locator('text=Data:').locator('..').first();
      if (await dateElement.count() > 0) {
        const dateText = await dateElement.textContent();
        details.date = dateText?.replace('Data:', '').trim() || '';
      }

      // Extract status
      const statusOptions = ['Në pritje', 'Aprovuar', 'Refuzuar', 'Përfunduar'];
      for (const status of statusOptions) {
        if (await card.locator(`text=${status}`).count() > 0) {
          details.status = status;
          break;
        }
      }

    } catch (error) {
      console.warn('⚠️ Could not extract complete booking details:', error);
    }

    return details;
  }

  /**
   * Click on a booking card to view details
   */
  async viewBookingDetails(cardIndex: number = 0) {
    console.log(`📋 Viewing booking details for card ${cardIndex}...`);
    
    const cards = this.bookingHistoryCards;
    const card = cards.nth(cardIndex);
    
    await expect(card).toBeVisible();
    await card.click();
    
    // Wait for details to load (could be modal or new page)
    await this.page.waitForTimeout(2000);
    
    // Check if details modal or page opened
    const detailsIndicators = [
      'text=Detajet e Rezervimit',
      'text=Informacionet e Rezervimit',
      '.modal',
      '[role="dialog"]'
    ];
    
    for (const indicator of detailsIndicators) {
      if (await this.page.locator(indicator).count() > 0) {
        console.log('✅ Booking details opened');
        return true;
      }
    }
    
    return false;
  }

  /**
   * Make a new booking from dashboard
   */
  async initiateNewBooking() {
    console.log('🆕 Initiating new booking...');
    
    if (await this.newBookingButton.count() > 0) {
      await this.newBookingButton.first().click();
      
      // Wait for navigation
      await this.page.waitForTimeout(2000);
      
      // Should navigate to salon discovery or booking page
      const currentUrl = this.page.url();
      console.log(`Navigated to: ${currentUrl}`);
      
      return currentUrl;
    }
    
    return null;
  }

  /**
   * Edit profile information
   */
  async editProfile(updates: { firstName?: string; lastName?: string; phone?: string }) {
    console.log('✏️ Editing profile...');
    
    await this.navigateToProfile();
    
    const editButton = this.page.locator('button:has-text("Ndrysho"), button:has-text("Redakto")');
    
    if (await editButton.count() > 0) {
      await editButton.click();
      await this.page.waitForTimeout(2000);
      
      // Fill updated information
      if (updates.firstName) {
        const firstNameInput = this.page.locator('input[name="firstName"], input[name="name"]');
        if (await firstNameInput.count() > 0) {
          await firstNameInput.fill(updates.firstName);
        }
      }
      
      if (updates.lastName) {
        const lastNameInput = this.page.locator('input[name="lastName"]');
        if (await lastNameInput.count() > 0) {
          await lastNameInput.fill(updates.lastName);
        }
      }
      
      // Save changes
      const saveButton = this.page.locator('button:has-text("Ruaj"), button[type="submit"]');
      if (await saveButton.count() > 0) {
        await saveButton.click();
        await this.page.waitForTimeout(2000);
        
        // Check for success message
        const successMessage = this.page.locator('text=Profili u përditësua');
        if (await successMessage.count() > 0) {
          console.log('✅ Profile updated successfully');
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Search bookings by salon name or service
   */
  async searchBookings(query: string) {
    console.log(`🔍 Searching bookings for: ${query}`);
    
    const searchInput = this.page.locator('input[placeholder*="Kërkoni"], input[type="search"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.fill(query);
      await this.page.waitForTimeout(2000);
      
      const filteredCards = this.bookingHistoryCards;
      const resultCount = await filteredCards.count();
      
      console.log(`Found ${resultCount} bookings matching "${query}"`);
      return resultCount;
    }
    
    return -1; // Search not available
  }

  /**
   * Verify mobile responsive layout
   */
  async verifyMobileLayout() {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.reload();
    await waitForPageLoad(this.page);
    
    // Verify main elements are accessible on mobile
    const mobileIndicators = [
      this.dashboardTitle,
      this.page.locator('text=Profili Im'),
      this.newBookingButton
    ];
    
    let visibleElements = 0;
    for (const element of mobileIndicators) {
      if (await element.count() > 0) {
        await expect(element).toBeVisible();
        visibleElements++;
      }
    }
    
    expect(visibleElements).toBeGreaterThan(0);
    console.log(`✅ Mobile layout: ${visibleElements} key elements visible`);
  }
}