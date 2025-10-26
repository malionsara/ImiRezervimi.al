#!/usr/bin/env node
// scripts/capture-ui-screenshots.js
// Script to capture UI audit screenshots using Playwright

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('📸 Starting UI Audit Screenshot Capture...\n');

// Ensure output directories exist
const outputDirs = [
  'docs/ui-audit/customer-pages',
  'docs/ui-audit/salon-pages', 
  'docs/ui-audit/admin-pages',
  'docs/ui-audit/error-pages'
];

outputDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

try {
  // Change to frontend directory
  process.chdir('frontend');
  
  console.log('🚀 Running Playwright screenshot tests...\n');
  
  // Run the UI audit screenshot tests
  const command = 'npx playwright test tests/ui-audit-screenshots.spec.ts --headed';
  
  console.log(`Executing: ${command}\n`);
  
  execSync(command, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Screenshot capture completed successfully!');
  console.log('\n📁 Screenshots saved to:');
  console.log('   - docs/ui-audit/customer-pages/');
  console.log('   - docs/ui-audit/salon-pages/');
  console.log('   - docs/ui-audit/admin-pages/');
  console.log('   - docs/ui-audit/error-pages/');
  
} catch (error) {
  console.error('\n❌ Error capturing screenshots:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   1. Make sure the frontend server is running (npm run dev)');
  console.log('   2. Check that Playwright is installed (npm install)');
  console.log('   3. Verify test files exist in tests/ directory');
  process.exit(1);
}
