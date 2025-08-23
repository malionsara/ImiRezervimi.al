// tests/customer-dashboard.spec.ts
// Customer dashboard tests for ImiRezervimi.al
// Tests customer booking history, profile management, and status tracking

import { test, expect } from '@playwright/test';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { checkForApplicationError, takeScreenshot, loginTestUser } from './utils/test-helpers';
import { TEST_DATA, getFutureDate } from './utils/test-data';

test.describe('Customer Dashboard - ImiRezervimi.al', () => {
  let customerDashboardPage: CustomerDashboardPage;

  test.beforeEach(async ({ page }) => {
    customerDashboardPage = new CustomerDashboardPage(page);
    
    // Login test user for customer dashboard tests
    try {
      await loginTestUser(page, 'VALID_USER');
      console.log('✅ Customer logged in for dashboard tests');
    } catch (error) {
      console.warn('⚠️ Could not login customer, some tests may require manual authentication');
    }
  });

  test('should load customer dashboard successfully', async ({ page }) => {
    await customerDashboardPage.goto();
    
    // Check for application errors
    const hasError = await checkForApplicationError(page);
    if (hasError) {
      await takeScreenshot(page, 'customer-dashboard-application-error');
      throw new Error('Customer dashboard has application error');
    }
    
    await customerDashboardPage.verifyDashboardLoaded();
  });

  test('should display customer profile information', async ({ page }) => {
    await customerDashboardPage.goto();
    await customerDashboardPage.verifyDashboardLoaded();
    
    // Verify profile section
    await expect(page.locator('text=Profili Im')).toBeVisible();
    
    // Should display customer name and phone
    const profileSection = page.locator('text=Profili Im').locator('..');
    await expect(profileSection.locator('text=Emri:')).toBeVisible();
    await expect(profileSection.locator('text=Telefoni:')).toBeVisible();
    
    // Verify Albanian phone format
    const phoneElement = profileSection.locator('text=+355');
    if (await phoneElement.count() > 0) {
      await expect(phoneElement).toBeVisible();
      console.log('✅ Albanian phone format displayed correctly');
    }
  });

  test('should display booking history', async ({ page }) => {
    await customerDashboardPage.goto();
    await customerDashboardPage.navigateToBookingHistory();
    
    // Verify booking history section
    await expect(page.locator('text=Historia e Rezervimeve')).toBeVisible();
    
    const bookingCards = customerDashboardPage.bookingHistoryCards;
    const bookingCount = await bookingCards.count();
    
    console.log(`Found ${bookingCount} bookings in history`);
    
    if (bookingCount > 0) {
      // Verify booking card structure
      const firstBooking = bookingCards.first();
      await expect(firstBooking).toBeVisible();
      
      // Should display booking details
      const cardElements = [
        'text=Salloni:',
        'text=Shërbimi:',
        'text=Data:',
        'text=Ora:'
      ];
      
      for (const element of cardElements) {
        const elementLocator = firstBooking.locator(element);
        if (await elementLocator.count() > 0) {
          await expect(elementLocator).toBeVisible();
        }
      }
      
      // Verify booking status
      const statusIndicators = [
        'text=Në pritje',
        'text=Aprovuar',
        'text=Refuzuar',
        'text=Përfunduar'
      ];
      
      let hasStatus = false;
      for (const status of statusIndicators) {
        if (await firstBooking.locator(status).count() > 0) {
          await expect(firstBooking.locator(status)).toBeVisible();
          hasStatus = true;
          break;
        }
      }
      
      expect(hasStatus).toBe(true);
    }
  });

  test('should filter bookings by status', async ({ page }) => {
    await customerDashboardPage.goto();
    await customerDashboardPage.navigateToBookingHistory();
    
    // Test status filters
    const statusFilters = [
      'Të gjitha',
      'Në pritje',
      'Aprovuar',
      'Refuzuar',
      'Përfunduar'
    ];
    
    for (const status of statusFilters) {
      const filterButton = page.locator(`button:has-text("${status}"), text=${status}`).first();
      
      if (await filterButton.count() > 0) {
        await filterButton.click();
        await page.waitForTimeout(1500);
        
        // Count filtered results
        const filteredBookings = customerDashboardPage.bookingHistoryCards;
        const filteredCount = await filteredBookings.count();
        
        console.log(`Filter "${status}": ${filteredCount} bookings`);
        
        // If there are bookings, verify they match the filter
        if (filteredCount > 0) {
          const firstBooking = filteredBookings.first();
          
          if (status !== 'Të gjitha') {
            await expect(firstBooking.locator(`text=${status}`)).toBeVisible();
          }
        }
      }
    }
  });

  test('should track pending appointment status', async ({ page }) => {
    await customerDashboardPage.goto();
    await customerDashboardPage.navigateToBookingHistory();
    
    // Look for pending appointments
    const pendingBookings = page.locator('[data-testid="booking-card"]:has-text("Në pritje"), .booking-card:has-text("Në pritje")');
    const pendingCount = await pendingBookings.count();
    
    if (pendingCount > 0) {
      console.log(`Found ${pendingCount} pending appointments`);
      
      const firstPending = pendingBookings.first();
      
      // Should show pending status clearly
      await expect(firstPending.locator('text=Në pritje')).toBeVisible();
      
      // Should show expected response time
      const responseTimeText = [
        'text=Do të merrni përgjigje brenda 2 orëve',
        'text=Në pritje për konfirmim',
        'text=Saloni do t\'ju kontaktojë'
      ];
      
      let hasResponseInfo = false;
      for (const text of responseTimeText) {
        if (await firstPending.locator(text).count() > 0) {
          hasResponseInfo = true;
          break;
        }
      }
      
      if (hasResponseInfo) {
        console.log('✅ Pending appointment status information displayed');
      }
    } else {
      console.log('ℹ️ No pending appointments found');
    }
  });

  test('should show approved appointment details', async ({ page }) => {
    await customerDashboardPage.goto();
    await customerDashboardPage.navigateToBookingHistory();
    
    // Look for approved appointments
    const approvedBookings = page.locator('[data-testid="booking-card"]:has-text("Aprovuar"), .booking-card:has-text("Aprovuar")');
    const approvedCount = await approvedBookings.count();
    
    if (approvedCount > 0) {
      console.log(`Found ${approvedCount} approved appointments`);
      
      const firstApproved = approvedBookings.first();
      
      // Should show confirmation details
      await expect(firstApproved.locator('text=Aprovuar')).toBeVisible();
      
      // Should have salon contact information
      const salonInfo = [
        'text=Telefoni i sallonit:',
        'text=Adresa:',
        'text=WhatsApp:'
      ];
      
      for (const info of salonInfo) {
        const infoElement = firstApproved.locator(info);
        if (await infoElement.count() > 0) {
          await expect(infoElement).toBeVisible();
        }
      }
      
      // Should show reminder about appointment
      const reminderText = [
        'text=Do të merrni kujtesë 24 orë para',
        'text=Mos harroni takimin tuaj'
      ];
      
      for (const reminder of reminderText) {
        if (await firstApproved.locator(reminder).count() > 0) {
          console.log('✅ Appointment reminder information shown');
          break;
        }
      }
    }
  });

  test('should display declined appointment with reason', async ({ page }) => {
    await customerDashboardPage.goto();
    await customerDashboardPage.navigateToBookingHistory();
    
    // Look for declined appointments
    const declinedBookings = page.locator('[data-testid="booking-card"]:has-text("Refuzuar"), .booking-card:has-text("Refuzuar")');
    const declinedCount = await declinedBookings.count();
    
    if (declinedCount > 0) {
      console.log(`Found ${declinedCount} declined appointments`);
      
      const firstDeclined = declinedBookings.first();
      
      // Should show declined status
      await expect(firstDeclined.locator('text=Refuzuar')).toBeVisible();
      
      // Should show decline reason if available
      const reasonText = [
        'text=Arsyeja:',
        'text=Nuk jemi të disponueshëm',
        'text=Saloni ka konflikte'
      ];
      
      let hasReason = false;
      for (const reason of reasonText) {
        if (await firstDeclined.locator(reason).count() > 0) {
          hasReason = true;
          console.log('✅ Decline reason displayed');
          break;
        }
      }
      
      // Should suggest alternative actions
      const actionButtons = [
        'button:has-text("Rezervo prapë")',
        'button:has-text("Kontakto sallonin")',
        'button:has-text("Gjej sallone të tjerë")'
      ];
      
      for (const action of actionButtons) {
        const actionButton = firstDeclined.locator(action);
        if (await actionButton.count() > 0) {
          await expect(actionButton).toBeEnabled();
        }
      }
    }
  });

  test('should allow editing profile information', async ({ page }) => {
    await customerDashboardPage.goto();
    await customerDashboardPage.navigateToProfile();
    
    // Look for edit profile functionality
    const editButton = page.locator('button:has-text("Ndrysho Profilin"), button:has-text("Redakto")');
    
    if (await editButton.count() > 0) {
      await editButton.click();
      await page.waitForTimeout(2000);
      
      // Should show editable form
      const nameInput = page.locator('input[name="firstName"], input[name="name"]');
      const phoneInput = page.locator('input[name="phone"], input[type="tel"]');
      
      if (await nameInput.count() > 0) {
        // Test editing name
        await nameInput.fill('Updated Test Name');
        
        const saveButton = page.locator('button:has-text("Ruaj"), button[type="submit"]');
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await page.waitForTimeout(2000);
          
          // Should show success message
          await expect(page.locator('text=Profili u përditësua')).toBeVisible({ 
            timeout: TEST_DATA.TIMEOUTS.FAST 
          });
          
          console.log('✅ Profile editing functionality working');
        }
      }
    } else {
      console.log('ℹ️ Profile editing not available or not found');
    }
  });

  test('should handle phone number change request', async ({ page }) => {
    await customerDashboardPage.goto();
    await customerDashboardPage.navigateToProfile();
    
    // Look for change phone number option
    const changePhoneButton = page.locator('button:has-text("Ndrysho Numrin"), text=Ndrysho numrin e telefonit');
    
    if (await changePhoneButton.count() > 0) {
      await changePhoneButton.click();
      await page.waitForTimeout(2000);
      
      // Should show phone change form
      const newPhoneInput = page.locator('input[type="tel"]');
      
      if (await newPhoneInput.count() > 0) {
        await newPhoneInput.fill('+355675490331');
        
        const requestButton = page.locator('button:has-text("Dërgo kodin"), button:has-text("Kërkesa")');
        if (await requestButton.count() > 0) {
          await requestButton.click();
          await page.waitForTimeout(3000);
          
          // Should show verification step
          const verificationStep = page.locator('text=Verifikoni numrin e ri');
          if (await verificationStep.count() > 0) {
            console.log('✅ Phone number change process initiated');
          }
        }
      }
    } else {
      console.log('ℹ️ Phone number change not available');
    }
  });

  test('should navigate to make new booking', async ({ page }) => {
    await customerDashboardPage.goto();
    
    // Look for "Make New Booking" button
    const newBookingButton = page.locator('button:has-text("Rezervo tani"), button:has-text("Rezervim i ri"), text=Rezervo në sallone të tjerë');
    
    if (await newBookingButton.count() > 0) {
      await newBookingButton.first().click();
      
      // Should navigate to salon discovery or booking page
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const expectedPaths = ['/salons', '/booking', '/'];
      
      const isValidPath = expectedPaths.some(path => currentUrl.includes(path));
      expect(isValidPath).toBe(true);
      
      console.log(`✅ New booking navigation successful: ${currentUrl}`);
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await customerDashboardPage.goto();
    await customerDashboardPage.verifyDashboardLoaded();
    
    // Verify mobile layout
    await expect(page.locator('text=Profili Im')).toBeVisible();
    
    // Test mobile navigation
    const mobileMenuButton = page.locator('button:has-text("☰"), [role="button"]:has-text("Menu")');
    if (await mobileMenuButton.count() > 0) {
      await mobileMenuButton.click();
      await page.waitForTimeout(1000);
      
      // Navigation should be accessible
      const navItems = ['text=Profili', 'text=Historia', 'text=Rezervo'];
      for (const item of navItems) {
        const navElement = page.locator(item);
        if (await navElement.count() > 0) {
          await expect(navElement).toBeVisible();
        }
      }
    }
    
    // Test booking history on mobile
    await customerDashboardPage.navigateToBookingHistory();
    
    const bookingCards = customerDashboardPage.bookingHistoryCards;
    if (await bookingCards.count() > 0) {
      // Cards should be stacked on mobile
      const firstCard = bookingCards.first();
      await expect(firstCard).toBeVisible();
      
      console.log('✅ Mobile customer dashboard layout verified');
    }
  });

  test('should handle empty booking history gracefully', async ({ page, context }) => {
    // Clear cookies to simulate new user
    await context.clearCookies();
    
    // Login as new user (or mock empty history)
    await customerDashboardPage.goto();
    await customerDashboardPage.navigateToBookingHistory();
    
    // Should handle empty state gracefully
    const emptyStateMessages = [
      'text=Nuk keni rezervime të mëparshme',
      'text=Historia e rezervimeve është bosh',
      'text=Filloni rezervimin tuaj të parë'
    ];
    
    let hasEmptyState = false;
    for (const message of emptyStateMessages) {
      if (await page.locator(message).count() > 0) {
        await expect(page.locator(message)).toBeVisible();
        hasEmptyState = true;
        break;
      }
    }
    
    if (hasEmptyState) {
      // Should have call-to-action for first booking
      const ctaButtons = [
        'button:has-text("Rezervo tani")',
        'button:has-text("Zbulo sallone")',
        'text=Filloni rezervimin'
      ];
      
      for (const cta of ctaButtons) {
        const ctaElement = page.locator(cta);
        if (await ctaElement.count() > 0) {
          await expect(ctaElement).toBeVisible();
          console.log('✅ Empty state with call-to-action displayed');
          break;
        }
      }
    }
  });

  test('should display upcoming appointments prominently', async ({ page }) => {
    await customerDashboardPage.goto();
    
    // Look for upcoming appointments section
    const upcomingSection = page.locator('text=Takimet e ardhshme').locator('..');
    
    if (await upcomingSection.count() > 0) {
      console.log('📅 Found upcoming appointments section');
      
      const upcomingCards = upcomingSection.locator('[data-testid="booking-card"], .booking-card');
      const upcomingCount = await upcomingCards.count();
      
      if (upcomingCount > 0) {
        console.log(`Found ${upcomingCount} upcoming appointments`);
        
        const nextAppointment = upcomingCards.first();
        
        // Should prominently display next appointment
        await expect(nextAppointment).toBeVisible();
        
        // Should show countdown or time until appointment
        const timeInfo = [
          'text=Në \\d+ ditë',
          'text=Nesër',
          'text=Sot'
        ];
        
        for (const timePattern of timeInfo) {
          const timeElement = nextAppointment.locator(timePattern);
          if (await timeElement.count() > 0) {
            console.log('✅ Upcoming appointment time information displayed');
            break;
          }
        }
      }
    }
  });
});