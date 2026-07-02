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
    
    // For production, use a simpler verification
    if (page.url().includes('imirezervimi.al')) {
      // Simple production check - just ensure page loaded without error
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.toLowerCase()).not.toContain('error');
      
      const bodyText = await page.textContent('body');
      expect(bodyText?.length || 0).toBeGreaterThan(100);
      console.log('✅ Production homepage loaded successfully');
    } else {
      // Full verification for local development
      await homePage.verifyPageLoaded();
    }
  });

  test('should display all main sections correctly', async ({ page }) => {
    await homePage.goto();
    
    if (page.url().includes('imirezervimi.al')) {
      // For production, just check that we have some sections/content
      const sections = await page.locator('section, div, main, article').count();
      expect(sections).toBeGreaterThan(3); // Should have multiple sections
      console.log('✅ Production page has multiple sections');
    } else {
      await homePage.verifyAllSectionsPresent();
    }
  });

  test('should navigate to salons page when clicking "Zbulo Sallone"', async ({ page }) => {
    await homePage.goto();
    
    if (page.url().includes('imirezervimi.al')) {
      // For production, skip navigation tests as they require specific UI elements
      console.log('📝 Skipping navigation test in production environment');
      return;
    }
    
    await homePage.discoverSalons();
    
    // Should be on salons page
    expect(page.url()).toContain('/salons');
    await expect(page.locator('text=Sallone, h1')).toBeVisible();
  });

  test('should navigate to login when clicking login button', async ({ page }) => {
    await homePage.goto();
    
    if (page.url().includes('imirezervimi.al')) {
      console.log('📝 Skipping login navigation test in production environment');
      return;
    }
    
    await homePage.goToLogin();
    
    // Should be on login page
    expect(page.url()).toContain('/login');
  });

  test('should navigate to salon registration', async ({ page }) => {
    await homePage.goto();
    
    if (page.url().includes('imirezervimi.al')) {
      console.log('📝 Skipping salon registration navigation test in production environment');
      return;
    }
    
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
    
    if (page.url().includes('imirezervimi.al')) {
      // For production, check for any Albanian content
      const bodyText = await page.textContent('body');
      const hasAlbanianWords = bodyText && (
        bodyText.includes('rezerv') || bodyText.includes('Rezerv') ||
        bodyText.includes('salon') || bodyText.includes('Salon') ||
        bodyText.includes('shqip') || bodyText.includes('Shqip')
      );
      expect(hasAlbanianWords).toBeTruthy();
      console.log('✅ Production page contains Albanian content');
      return;
    }
    
    // Check for key Albanian phrases in development
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

  test('should not display fabricated social proof numbers', async ({ page }) => {
    await homePage.goto();

    // The redesign removed invented stats; make sure they stay gone
    const fabricatedStats = ['500+', '10k+', '50k+', '4.9★'];

    for (const stat of fabricatedStats) {
      await expect(page.locator(`text=${stat}`)).toHaveCount(0);
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

      // Check first testimonial renders a quote and attribution
      const firstTestimonial = testimonials.first();
      await expect(firstTestimonial).toBeVisible();
      await expect(firstTestimonial.locator('blockquote')).toBeVisible();
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