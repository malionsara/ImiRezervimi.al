// tests/pages/LoginPage.ts
// Page Object Model for the login page

import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, expectAlbanianText } from '../utils/test-helpers';
import { TEST_DATA } from '../utils/test-data';

export class LoginPage {
  readonly page: Page;
  readonly instagramLoginButton: Locator;
  readonly phoneVerificationButton: Locator;
  readonly pageTitle: Locator;
  readonly loginForm: Locator;
  readonly phoneInput: Locator;
  readonly verificationCodeInputs: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.instagramLoginButton = page.locator('button:has-text("Identifikohu me Instagram"), [href*="instagram"], text=Identifikohu me Instagram').first();
    this.phoneVerificationButton = page.locator('button:has-text("Dërgo kodin"), button:has-text("Vazhdo me telefon")');
    this.pageTitle = page.locator('h1:has-text("Identifikohu"), h1:has-text("Fillo Tani")');
    this.loginForm = page.locator('form, [role="form"]');
    this.phoneInput = page.locator('input[type="tel"], input[name="phone"]');
    this.verificationCodeInputs = page.locator('input[maxlength="1"], input[type="number"][max="9"]');
    this.submitButton = page.locator('button[type="submit"], button:has-text("Përfundo")');
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto(TEST_DATA.URLS.LOGIN);
    await waitForPageLoad(this.page);
  }

  /**
   * Verify login page loads correctly
   */
  async verifyPageLoaded() {
    // Check for main login elements
    await expect(this.pageTitle).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.MEDIUM });
    await expect(this.instagramLoginButton).toBeVisible();
    
    // Verify Albanian text
    await expectAlbanianText(this.page, 'Identifikohu me Instagram');
    await expectAlbanianText(this.page, 'Platforma e parë shqiptare');
    
    // Check page doesn't have loading state
    await this.page.waitForFunction(
      () => !document.body.textContent?.includes('Po ngarkon...'),
      { timeout: TEST_DATA.TIMEOUTS.FAST }
    );
  }

  /**
   * Click Instagram login button
   */
  async clickInstagramLogin() {
    console.log('🔐 Clicking Instagram login...');
    
    await expect(this.instagramLoginButton).toBeVisible();
    await expect(this.instagramLoginButton).toBeEnabled();
    
    await this.instagramLoginButton.click();
    
    // Wait for navigation or popup
    await this.page.waitForTimeout(2000);
  }

  /**
   * Fill phone number for verification
   */
  async fillPhoneNumber(phone: string = TEST_DATA.USERS.VALID_USER.phone) {
    console.log('📱 Filling phone number...');
    
    await expect(this.phoneInput).toBeVisible();
    await this.phoneInput.fill(phone);
    
    // Verify phone was filled
    const filledValue = await this.phoneInput.inputValue();
    expect(filledValue).toBe(phone);
    
    console.log(`✅ Phone number filled: ${phone}`);
  }

  /**
   * Submit phone for verification
   */
  async submitPhoneVerification() {
    console.log('📤 Submitting phone verification...');
    
    await expect(this.phoneVerificationButton).toBeVisible();
    await expect(this.phoneVerificationButton).toBeEnabled();
    
    await this.phoneVerificationButton.click();
    
    // Wait for verification code inputs to appear
    await this.page.waitForTimeout(3000);
    await expect(this.verificationCodeInputs.first()).toBeVisible({ timeout: TEST_DATA.TIMEOUTS.MEDIUM });
  }

  /**
   * Fill verification code
   */
  async fillVerificationCode(code: string = '123456') {
    console.log('🔢 Filling verification code...');
    
    // Wait for code inputs
    await this.verificationCodeInputs.first().waitFor({ state: 'visible', timeout: TEST_DATA.TIMEOUTS.MEDIUM });
    
    const inputCount = await this.verificationCodeInputs.count();
    console.log(`Found ${inputCount} verification code inputs`);
    
    // Fill each digit
    for (let i = 0; i < Math.min(code.length, inputCount); i++) {
      const input = this.verificationCodeInputs.nth(i);
      await input.fill(code[i]);
      
      // Wait briefly between inputs to simulate natural typing
      await this.page.waitForTimeout(200);
    }
    
    console.log(`✅ Verification code filled: ${code}`);
  }

  /**
   * Submit verification code
   */
  async submitVerificationCode() {
    console.log('✅ Submitting verification code...');
    
    // Look for submit button after code is filled
    const submitBtn = this.page.locator('button:has-text("Konfirmo"), button:has-text("Vazhdo"), button[type="submit"]').first();
    
    if (await submitBtn.count() > 0) {
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();
      
      // Wait for next step
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Complete the full phone verification flow
   */
  async completePhoneVerification(phone?: string, code?: string) {
    console.log('🚀 Starting complete phone verification flow...');
    
    await this.fillPhoneNumber(phone);
    await this.submitPhoneVerification();
    await this.fillVerificationCode(code);
    await this.submitVerificationCode();
    
    console.log('✅ Phone verification flow completed');
  }

  /**
   * Verify user is redirected after successful auth
   */
  async verifyAuthSuccess() {
    // Wait for redirect to dashboard or profile completion
    await this.page.waitForURL(/dashboard|complete-profile|krye/, { timeout: TEST_DATA.TIMEOUTS.SLOW });
    
    // Verify we're no longer on login page
    const currentUrl = this.page.url();
    expect(currentUrl).not.toContain('/login');
    
    console.log(`✅ Authentication successful, redirected to: ${currentUrl}`);
  }

  /**
   * Verify error message appears
   */
  async verifyErrorMessage(expectedError?: string) {
    const errorSelectors = [
      'text=Ka ndodhur një gabim',
      'text=Gabim',
      '.error',
      '[role="alert"]',
      'text=Numri i telefonit nuk është valid'
    ];
    
    let errorFound = false;
    
    for (const selector of errorSelectors) {
      if (await this.page.locator(selector).count() > 0) {
        await expect(this.page.locator(selector)).toBeVisible();
        errorFound = true;
        
        if (expectedError) {
          await expect(this.page.locator(`text=${expectedError}`)).toBeVisible();
        }
        
        break;
      }
    }
    
    expect(errorFound).toBe(true);
    console.log('✅ Error message displayed correctly');
  }

  /**
   * Check if user is already authenticated
   */
  async checkIfAuthenticated(): Promise<boolean> {
    // Check for indicators that user is already logged in
    const authIndicators = [
      'text=Përshëndetje',
      'text=Dashboard',
      'button:has-text("Dil")',
      '[data-testid="user-menu"]'
    ];
    
    for (const indicator of authIndicators) {
      if (await this.page.locator(indicator).count() > 0) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Test mobile layout
   */
  async testMobileLayout() {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.reload();
    await waitForPageLoad(this.page);
    
    // Verify mobile elements are accessible
    await expect(this.instagramLoginButton).toBeVisible();
    await expect(this.pageTitle).toBeVisible();
    
    // Test touch interactions
    await this.instagramLoginButton.hover();
    
    console.log('✅ Mobile login layout verified');
  }
}