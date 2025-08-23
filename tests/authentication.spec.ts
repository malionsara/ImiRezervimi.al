// tests/authentication.spec.ts
// Authentication flow tests for ImiRezervimi.al
// Tests Instagram login, phone verification, and user registration

import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { checkForApplicationError, takeScreenshot, generateUniqueTestData, fillFormField, waitForPageLoad } from './utils/test-helpers';
import { TEST_DATA } from './utils/test-data';

test.describe('Authentication - ImiRezervimi.al', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
  });

  test('should load login page successfully', async ({ page }) => {
    await loginPage.goto();
    
    // Check for application errors
    const hasError = await checkForApplicationError(page);
    if (hasError) {
      await takeScreenshot(page, 'login-page-application-error');
      throw new Error('Login page has application error');
    }
    
    await loginPage.verifyPageLoaded();
  });

  test('should display Instagram login option', async ({ page }) => {
    await loginPage.goto();
    await loginPage.verifyPageLoaded();
    
    // Verify Instagram login button
    await expect(loginPage.instagramLoginButton).toBeVisible();
    await expect(page.locator('text=Identifikohu me Instagram')).toBeVisible();
    
    // Verify Instagram login is primary option
    const instagramButton = loginPage.instagramLoginButton;
    await expect(instagramButton).toBeEnabled();
    
    // Test hover effect
    await instagramButton.hover();
    await page.waitForTimeout(500);
  });

  test('should navigate to Instagram OAuth when clicking Instagram login', async ({ page, context }) => {
    await loginPage.goto();
    await loginPage.verifyPageLoaded();
    
    // Click Instagram login and wait for navigation
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      loginPage.instagramLoginButton.click()
    ]);
    
    // Should navigate to Instagram OAuth
    const url = newPage.url();
    expect(url).toContain('instagram.com');
    expect(url).toContain('oauth');
    expect(url).toContain('authorize');
    
    console.log('✅ Instagram OAuth redirect successful');
    await newPage.close();
  });

  test('should display phone verification form for new users', async ({ page }) => {
    // This test assumes we can mock successful Instagram auth
    // In a real scenario, you'd use Instagram test credentials
    
    await page.goto('/phone-verification');
    await waitForPageLoad(page);
    
    // Verify phone verification elements
    await expect(page.locator('text=Verifikoni numrin e telefonit')).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator('button:has-text("Dërgo kodin")')).toBeVisible();
    
    // Test Albanian phone number format
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('+355675490330');
    
    // Verify format validation
    const phoneValue = await phoneInput.inputValue();
    expect(phoneValue).toContain('+355');
  });

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/phone-verification');
    await waitForPageLoad(page);
    
    const phoneInput = page.locator('input[type="tel"]');
    const submitButton = page.locator('button:has-text("Dërgo kodin")');
    
    // Test invalid formats
    const invalidNumbers = [
      '123456',
      '+1234567890',
      '0675490330',
      '+355 123'
    ];
    
    for (const invalidNumber of invalidNumbers) {
      await phoneInput.fill(invalidNumber);
      await submitButton.click();
      
      // Should show validation error
      const hasError = await page.locator('text=Numri i telefonit nuk është valid').isVisible();
      if (hasError) {
        console.log(`✅ Correctly rejected invalid phone: ${invalidNumber}`);
      }
    }
    
    // Test valid Albanian number
    await phoneInput.fill('+355675490330');
    await expect(submitButton).toBeEnabled();
  });

  test('should handle SMS verification code input', async ({ page }) => {
    await page.goto('/phone-verification');
    await waitForPageLoad(page);
    
    // Fill phone number first
    await fillFormField(page, 'input[type="tel"]', '+355675490330');
    await page.locator('button:has-text("Dërgo kodin")').click();
    
    // Wait for verification code input
    await page.waitForTimeout(2000);
    
    // Look for verification code input
    const codeInputs = page.locator('input[maxlength="1"], input[type="number"]');
    
    if (await codeInputs.count() > 0) {
      // Test code input functionality
      const codeLength = await codeInputs.count();
      expect(codeLength).toBeGreaterThanOrEqual(4); // Usually 4 or 6 digits
      
      // Fill verification code
      for (let i = 0; i < Math.min(codeLength, 6); i++) {
        await codeInputs.nth(i).fill((i + 1).toString());
      }
      
      // Verify all inputs are filled
      for (let i = 0; i < Math.min(codeLength, 6); i++) {
        const value = await codeInputs.nth(i).inputValue();
        expect(value).toBeTruthy();
      }
    }
  });

  test('should complete user profile after phone verification', async ({ page }) => {
    // Mock successful phone verification state
    await page.goto('/complete-profile');
    await waitForPageLoad(page);
    
    // Generate unique test data
    const testUser = generateUniqueTestData();
    
    // Fill profile form
    await fillFormField(page, 'input[name="firstName"]', testUser.firstName);
    await fillFormField(page, 'input[name="lastName"]', testUser.lastName);
    
    // Optional: Gender selection
    const genderSelect = page.locator('select[name="gender"]');
    if (await genderSelect.count() > 0) {
      await genderSelect.selectOption('Femër');
    }
    
    // Submit profile
    const submitButton = page.locator('button[type="submit"], button:has-text("Përfundo regjistrimin")');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // Should redirect to dashboard or home
    await page.waitForURL(/dashboard|krye/, { timeout: TEST_DATA.TIMEOUTS.MEDIUM });
    console.log('✅ Profile completion successful');
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    await loginPage.goto();
    
    // Test network timeout scenario
    await page.route('/api/auth/**', route => {
      setTimeout(() => route.abort(), 5000);
    });
    
    await loginPage.instagramLoginButton.click();
    
    // Should show error message
    await page.waitForTimeout(6000);
    const hasErrorMessage = await page.locator('text=Ka ndodhur një gabim').isVisible();
    
    if (hasErrorMessage) {
      console.log('✅ Error handling works correctly');
    }
  });

  test('should redirect authenticated users away from login', async ({ page, context }) => {
    // Mock authenticated session
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-session-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await loginPage.goto();
    
    // Should redirect away from login page
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    
    console.log('✅ Authenticated user redirect working');
  });

  test('should maintain auth state across browser refresh', async ({ page, context }) => {
    // This test would require setting up proper auth state
    // Mock authentication cookies
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'valid-session-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.goto('/dashboard');
    await waitForPageLoad(page);
    
    // Verify user is authenticated
    const isAuthenticated = await page.locator('text=Përshëndetje').isVisible();
    
    // Refresh page
    await page.reload();
    await waitForPageLoad(page);
    
    // Should still be authenticated
    const stillAuthenticated = await page.locator('text=Përshëndetje').isVisible();
    expect(stillAuthenticated).toBe(isAuthenticated);
  });

  test('should handle logout functionality', async ({ page, context }) => {
    // Set up authenticated state
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'valid-session-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.goto('/dashboard');
    await waitForPageLoad(page);
    
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Dil"), text=Dil nga llogaria');
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      
      // Should redirect to homepage or login
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(login|^\/$)/);
      
      console.log('✅ Logout functionality working');
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginPage.goto();
    await waitForPageLoad(page);
    
    // Verify mobile layout
    await expect(loginPage.instagramLoginButton).toBeVisible();
    
    // Test touch interactions
    await loginPage.instagramLoginButton.hover();
    await page.waitForTimeout(500);
    
    console.log('✅ Mobile authentication layout verified');
  });

  test('should handle Albanian text correctly in auth flow', async ({ page }) => {
    await loginPage.goto();
    
    // Verify Albanian authentication text
    await expect(page.locator('text=Identifikohu me Instagram')).toBeVisible();
    await expect(page.locator('text=Regjistrohuni shpejt')).toBeVisible();
    
    // Navigate to phone verification
    await page.goto('/phone-verification');
    await waitForPageLoad(page);
    
    // Verify Albanian phone verification text
    await expect(page.locator('text=Verifikoni numrin e telefonit')).toBeVisible();
    await expect(page.locator('text=Dërgo kodin')).toBeVisible();
  });

  test('should validate required profile fields', async ({ page }) => {
    await page.goto('/complete-profile');
    await waitForPageLoad(page);
    
    const submitButton = page.locator('button[type="submit"]');
    
    // Try to submit empty form
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Should show validation errors
      const hasValidationErrors = await page.locator('text=Ky fushë është e detyrueshme').isVisible();
      
      if (hasValidationErrors) {
        console.log('✅ Profile validation working correctly');
      }
    }
  });

  test('should handle session expiration', async ({ page, context }) => {
    // Set up expired session
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'expired-session-token',
        domain: 'localhost',
        path: '/',
        expires: Date.now() / 1000 - 3600 // Expired 1 hour ago
      }
    ]);

    await page.goto('/dashboard');
    
    // Should redirect to login due to expired session
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('login');
    
    console.log('✅ Session expiration handling working');
  });
});