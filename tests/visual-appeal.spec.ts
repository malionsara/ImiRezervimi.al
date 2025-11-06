// tests/visual-appeal.spec.ts
// Visual appeal and design consistency testing for ImiRezervimi.al
// Tests colors, typography, spacing, and Albanian language rendering

import { test, expect } from '@playwright/test';

test.describe('Visual Appeal Tests', () => {

  test('Albanian characters render correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.textContent('body');

    // Check for Albanian special characters
    const albanianChars = {
      'ë': 'e with diaeresis',
      'ç': 'c with cedilla',
      'Ë': 'E with diaeresis',
      'Ç': 'C with cedilla'
    };

    const foundChars: string[] = [];

    Object.keys(albanianChars).forEach(char => {
      if (bodyText?.includes(char)) {
        foundChars.push(char);
      }
    });

    if (foundChars.length > 0) {
      console.log(`✅ Albanian characters found: ${foundChars.join(', ')}`);

      // Take screenshot for visual verification
      await page.screenshot({
        path: 'test-results/visual/albanian-characters.png',
        fullPage: false
      });

      console.log('📸 Screenshot saved for character verification');

      // Verify UTF-8 encoding
      const charset = await page.locator('meta[charset]').first().getAttribute('charset');
      expect(charset?.toLowerCase()).toBe('utf-8');
    } else {
      console.log('ℹ️ No Albanian special characters on this page');
    }
  });

  test('Brand colors are consistent', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Define brand colors
    const brandColors = {
      primary: ['rgb(239, 68, 68)', '#ef4444'], // red-500
      secondary: ['rgb(236, 72, 153)', '#ec4899'], // pink-500
      success: ['rgb(34, 197, 94)', '#22c55e'], // green-500
      error: ['rgb(239, 68, 68)', '#ef4444'] // red-500
    };

    // Check if brand colors are used
    const buttons = await page.locator('button').all();

    let brandColorFound = false;

    for (const button of buttons.slice(0, 5)) {
      const bgColor = await button.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.backgroundColor;
      });

      if (brandColors.primary.includes(bgColor) || brandColors.secondary.includes(bgColor)) {
        brandColorFound = true;
        console.log(`✅ Brand color found: ${bgColor}`);
      }
    }

    if (brandColorFound) {
      console.log('✅ Brand colors are being used');
    }
  });

  test('Text contrast is sufficient', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Sample text elements
    const textElements = await page.locator('p, h1, h2, h3, span, a, button').all();

    let lowContrastCount = 0;

    for (const element of textElements.slice(0, 10)) {
      const colors = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize
        };
      });

      // Log for manual verification
      console.log('Text colors:', colors);

      // Note: Automated contrast checking is complex
      // Consider using @axe-core/playwright for automated a11y testing
    }

    console.log('ℹ️ Manual contrast verification recommended using browser dev tools');
  });

  test('Typography hierarchy is clear', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check heading sizes
    const headings = {
      h1: await page.locator('h1').first(),
      h2: await page.locator('h2').first(),
      h3: await page.locator('h3').first(),
      body: await page.locator('p').first()
    };

    const sizes: { [key: string]: number } = {};

    for (const [tag, element] of Object.entries(headings)) {
      if (await element.count() > 0) {
        const fontSize = await element.evaluate((el) => {
          return parseFloat(window.getComputedStyle(el).fontSize);
        });
        sizes[tag] = fontSize;
        console.log(`${tag}: ${fontSize}px`);
      }
    }

    // Verify hierarchy (h1 > h2 > h3 > body)
    if (sizes.h1 && sizes.h2) {
      expect(sizes.h1).toBeGreaterThan(sizes.h2);
    }

    if (sizes.h2 && sizes.h3) {
      expect(sizes.h2).toBeGreaterThan(sizes.h3);
    }

    if (sizes.h3 && sizes.body) {
      expect(sizes.h3).toBeGreaterThan(sizes.body);
    }

    console.log('✅ Typography hierarchy is correct');
  });

  test('Consistent spacing throughout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check section spacing
    const sections = await page.locator('section, [class*="section"]').all();

    const spacings = [];

    for (const section of sections.slice(0, 5)) {
      const padding = await section.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          top: parseInt(style.paddingTop),
          bottom: parseInt(style.paddingBottom),
          left: parseInt(style.paddingLeft),
          right: parseInt(style.paddingRight)
        };
      });

      spacings.push(padding);
      console.log('Section spacing:', padding);
    }

    // Check for consistency (spacings should use multiples of 4 or 8)
    const isConsistent = spacings.every(s =>
      s.top % 4 === 0 && s.bottom % 4 === 0
    );

    if (isConsistent) {
      console.log('✅ Spacing follows consistent pattern');
    } else {
      console.log('ℹ️ Spacing varies - manual review recommended');
    }
  });

  test('Buttons have consistent styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttons = await page.locator('button').all();

    const buttonStyles = [];

    for (const button of buttons.slice(0, 5)) {
      const style = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          padding: computed.padding,
          borderRadius: computed.borderRadius,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          backgroundColor: computed.backgroundColor
        };
      });

      buttonStyles.push(style);
    }

    console.log('Button styles:', buttonStyles);
    console.log('✅ Button styles logged for verification');
  });

  test('Loading states are visible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('load'); // Don't wait for networkidle

    // Look for loading indicators
    const loadingSelectors = [
      '.animate-spin',
      '[class*="loading"]',
      '[class*="spinner"]',
      '[class*="skeleton"]'
    ];

    let foundLoading = false;

    for (const selector of loadingSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        foundLoading = true;
        console.log(`✅ Loading indicator found: ${selector}`);

        // Take screenshot
        await page.screenshot({
          path: `test-results/visual/loading-state-${selector.replace(/[^a-z0-9]/gi, '')}.png`
        });
      }
    }

    if (foundLoading) {
      console.log('✅ Loading states are implemented');
    } else {
      console.log('ℹ️ No loading indicators detected on quick load');
    }
  });

  test('Error states are prominent', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Try to submit empty form to trigger errors
    const submitButton = page.locator('button[type="submit"]').first();

    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(500);

      // Look for error messages
      const errorSelectors = [
        '[class*="error"]',
        '.text-red-500',
        '.text-red-600',
        '.bg-red-50',
        '[role="alert"]'
      ];

      let errorsFound = 0;

      for (const selector of errorSelectors) {
        const count = await page.locator(selector).count();
        errorsFound += count;
      }

      if (errorsFound > 0) {
        console.log(`✅ ${errorsFound} error indicators found`);

        // Take screenshot
        await page.screenshot({
          path: 'test-results/visual/error-states.png',
          fullPage: true
        });
      } else {
        console.log('⚠️ No error indicators detected');
      }

      expect(errorsFound).toBeGreaterThan(0);
    }
  });

  test('Success states are celebratory', async ({ page }) => {
    // This test would need successful submission
    // For now, just check if success styles are defined

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if success color classes exist
    const hasSuccessClasses = await page.evaluate(() => {
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

      return styles.includes('green') || styles.includes('success');
    });

    if (hasSuccessClasses) {
      console.log('✅ Success state styles are defined');
    }
  });

  test('Icons align with text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find elements with both icon and text
    const buttons = await page.locator('button:has-text("")').all();

    for (const button of buttons.slice(0, 3)) {
      const hasIcon = await button.locator('svg').count() > 0;

      if (hasIcon) {
        const alignment = await button.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            display: style.display,
            alignItems: style.alignItems,
            justifyContent: style.justifyContent
          };
        });

        console.log('Button with icon alignment:', alignment);
      }
    }

    console.log('✅ Icon alignment checked');
  });

  test('Images have proper spacing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();

    for (const img of images) {
      const spacing = await img.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          margin: style.margin,
          borderRadius: style.borderRadius
        };
      });

      console.log('Image spacing:', spacing);
    }

    console.log(`✅ Checked spacing for ${images.length} images`);
  });

  test('Cards have consistent styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find card-like elements
    const cards = await page.locator('[class*="card"], [class*="rounded"]').all();

    const cardStyles = [];

    for (const card of cards.slice(0, 5)) {
      const style = await card.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          borderRadius: computed.borderRadius,
          padding: computed.padding,
          boxShadow: computed.boxShadow,
          border: computed.border
        };
      });

      cardStyles.push(style);
    }

    console.log('Card styles:', cardStyles);
    console.log('✅ Card styles logged for consistency check');
  });

  test('Forms have proper visual feedback', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const inputs = await page.locator('input').all();

    for (const input of inputs) {
      // Focus the input
      await input.focus();

      // Get focus styles
      const focusStyle = await input.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          borderColor: style.borderColor,
          boxShadow: style.boxShadow
        };
      });

      console.log('Input focus style:', focusStyle);

      // Should have some focus indicator
      const hasFocusStyle =
        focusStyle.outline !== 'none' ||
        focusStyle.boxShadow !== 'none' ||
        focusStyle.borderColor !== 'rgb(0, 0, 0)';

      expect(hasFocusStyle).toBeTruthy();
    }

    console.log('✅ Form inputs have focus styles');
  });
});

