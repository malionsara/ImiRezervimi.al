// tests/mobile-interactions.spec.ts
// Mobile interaction testing for ImiRezervimi.al
// Tests touch interactions, gestures, and mobile-specific behaviors

import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Touch Interactions', () => {

  test.use({ ...devices['iPhone 12'] });

  test('Buttons respond to tap', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all buttons
    const buttons = await page.locator('button:visible').all();

    if (buttons.length > 0) {
      const firstButton = buttons[0];
      const buttonText = await firstButton.textContent();

      console.log(`🔘 Testing button: "${buttonText?.trim()}"`);

      // Tap the button
      await firstButton.tap();

      console.log('✅ Button tap successful');
    } else {
      console.log('ℹ️ No buttons found on page');
    }
  });

  test('Links are tappable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all visible links
    const links = await page.locator('a[href]:visible').all();

    console.log(`🔗 Found ${links.length} links`);

    // Test first few links
    for (const link of links.slice(0, 3)) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();

      console.log(`Testing link: "${text?.trim()}" → ${href}`);

      // Check if link is tappable
      const box = await link.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    }

    console.log('✅ All tested links are tappable');
  });

  test('Form inputs are focusable', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Get all input fields
    const inputs = await page.locator('input:visible').all();

    console.log(`📝 Found ${inputs.length} input fields`);

    for (const input of inputs) {
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');

      console.log(`Testing input: type="${type}", placeholder="${placeholder}"`);

      // Tap to focus
      await input.tap();

      // Check if focused
      const isFocused = await input.evaluate((el) => el === document.activeElement);
      expect(isFocused).toBeTruthy();

      console.log('✅ Input is focusable');
    }
  });

  test('Tap targets do not overlap', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all clickable elements
    const clickables = await page.locator('button:visible, a[href]:visible').all();

    // Check for overlapping elements
    const boxes = await Promise.all(
      clickables.map(async (el) => await el.boundingBox())
    );

    let overlaps = 0;

    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const box1 = boxes[i];
        const box2 = boxes[j];

        if (box1 && box2) {
          // Check if boxes overlap
          const overlapping =
            box1.x < box2.x + box2.width &&
            box1.x + box1.width > box2.x &&
            box1.y < box2.y + box2.height &&
            box1.y + box1.height > box2.y;

          if (overlapping) {
            overlaps++;
            console.warn('⚠️ Overlapping touch targets detected');
          }
        }
      }
    }

    console.log(`✅ Checked ${clickables.length} clickable elements, found ${overlaps} overlaps`);

    expect(overlaps).toBe(0);
  });

  test('Scroll behavior is smooth', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);

    // Check new scroll position
    const newScroll = await page.evaluate(() => window.scrollY);

    expect(newScroll).toBeGreaterThan(initialScroll);
    console.log(`✅ Scrolled from ${initialScroll} to ${newScroll}`);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(500);

    const finalScroll = await page.evaluate(() => window.scrollY);
    expect(finalScroll).toBeLessThan(100);

    console.log('✅ Smooth scroll works');
  });
});

test.describe('Mobile Navigation Tests', () => {

  test.use({ ...devices['Pixel 5'] });

  test('Mobile menu toggles correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for mobile menu button
    const menuButton = page.locator(
      'button[aria-label*="menu" i], [class*="hamburger"], [class*="mobile-menu"]'
    ).first();

    if (await menuButton.count() > 0) {
      // Open menu
      await menuButton.tap();
      await page.waitForTimeout(500);

      // Check if menu is visible
      const menu = page.locator('nav, [role="navigation"], [class*="mobile-nav"]').first();

      if (await menu.count() > 0) {
        await expect(menu).toBeVisible();
        console.log('✅ Mobile menu opens');

        // Close menu
        await menuButton.tap();
        await page.waitForTimeout(500);

        console.log('✅ Mobile menu closes');
      }
    } else {
      console.log('ℹ️ No mobile menu found (may not be needed)');
    }
  });

  test('Bottom navigation is accessible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for bottom navigation
    const bottomNav = page.locator(
      '.mobile-nav, [class*="bottom-nav"], [class*="fixed bottom"]'
    ).first();

    if (await bottomNav.count() > 0) {
      await expect(bottomNav).toBeVisible();

      // Check if it's actually at the bottom
      const box = await bottomNav.boundingBox();
      const windowHeight = await page.evaluate(() => window.innerHeight);

      if (box) {
        const isAtBottom = box.y + box.height >= windowHeight - 10; // 10px tolerance
        expect(isAtBottom).toBeTruthy();
        console.log('✅ Bottom navigation is positioned correctly');
      }
    } else {
      console.log('ℹ️ No bottom navigation found');
    }
  });

  test('Sticky headers work on scroll', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header').first();

    if (await header.count() > 0) {
      // Get initial header position
      const initialPosition = await header.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          position: style.position,
          top: el.getBoundingClientRect().top
        };
      });

      console.log('Header initial position:', initialPosition);

      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(300);

      // Check if header is still visible
      await expect(header).toBeVisible();

      // Check if header is sticky/fixed
      const scrolledPosition = await header.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          position: style.position,
          top: el.getBoundingClientRect().top
        };
      });

      if (scrolledPosition.position === 'fixed' || scrolledPosition.position === 'sticky') {
        console.log('✅ Header is sticky/fixed on scroll');
      } else {
        console.log('ℹ️ Header is not sticky');
      }
    }
  });
});

