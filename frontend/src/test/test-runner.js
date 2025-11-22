/**
 * Comprehensive test runner for wishlist improvements
 * Orchestrates different types of tests and provides reporting
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Test configuration
 */
const TEST_CONFIG = {
  // Unit tests
  unit: {
    pattern: '**/*.test.{js,jsx}',
    exclude: ['**/*.property.test.{js,jsx}', '**/integration.test.jsx'],
    timeout: 30000
  },
  
  // Property-based tests
  property: {
    pattern: '**/*.property.test.{js,jsx}',
    timeout: 120000,
    runs: 100
  },
  
  // Integration tests
  integration: {
    pattern: '**/integration.test.jsx',
    timeout: 180000
  },
  
  // All tests
  all: {
    pattern: '**/*.{test,spec}.{js,jsx}',
    timeout: 300000
  }
};

/**
 * Test result tracking
 */
class TestResults {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, skipped: 0, duration: 0 },
      property: { passed: 0, failed: 0, skipped: 0, duration: 0 },
      integration: { passed: 0, failed: 0, skipped: 0, duration: 0 },
      total: { passed: 0, failed: 0, skipped: 0, duration: 0 }
    };
    this.failures = [];
    this.propertyFailures = [];
  }

  addResult(type, result) {
    this.results[type].passed += result.passed || 0;
    this.results[type].failed += result.failed || 0;
    this.results[type].skipped += result.skipped || 0;
    this.results[type].duration += result.duration || 0;
    
    if (result.failures) {
      this.failures.push(...result.failures);
    }
    
    if (result.propertyFailures) {
      this.propertyFailures.push(...result.propertyFailures);
    }
  }

  calculateTotals() {
    const types = ['unit', 'property', 'integration'];
    types.forEach(type => {
      this.results.total.passed += this.results[type].passed;
      this.results.total.failed += this.results[type].failed;
      this.results.total.skipped += this.results[type].skipped;
      this.results.total.duration += this.results[type].duration;
    });
  }

  generateReport() {
    this.calculateTotals();
    
    const report = {
      summary: this.results,
      failures: this.failures,
      propertyFailures: this.propertyFailures,
      timestamp: new Date().toISOString(),
      success: this.results.total.failed === 0
    };

    return report;
  }
}

/**
 * Run specific test type
 */
async function runTestType(type, options = {}) {
  const config = TEST_CONFIG[type];
  if (!config) {
    throw new Error(`Unknown test type: ${type}`);
  }

  const {
    verbose = false,
    coverage = false,
    watch = false,
    bail = false
  } = options;

  console.log(`\n🧪 Running ${type} tests...`);
  console.log(`Pattern: ${config.pattern}`);
  console.log(`Timeout: ${config.timeout}ms`);

  const vitestArgs = [
    'vitest',
    watch ? '' : '--run',
    `--testTimeout=${config.timeout}`,
    verbose ? '--reporter=verbose' : '--reporter=default',
    coverage ? '--coverage' : '',
    bail ? '--bail=1' : '',
    `--testNamePattern="${config.pattern}"`,
    config.exclude ? `--exclude="${config.exclude.join(',')}"` : ''
  ].filter(Boolean);

  try {
    const startTime = Date.now();
    const output = execSync(vitestArgs.join(' '), {
      encoding: 'utf8',
      stdio: verbose ? 'inherit' : 'pipe',
      cwd: process.cwd()
    });
    const duration = Date.now() - startTime;

    // Parse vitest output to extract results
    const result = parseVitestOutput(output, duration);
    console.log(`✅ ${type} tests completed in ${duration}ms`);
    
    return result;
  } catch (error) {
    const duration = Date.now() - Date.now();
    console.error(`❌ ${type} tests failed:`, error.message);
    
    return {
      passed: 0,
      failed: 1,
      skipped: 0,
      duration,
      failures: [{ type, error: error.message }]
    };
  }
}

/**
 * Parse vitest output to extract test results
 */
function parseVitestOutput(output, duration) {
  // This is a simplified parser - in practice you'd want more robust parsing
  const lines = output.split('\n');
  
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const failures = [];
  const propertyFailures = [];

  lines.forEach(line => {
    if (line.includes('✓') || line.includes('PASS')) {
      passed++;
    } else if (line.includes('✗') || line.includes('FAIL')) {
      failed++;
      failures.push({ message: line.trim() });
    } else if (line.includes('SKIP')) {
      skipped++;
    } else if (line.includes('Property failed') || line.includes('Counterexample')) {
      propertyFailures.push({ message: line.trim() });
    }
  });

  return {
    passed,
    failed,
    skipped,
    duration,
    failures,
    propertyFailures
  };
}

/**
 * Run property-based tests with specific configuration
 */
async function runPropertyTests(options = {}) {
  const {
    runs = 100,
    verbose = false,
    seed = null
  } = options;

  console.log(`\n🎲 Running property-based tests with ${runs} runs...`);
  
  // Set environment variables for fast-check
  process.env.FC_NUM_RUNS = runs.toString();
  if (seed) {
    process.env.FC_SEED = seed.toString();
  }

  const result = await runTestType('property', { verbose });
  
  // Clean up environment variables
  delete process.env.FC_NUM_RUNS;
  delete process.env.FC_SEED;

  return result;
}

