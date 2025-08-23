# 🧪 Testing Guide for ImiRezervimi.al

This comprehensive testing guide covers all aspects of testing the Albanian beauty salon booking platform, from local development to production deployment verification.

## Table of Contents

- [Quick Start](#quick-start)
- [Local Testing Setup](#local-testing-setup)
- [Test Suites Overview](#test-suites-overview)
- [Running Tests](#running-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment Testing](#deployment-testing)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in the `frontend` directory:

```bash
# Test user credentials
TEST_USER_PHONE=+355675490330
TEST_SALON_OWNER_PHONE=+355691234567

# Application environment (copy from your .env file)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
```

### 3. Run Tests
```bash
# Run all tests
npm test

# Run specific test suite
npx playwright test tests/homepage.spec.ts

# Run tests with UI (headed mode)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug
```

## Local Testing Setup

### Prerequisites

1. **Node.js 18+** - Required for running the application and tests
2. **Playwright** - E2E testing framework
3. **Local Development Server** - Next.js application running locally
4. **Test Database Access** - Supabase connection for test data
5. **WhatsApp Sandbox** - Twilio WhatsApp sandbox for notification testing

### Environment Setup

1. **Start the application locally:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Verify application is running:**
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Run test connectivity check:**
   ```bash
   npx playwright test tests/global.setup.ts
   ```

### Test Data Management

The testing framework uses controlled test data to ensure consistent results:

- **Test Users:** Defined in `tests/utils/test-data.ts`
- **Test Salons:** Malion salon used as primary test target
- **Test Phone Numbers:** Albanian format (+355) numbers
- **Test Appointments:** Generated with future dates to avoid conflicts

## Test Suites Overview

### 1. Homepage Tests (`tests/homepage.spec.ts`)
- ✅ Page loading and basic functionality
- ✅ Navigation elements and links
- ✅ Albanian text display
- ✅ Mobile responsiveness
- ✅ Performance and SEO checks
- ✅ Interactive elements and assets

**Coverage:** Landing page, initial user experience, SEO compliance

### 2. Authentication Tests (`tests/authentication.spec.ts`)
- ✅ Instagram login integration
- ✅ Phone verification flow
- ✅ Profile completion
- ✅ Session management
- ✅ Error handling and validation
- ✅ Mobile authentication flow

**Coverage:** User registration, login, profile management

### 3. Booking Flow Tests (`tests/booking.spec.ts`)
- ✅ Service selection
- ✅ Albanian calendar functionality
- ✅ Time slot selection and availability
- ✅ Booking confirmation and summary
- ✅ Error scenarios and validation
- ✅ Mobile booking experience
- ✅ Network failure handling

**Coverage:** Complete customer booking journey

### 4. Salon Management Tests (`tests/salon-management.spec.ts`)
- ✅ Dashboard functionality
- ✅ Appointment request handling
- ✅ Approval/decline workflows
- ✅ Calendar and schedule management
- ✅ Settings and service management
- ✅ WhatsApp message history
- ✅ Mobile salon dashboard

**Coverage:** Salon owner operations and business management

### 5. Customer Dashboard Tests (`tests/customer-dashboard.spec.ts`)
- ✅ Booking history display
- ✅ Status filtering and tracking
- ✅ Profile management
- ✅ Phone number updates
- ✅ Empty state handling
- ✅ Mobile customer experience

**Coverage:** Customer account management and booking tracking

### 6. API Endpoint Tests (`tests/api-endpoints.spec.ts`)
- ✅ Authentication APIs
- ✅ Appointment management APIs
- ✅ WhatsApp notification APIs
- ✅ Twilio webhook handling
- ✅ Salon and service APIs
- ✅ Search and discovery APIs
- ✅ Error handling and validation
- ✅ Rate limiting and security

**Coverage:** Backend functionality and API reliability

## Running Tests

### Local Test Execution

#### Basic Commands
```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/homepage.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run mobile tests
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

#### Development and Debugging
```bash
# Run tests with browser UI visible
npx playwright test --headed

# Run tests in debug mode with step-by-step execution
npx playwright test --debug

# Run single test in debug mode
npx playwright test tests/booking.spec.ts -t "should complete full booking flow" --debug

# Generate and open HTML report
npx playwright show-report
```

#### Test Filtering
```bash
# Run tests by name pattern
npx playwright test -g "should display"

# Run tests by tag
npx playwright test --grep "@smoke"

# Run tests in specific directory
npx playwright test tests/

# Skip specific tests
npx playwright test --grep-invert "network issues"
```

### Test Configuration

The test configuration is defined in `playwright.config.ts`:

- **Multiple Browsers:** Chromium, Firefox, WebKit
- **Mobile Devices:** iPhone 12, Pixel 5
- **Parallel Execution:** 2 workers for faster execution
- **Retry Logic:** 1 retry on CI, 0 locally
- **Timeouts:** 30s default, 60s for slow operations
- **Screenshots:** On failure only
- **Video:** On first retry
- **Trace:** On first retry for debugging

### Environment-Specific Testing

```bash
# Test against local development server
BASE_URL=http://localhost:3000 npx playwright test

# Test against staging/preview deployment
BASE_URL=https://preview-url.vercel.app npx playwright test

# Test against production
BASE_URL=https://imirezervimi.al npx playwright test

# Use custom environment variables
TEST_USER_PHONE=+355675490331 npx playwright test
```

## CI/CD Pipeline

### Automated Testing Workflows

#### 1. Main Test Pipeline (`.github/workflows/playwright-tests.yml`)
**Triggers:** Push to main/develop, Pull Requests
**Includes:**
- Build verification and linting
- Cross-browser E2E testing
- API endpoint testing
- Mobile device testing
- Performance and accessibility checks

#### 2. Manual Test Execution (`.github/workflows/manual-tests.yml`)
**Triggers:** Manual workflow dispatch
**Features:**
- Selective test suite execution
- Environment selection (production/preview/localhost)
- Browser selection
- Debug mode support

#### 3. Vercel Deployment Testing (`.github/workflows/vercel-deployment.yml`)
**Triggers:** Deployment status updates
**Includes:**
- Deployment health checks
- Critical flow verification
- Performance auditing with Lighthouse
- Security scanning
- Accessibility testing

### GitHub Actions Configuration

#### Required Secrets
```
TEST_USER_PHONE=+355675490330
TEST_SALON_OWNER_PHONE=+355691234567
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-app.vercel.app
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_TOKEN=your_vercel_token
```

#### Workflow Features
- **Parallel Execution:** Tests run across multiple browsers simultaneously
- **Artifact Collection:** Test reports, screenshots, and videos preserved
- **Failure Analysis:** Automatic issue creation for production failures
- **PR Integration:** Test results commented on pull requests
- **Performance Monitoring:** Lighthouse scores tracked over time

## Deployment Testing

### Automated Deployment Verification

The deployment testing system automatically verifies deployments using the script `scripts/test-deployment.js`:

```bash
# Test production deployment
node scripts/test-deployment.js production

# Test preview deployment
node scripts/test-deployment.js preview

# Test local development
node scripts/test-deployment.js localhost
```

### Deployment Test Coverage

1. **Health Endpoint Testing**
   - API availability
   - Response time measurement
   - Basic connectivity verification

2. **Homepage Load Testing**
   - Page loading performance
   - Asset loading verification
   - Initial render testing

3. **Critical API Testing**
   - Authentication endpoints
   - Booking APIs
   - WhatsApp notification APIs
   - Search functionality

4. **End-to-End Flow Testing**
   - Homepage navigation
   - Authentication flows
   - Critical user journeys

### Test Report Generation

The deployment tester generates comprehensive reports in both JSON and Markdown formats:

- **JSON Report:** Machine-readable results for automation
- **Markdown Report:** Human-readable summary with recommendations
- **Success Rate Calculation:** Percentage of passing tests
- **Performance Metrics:** Load times and response times
- **Failure Analysis:** Detailed error information and suggestions

## Test Data Management

### Test User Accounts

The testing framework uses dedicated test accounts to avoid interfering with real user data:

```javascript
// Test users defined in tests/utils/test-data.ts
const TEST_DATA = {
  USERS: {
    VALID_USER: {
      phone: '+355675490330',
      firstName: 'Test',
      lastName: 'User'
    },
    SALON_OWNER: {
      phone: '+355691234567',
      firstName: 'Salon',
      lastName: 'Owner'
    }
  }
}
```

### Test Salon Configuration

```javascript
const TEST_DATA = {
  SALONS: {
    MALION: {
      name: 'Malion',
      slug: 'malion',
      expectedServices: [
        'Qethje Femra',
        'Qethje Burra', 
        'Larim + Fletëzim',
        'Ngjyrosje'
      ]
    }
  }
}
```

### Test Cleanup

The testing framework includes cleanup utilities to remove test data:

```javascript
// Cleanup function in tests/utils/test-helpers.ts
export async function cleanupTestData(page: Page, testData: any[]) {
  console.log('🧹 Cleaning up test data...');
  // Implementation for cleaning up test appointments, users, etc.
}
```

## Best Practices

### 1. Test Organization
- **Page Object Models:** Reusable page representations
- **Utility Functions:** Common operations abstracted
- **Test Data Separation:** Centralized test data management
- **Environment Isolation:** Separate test and production data

### 2. Reliability Patterns
- **Wait Strategies:** Explicit waits for elements and network
- **Retry Logic:** Automatic retry for flaky tests
- **Error Handling:** Graceful failure with meaningful messages
- **Screenshot Capture:** Visual debugging for failures

### 3. Performance Optimization
- **Parallel Execution:** Multiple test workers
- **Selective Testing:** Run only relevant tests
- **Resource Management:** Efficient browser usage
- **Test Prioritization:** Critical paths first

### 4. Maintenance
- **Regular Updates:** Keep test selectors current
- **Data Refresh:** Update test data as needed
- **Browser Updates:** Keep Playwright browsers current
- **Dependency Management:** Regular npm updates

## Troubleshooting

### Common Issues and Solutions

#### 1. Test Timeout Errors
```bash
# Increase timeout for slow tests
npx playwright test --timeout=60000

# Check network connectivity
curl -f http://localhost:3000/api/health
```

#### 2. Element Not Found
- Verify selectors in browser dev tools
- Check for loading states and wait conditions
- Ensure test data exists in the database

#### 3. Authentication Issues
- Verify test user credentials in .env.local
- Check Instagram app configuration
- Validate phone verification setup

#### 4. Mobile Test Failures
- Test viewport settings
- Touch interaction compatibility
- Mobile-specific element visibility

#### 5. API Test Failures
- Verify backend service availability
- Check API endpoint configurations
- Validate request/response formats

### Debugging Techniques

#### 1. Visual Debugging
```bash
# Run with browser visible
npx playwright test --headed

# Enable slow motion for better observation
npx playwright test --headed --slow-mo=1000
```

#### 2. Step-by-Step Debugging
```bash
# Pause on each action
npx playwright test --debug

# Add breakpoints in test code
await page.pause();
```

#### 3. Network Analysis
```bash
# Enable network logging
DEBUG=pw:api npx playwright test

# Capture HAR files for network analysis
npx playwright test --trace=on
```

#### 4. Screenshot Analysis
```bash
# Take screenshots at specific points
await page.screenshot({ path: 'debug-screenshot.png' });

# Enable automatic screenshots on failure
npx playwright test --screenshot=only-on-failure
```

### Performance Optimization

#### 1. Reduce Test Execution Time
```bash
# Run tests in parallel
npx playwright test --workers=4

# Run only changed tests
npx playwright test --only-changed
```

#### 2. Optimize Test Setup
- Use beforeAll for expensive setup operations
- Cache authentication states
- Minimize database operations
- Reuse browser contexts where possible

### Reporting and Monitoring

#### 1. Generate Detailed Reports
```bash
# Generate HTML report with detailed results
npx playwright test --reporter=html

# Generate JSON report for CI integration
npx playwright test --reporter=json
```

#### 2. Continuous Monitoring
- Set up alerts for test failures
- Monitor test execution times
- Track flaky test patterns
- Regular test suite health checks

## Support and Resources

### Documentation
- [Playwright Official Docs](https://playwright.dev/)
- [Project README](./README.md)
- [Supabase Documentation](./docs/SUPABASE.md)

### Getting Help
- Check the [GitHub Issues](https://github.com/anthropics/claude-code/issues) for known problems
- Review test logs and screenshots in CI artifacts
- Contact the development team for complex issues

---

*This testing guide is maintained as part of the ImiRezervimi.al project. Last updated: 2025-08-22*