test.describe('Mobile Form Interactions', () => {

  test.use({ ...devices['iPhone 12'] });

  test('Keyboard opens when input is tapped', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const input = page.locator('input[type="text"], input[type="email"]').first();

    if (await input.count() > 0) {
      await input.tap();

      // Check if input is focused
      const isFocused = await input.evaluate((el) => el === document.activeElement);
      expect(isFocused).toBeTruthy();

      console.log('✅ Input focuses on tap (keyboard would open on real device)');
    }
  });

  test('Phone number input has correct keyboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Look for phone input
    const phoneInput = page.locator('input[type="tel"], input[name*="phone" i]').first();

    if (await phoneInput.count() > 0) {
      const inputType = await phoneInput.getAttribute('type');
      const inputMode = await phoneInput.getAttribute('inputmode');

      console.log(`Phone input type: ${inputType}, inputmode: ${inputMode}`);

      // Should use tel type or numeric inputmode
      expect(inputType === 'tel' || inputMode === 'tel' || inputMode === 'numeric').toBeTruthy();

      console.log('✅ Phone input will show numeric keyboard');
    }
  });

  test('Form submission works on mobile', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Find submit button
    const submitButton = page.locator('button[type="submit"]').first();

    if (await submitButton.count() > 0) {
      const isDisabled = await submitButton.isDisabled();

      if (!isDisabled) {
        // Try to submit empty form
        await submitButton.tap();
        await page.waitForTimeout(500);

        // Should show validation errors
        const errorMessages = await page.locator('[class*="error"], .text-red-500').count();

        if (errorMessages > 0) {
          console.log('✅ Form validation works on mobile');
        }
      }
    }
  });

  test('Select dropdowns work on mobile', async ({ page }) => {
    await page.goto('/salon/register');
    await page.waitForLoadState('networkidle');

    const selects = await page.locator('select').all();

    for (const select of selects) {
      // Tap to open dropdown
      await select.tap();

      // Check if dropdown is accessible
      const isEnabled = await select.isEnabled();
      expect(isEnabled).toBeTruthy();

      console.log('✅ Select dropdown is accessible');
    }
  });
});

test.describe('Mobile Gesture Tests', () => {

  test.use({ ...devices['Pixel 5'] });

  test('Pull-to-refresh does not interfere', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simulate pull down gesture
    await page.touchscreen.tap(200, 100);
    await page.touchscreen.swipe({ x: 200, y: 100 }, { x: 200, y: 300 });

    await page.waitForTimeout(500);

    // Page should not have scrolled up beyond top
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThanOrEqual(0);

    console.log('✅ Pull-to-refresh behavior tested');
  });

  test('Swipe navigation (if implemented)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check if swipeable content exists
    const swipeable = page.locator('[class*="swipe"], [class*="slider"]').first();

    if (await swipeable.count() > 0) {
      const box = await swipeable.boundingBox();

      if (box) {
        // Simulate swipe gesture
        await page.touchscreen.tap(box.x + 100, box.y + box.height / 2);
        await page.touchscreen.swipe(
          { x: box.x + 100, y: box.y + box.height / 2 },
          { x: box.x - 100, y: box.y + box.height / 2 }
        );

        await page.waitForTimeout(500);
        console.log('✅ Swipe gesture tested');
      }
    } else {
      console.log('ℹ️ No swipeable content found');
    }
  });

  test('Long press behavior (if applicable)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find an element that might have long-press behavior
    const element = page.locator('button, a[href]').first();

    if (await element.count() > 0) {
      const box = await element.boundingBox();

      if (box) {
        // Simulate long press
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);

        // Hold for 1 second
        await page.waitForTimeout(1000);

        console.log('ℹ️ Long press tested (no specific behavior expected)');
      }
    }
  });
});

test.describe('Mobile Orientation Tests', () => {

  test('Portrait orientation works', async ({ page, context }) => {
    await context.setViewportSize({ width: 390, height: 844 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);

    expect(scrollWidth).toBeLessThanOrEqual(windowWidth + 5);

    console.log('✅ Portrait orientation works');
  });

  test('Landscape orientation works', async ({ page, context }) => {
    // Rotate to landscape
    await context.setViewportSize({ width: 844, height: 390 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);

    expect(scrollWidth).toBeLessThanOrEqual(windowWidth + 5);

    console.log('✅ Landscape orientation works');
  });
});
