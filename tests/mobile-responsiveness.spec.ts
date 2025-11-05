// tests/mobile-responsiveness.spec.ts
// Mobile responsiveness testing for ImiRezervimi.al
// Tests layout, touch targets, and text readability on mobile devices

import { test, expect, devices } from '@playwright/test';

// Test key pages on mobile
const MOBILE_PAGES = [
  { url: '/', name: 'Homepage' },
  { url: '/login', name: 'Login Page' },
  { url: '/salon/register', name: 'Salon Registration' },
];

test.describe('Mobile Responsiveness Tests', () => {

  test.use({ ...devices['iPhone 12'] });

  for (const pageConfig of MOBILE_PAGES) {
    test(`${pageConfig.name} - No horizontal scroll`, async ({ page }) => {
      await page.goto(pageConfig.url);
      await page.waitForLoadState('networkidle');

      // Check for horizontal overflow
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowInnerWidth = await page.evaluate(() => window.innerWidth);

      console.log(`📏 ${pageConfig.name}: scrollWidth=${bodyScrollWidth}, innerWidth=${windowInnerWidth}`);

      expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth + 5); // 5px tolerance
    });

    test(`${pageConfig.name} - Touch targets are large enough`, async ({ page }) => {
      await page.goto(pageConfig.url);
      await page.waitForLoadState('networkidle');

      // Get all clickable elements
      const clickableElements = await page.locator('button:visible, a[href]:visible, input[type="submit"]:visible').all();

      let tooSmallCount = 0;
      const minSize = 40; // Relaxed from 44px for icons

      for (const element of clickableElements) {
        const box = await element.boundingBox();
        if (box) {
          const isTooSmall = box.width < minSize || box.height < minSize;
          if (isTooSmall) {
            const text = await element.textContent();
            console.warn(`⚠️ Small touch target on ${pageConfig.name}: ${text?.substring(0, 30)} (${box.width}×${box.height})`);
            tooSmallCount++;
          }
        }
      }

      console.log(`✅ ${pageConfig.name}: ${clickableElements.length - tooSmallCount}/${clickableElements.length} touch targets are adequate`);

      // Allow max 10% of elements to be too small (for small icons)
      expect(tooSmallCount).toBeLessThan(clickableElements.length * 0.1);
    });

    test(`${pageConfig.name} - Text is readable`, async ({ page }) => {
      await page.goto(pageConfig.url);
      await page.waitForLoadState('networkidle');

      // Check font sizes
      const textElements = await page.locator('p, span, div, li, a, button').all();

      let tooSmallCount = 0;
      const minFontSize = 14; // Minimum readable size

      for (const element of textElements.slice(0, 20)) { // Check first 20
        const fontSize = await element.evaluate((el) => {
          const text = el.textContent?.trim();
          if (!text || text.length === 0) return 0;

          const style = window.getComputedStyle(el);
          return parseFloat(style.fontSize);
        });

        if (fontSize > 0 && fontSize < minFontSize) {
          tooSmallCount++;
        }
      }

      console.log(`✅ ${pageConfig.name}: ${20 - tooSmallCount}/20 sampled text elements are readable`);

      // Allow max 20% to be small (for labels, captions)
      expect(tooSmallCount).toBeLessThan(4);
    });

    test(`${pageConfig.name} - Images are responsive`, async ({ page }) => {
      await page.goto(pageConfig.url);
      await page.waitForLoadState('networkidle');

      // Check all images
      const images = await page.locator('img').all();

      let overflowingImages = 0;
      const windowWidth = await page.evaluate(() => window.innerWidth);

      for (const img of images) {
        const box = await img.boundingBox();
        if (box && box.width > windowWidth) {
          const src = await img.getAttribute('src');
          console.warn(`⚠️ Image overflows viewport: ${src?.substring(0, 50)}`);
          overflowingImages++;
        }
      }

      console.log(`✅ ${pageConfig.name}: ${images.length - overflowingImages}/${images.length} images are responsive`);

      expect(overflowingImages).toBe(0);
    });

    test(`${pageConfig.name} - Viewport meta tag is set`, async ({ page }) => {
      await page.goto(pageConfig.url);

      // Check viewport meta tag
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');

      expect(viewport).toBeTruthy();
      expect(viewport).toContain('width=device-width');
      expect(viewport).toContain('initial-scale=1');

      console.log(`✅ ${pageConfig.name}: Viewport meta tag configured correctly`);
    });
  }
});

