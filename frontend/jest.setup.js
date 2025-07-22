// frontend/jest.setup.js
// Jest setup for Instagram login tests

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}));

// Mock environment variables for testing
process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID = 'test_client_id';
process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/instagram';
process.env.INSTAGRAM_CLIENT_SECRET = 'test_client_secret';

// Mock fetch for API calls
global.fetch = jest.fn();

// Setup console mocks to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};