/**
 * Run tests with coverage reporting
 */
async function runWithCoverage(testType = 'all', options = {}) {
  console.log(`\n📊 Running ${testType} tests with coverage...`);
  
  const result = await runTestType(testType, { 
    ...options, 
    coverage: true 
  });

  // Generate coverage report
  try {
    execSync('npx vitest --coverage --reporter=html', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('📈 Coverage report generated in coverage/ directory');
  } catch (error) {
    console.warn('⚠️  Failed to generate coverage report:', error.message);
  }

  return result;
}

/**
 * Run tests in watch mode for development
 */
async function runInWatchMode(testType = 'unit', options = {}) {
  console.log(`\n👀 Running ${testType} tests in watch mode...`);
  console.log('Press Ctrl+C to exit');
  
  await runTestType(testType, { 
    ...options, 
    watch: true 
  });
}

/**
 * Run comprehensive test suite
 */
async function runComprehensiveTests(options = {}) {
  const {
    verbose = false,
    coverage = false,
    propertyRuns = 100,
    bail = false
  } = options;

  console.log('\n🚀 Running comprehensive test suite...');
  console.log('This includes unit tests, property-based tests, and integration tests');
  
  const results = new TestResults();
  const startTime = Date.now();

  try {
    // 1. Run unit tests first (fastest feedback)
    console.log('\n📋 Phase 1: Unit Tests');
    const unitResult = await runTestType('unit', { verbose, bail });
    results.addResult('unit', unitResult);

    if (bail && unitResult.failed > 0) {
      console.log('❌ Stopping due to unit test failures (--bail)');
      return results.generateReport();
    }

    // 2. Run property-based tests
    console.log('\n🎲 Phase 2: Property-Based Tests');
    const propertyResult = await runPropertyTests({ 
      runs: propertyRuns, 
      verbose 
    });
    results.addResult('property', propertyResult);

    if (bail && propertyResult.failed > 0) {
      console.log('❌ Stopping due to property test failures (--bail)');
      return results.generateReport();
    }

    // 3. Run integration tests
    console.log('\n🔗 Phase 3: Integration Tests');
    const integrationResult = await runTestType('integration', { verbose, bail });
    results.addResult('integration', integrationResult);

    // 4. Generate coverage if requested
    if (coverage) {
      console.log('\n📊 Phase 4: Coverage Report');
      await runWithCoverage('all', { verbose: false });
    }

    const totalDuration = Date.now() - startTime;
    console.log(`\n✅ Comprehensive test suite completed in ${totalDuration}ms`);

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    results.addResult('total', { 
      failed: 1, 
      failures: [{ type: 'suite', error: error.message }] 
    });
  }

  return results.generateReport();
}

/**
 * Generate test report
 */
function generateTestReport(report, outputPath = './test-report.json') {
  console.log('\n📄 Generating test report...');
  
  // Write JSON report
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  // Print summary to console
  console.log('\n📊 Test Summary:');
  console.log(`Total Tests: ${report.summary.total.passed + report.summary.total.failed + report.summary.total.skipped}`);
  console.log(`✅ Passed: ${report.summary.total.passed}`);
  console.log(`❌ Failed: ${report.summary.total.failed}`);
  console.log(`⏭️  Skipped: ${report.summary.total.skipped}`);
  console.log(`⏱️  Duration: ${report.summary.total.duration}ms`);
  
  if (report.failures.length > 0) {
    console.log('\n❌ Failures:');
    report.failures.forEach((failure, index) => {
      console.log(`${index + 1}. ${failure.message || failure.error}`);
    });
  }
  
  if (report.propertyFailures.length > 0) {
    console.log('\n🎲 Property Test Failures:');
    report.propertyFailures.forEach((failure, index) => {
      console.log(`${index + 1}. ${failure.message}`);
    });
  }
  
  console.log(`\n📄 Full report saved to: ${outputPath}`);
  
  return report.success;
}

/**
 * Main CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'comprehensive';
  
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    coverage: args.includes('--coverage') || args.includes('-c'),
    watch: args.includes('--watch') || args.includes('-w'),
    bail: args.includes('--bail') || args.includes('-b'),
    propertyRuns: parseInt(args.find(arg => arg.startsWith('--runs='))?.split('=')[1]) || 100
  };

  let report;

  switch (command) {
    case 'unit':
      report = { summary: { total: await runTestType('unit', options) } };
      break;
      
    case 'property':
      report = { summary: { total: await runPropertyTests(options) } };
      break;
      
    case 'integration':
      report = { summary: { total: await runTestType('integration', options) } };
      break;
      
    case 'coverage':
      report = { summary: { total: await runWithCoverage('all', options) } };
      break;
      
    case 'watch':
      await runInWatchMode(args[1] || 'unit', options);
      return; // Watch mode doesn't generate reports
      
    case 'comprehensive':
    default:
      report = await runComprehensiveTests(options);
      break;
  }

  const success = generateTestReport(report);
  process.exit(success ? 0 : 1);
}

// Export functions for programmatic use
export {
  runTestType,
  runPropertyTests,
  runWithCoverage,
  runInWatchMode,
  runComprehensiveTests,
  generateTestReport,
  TestResults
};

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}