// tests/global.teardown.ts
// Global teardown for Playwright tests
// Cleans up test data and resources

async function globalTeardown() {
  console.log('🧹 Running global teardown for ImiRezervimi.al tests...');
  
  // Clean up test data if needed
  // This could include cleaning up test appointments, users, etc.
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;