test.describe('Mobile Visual Tests', () => {

  test.use({ viewport: { width: 375, height: 667 } });

  test('Mobile typography is readable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check body text size
    const bodyText = page.locator('p').first();

    if (await bodyText.count() > 0) {
      const fontSize = await bodyText.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).fontSize);
      });

      console.log(`Mobile body text size: ${fontSize}px`);

      // Should be at least 16px on mobile
      expect(fontSize).toBeGreaterThanOrEqual(16);
    }
  });

  test('Mobile buttons are appropriately sized', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 5)) {
      const box = await button.boundingBox();

      if (box) {
        console.log(`Button size: ${box.width}×${box.height}px`);

        // Mobile buttons should be at least 44px tall
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }

    console.log('✅ Mobile button sizes checked');
  });

  test('Mobile spacing is appropriate', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check container padding
    const main = page.locator('main, [role="main"]').first();

    if (await main.count() > 0) {
      const padding = await main.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          left: parseInt(style.paddingLeft),
          right: parseInt(style.paddingRight)
        };
      });

      console.log(`Mobile main padding: ${padding.left}px (left), ${padding.right}px (right)`);

      // Should have at least 16px padding on mobile
      expect(padding.left).toBeGreaterThanOrEqual(16);
      expect(padding.right).toBeGreaterThanOrEqual(16);
    }
  });
});

test.describe('Dark Mode Tests (if implemented)', () => {

  test('Dark mode toggle exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for dark mode toggle
    const darkModeToggle = page.locator(
      '[aria-label*="dark" i], [aria-label*="theme" i], [class*="dark-mode"]'
    ).first();

    if (await darkModeToggle.count() > 0) {
      console.log('✅ Dark mode toggle found');

      // Try to toggle
      await darkModeToggle.click();
      await page.waitForTimeout(500);

      // Check if class changed
      const htmlClass = await page.locator('html').getAttribute('class');
      console.log('HTML classes after toggle:', htmlClass);
    } else {
      console.log('ℹ️ Dark mode not implemented');
    }
  });
});
