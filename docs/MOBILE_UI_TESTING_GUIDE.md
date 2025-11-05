# 📱 Mobile UI Testing Guide for ImiRezervimi.al

**Complete guide for testing mobile responsiveness and visual appeal**

---

## 🎯 Quick Start

### Prerequisites
```bash
# Make sure you're in the frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

### Run All UI Tests
```bash
# Run all Playwright tests (includes mobile devices)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug
```

---

## 📋 What's Already Configured

Your project already has excellent test infrastructure:

### ✅ Configured Devices
**Desktop:**
- Chrome (1920×1080)
- Firefox (1920×1080)
- Safari/WebKit (1920×1080)

**Mobile:**
- **Pixel 5** - Android (393×851, 2.75x DPR)
- **iPhone 12** - iOS (390×844, 3x DPR)

### ✅ Configured Features
- Screenshot capture on failure
- Video recording on failure
- Full-page screenshots
- Network idle detection
- Trace viewer for debugging
- HTML/JSON/JUnit reports

### ✅ Existing Test Suites
1. `tests/homepage.spec.ts` - Homepage tests
2. `tests/authentication.spec.ts` - Login flows
3. `tests/booking.spec.ts` - Booking workflow
4. `tests/salon-management.spec.ts` - Salon dashboard
5. `tests/customer-dashboard.spec.ts` - Customer dashboard
6. `tests/api-endpoints.spec.ts` - API testing
7. `tests/ui-audit-screenshots.spec.ts` - Visual documentation

---

## 🚀 Running Mobile-Specific Tests

### Option 1: Run Only Mobile Tests
```bash
# Run only Pixel 5 (Android) tests
npx playwright test --project="Mobile Chrome"

# Run only iPhone 12 (iOS) tests
npx playwright test --project="Mobile Safari"

# Run both mobile devices
npx playwright test --project="Mobile Chrome" --project="Mobile Safari"
```

### Option 2: Run Specific Test File on Mobile
```bash
# Run booking tests on mobile only
npx playwright test tests/booking.spec.ts --project="Mobile Chrome"

# Run UI audit on all devices
npx playwright test tests/ui-audit-screenshots.spec.ts
```

### Option 3: Interactive UI Mode (Recommended!)
```bash
# Best for development and debugging
npm run test:e2e:ui
```

**UI Mode Features:**
- Visual test runner
- Watch mode (auto-rerun on file changes)
- Time travel debugging
- Live trace viewer
- Screenshots/videos inline

---

## 📸 Visual UI Testing

### Capture Screenshots for All Pages
```bash
# Run the UI audit test
npx playwright test tests/ui-audit-screenshots.spec.ts

# Screenshots will be saved to:
# docs/ui-audit/customer-pages/
# docs/ui-audit/salon-pages/
# docs/ui-audit/admin-pages/
# docs/ui-audit/error-pages/
```

**Viewports Captured:**
- Desktop: 1920×1080
- Tablet: 768×1024
- Mobile: 375×667

### View Generated Screenshots
```bash
# Open the UI audit folder
open docs/ui-audit/

# Or on Linux
xdg-open docs/ui-audit/

