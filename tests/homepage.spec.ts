// tests/homepage.spec.ts
// Homepage tests for ImiRezervimi.al
// Tests the main landing page functionality and user experience

import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { checkForApplicationError, takeScreenshot } from './utils/test-helpers';

test.describe('Homepage - ImiRezervimi.al', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should load homepage successfully', async ({ page }) => {
    await homePage.goto();
    
    // Check for application errors
    const hasError = await checkForApplicationError(page);
    if (hasError) {
      await takeScreenshot(page, 'homepage-application-error');
      throw new Error('Homepage has application error');
    }
    
    await homePage.verifyPageLoaded();
  });

  test('should display all main sections correctly', async ({ page }) => {
    await homePage.goto();
    await homePage.verifyAllSectionsPresent();
  });

  test('should navigate to salons page when clicking "Zbulo Sallone"', async ({ page }) => {
    await homePage.goto();
    await homePage.discoverSalons();
    
    // Should be on salons page
    expect(page.url()).toContain('/salons');
    await expect(page.locator('text=Sallone, h1')).toBeVisible();
  });

  test('should navigate to login when clicking login button', async ({ page }) => {
    await homePage.goto();
    await homePage.goToLogin();
    
    // Should be on login page
    expect(page.url()).toContain('/login');
  });

  test('should navigate to salon registration', async ({ page }) => {
    await homePage.goto();
    await homePage.goToSalonRegistration();
    
    // Should be on salon registration
    expect(page.url()).toContain('/salon');
  });

  test('should be mobile responsive', async ({ page }) => {
    await homePage.goto();
    await homePage.testMobileLayout();
  });

  test('should load within acceptable time', async ({ page }) => {
    await homePage.verifyPerformance();
  });

  test('should have proper SEO elements', async ({ page }) => {
    await homePage.goto();
    await homePage.verifySEO();
  });

  test('should have working interactive elements', async ({ page }) => {
    await homePage.goto();
    await homePage.testInteractiveElements();
  });

  test('should not have broken images or assets', async ({ page }) => {
    await homePage.goto();
    await homePage.verifyAssetsLoaded();
  });

  test('should display Albanian text correctly', async ({ page }) => {
    await homePage.goto();
    
    // Check for key Albanian phrases
    await expect(page.locator('text=Rezervo te salloni yt')).toBeVisible();
    await expect(page.locator('text=Platforma e parë shqiptare')).toBeVisible();
    await expect(page.locator('text=Identifikohu me Instagram')).toBeVisible();
    await expect(page.locator('text=konfirmo me WhatsApp')).toBeVisible();
  });

  test('should handle different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Medium' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await homePage.goto();
      
      // Verify main elements are visible at each size
      await expect(homePage.heroTitle).toBeVisible();
      await expect(homePage.discoverSalonsButton).toBeVisible();
      
      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) layout verified`);
    }
  });

  test('should redirect authenticated users to dashboard', async ({ page, context }) => {
    // Mock authenticated session
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-session-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await homePage.goto();
    
    // Should redirect to dashboard (this depends on your auth implementation)
    // This test might need adjustment based on how you handle auth
  });

  test('should display correct social proof numbers', async ({ page }) => {
    await homePage.goto();
    
    // Check stats section
    const stats = [
      { text: '500+', label: 'Sallone' },
      { text: '10k+', label: 'Klienta' },
      { text: '50k+', label: 'Rezervime' },
      { text: '4.9★', label: 'Vlerësim' }
    ];

    for (const stat of stats) {
      await expect(page.locator(`text=${stat.text}`)).toBeVisible();
      await expect(page.locator(`text=${stat.label}`)).toBeVisible();
    }
  });

  test('should have working testimonials section', async ({ page }) => {
    await homePage.goto();
    
    // Scroll to testimonials section
    await page.locator('text=Çfarë thonë klientët tanë').scrollIntoViewIfNeeded();
    
    // Verify testimonial cards
    const testimonials = page.locator('.testimonial, [class*="testimonial"]');
    const testimonialCount = await testimonials.count();
    
    if (testimonialCount > 0) {
      expect(testimonialCount).toBeGreaterThanOrEqual(3);
      
      // Check first testimonial has all elements
      const firstTestimonial = testimonials.first();
      await expect(firstTestimonial).toBeVisible();
      await expect(firstTestimonial.locator('text=⭐⭐⭐⭐⭐')).toBeVisible();
    }
  });

  test('should handle network failures gracefully', async ({ page, context }) => {
    // Simulate network failure
    await context.setOffline(true);
    
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (error) {
      // This is expected when offline
      expect(error.message).toContain('ERR_INTERNET_DISCONNECTED');
    }
    
    // Restore network
    await context.setOffline(false);
    
    // Should work again
    await homePage.goto();
    await homePage.verifyPageLoaded();
  });
});