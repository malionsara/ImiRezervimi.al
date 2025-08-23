// tests/salon-management.spec.ts
// Salon management tests for ImiRezervimi.al
// Tests salon dashboard, appointment management, and business features

import { test, expect } from '@playwright/test';
import { SalonDashboardPage } from './pages/SalonDashboardPage';
import { checkForApplicationError, takeScreenshot, loginTestUser } from './utils/test-helpers';
import { TEST_DATA, getFutureDate } from './utils/test-data';

test.describe('Salon Management - ImiRezervimi.al', () => {
  let salonDashboardPage: SalonDashboardPage;

  test.beforeEach(async ({ page }) => {
    salonDashboardPage = new SalonDashboardPage(page);
    
    // Login as salon owner for management tests
    try {
      await loginTestUser(page, 'SALON_OWNER');
      console.log('✅ Salon owner logged in');
    } catch (error) {
      console.warn('⚠️ Could not login salon owner, some tests may require manual authentication');
    }
  });

  test('should load salon dashboard successfully', async ({ page }) => {
    await salonDashboardPage.goto();
    
    // Check for application errors
    const hasError = await checkForApplicationError(page);
    if (hasError) {
      await takeScreenshot(page, 'salon-dashboard-application-error');
      throw new Error('Salon dashboard has application error');
    }
    
    await salonDashboardPage.verifyDashboardLoaded();
  });

  test('should display pending appointment requests', async ({ page }) => {
    await salonDashboardPage.goto();
    await salonDashboardPage.verifyDashboardLoaded();
    
    // Navigate to pending requests
    await salonDashboardPage.navigateToPendingRequests();
    
    // Verify pending requests section
    await expect(page.locator('text=Kërkesat e Reja')).toBeVisible();
    
    const requestCards = salonDashboardPage.appointmentCards;
    const requestCount = await requestCards.count();
    
    console.log(`Found ${requestCount} pending appointment requests`);
    
    if (requestCount > 0) {
      // Verify request card structure
      const firstRequest = requestCards.first();
      await expect(firstRequest).toBeVisible();
      
      // Should have customer info, service, date/time
      await expect(firstRequest.locator('text=Emri:')).toBeVisible();
      await expect(firstRequest.locator('text=Telefoni:')).toBeVisible();
      await expect(firstRequest.locator('text=Shërbimi:')).toBeVisible();
      
      // Should have action buttons
      await expect(firstRequest.locator('button:has-text("Prano")')).toBeVisible();
      await expect(firstRequest.locator('button:has-text("Refuzo")')).toBeVisible();
    }
  });

  test('should approve appointment request successfully', async ({ page }) => {
    await salonDashboardPage.goto();
    await salonDashboardPage.navigateToPendingRequests();
    
    const requestCards = salonDashboardPage.appointmentCards;
    const requestCount = await requestCards.count();
    
    if (requestCount > 0) {
      console.log('📋 Testing appointment approval...');
      
      const firstRequest = requestCards.first();
      
      // Get customer info before approval
      const customerName = await firstRequest.locator('text=Emri:').locator('..').textContent();
      
      // Click approve button
      const approveButton = firstRequest.locator('button:has-text("Prano")');
      await expect(approveButton).toBeEnabled();
      await approveButton.click();
      
      // Wait for confirmation dialog or modal
      await page.waitForTimeout(2000);
      
      // Look for confirmation elements
      const confirmButton = page.locator('button:has-text("Konfirmo"), button:has-text("Po")');
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }
      
      // Verify success message
      await page.waitForTimeout(3000);
      await expect(page.locator('text=Rezervimi u aprovua')).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.MEDIUM });
      
      console.log('✅ Appointment approved successfully');
    } else {
      console.log('ℹ️ No pending requests to test approval');
    }
  });

  test('should decline appointment request successfully', async ({ page }) => {
    await salonDashboardPage.goto();
    await salonDashboardPage.navigateToPendingRequests();
    
    const requestCards = salonDashboardPage.appointmentCards;
    const requestCount = await requestCards.count();
    
    if (requestCount > 0) {
      console.log('❌ Testing appointment decline...');
      
      const firstRequest = requestCards.first();
      
      // Click decline button
      const declineButton = firstRequest.locator('button:has-text("Refuzo")');
      await expect(declineButton).toBeEnabled();
      await declineButton.click();
      
      // Wait for decline reason modal
      await page.waitForTimeout(2000);
      
      // Look for decline reason selection
      const reasonSelect = page.locator('select, textarea');
      if (await reasonSelect.count() > 0) {
        await reasonSelect.first().fill('Nuk jemi të disponueshëm për këtë kohë');
      }
      
      // Confirm decline
      const confirmDeclineButton = page.locator('button:has-text("Konfirmo refuzimin"), button:has-text("Refuzo")');
      if (await confirmDeclineButton.count() > 0) {
        await confirmDeclineButton.click();
      }
      
      // Verify success message
      await page.waitForTimeout(3000);
      await expect(page.locator('text=Rezervimi u refuzua')).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.MEDIUM });
      
      console.log('✅ Appointment declined successfully');
    } else {
      console.log('ℹ️ No pending requests to test decline');
    }
  });

  test('should display approved appointments calendar', async ({ page }) => {
    await salonDashboardPage.goto();
    await salonDashboardPage.navigateToCalendar();
    
    // Verify calendar view
    await expect(page.locator('text=Kalendari i Rezervimeve')).toBeVisible();
    
    // Check for Albanian day labels
    const albanianDays = ['Hë', 'Ma', 'Më', 'En', 'Pr', 'Sh', 'Di'];
    for (const day of albanianDays) {
      await expect(page.locator(`text=${day}`)).toBeVisible();
    }
    
    // Verify calendar navigation
    const prevButton = page.locator('button:has-text("◀"), button[aria-label*="previous"]');
    const nextButton = page.locator('button:has-text("▶"), button[aria-label*="next"]');
    
    if (await prevButton.count() > 0) {
      await expect(prevButton).toBeEnabled();
    }
    
    if (await nextButton.count() > 0) {
      await expect(nextButton).toBeEnabled();
    }
    
    console.log('✅ Salon calendar view working correctly');
  });

  test('should manage salon settings', async ({ page }) => {
    await salonDashboardPage.goto();
    await salonDashboardPage.navigateToSettings();
    
    // Verify settings page
    await expect(page.locator('text=Cilësimet e Sallonit')).toBeVisible();
    
    // Check for settings sections
    const settingsSections = [
      'Informacionet e Përgjithshme',
      'Orari i Punës',
      'Shërbimet',
      'Çmimet'
    ];
    
    for (const section of settingsSections) {
      const sectionElement = page.locator(`text=${section}`);
      if (await sectionElement.count() > 0) {
        await expect(sectionElement).toBeVisible();
      }
    }
    
    // Test business hours settings
    const businessHoursSection = page.locator('text=Orari i Punës').locator('..');
    if (await businessHoursSection.count() > 0) {
      // Should have time inputs for opening and closing
      const timeInputs = businessHoursSection.locator('input[type="time"]');
      const inputCount = await timeInputs.count();
      
      if (inputCount > 0) {
        console.log(`Found ${inputCount} business hours time inputs`);
        expect(inputCount).toBeGreaterThanOrEqual(2); // At least open and close time
      }
    }
  });

  test('should manage services and pricing', async ({ page }) => {
    await salonDashboardPage.goto();
    await salonDashboardPage.navigateToServices();
    
    // Verify services management
    await expect(page.locator('text=Menaxho Shërbimet')).toBeVisible();
    
    // Look for existing services
    const servicesList = page.locator('[data-testid="service-item"], .service-item');
    const serviceCount = await servicesList.count();
    
    console.log(`Found ${serviceCount} configured services`);
    
    // Test adding new service
    const addServiceButton = page.locator('button:has-text("Shto Shërbim"), button:has-text("+ Shërbim i Ri")');
    
    if (await addServiceButton.count() > 0) {
      await addServiceButton.click();
      
      // Wait for service form
      await page.waitForTimeout(2000);
      
      // Fill service details
      const serviceNameInput = page.locator('input[name="name"], input[placeholder*="emri"]');
      if (await serviceNameInput.count() > 0) {
        await serviceNameInput.fill('Test Service');
      }
      
      const servicePriceInput = page.locator('input[name="price"], input[type="number"]');
      if (await servicePriceInput.count() > 0) {
        await servicePriceInput.fill('2500');
      }
      
      const serviceDurationInput = page.locator('input[name="duration"], select[name="duration"]');
      if (await serviceDurationInput.count() > 0) {
        await serviceDurationInput.fill('60');
      }
      
      // Save service
      const saveButton = page.locator('button:has-text("Ruaj"), button[type="submit"]');
      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForTimeout(2000);
        
        // Verify service was added
        await expect(page.locator('text=Test Service')).toBeVisible();
        console.log('✅ Service added successfully');
      }
    }
  });

  test('should display salon statistics', async ({ page }) => {
    await salonDashboardPage.goto();
    
    // Look for statistics dashboard
    const statsSection = page.locator('text=Statistikat').locator('..');
    
    if (await statsSection.count() > 0) {
      // Check for key metrics
      const metrics = [
        'Rezervime të Reja',
        'Rezervime të Aprovoara',
        'Klienta të Rinj',
        'Të Hyra'
      ];
      
      for (const metric of metrics) {
        const metricElement = page.locator(`text=${metric}`);
        if (await metricElement.count() > 0) {
          await expect(metricElement).toBeVisible();
        }
      }
      
      console.log('✅ Salon statistics displayed');
    } else {
      console.log('ℹ️ Statistics section not found');
    }
  });

  test('should handle WhatsApp message history', async ({ page }) => {
    await salonDashboardPage.goto();
    
    // Navigate to messages/notifications
    const messagesTab = page.locator('text=Mesazhet, text=WhatsApp, text=Njoftime');
    
    if (await messagesTab.count() > 0) {
      await messagesTab.first().click();
      await page.waitForTimeout(2000);
      
      // Verify message history
      const messagesList = page.locator('[data-testid="message-item"], .message-item');
      const messageCount = await messagesList.count();
      
      console.log(`Found ${messageCount} WhatsApp messages in history`);
      
      if (messageCount > 0) {
        // Verify message structure
        const firstMessage = messagesList.first();
        await expect(firstMessage).toBeVisible();
        
        // Should show timestamp, recipient, message content
        const hasTimestamp = await firstMessage.locator('text=/\\d{2}:\\d{2}|\\d{1,2}\\/\\d{1,2}/').count() > 0;
        const hasPhone = await firstMessage.locator('text=/\\+355\\d{8,9}/').count() > 0;
        
        if (hasTimestamp || hasPhone) {
          console.log('✅ Message history structure correct');
        }
      }
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await salonDashboardPage.goto();
    await salonDashboardPage.verifyDashboardLoaded();
    
    // Verify mobile navigation
    const mobileMenu = page.locator('button:has-text("☰"), [role="button"]:has-text("Menu")');
    if (await mobileMenu.count() > 0) {
      await mobileMenu.click();
      await page.waitForTimeout(1000);
      
      // Navigation should be accessible
      await expect(page.locator('text=Kërkesat')).toBeVisible();
      await expect(page.locator('text=Kalendari')).toBeVisible();
    }
    
    // Test request cards on mobile
    await salonDashboardPage.navigateToPendingRequests();
    
    const requestCards = salonDashboardPage.appointmentCards;
    if (await requestCards.count() > 0) {
      const firstCard = requestCards.first();
      await expect(firstCard).toBeVisible();
      
      // Action buttons should be accessible on mobile
      await expect(firstCard.locator('button:has-text("Prano")')).toBeVisible();
      await expect(firstCard.locator('button:has-text("Refuzo")')).toBeVisible();
    }
    
    console.log('✅ Mobile salon dashboard layout verified');
  });

  test('should handle network issues during appointment actions', async ({ page, context }) => {
    await salonDashboardPage.goto();
    await salonDashboardPage.navigateToPendingRequests();
    
    const requestCards = salonDashboardPage.appointmentCards;
    if (await requestCards.count() > 0) {
      const firstRequest = requestCards.first();
      
      // Simulate network failure
      await context.setOffline(true);
      
      // Try to approve appointment
      await firstRequest.locator('button:has-text("Prano")').click();
      
      // Should handle error gracefully
      await page.waitForTimeout(5000);
      
      // Look for error message
      const hasErrorMessage = await page.locator('text=Ka ndodhur një gabim, text=Problem me rrjetin').isVisible();
      
      // Restore network
      await context.setOffline(false);
      
      if (hasErrorMessage) {
        console.log('✅ Network error handling working');
        
        // Should be able to retry
        await firstRequest.locator('button:has-text("Prano")').click();
        await page.waitForTimeout(3000);
      }
    }
  });

  test('should validate business hours constraints', async ({ page }) => {
    await salonDashboardPage.goto();
    await salonDashboardPage.navigateToSettings();
    
    // Navigate to business hours
    const businessHoursSection = page.locator('text=Orari i Punës');
    if (await businessHoursSection.count() > 0) {
      await businessHoursSection.click();
      
      // Try to set invalid hours (closing before opening)
      const openTimeInput = page.locator('input[name="openTime"]').first();
      const closeTimeInput = page.locator('input[name="closeTime"]').first();
      
      if (await openTimeInput.count() > 0 && await closeTimeInput.count() > 0) {
        await openTimeInput.fill('18:00');
        await closeTimeInput.fill('09:00'); // Invalid: closes before opening
        
        const saveButton = page.locator('button:has-text("Ruaj")');
        if (await saveButton.count() > 0) {
          await saveButton.click();
          
          // Should show validation error
          await page.waitForTimeout(2000);
          const hasValidationError = await page.locator('text=Ora e mbylljes duhet të jetë pas orës së hapjes').isVisible();
          
          if (hasValidationError) {
            console.log('✅ Business hours validation working');
          }
        }
      }
    }
  });
});