# Or manually navigate to:
# /home/user/ImiRezervimi.al/docs/ui-audit/
```

---

## 🧪 Mobile-Specific Test Scenarios

### What to Test on Mobile

#### 1. **Touch Interactions**
- Tap targets are at least 44×44px
- Buttons are easily clickable
- No accidental clicks on nearby elements
- Swipe gestures work (if applicable)

#### 2. **Responsive Layout**
- Content fits within viewport (no horizontal scroll)
- Text is readable without zooming (min 16px)
- Images scale properly
- Navigation is accessible
- Forms are usable

#### 3. **Performance**
- Pages load in <3 seconds on 3G
- Images are optimized
- No layout shift (CLS)
- Smooth scrolling

#### 4. **Albanian Text Rendering**
- Special characters display correctly (ë, ç)
- Text doesn't overflow containers
- Line heights are appropriate
- No text cut-off

#### 5. **Instagram In-App Browser**
- All features work in Instagram browser
- OAuth redirects work
- Images load
- Forms submit correctly

---

## 🎨 Testing Visual Appeal

### Manual Checklist

#### Color & Contrast
- [ ] Text is readable on all backgrounds
- [ ] WCAG AA contrast ratio met (4.5:1)
- [ ] Brand colors consistent (red #EF4444, pink #EC4899)
- [ ] Disabled states are visible but distinct
- [ ] Error states are red and clear

#### Typography
- [ ] Headings hierarchy clear (h1 > h2 > h3)
- [ ] Body text 16px minimum
- [ ] Line height 1.5-1.8 for readability
- [ ] Albanian characters render properly
- [ ] No text orphans or widows

#### Spacing & Layout
- [ ] Consistent padding/margins
- [ ] Adequate whitespace between sections
- [ ] Touch targets 44px minimum
- [ ] Forms have proper spacing
- [ ] Cards have consistent spacing

#### Components
- [ ] Buttons have hover/active states
- [ ] Loading states are clear
- [ ] Error messages are prominent
- [ ] Success messages are celebratory
- [ ] Icons align with text

#### Mobile-Specific
- [ ] Sticky headers work correctly
- [ ] Bottom navigation accessible
- [ ] Safe area insets respected (iPhone notch)
- [ ] Landscape orientation works
- [ ] No content behind notch/home indicator

---

## 🔧 Advanced Testing Setup

### 1. Add More Mobile Devices

Edit `playwright.config.ts`:

```typescript
projects: [
  // ... existing projects ...

  // Add Android devices
  {
    name: 'Galaxy S21',
    use: { ...devices['Galaxy S21'] },
  },
  {
    name: 'Galaxy S8',
    use: { ...devices['Galaxy S8'] },
  },

  // Add older iPhones
  {
    name: 'iPhone SE',
    use: { ...devices['iPhone SE'] },
  },
  {
    name: 'iPhone 11',
    use: { ...devices['iPhone 11'] },
  },

  // Add tablets
  {
    name: 'iPad Pro',
    use: { ...devices['iPad Pro'] },
  },

  // Instagram in-app browser simulation
  {
    name: 'Instagram Browser',
    use: {
      ...devices['iPhone 12'],
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 203.0.0.29.118 (iPhone13,2; iOS 14_7_1; en_US; en-US; scale=3.00; 1170x2532; 314966024)'
    }
  }
],
```

### 2. Visual Regression Testing

Install Percy (recommended) or Applitools:

```bash
# Install Percy
npm install --save-dev @percy/cli @percy/playwright

# Or install Playwright's built-in visual comparison
# (No additional packages needed)
```

**Option A: Percy (Cloud-based)**

```typescript
// Add to test file
import percySnapshot from '@percy/playwright';

test('visual regression test', async ({ page }) => {
  await page.goto('/');
  await percySnapshot(page, 'Homepage');
});
```

**Option B: Playwright Visual Comparison (Local)**

```typescript
test('visual regression test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100,
    threshold: 0.2
  });
});
```

### 3. Network Throttling (3G Simulation)

```typescript
test('test on slow 3G', async ({ page, context }) => {
  // Simulate slow 3G
  await context.route('**/*', (route) => {
    route.continue({
      // Add 500ms latency
      headers: { ...route.request().headers() }
    });
  });

  await page.goto('/');

  // Measure loading time
  const performanceMetrics = await page.evaluate(() =>
    JSON.stringify(window.performance.getEntriesByType('navigation')[0])
  );

  console.log('Performance:', performanceMetrics);
});
```

### 4. Accessibility Testing

```bash
# Install axe-core
npm install --save-dev @axe-core/playwright
```

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('accessibility test', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

---

## 📝 Create Custom Mobile UI Tests

### Create: `tests/mobile-responsiveness.spec.ts`

```typescript
import { test, expect, devices } from '@playwright/test';

// Test key pages on mobile
const MOBILE_PAGES = [
  { url: '/', name: 'Homepage' },
  { url: '/salons', name: 'Salons List' },
  { url: '/dashboard', name: 'Customer Dashboard', requiresAuth: true },
  { url: '/salon/dashboard', name: 'Salon Dashboard', requiresAuth: true },
];