test.describe('Mobile Layout Tests', () => {

  test.use({ ...devices['Pixel 5'] });

  test('Header is visible and accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    // Check header doesn't take up too much space
    const headerBox = await header.boundingBox();
    const windowHeight = await page.evaluate(() => window.innerHeight);

    if (headerBox) {
      const headerPercentage = (headerBox.height / windowHeight) * 100;
      console.log(`📐 Header takes up ${headerPercentage.toFixed(1)}% of viewport height`);

      // Header should be less than 15% of viewport
      expect(headerPercentage).toBeLessThan(15);
    }
  });

  test('Footer is accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const footer = page.locator('footer').first();

    // Footer should exist
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
      console.log('✅ Footer is visible');
    } else {
      console.log('ℹ️ No footer found');
    }
  });

  test('Mobile navigation works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for mobile menu button (hamburger)
    const menuButton = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="Menu"], [class*="hamburger"], [class*="menu-button"]'
    ).first();

    if (await menuButton.count() > 0) {
      console.log('✅ Mobile menu button found');

      // Try to open menu
      await menuButton.click();
      await page.waitForTimeout(500);

      // Check if navigation is now visible
      const nav = page.locator('nav, [role="navigation"]').first();

      if (await nav.count() > 0) {
        const isVisible = await nav.isVisible();
        expect(isVisible).toBeTruthy();
        console.log('✅ Mobile menu opens successfully');
      }
    } else {
      console.log('ℹ️ No mobile menu button found (may use different navigation)');
    }
  });

  test('Forms are mobile-friendly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check input fields
    const inputs = await page.locator('input').all();

    for (const input of inputs) {
      const box = await input.boundingBox();
      if (box) {
        // Inputs should be tall enough for easy interaction
        expect(box.height).toBeGreaterThanOrEqual(40);

        // Check if input has appropriate spacing
        const inputStyle = await input.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            padding: style.padding,
            fontSize: style.fontSize
          };
        });

        console.log('Input styles:', inputStyle);
      }
    }

    console.log(`✅ Checked ${inputs.length} input fields`);
  });

  test('Safe area insets for iPhone notch', async ({ page }) => {
    test.use({ ...devices['iPhone 12'] });

    await page.goto('/');

    // Check viewport-fit meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');

    if (viewport && viewport.includes('viewport-fit=cover')) {
      console.log('✅ Viewport-fit=cover set for notch handling');
    } else {
      console.log('⚠️ Consider adding viewport-fit=cover for iPhone notch');
    }

    // Check for safe area inset usage
    const hasSafeAreaInsets = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets)
        .flatMap(sheet => {
          try {
            return Array.from(sheet.cssRules || []);
          } catch {
            return [];
          }
        })
        .map(rule => rule.cssText)
        .join(' ');

      return styles.includes('safe-area-inset');
    });

    if (hasSafeAreaInsets) {
      console.log('✅ Safe area insets used in CSS');
    } else {
      console.log('ℹ️ No safe area insets detected (may not be needed)');
    }
  });
});

test.describe('Mobile Performance Tests', () => {

  test.use({ ...devices['Pixel 5'] });

  test('Page loads without layout shift', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check Cumulative Layout Shift (CLS)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsScore = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            clsScore += (entry as any).value;
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsScore);
        }, 2000);
      });
    });

    console.log(`📊 Cumulative Layout Shift: ${cls}`);

    // CLS should be less than 0.1 (good), warn if above 0.25
    if (cls > 0.25) {
      console.warn('⚠️ High layout shift detected');
    }

    expect(cls).toBeLessThan(0.5); // Maximum acceptable
  });

  test('Images have proper dimensions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();

    let imagesWithoutDimensions = 0;

    for (const img of images) {
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');

      if (!width || !height) {
        const src = await img.getAttribute('src');
        console.warn(`⚠️ Image without dimensions: ${src?.substring(0, 50)}`);
        imagesWithoutDimensions++;
      }
    }

    console.log(`✅ ${images.length - imagesWithoutDimensions}/${images.length} images have dimensions set`);

    // At least 80% of images should have dimensions
    expect(imagesWithoutDimensions).toBeLessThan(images.length * 0.2);
  });
});

test.describe('Albanian Language Support', () => {

  test.use({ ...devices['iPhone 12'] });

  test('Albanian characters render correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.textContent('body');

    // Check for Albanian special characters
    const albanianChars = ['ë', 'ç', 'Ë', 'Ç'];
    const foundChars = albanianChars.filter(char => bodyText?.includes(char));

    if (foundChars.length > 0) {
      console.log(`✅ Albanian characters found: ${foundChars.join(', ')}`);

      // Take screenshot to verify visual rendering
      await page.screenshot({
        path: 'test-results/albanian-chars-mobile.png',
        fullPage: false
      });

      console.log('📸 Screenshot saved for visual verification');
    } else {
      console.log('ℹ️ No Albanian special characters found on this page');
    }
  });

  test('Albanian text does not overflow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for text overflow
    const overflowingElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div'));
      const overflowing = [];

      for (const el of elements) {
        const computed = window.getComputedStyle(el as HTMLElement);
        if (computed.overflow === 'visible' && (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth) {
          overflowing.push({
            tagName: el.tagName,
            text: el.textContent?.substring(0, 50)
          });
        }
      }

      return overflowing;
    });

    if (overflowingElements.length > 0) {
      console.warn('⚠️ Text overflow detected:', overflowingElements);
    } else {
      console.log('✅ No text overflow detected');
    }

    expect(overflowingElements.length).toBe(0);
  });
});
