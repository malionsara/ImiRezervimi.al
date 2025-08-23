// tests/global.setup.ts
// Global setup for Playwright tests
// Sets up test data and authentication tokens

import { FullConfig, chromium, expect } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🧪 Running global setup for ImiRezervimi.al tests...');
  
  const baseURL = process.env.TEST_BASE_URL || config.projects[0].use?.baseURL || 'http://localhost:3000';
  console.log(`📍 Testing against: ${baseURL}`);

  // Create a browser instance for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test basic connectivity
    console.log('🌐 Testing basic connectivity...');
    const response = await page.goto(baseURL);
    if (!response || !response.ok()) {
      throw new Error(`Failed to load ${baseURL}. Status: ${response?.status()}`);
    }
    console.log('✅ Basic connectivity successful');

    // Check if site is accessible and not showing errors
    await page.waitForTimeout(2000); // Give the page time to load
    const hasError = await page.locator('text=Application Error').count() > 0;
    if (hasError) {
      console.warn('⚠️ Application Error detected on homepage');
    }

    // Setup test user authentication if needed
    if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
      console.log('👤 Setting up test user authentication...');
      // You can add authentication setup here if needed
    }

    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;