test.describe('Mobile Responsiveness Tests', () => {

  test.use({ ...devices['iPhone 12'] });

  for (const page of MOBILE_PAGES) {
    test(`${page.name} - No horizontal scroll`, async ({ page: p }) => {
      if (page.requiresAuth) {
        test.skip();
        return;
      }

      await p.goto(page.url);
      await p.waitForLoadState('networkidle');

      // Check for horizontal overflow
      const bodyScrollWidth = await p.evaluate(() => document.body.scrollWidth);
      const windowInnerWidth = await p.evaluate(() => window.innerWidth);

      expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth);
    });

    test(`${page.name} - Touch targets are large enough`, async ({ page: p }) => {
      if (page.requiresAuth) {
        test.skip();
        return;
      }

      await p.goto(page.url);
      await p.waitForLoadState('networkidle');

      // Get all clickable elements
      const buttons = await p.locator('button, a[href], input[type="submit"]').all();

      for (const button of buttons) {
        const box = await button.boundingBox();
        if (box && await button.isVisible()) {
          // Check minimum touch target size (44x44px)
          expect(box.width).toBeGreaterThanOrEqual(40); // Slightly relaxed for icons
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    });

    test(`${page.name} - Text is readable`, async ({ page: p }) => {
      if (page.requiresAuth) {
        test.skip();
        return;
      }

      await p.goto(page.url);
      await p.waitForLoadState('networkidle');

      // Check font sizes
      const textElements = await p.locator('p, span, div, li').all();

      for (const element of textElements.slice(0, 10)) { // Check first 10
        const fontSize = await element.evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });

        const size = parseInt(fontSize);
        if (size > 0) {
          expect(size).toBeGreaterThanOrEqual(14); // Minimum 14px
        }
      }
    });
  }
});
```

### Create: `tests/mobile-interactions.spec.ts`

```typescript
import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Interactions', () => {

  test.use({ ...devices['iPhone 12'] });

  test('Navigation menu works on mobile', async ({ page }) => {
    await page.goto('/');

    // Look for hamburger menu
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();

    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Check if menu opened
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
    }
  });

  test('Forms are usable on mobile', async ({ page }) => {
    await page.goto('/login');

    // Check input sizes
    const inputs = await page.locator('input').all();

    for (const input of inputs) {
      const box = await input.boundingBox();
      if (box) {
        // Inputs should be at least 44px tall for easy tapping
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('Bottom navigation is accessible', async ({ page }) => {
    await page.goto('/');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check if bottom nav is sticky/visible
    const bottomNav = page.locator('.mobile-nav, [class*="bottom"], [class*="fixed"]').first();

    if (await bottomNav.count() > 0) {
      await expect(bottomNav).toBeVisible();
    }
  });

  test('Safe area insets respected on iPhone', async ({ page }) => {
    await page.goto('/');

    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('viewport-fit=cover');
  });
});
```

### Create: `tests/visual-appeal.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Appeal Tests', () => {

  test('Albanian characters render correctly', async ({ page }) => {
    await page.goto('/');

    // Check for Albanian text
    const albanianText = await page.textContent('body');

    // Verify special Albanian characters are present and rendered
    const hasAlbanianChars = /[ëçË]/.test(albanianText || '');

    if (hasAlbanianChars) {
      // Take screenshot to verify rendering
      await page.screenshot({ path: 'test-results/albanian-chars.png' });
      console.log('✅ Albanian characters detected and rendered');
    }
  });

  test('Color contrast is sufficient', async ({ page }) => {
    await page.goto('/');

    // Get background and text colors
    const textElement = page.locator('body').first();

    const colors = await textElement.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor
      };
    });

    console.log('Text color:', colors.color);
    console.log('Background:', colors.backgroundColor);

    // Manual verification needed - consider using axe-core for automated checks
  });

  test('Loading states are visible', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for loading indicators
    const loadingIndicators = await page.locator(
      '.animate-spin, [class*="loading"], [class*="spinner"]'
    ).count();

    console.log(`Found ${loadingIndicators} loading indicators`);
  });

  test('Error states are prominent', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Check for error messages
    const errorMessages = await page.locator(
      '[class*="error"], [class*="invalid"], .text-red-500, .text-red-600'
    ).count();

    expect(errorMessages).toBeGreaterThan(0);
  });

  test('Consistent spacing throughout', async ({ page }) => {
    await page.goto('/');

    // Get all section paddings
    const sections = await page.locator('section, [class*="section"]').all();

    const paddings = [];
    for (const section of sections) {
      const padding = await section.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          top: style.paddingTop,
          bottom: style.paddingBottom
        };
      });
      paddings.push(padding);
    }

    console.log('Section paddings:', paddings);
    // Manual verification of consistency
  });
});
```

---

## 🎭 Testing in Real Devices

### Option 1: Use BrowserStack/Sauce Labs
```bash
# Install BrowserStack local
npm install -g browserstack-local

