import { test, expect } from '@playwright/test';

test.describe('Simple Mobile Tests', () => {

  test('Homepage loads on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Take a screenshot
    await page.screenshot({ path: 'test-results/homepage-mobile.png', fullPage: true });

    console.log('✅ Homepage loaded and screenshot saved');

    // Check that the page loaded
    const title = await page.title();
    console.log('📄 Page title:', title);

    expect(title).toBeTruthy();
  });

  test('Check for horizontal scroll', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Check viewport width vs scroll width
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.body.scrollWidth,
      clientWidth: window.innerWidth
    }));

    console.log('📏 Scroll width:', dimensions.scrollWidth, 'px');
    console.log('📏 Viewport width:', dimensions.clientWidth, 'px');

    if (dimensions.scrollWidth > dimensions.clientWidth) {
      console.log('⚠️ Page has horizontal scroll');
    } else {
      console.log('✅ No horizontal scroll - responsive!');
    }

    // Allow small tolerance
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 5);
  });

  test('Check touch target sizes', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Get all buttons
    const buttons = await page.locator('button').all();
    console.log('🔘 Found', buttons.length, 'buttons');

    let adequateCount = 0;
    for (const button of buttons.slice(0, 5)) {
      const box = await button.boundingBox();
      if (box) {
        console.log('Button:', box.width, '×', box.height, 'px');
        if (box.height >= 40 && box.width >= 40) {
          adequateCount++;
        }
      }
    }

    console.log('✅', adequateCount, '/ 5 buttons have adequate touch targets');
  });
});
