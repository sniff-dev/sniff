// Simple test script for environment variable interpolation
// Run with: tsx test/unit/env-vars.test.ts

import { interpolateEnvVars } from '../../src/index.js';

console.log('🧪 Testing Environment Variable Interpolation\n');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    failed++;
  }
}

function assertEquals(actual: string, expected: string, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected "${expected}" but got "${actual}"`);
  }
}

function assertThrows(fn: () => void, message?: string) {
  try {
    fn();
    throw new Error(message || 'Expected function to throw but it did not');
  } catch (error) {
    // Expected to throw
    if (error instanceof Error && error.message.includes('Expected function to throw')) {
      throw error;
    }
  }
}

// Test 1: Env var that exists
test('Replaces existing env var', () => {
  process.env.TEST_VAR = 'test-value';
  const result = interpolateEnvVars('key: ${TEST_VAR}');
  assertEquals(result, 'key: test-value');
  delete process.env.TEST_VAR;
});

// Test 2: Env var with default (var not set)
test('Uses default when env var not set', () => {
  delete process.env.MISSING_VAR;
  const result = interpolateEnvVars('key: ${MISSING_VAR:-default-value}');
  assertEquals(result, 'key: default-value');
});

// Test 3: Env var with default (var is set)
test('Uses env var over default when set', () => {
  process.env.SET_VAR = 'actual-value';
  const result = interpolateEnvVars('key: ${SET_VAR:-default-value}');
  assertEquals(result, 'key: actual-value');
  delete process.env.SET_VAR;
});

// Test 4: Missing required env var (should throw)
test('Throws error for missing required env var', () => {
  delete process.env.REQUIRED_VAR;
  assertThrows(() => {
    interpolateEnvVars('key: ${REQUIRED_VAR}');
  });
});

// Test 5: Empty default value
test('Supports empty default value', () => {
  delete process.env.EMPTY_DEFAULT;
  const result = interpolateEnvVars('key: ${EMPTY_DEFAULT:-}');
  assertEquals(result, 'key: ');
});

// Test 6: Multiple env vars in same string
test('Replaces multiple env vars', () => {
  process.env.VAR1 = 'value1';
  process.env.VAR2 = 'value2';
  const result = interpolateEnvVars('${VAR1} and ${VAR2}');
  assertEquals(result, 'value1 and value2');
  delete process.env.VAR1;
  delete process.env.VAR2;
});

// Test 7: Default with special characters
test('Handles defaults with special characters', () => {
  delete process.env.URL_VAR;
  const result = interpolateEnvVars('url: ${URL_VAR:-https://example.com/path?query=1}');
  assertEquals(result, 'url: https://example.com/path?query=1');
});

// Test 8: No env vars in string
test('Returns original string when no env vars', () => {
  const input = 'plain string with no vars';
  const result = interpolateEnvVars(input);
  assertEquals(result, input);
});

// Test 9: Realistic MCP config example
test('Works with realistic MCP config', () => {
  process.env.RAGIE_API_KEY = 'secret123';
  const input = `
mcp_servers:
  - url: \${RAGIE_URL:-https://api.ragie.ai/v1/mcp}
    authorization_token: \${RAGIE_API_KEY}
`;
  const expected = `
mcp_servers:
  - url: https://api.ragie.ai/v1/mcp
    authorization_token: secret123
`;
  const result = interpolateEnvVars(input);
  assertEquals(result, expected);
  delete process.env.RAGIE_API_KEY;
});

// Test 10: Empty string env var (should use it, not default)
test('Uses empty string env var value', () => {
  process.env.EMPTY_VAR = '';
  const result = interpolateEnvVars('key: ${EMPTY_VAR:-default}');
  assertEquals(result, 'key: '); // Should use empty string, not default
  delete process.env.EMPTY_VAR;
});

// Test 11: Env var name validation (lowercase should not match)
test('Only matches uppercase env var names', () => {
  process.env.lowercase_var = 'value';
  const input = 'key: ${lowercase_var:-default}';
  const result = interpolateEnvVars(input);
  // Should NOT interpolate lowercase, keep as-is
  assertEquals(result, 'key: ${lowercase_var:-default}');
  delete process.env.lowercase_var;
});

// Test 12: Env var with numbers
test('Supports env var names with numbers', () => {
  process.env.VAR_123 = 'numeric-value';
  const result = interpolateEnvVars('key: ${VAR_123}');
  assertEquals(result, 'key: numeric-value');
  delete process.env.VAR_123;
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