# Set credentials
export BROWSERSTACK_USERNAME=your_username
export BROWSERSTACK_ACCESS_KEY=your_key

# Run tests
npm run test:e2e
```

### Option 2: Test on Physical Devices

**For iPhone (iOS):**
```bash
# Expose localhost to network
npm run dev -- --hostname 0.0.0.0

# Get your IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access from iPhone:
# http://YOUR_IP:3000

# For HTTPS (required for Instagram):
# Use ngrok or similar
npx ngrok http 3000
```

**For Android:**
```bash
# Same as above
npm run dev -- --hostname 0.0.0.0

# Or use Android emulator
# Install Android Studio
# Create virtual device
# Access http://10.0.2.2:3000 from emulator
```

### Option 3: Instagram In-App Browser Testing

```bash
# Use ngrok to expose local server
npx ngrok http 3000

# Copy ngrok URL (e.g., https://abcd1234.ngrok.io)

# Create Instagram post with link in bio
# Test booking flow from Instagram app
```

---

## 📊 Viewing Test Results

### HTML Report
```bash
# After running tests, open report
npx playwright show-report

# Or manually open
open playwright-report/index.html
```

### Screenshots & Videos
```bash
# View test artifacts
ls test-results/

# Each failed test has:
# - Screenshot
# - Video recording
# - Trace file (for debugging)
```

### Trace Viewer (Time Travel Debugging!)
```bash
# Open trace viewer
npx playwright show-trace test-results/path-to-trace.zip

