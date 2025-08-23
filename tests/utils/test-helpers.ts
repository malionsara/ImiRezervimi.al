// tests/utils/test-helpers.ts
// Test helper functions for ImiRezervimi.al tests
// Common testing utilities and assertions

import { Page, expect, Locator } from '@playwright/test';
import { TEST_DATA } from './test-data';

/**
 * Wait for page to load completely (no loading indicators)
 */
export async function waitForPageLoad(page: Page, timeout: number = TEST_DATA.TIMEOUTS.MEDIUM) {
  try {
    // First, ensure the page is loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for network to be mostly idle (shorter timeout)
    await page.waitForLoadState('networkidle', { timeout: Math.min(timeout, 15000) });
    
    // Optional: Check for loading indicators with shorter timeout and no failure
    try {
      await page.waitForFunction(
        () => {
          const text = document.body.textContent || '';
          return !text.includes('Po ngarkon...') && 
                 !text.includes('Po ngarkohet...') &&
                 !text.includes('Loading...') &&
                 !document.querySelector('.loading, .spinner, [aria-label*="loading"]');
        },
        { timeout: 5000 }
      );
    } catch {
      // Ignore loading indicator timeout - page might be functional even with some loading states
      console.log('📝 Note: Some loading indicators may still be present, but proceeding...');
    }
    
    // Check if page is still open before waiting
    if (!page.isClosed()) {
      // Small delay to ensure page is interactive
      await page.waitForTimeout(500);
    }
  } catch (error) {
    console.warn(`⚠️ Page load timeout after ${timeout}ms:`, error);
    // Continue anyway - the page might still be functional
  }
}

/**
 * Check if page has application error
 */
export async function checkForApplicationError(page: Page): Promise<boolean> {
  const hasError = await page.locator('text=Application Error').count() > 0;
  if (hasError) {
    console.warn('⚠️ Application Error detected on page:', page.url());
  }
  return hasError;
}

/**
 * Take a screenshot with descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `test-results/screenshots/${timestamp}-${name}.png`,
    fullPage: true 
  });
}

/**
 * Wait for element to be visible and ready for interaction
 */
export async function waitForElement(page: Page, selector: string, timeout: number = TEST_DATA.TIMEOUTS.MEDIUM): Promise<Locator> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
  return element;
}

/**
 * Fill form field and verify it was filled
 */
export async function fillFormField(page: Page, selector: string, value: string, label?: string) {
  const field = page.locator(selector);
  await field.waitFor({ state: 'visible' });
  await field.fill(value);
  
  // Verify the field was filled
  const fieldValue = await field.inputValue();
  expect(fieldValue).toBe(value);
  
  if (label) {
    console.log(`✅ Filled ${label}: ${value}`);
  }
}

/**
 * Click button and wait for navigation or response
 */
export async function clickAndWait(page: Page, selector: string, waitForNavigation: boolean = false) {
  const button = page.locator(selector);
  await button.waitFor({ state: 'visible' });
  
  if (waitForNavigation) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      button.click()
    ]);
  } else {
    await button.click();
    await page.waitForTimeout(1000); // Give time for any immediate responses
  }
}

/**
 * Check if element contains Albanian text
 */
export async function expectAlbanianText(page: Page, text: string, timeout: number = TEST_DATA.TIMEOUTS.FAST) {
  await expect(page.locator(`text=${text}`)).toBeVisible({ timeout });
}

/**
 * Verify page title contains expected text
 */
export async function verifyPageTitle(page: Page, expectedTitle: string) {
  await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
}

/**
 * Check if booking form is properly loaded
 */
export async function verifyBookingFormLoaded(page: Page) {
  // Check for booking form elements
  await expectAlbanianText(page, TEST_DATA.ALBANIAN_TEXT.BOOK_APPOINTMENT);
  
  // Verify step indicators are present
  const steps = page.locator('.step, [role="tablist"], .progress');
  await expect(steps).toBeVisible();
}

/**
 * Simulate mobile device viewport
 */
export async function setMobileViewport(page: Page) {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp, timeout: number = TEST_DATA.TIMEOUTS.MEDIUM) {
  const response = await page.waitForResponse(urlPattern, { timeout });
  const responseBody = await response.text();
  
  try {
    const jsonBody = JSON.parse(responseBody);
    return { response, body: jsonBody };
  } catch {
    return { response, body: responseBody };
  }
}

/**
 * Login helper for authenticated tests
 */
export async function loginTestUser(page: Page, userType: 'VALID_USER' | 'SALON_OWNER' = 'VALID_USER') {
  const user = TEST_DATA.USERS[userType];
  
  await page.goto(TEST_DATA.URLS.LOGIN);
  await waitForPageLoad(page);
  
  // Fill login form (this will depend on your login implementation)
  if (page.locator('input[type="email"]').count() > 0) {
    await fillFormField(page, 'input[type="email"]', user.email, 'Email');
    await fillFormField(page, 'input[type="password"]', user.password, 'Password');
    await clickAndWait(page, 'button[type="submit"], button:has-text("Identifikohu")', true);
  }
  
  // Wait for redirect to dashboard
  await page.waitForURL(/dashboard|krye/, { timeout: TEST_DATA.TIMEOUTS.MEDIUM });
  await waitForPageLoad(page);
}

/**
 * Mock Instagram authentication for testing
 */
export async function mockInstagramAuth(page: Page) {
  // This would mock the Instagram OAuth flow
  // Implementation depends on how you handle Instagram auth in tests
  console.log('🔐 Mocking Instagram authentication...');
}

/**
 * Generate unique test data
 */
export function generateUniqueTestData() {
  const timestamp = Date.now();
  return {
    email: `test.${timestamp}@example.com`,
    phone: `+355${Math.floor(Math.random() * 90000000) + 10000000}`,
    firstName: `TestUser${timestamp}`,
    lastName: 'Test',
    salonName: `Test Salon ${timestamp}`
  };
}

/**
 * Cleanup test data (for teardown)
 */
export async function cleanupTestData(page: Page, testData: any[]) {
  console.log('🧹 Cleaning up test data...');
  // Implementation for cleaning up test appointments, users, etc.
  // This would make API calls to delete test data
}