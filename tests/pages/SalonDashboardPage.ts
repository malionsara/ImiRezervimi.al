// tests/pages/SalonDashboardPage.ts
// Page Object Model for salon dashboard and management features

import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, expectAlbanianText } from '../utils/test-helpers';
import { TEST_DATA } from '../utils/test-data';

export class SalonDashboardPage {
  readonly page: Page;
  readonly dashboardTitle: Locator;
  readonly pendingRequestsTab: Locator;
  readonly calendarTab: Locator;
  readonly settingsTab: Locator;
  readonly servicesTab: Locator;
  readonly appointmentCards: Locator;
  readonly approveButtons: Locator;
  readonly declineButtons: Locator;
  readonly statsSection: Locator;
  readonly notificationsBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardTitle = page.locator('h1:has-text("Dashboard"), h1:has-text("Paneli i Kontrollit")');
    this.pendingRequestsTab = page.locator('text=Kërkesat e Reja, text=Kërkesat, [href*="requests"]').first();
    this.calendarTab = page.locator('text=Kalendari, text=Calendar, [href*="calendar"]').first();
    this.settingsTab = page.locator('text=Cilësimet, text=Settings, [href*="settings"]').first();
    this.servicesTab = page.locator('text=Shërbimet, text=Services, [href*="services"]').first();
    this.appointmentCards = page.locator('[data-testid="appointment-card"], .appointment-card, .request-card');
    this.approveButtons = page.locator('button:has-text("Prano"), button:has-text("Approve")');
    this.declineButtons = page.locator('button:has-text("Refuzo"), button:has-text("Decline")');
    this.statsSection = page.locator('[data-testid="stats"], .stats, .dashboard-stats');
    this.notificationsBadge = page.locator('.notification-badge, [data-testid="notifications"]');
  }

  /**
   * Navigate to salon dashboard
   */
  async goto() {
    await this.page.goto(TEST_DATA.URLS.SALON_DASHBOARD);
    await waitForPageLoad(this.page);
  }

  /**
   * Verify dashboard loads correctly
   */
  async verifyDashboardLoaded() {
    // Check if authentication is required
    const needsAuth = await this.page.locator('text=Identifikohuni për të vazhduar').count() > 0;
    if (needsAuth) {
      throw new Error('Authentication required for salon dashboard');
    }

    // Wait for loading to finish
    await this.page.waitForFunction(
      () => !document.body.textContent?.includes('Po ngarkon...'),
      { timeout: TEST_DATA.TIMEOUTS.MEDIUM }
    );

    // Verify main dashboard elements
    await expect(this.dashboardTitle).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.MEDIUM });
    await expectAlbanianText(this.page, 'Dashboard');
    
    // Verify navigation tabs are present
    const navigationTabs = [
      this.pendingRequestsTab,
      this.calendarTab,
      this.settingsTab,
      this.servicesTab
    ];

    let visibleTabs = 0;
    for (const tab of navigationTabs) {
      if (await tab.count() > 0) {
        visibleTabs++;
      }
    }

    expect(visibleTabs).toBeGreaterThan(0);
    console.log(`✅ Dashboard loaded with ${visibleTabs} navigation tabs visible`);
  }

  /**
   * Navigate to pending requests section
   */
  async navigateToPendingRequests() {
    console.log('📋 Navigating to pending requests...');
    
    if (await this.pendingRequestsTab.count() > 0) {
      await this.pendingRequestsTab.click();
      await this.page.waitForTimeout(2000);
      
      // Verify we're on pending requests
      await expectAlbanianText(this.page, 'Kërkesat e Reja');
    } else {
      // Might already be on pending requests page
      console.log('ℹ️ Already on pending requests or tab not found');
    }
    
    // Wait for appointment cards to load
    await this.page.waitForTimeout(2000);
  }

  /**
   * Navigate to calendar view
   */
  async navigateToCalendar() {
    console.log('📅 Navigating to calendar...');
    
    if (await this.calendarTab.count() > 0) {
      await this.calendarTab.click();
      await this.page.waitForTimeout(2000);
      
      // Verify calendar is loaded
      await expectAlbanianText(this.page, 'Kalendari');
    }
  }

  /**
   * Navigate to settings
   */
  async navigateToSettings() {
    console.log('⚙️ Navigating to settings...');
    
    if (await this.settingsTab.count() > 0) {
      await this.settingsTab.click();
      await this.page.waitForTimeout(2000);
      
      // Verify settings page
      await expectAlbanianText(this.page, 'Cilësimet');
    }
  }

  /**
   * Navigate to services management
   */
  async navigateToServices() {
    console.log('💼 Navigating to services...');
    
    if (await this.servicesTab.count() > 0) {
      await this.servicesTab.click();
      await this.page.waitForTimeout(2000);
      
      // Verify services page
      await expectAlbanianText(this.page, 'Shërbimet');
    }
  }

  /**
   * Approve an appointment request
   */
  async approveAppointment(cardIndex: number = 0) {
    console.log(`✅ Approving appointment request ${cardIndex}...`);
    
    await this.navigateToPendingRequests();
    
    const cards = this.appointmentCards;
    const cardCount = await cards.count();
    
    if (cardCount === 0) {
      throw new Error('No appointment requests available to approve');
    }
    
    if (cardIndex >= cardCount) {
      throw new Error(`Cannot approve appointment ${cardIndex}: only ${cardCount} requests available`);
    }
    
    const targetCard = cards.nth(cardIndex);
    const approveButton = targetCard.locator('button:has-text("Prano")');
    
    // Get customer info before approval
    const customerInfo = await this.getAppointmentCardInfo(targetCard);
    
    await expect(approveButton).toBeVisible();
    await expect(approveButton).toBeEnabled();
    await approveButton.click();
    
    // Handle confirmation dialog
    await this.page.waitForTimeout(2000);
    const confirmButton = this.page.locator('button:has-text("Konfirmo"), button:has-text("Po")');
    
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
    }
    
    // Wait for success message
    await expect(this.page.locator('text=Rezervimi u aprovua')).toBeVisible({ 
      timeout: TEST_DATA.TIMEOUTS.MEDIUM 
    });
    
    console.log(`✅ Approved appointment for ${customerInfo.name}`);
    return customerInfo;
  }

  /**
   * Decline an appointment request
   */
  async declineAppointment(cardIndex: number = 0, reason?: string) {
    console.log(`❌ Declining appointment request ${cardIndex}...`);
    
    await this.navigateToPendingRequests();
    
    const cards = this.appointmentCards;
    const cardCount = await cards.count();
    
    if (cardCount === 0) {
      throw new Error('No appointment requests available to decline');
    }
    
    if (cardIndex >= cardCount) {
      throw new Error(`Cannot decline appointment ${cardIndex}: only ${cardCount} requests available`);
    }
    
    const targetCard = cards.nth(cardIndex);
    const declineButton = targetCard.locator('button:has-text("Refuzo")');
    
    // Get customer info before decline
    const customerInfo = await this.getAppointmentCardInfo(targetCard);
    
    await expect(declineButton).toBeVisible();
    await expect(declineButton).toBeEnabled();
    await declineButton.click();
    
    // Handle decline reason
    await this.page.waitForTimeout(2000);
    
    const reasonInput = this.page.locator('textarea, input[type="text"]');
    if (await reasonInput.count() > 0 && reason) {
      await reasonInput.fill(reason);
    }
    
    // Confirm decline
    const confirmDeclineButton = this.page.locator('button:has-text("Konfirmo refuzimin"), button:has-text("Refuzo")');
    
    if (await confirmDeclineButton.count() > 0) {
      await confirmDeclineButton.click();
    }
    
    // Wait for success message
    await expect(this.page.locator('text=Rezervimi u refuzua')).toBeVisible({ 
      timeout: TEST_DATA.TIMEOUTS.MEDIUM 
    });
    
    console.log(`❌ Declined appointment for ${customerInfo.name}`);
    return customerInfo;
  }

  /**
   * Get information from an appointment card
   */
  async getAppointmentCardInfo(card: Locator) {
    const info = {
      name: '',
      phone: '',
      service: '',
      date: '',
      time: ''
    };

    try {
      // Extract customer name
      const nameElement = card.locator('text=Emri:').locator('..').first();
      if (await nameElement.count() > 0) {
        const nameText = await nameElement.textContent();
        info.name = nameText?.replace('Emri:', '').trim() || '';
      }

      // Extract phone
      const phoneElement = card.locator('text=Telefoni:').locator('..').first();
      if (await phoneElement.count() > 0) {
        const phoneText = await phoneElement.textContent();
        info.phone = phoneText?.replace('Telefoni:', '').trim() || '';
      }

      // Extract service
      const serviceElement = card.locator('text=Shërbimi:').locator('..').first();
      if (await serviceElement.count() > 0) {
        const serviceText = await serviceElement.textContent();
        info.service = serviceText?.replace('Shërbimi:', '').trim() || '';
      }

    } catch (error) {
      console.warn('⚠️ Could not extract complete appointment card info:', error);
    }

    return info;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const stats = {
      pendingRequests: 0,
      approvedAppointments: 0,
      newCustomers: 0,
      revenue: '0'
    };

    if (await this.statsSection.count() > 0) {
      try {
        // Extract numbers from stats section
        const pendingElement = this.statsSection.locator('text=Kërkesat e Reja').locator('..');
        const approvedElement = this.statsSection.locator('text=Rezervime të Aprovoara').locator('..');
        const customersElement = this.statsSection.locator('text=Klienta të Rinj').locator('..');
        const revenueElement = this.statsSection.locator('text=Të Hyra').locator('..');

        if (await pendingElement.count() > 0) {
          const pendingText = await pendingElement.textContent();
          const match = pendingText?.match(/\d+/);
          if (match) stats.pendingRequests = parseInt(match[0]);
        }

        // Similar extraction for other stats...
        
      } catch (error) {
        console.warn('⚠️ Could not extract dashboard statistics:', error);
      }
    }

    return stats;
  }

  /**
   * Search appointments by customer name or phone
   */
  async searchAppointments(query: string) {
    console.log(`🔍 Searching appointments for: ${query}`);
    
    const searchInput = this.page.locator('input[placeholder*="Kërkoni"], input[type="search"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.fill(query);
      await this.page.waitForTimeout(2000);
      
      // Count filtered results
      const filteredCards = this.appointmentCards;
      const resultCount = await filteredCards.count();
      
      console.log(`Found ${resultCount} appointments matching "${query}"`);
      return resultCount;
    }
    
    return 0;
  }

  /**
   * Verify salon dashboard is mobile responsive
   */
  async verifyMobileLayout() {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.reload();
    await waitForPageLoad(this.page);
    
    // Verify main elements are accessible on mobile
    await expect(this.dashboardTitle).toBeVisible();
    
    // Check mobile navigation
    const mobileMenuButton = this.page.locator('button:has-text("☰"), [role="button"]:has-text("Menu")');
    
    if (await mobileMenuButton.count() > 0) {
      await mobileMenuButton.click();
      await this.page.waitForTimeout(1000);
      
      // Navigation should be accessible
      const navItems = [
        'text=Kërkesat',
        'text=Kalendari',
        'text=Cilësimet'
      ];
      
      let visibleNavItems = 0;
      for (const item of navItems) {
        if (await this.page.locator(item).count() > 0) {
          visibleNavItems++;
        }
      }
      
      expect(visibleNavItems).toBeGreaterThan(0);
    }
    
    console.log('✅ Mobile salon dashboard layout verified');
  }
}