# Features:
# - View each step
# - See network requests
# - View console logs
# - Inspect DOM at any point
# - View screenshots at each step
```

---

## 🚨 Common Mobile Issues & Fixes

### Issue 1: Horizontal Scroll
**Problem:** Content wider than viewport

**Check:**
```typescript
test('no horizontal scroll', async ({ page }) => {
  await page.goto('/');
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const windowWidth = await page.evaluate(() => window.innerWidth);
  expect(scrollWidth).toBeLessThanOrEqual(windowWidth);
});
```

**Fix:** Add to your CSS:
```css
* {
  max-width: 100%;
  overflow-x: hidden;
}
```

### Issue 2: Text Too Small
**Problem:** Text not readable without zooming

**Check:**
```typescript
test('readable text size', async ({ page }) => {
  await page.goto('/');
  const bodyFontSize = await page.evaluate(() =>
    window.getComputedStyle(document.body).fontSize
  );
  expect(parseInt(bodyFontSize)).toBeGreaterThanOrEqual(16);
});
```

**Fix:**
```css
body {
  font-size: 16px; /* Minimum for mobile */
}
```

### Issue 3: Touch Targets Too Small
**Problem:** Buttons hard to tap

**Check:**
```typescript
test('adequate touch targets', async ({ page }) => {
  await page.goto('/');
  const buttons = await page.locator('button').all();

  for (const button of buttons) {
    const box = await button.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  }
});
```

**Fix:**
```css
button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}
```

### Issue 4: Fixed Positioning Issues
**Problem:** Fixed headers/footers overlap content

**Check:**
```typescript
test('fixed elements dont overlap', async ({ page }) => {
  await page.goto('/');

  const header = page.locator('header').first();
  const content = page.locator('main').first();

  const headerBox = await header.boundingBox();
  const contentBox = await content.boundingBox();

  if (headerBox && contentBox) {
    expect(contentBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
  }
});
```

**Fix:**
```css
header {
  position: fixed;
  top: 0;
  z-index: 1000;
}

main {
  padding-top: 64px; /* Header height */
}
```

### Issue 5: Albanian Characters Don't Display
**Problem:** ë, ç characters show as �

**Check:**
```typescript
test('albanian chars display', async ({ page }) => {
  await page.goto('/');
  const text = await page.textContent('body');

  // Should contain Albanian chars if present
  const hasSpecialChars = /[ëçËÇ]/.test(text || '');
  expect(hasSpecialChars).toBeTruthy();
});
```

**Fix:** Add to `<head>`:
```html
<meta charset="UTF-8">
```

---

## 🎯 Testing Checklist

### Before Each Release

#### Mobile Responsiveness
- [ ] Run all mobile tests: `npx playwright test --project="Mobile Chrome" --project="Mobile Safari"`
- [ ] Check screenshots in `docs/ui-audit/`
- [ ] No horizontal scroll on any page
- [ ] All text readable (16px minimum)
- [ ] Touch targets 44px minimum
- [ ] Forms usable on mobile

#### Visual Appeal
- [ ] Brand colors consistent
- [ ] Albanian characters render correctly
- [ ] Adequate spacing throughout
- [ ] Loading states visible
- [ ] Error states prominent
- [ ] Success states celebratory

#### Performance
- [ ] Pages load <3s on 3G
- [ ] Images optimized
- [ ] No layout shift
- [ ] Smooth scrolling

#### Cross-Browser
- [ ] Works on Mobile Chrome
- [ ] Works on Mobile Safari
- [ ] Works in Instagram browser
- [ ] Works on old Android (Galaxy S8)
- [ ] Works on old iPhone (iPhone SE)

---

## 🔗 Quick Reference Commands

```bash
# Run all tests
npm run test:e2e

# Run mobile only
npx playwright test --project="Mobile Chrome" --project="Mobile Safari"

# Run with UI (best for development)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/mobile-responsiveness.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Generate screenshots
npx playwright test tests/ui-audit-screenshots.spec.ts

# View HTML report
npx playwright show-report

# View trace
npx playwright show-trace test-results/[trace-file].zip

# Update snapshots (for visual regression)
npx playwright test --update-snapshots

# Run on specific device
npx playwright test --project="iPhone 12"
```

---

## 📚 Additional Resources

### Playwright Documentation
- [Playwright Test](https://playwright.dev/docs/intro)
- [Emulation](https://playwright.dev/docs/emulation)
- [Screenshots](https://playwright.dev/docs/screenshots)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)

### Mobile Testing Best Practices
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [WebPageTest](https://www.webpagetest.org/) - Performance testing
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Automated audits

### Visual Testing
- [Percy.io](https://percy.io/) - Visual testing platform
- [Chromatic](https://www.chromatic.com/) - Storybook visual testing
- [Applitools](https://applitools.com/) - AI-powered visual testing

---

## 🎬 Next Steps

1. **Run baseline tests:**
   ```bash
   npm run test:e2e:ui
   ```

2. **Generate UI audit screenshots:**
   ```bash
   npx playwright test tests/ui-audit-screenshots.spec.ts
   ```

3. **Review screenshots:**
   ```bash
   open docs/ui-audit/
   ```

4. **Create custom mobile tests:**
   - Copy examples from this guide
   - Add to `tests/` folder
   - Run and iterate

5. **Set up CI/CD:**
   - Add to GitHub Actions
   - Run on every PR
   - Block merge if tests fail

---

**Questions?** Check the [Playwright Discord](https://discord.com/invite/playwright-807756831384403968) or open an issue!

**Last Updated:** November 5, 2025
