// tests/ui-audit-screenshots.spec.ts
// Automated screenshot capture for UI audit documentation
// Captures screenshots at multiple viewports for designer handoff

import { test, expect } from '@playwright/test';
import { checkForApplicationError, takeScreenshot, loginTestUser } from './utils/test-helpers';

// Viewport configurations for testing
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080, name: 'Desktop' },
  tablet: { width: 768, height: 1024, name: 'Tablet' },
  mobile: { width: 375, height: 667, name: 'Mobile' }
};

// Page configurations
const PAGES = {
  // Customer pages
  homepage: { url: '/', name: 'Homepage', category: 'customer' },
  login: { url: '/login', name: 'Login', category: 'customer' },
  dashboard: { url: '/dashboard', name: 'Customer Dashboard', category: 'customer' },
  salons: { url: '/salons', name: 'Salons List', category: 'customer' },
  
  // Salon pages  
  salonLogin: { url: '/login-salon', name: 'Salon Login', category: 'salon' },
  salonDashboard: { url: '/salon/dashboard?salonId=test', name: 'Salon Dashboard', category: 'salon' },
  
  // Admin pages
  admin: { url: '/admin', name: 'Admin Auth', category: 'admin' },
  adminDashboard: { url: '/admin/dashboard', name: 'Admin Dashboard', category: 'admin' }
};

test.describe('UI Audit Screenshots', () => {
  
  // Helper function to capture screenshots for a page
  async function capturePageScreenshots(page: any, pageConfig: any) {
    const { url, name, category } = pageConfig;
    
    console.log(`📸 Capturing screenshots for ${name}...`);
    
    // Navigate to page
    await page.goto(url);
    
    // Check for application errors
    const hasError = await checkForApplicationError(page);
    if (hasError) {
      console.warn(`⚠️ Application error detected on ${name}`);
    }
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Capture screenshots for each viewport
    for (const [viewportKey, viewport] of Object.entries(VIEWPORTS)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Wait a bit for layout to adjust
      await page.waitForTimeout(1000);
      
      // Take full page screenshot
      const screenshotPath = `docs/ui-audit/${category}-pages/${name.toLowerCase().replace(/\s+/g, '-')}-${viewportKey}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log(`✅ Captured ${viewport.name} screenshot: ${screenshotPath}`);
    }
  }

  // Customer Pages
  test('Capture customer page screenshots', async ({ page }) => {
    const customerPages = Object.entries(PAGES).filter(([_, config]) => config.category === 'customer');
    
    for (const [key, pageConfig] of customerPages) {
      await capturePageScreenshots(page, pageConfig);
    }
  });

  // Salon Pages
  test('Capture salon page screenshots', async ({ page }) => {
    const salonPages = Object.entries(PAGES).filter(([_, config]) => config.category === 'salon');
    
    for (const [key, pageConfig] of salonPages) {
      await capturePageScreenshots(page, pageConfig);
    }
  });

  // Admin Pages
  test('Capture admin page screenshots', async ({ page }) => {
    const adminPages = Object.entries(PAGES).filter(([_, config]) => config.category === 'admin');
    
    for (const [key, pageConfig] of adminPages) {
      await capturePageScreenshots(page, pageConfig);
    }
  });

  // Booking Flow Screenshots (requires specific salon)
  test('Capture booking flow screenshots', async ({ page }) => {
    // First, get a salon slug from the salons page
    await page.goto('/salons');
    await page.waitForLoadState('networkidle');
    
    // Try to find a salon link
    const salonLink = page.locator('a[href*="/"]').first();
    const salonHref = await salonLink.getAttribute('href');
    
    if (salonHref && salonHref !== '/') {
      const salonSlug = salonHref.replace('/', '');
      console.log(`📸 Capturing booking flow for salon: ${salonSlug}`);
      
      // Navigate to salon booking page
      await page.goto(`/${salonSlug}`);
      await page.waitForLoadState('networkidle');
      
      // Capture screenshots for each viewport
      for (const [viewportKey, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);
        
        const screenshotPath = `docs/ui-audit/customer-pages/booking-flow-${viewportKey}.png`;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        
        console.log(`✅ Captured booking flow ${viewport.name} screenshot: ${screenshotPath}`);
      }
    } else {
      console.warn('⚠️ Could not find salon for booking flow screenshots');
    }
  });

  // Authenticated Pages (requires login)
  test('Capture authenticated page screenshots', async ({ page }) => {
    // Login as test user
    try {
      await loginTestUser(page, 'VALID_USER');
      console.log('✅ Test user logged in for authenticated screenshots');
    } catch (error) {
      console.warn('⚠️ Could not login test user, skipping authenticated pages');
      return;
    }

    // Capture dashboard screenshots
    await capturePageScreenshots(page, PAGES.dashboard);
  });

  // Salon Dashboard (requires salon login)
  test('Capture salon dashboard screenshots', async ({ page }) => {
    // This would require salon authentication setup
    // For now, we'll capture the login page
    await capturePageScreenshots(page, PAGES.salonLogin);
  });

  // Error Page Screenshots
  test('Capture error page screenshots', async ({ page }) => {
    // 404 page
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');
    
    for (const [viewportKey, viewport] of Object.entries(VIEWPORTS)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      const screenshotPath = `docs/ui-audit/error-pages/404-${viewportKey}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log(`✅ Captured 404 ${viewport.name} screenshot: ${screenshotPath}`);
    }
  });
});
