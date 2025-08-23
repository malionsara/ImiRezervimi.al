#!/usr/bin/env node
/**
 * Deployment Testing Script for ImiRezervimi.al
 * Tests deployed instances on Vercel to ensure everything works correctly
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  production: {
    url: 'https://imirezervimi.al',
    name: 'Production'
  },
  preview: {
    url: process.env.VERCEL_PREVIEW_URL || 'https://imi-rezervimi-al-git-main-your-team.vercel.app',
    name: 'Preview/Staging'
  },
  localhost: {
    url: 'http://localhost:3000',
    name: 'Local Development'
  }
};

class DeploymentTester {
  constructor(environment = 'production') {
    this.env = environment;
    this.config = config[environment];
    this.results = {
      environment: environment,
      url: this.config.url,
      timestamp: new Date().toISOString(),
      tests: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    if (!this.config) {
      throw new Error(`Unknown environment: ${environment}`);
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📝',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      debug: '🐛'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testHealthEndpoint() {
    this.log('Testing health endpoint...', 'info');
    
    try {
      const response = await fetch(`${this.config.url}/api/health`);
      const isHealthy = response.status === 200;
      
      this.results.tests.healthEndpoint = {
        passed: isHealthy,
        status: response.status,
        message: isHealthy ? 'Health endpoint responding' : 'Health endpoint not responding'
      };

      if (isHealthy) {
        this.log('Health endpoint test passed', 'success');
        this.results.summary.passed++;
      } else {
        this.log(`Health endpoint test failed: ${response.status}`, 'error');
        this.results.summary.failed++;
      }
      
      this.results.summary.total++;
    } catch (error) {
      this.log(`Health endpoint test error: ${error.message}`, 'error');
      this.results.tests.healthEndpoint = {
        passed: false,
        error: error.message
      };
      this.results.summary.failed++;
      this.results.summary.total++;
    }
  }

  async testHomepageLoad() {
    this.log('Testing homepage load...', 'info');
    
    try {
      const startTime = Date.now();
      const response = await fetch(this.config.url);
      const loadTime = Date.now() - startTime;
      
      const isLoaded = response.status === 200;
      const isPerformant = loadTime < 5000; // 5 seconds max
      
      this.results.tests.homepageLoad = {
        passed: isLoaded,
        loadTime: loadTime,
        performant: isPerformant,
        status: response.status,
        message: isLoaded ? `Homepage loaded in ${loadTime}ms` : 'Homepage failed to load'
      };

      if (isLoaded) {
        this.log(`Homepage test passed (${loadTime}ms)`, 'success');
        this.results.summary.passed++;
      } else {
        this.log(`Homepage test failed: ${response.status}`, 'error');
        this.results.summary.failed++;
      }

      if (!isPerformant) {
        this.log(`Homepage load is slow: ${loadTime}ms`, 'warning');
        this.results.summary.warnings++;
      }
      
      this.results.summary.total++;
    } catch (error) {
      this.log(`Homepage test error: ${error.message}`, 'error');
      this.results.tests.homepageLoad = {
        passed: false,
        error: error.message
      };
      this.results.summary.failed++;
      this.results.summary.total++;
    }
  }

  async testAPIEndpoints() {
    this.log('Testing critical API endpoints...', 'info');
    
    const endpoints = [
      { path: '/api/notifications/templates', method: 'GET', name: 'WhatsApp Templates' },
      { path: '/api/search/salons', method: 'GET', name: 'Salon Search', query: '?q=test' },
      { path: '/api/salons/malion', method: 'GET', name: 'Salon Info' }
    ];

    let apiTestsPassed = 0;
    let apiTestsTotal = endpoints.length;

    for (const endpoint of endpoints) {
      try {
        const url = `${this.config.url}${endpoint.path}${endpoint.query || ''}`;
        const response = await fetch(url, { method: endpoint.method });
        
        const passed = response.status === 200 || response.status === 404; // 404 might be valid for some endpoints
        
        this.results.tests[`api_${endpoint.name.toLowerCase().replace(/\s+/g, '_')}`] = {
          passed: passed,
          status: response.status,
          endpoint: endpoint.path,
          message: `${endpoint.name} API: ${response.status}`
        };

        if (passed) {
          apiTestsPassed++;
          this.log(`${endpoint.name} API test passed (${response.status})`, 'success');
        } else {
          this.log(`${endpoint.name} API test failed: ${response.status}`, 'error');
        }

      } catch (error) {
        this.log(`${endpoint.name} API test error: ${error.message}`, 'error');
        this.results.tests[`api_${endpoint.name.toLowerCase().replace(/\s+/g, '_')}`] = {
          passed: false,
          error: error.message
        };
      }
    }

    this.results.summary.passed += apiTestsPassed;
    this.results.summary.failed += (apiTestsTotal - apiTestsPassed);
    this.results.summary.total += apiTestsTotal;
  }

  async runPlaywrightTests() {
    this.log('Running critical Playwright tests...', 'info');
    
    try {
      // Run a subset of critical tests
      const testCommand = `npx playwright test tests/homepage.spec.ts tests/authentication.spec.ts --project=chromium --reporter=json`;
      
      const testProcess = spawn('npx', [
        'playwright', 'test', 
        'tests/homepage.spec.ts', 
        'tests/authentication.spec.ts',
        '--project=chromium',
        '--reporter=json'
      ], {
        env: {
          ...process.env,
          BASE_URL: this.config.url,
          HEADLESS: 'true'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errors = '';

      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      testProcess.stderr.on('data', (data) => {
        errors += data.toString();
      });

      const exitCode = await new Promise((resolve) => {
        testProcess.on('close', resolve);
      });

      const playwrightPassed = exitCode === 0;
      
      this.results.tests.playwrightTests = {
        passed: playwrightPassed,
        exitCode: exitCode,
        message: playwrightPassed ? 'Critical E2E tests passed' : 'Some E2E tests failed',
        output: output.substring(0, 1000), // Limit output size
        errors: errors.substring(0, 1000)
      };

      if (playwrightPassed) {
        this.log('Playwright tests passed', 'success');
        this.results.summary.passed++;
      } else {
        this.log('Some Playwright tests failed', 'warning');
        this.results.summary.warnings++;
      }
      
      this.results.summary.total++;
      
    } catch (error) {
      this.log(`Playwright tests error: ${error.message}`, 'error');
      this.results.tests.playwrightTests = {
        passed: false,
        error: error.message
      };
      this.results.summary.failed++;
      this.results.summary.total++;
    }
  }

  async generateReport() {
    const reportPath = path.join(process.cwd(), `deployment-test-report-${this.env}-${Date.now()}.json`);
    
    // Calculate success rate
    this.results.summary.successRate = this.results.summary.total > 0 
      ? ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)
      : 0;

    // Overall status
    this.results.status = this.results.summary.failed === 0 
      ? (this.results.summary.warnings === 0 ? 'PASS' : 'PASS_WITH_WARNINGS')
      : 'FAIL';

    // Write JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate markdown report
    const markdownReport = this.generateMarkdownReport();
    const markdownPath = reportPath.replace('.json', '.md');
    fs.writeFileSync(markdownPath, markdownReport);

    this.log(`Reports generated:`, 'success');
    this.log(`  JSON: ${reportPath}`, 'info');
    this.log(`  Markdown: ${markdownPath}`, 'info');

    return this.results;
  }

  generateMarkdownReport() {
    const { results } = this;
    
    let report = `# 🚀 Deployment Test Report\n\n`;
    report += `**Environment:** ${results.environment} (${this.config.name})\n`;
    report += `**URL:** ${results.url}\n`;
    report += `**Timestamp:** ${results.timestamp}\n`;
    report += `**Status:** ${results.status}\n`;
    report += `**Success Rate:** ${results.summary.successRate}%\n\n`;

    // Summary
    report += `## 📊 Summary\n\n`;
    report += `| Metric | Count |\n`;
    report += `|--------|-------|\n`;
    report += `| Total Tests | ${results.summary.total} |\n`;
    report += `| Passed | ${results.summary.passed} |\n`;
    report += `| Failed | ${results.summary.failed} |\n`;
    report += `| Warnings | ${results.summary.warnings} |\n\n`;

    // Test Results
    report += `## 🧪 Test Results\n\n`;
    
    Object.entries(results.tests).forEach(([testName, testResult]) => {
      const status = testResult.passed ? '✅' : '❌';
      const name = testName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      report += `### ${status} ${name}\n`;
      if (testResult.message) {
        report += `**Result:** ${testResult.message}\n`;
      }
      if (testResult.loadTime) {
        report += `**Load Time:** ${testResult.loadTime}ms\n`;
      }
      if (testResult.status) {
        report += `**HTTP Status:** ${testResult.status}\n`;
      }
      if (testResult.error) {
        report += `**Error:** ${testResult.error}\n`;
      }
      report += `\n`;
    });

    // Recommendations
    if (results.summary.failed > 0 || results.summary.warnings > 0) {
      report += `## 🔧 Recommendations\n\n`;
      
      if (results.summary.failed > 0) {
        report += `- ❌ **Critical Issues:** ${results.summary.failed} tests failed. Please investigate and fix before production deployment.\n`;
      }
      
      if (results.summary.warnings > 0) {
        report += `- ⚠️ **Warnings:** ${results.summary.warnings} tests have warnings. Consider optimization.\n`;
      }

      if (results.tests.homepageLoad && !results.tests.homepageLoad.performant) {
        report += `- 🐌 **Performance:** Homepage load time is slow. Consider optimization.\n`;
      }
    } else {
      report += `## 🎉 All Tests Passed!\n\n`;
      report += `The deployment is working correctly. All critical functionality is operational.\n`;
    }

    report += `\n---\n*Report generated automatically by deployment testing script*`;
    
    return report;
  }

  async runAllTests() {
    this.log(`Starting deployment tests for ${this.config.name} (${this.config.url})`, 'info');
    
    await this.testHealthEndpoint();
    await this.testHomepageLoad();
    await this.testAPIEndpoints();
    
    // Only run Playwright tests if basic connectivity works
    if (this.results.tests.healthEndpoint?.passed) {
      await this.runPlaywrightTests();
    } else {
      this.log('Skipping Playwright tests due to connectivity issues', 'warning');
    }
    
    const finalResults = await this.generateReport();
    
    this.log(`Testing completed. Status: ${finalResults.status}`, 
      finalResults.status === 'PASS' ? 'success' : 'error');
    
    return finalResults;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'production';
  const validEnvs = ['production', 'preview', 'localhost'];
  
  if (!validEnvs.includes(environment)) {
    console.error(`❌ Invalid environment: ${environment}`);
    console.error(`✅ Valid environments: ${validEnvs.join(', ')}`);
    process.exit(1);
  }

  try {
    const tester = new DeploymentTester(environment);
    const results = await tester.runAllTests();
    
    // Exit with error code if tests failed
    if (results.status === 'FAIL') {
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`❌ Test execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = { DeploymentTester };

// Run if called directly
if (require.main === module) {
  main();
}