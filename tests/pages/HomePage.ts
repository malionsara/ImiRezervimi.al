// tests/pages/HomePage.ts
// Page Object Model for the homepage of ImiRezervimi.al

import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, expectAlbanianText } from '../utils/test-helpers';
import { TEST_DATA } from '../utils/test-data';

export class HomePage {
  readonly page: Page;
  readonly discoverSalonsButton: Locator;
  readonly loginButton: Locator;
  readonly registerSalonButton: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly featuresSection: Locator;
  readonly testimonialsSection: Locator;
  readonly ctaSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.discoverSalonsButton = page.locator('text=Zbulo Sallone').first();
    this.loginButton = page.locator('text=Fillo Tani - FALAS, text=Identifikohu').first();
    this.registerSalonButton = page.locator('text=Regjistro Sallonin, text=Regjistro Sallonin Tënd').first();
    this.heroTitle = page.locator('h1:has-text("Rezervo te salloni yt")');
    this.heroSubtitle = page.locator('text=Platforma e parë shqiptare për rezervime online');
    this.featuresSection = page.locator('#si-funksionon, [id*="features"]');
    this.testimonialsSection = page.locator('text=Çfarë thonë klientët tanë').locator('..');
    this.ctaSection = page.locator('text=Gati për rezervimin tuaj të parë?').locator('..');
  }

  /**
   * Navigate to homepage
   */
  async goto() {
    await this.page.goto(TEST_DATA.URLS.HOME);
    await waitForPageLoad(this.page);
  }

  /**
   * Verify homepage loads correctly
   */
  async verifyPageLoaded() {
    // Check main elements are visible
    await expect(this.heroTitle).toBeVisible();
    await expect(this.heroSubtitle).toBeVisible();
    await expect(this.discoverSalonsButton).toBeVisible();
    
    // Verify Albanian text is present
    await expectAlbanianText(this.page, 'Rezervo te salloni yt');
    await expectAlbanianText(this.page, 'Platforma e parë shqiptare');
  }

  /**
   * Click on "Zbulo Sallone" button
   */
  async discoverSalons() {
    await this.discoverSalonsButton.click();
    await this.page.waitForURL(/salons/, { timeout: TEST_DATA.TIMEOUTS.MEDIUM });
    await waitForPageLoad(this.page);
  }

  /**
   * Click on login/register button
   */
  async goToLogin() {
    await this.loginButton.click();
    await this.page.waitForURL(/login/, { timeout: TEST_DATA.TIMEOUTS.MEDIUM });
    await waitForPageLoad(this.page);
  }

  /**
   * Click on salon registration button
   */
  async goToSalonRegistration() {
    await this.registerSalonButton.click();
    await this.page.waitForURL(/salon/, { timeout: TEST_DATA.TIMEOUTS.MEDIUM });
    await waitForPageLoad(this.page);
  }

  /**
   * Verify all main sections are present
   */
  async verifyAllSectionsPresent() {
    // Hero section
    await expect(this.heroTitle).toBeVisible();
    await expect(this.heroSubtitle).toBeVisible();
    
    // Features section
    await expectAlbanianText(this.page, 'SI FUNKSIONON');
    await expectAlbanianText(this.page, 'Zbulo në Instagram');
    await expectAlbanianText(this.page, 'Rezervo Online');
    await expectAlbanianText(this.page, 'Konfirmo me WhatsApp');
    
    // Salon owner section
    await expectAlbanianText(this.page, 'Je pronare salloni?');
    await expectAlbanianText(this.page, 'Më shumë rezervime');
    
    // Testimonials
    await expectAlbanianText(this.page, 'Çfarë thonë klientët tanë');
    
    // Final CTA
    await expectAlbanianText(this.page, 'Gati për rezervimin tuaj të parë?');
  }

  /**
   * Check for any broken images or missing assets
   */
  async verifyAssetsLoaded() {
    // Check for broken images
    const images = this.page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      
      if (src && !src.startsWith('data:')) {
        // This would be better implemented with actual network request checking
        await expect(img).toBeVisible();
      }
    }
  }

  /**
   * Test responsive design on mobile
   */
  async testMobileLayout() {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.reload();
    await waitForPageLoad(this.page);
    
    // Verify mobile layout
    await expect(this.heroTitle).toBeVisible();
    await expect(this.discoverSalonsButton).toBeVisible();
    
    // Check that mobile navigation works
    const mobileMenuButton = this.page.locator('[role="button"]:has-text("Menu"), button:has-text("☰")');
    if (await mobileMenuButton.count() > 0) {
      await mobileMenuButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Verify page performance (basic checks)
   */
  async verifyPerformance() {
    const startTime = Date.now();
    await this.goto();
    const loadTime = Date.now() - startTime;
    
    // Page should load within reasonable time
    expect(loadTime).toBeLessThan(TEST_DATA.TIMEOUTS.SLOW);
    
    console.log(`📊 Homepage load time: ${loadTime}ms`);
  }

  /**
   * Test all interactive elements
   */
  async testInteractiveElements() {
    // Test all buttons are clickable
    await expect(this.discoverSalonsButton).toBeEnabled();
    await expect(this.loginButton).toBeEnabled();
    await expect(this.registerSalonButton).toBeEnabled();
    
    // Test hover effects (visual regression would be better)
    await this.discoverSalonsButton.hover();
    await this.page.waitForTimeout(500);
    
    await this.loginButton.hover();
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify SEO elements
   */
  async verifySEO() {
    // Check page title
    const title = await this.page.title();
    expect(title).toContain('ImiRezervimi');
    
    // Check meta description
    const metaDescription = this.page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
    
    // Check for proper heading hierarchy
    const h1Count = await this.page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(2); // Should have only one main h1
  }
}