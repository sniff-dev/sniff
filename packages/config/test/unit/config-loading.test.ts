// Test script to verify config loading with environment variables
// Run with: tsx test/unit/config-loading.test.ts

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from '../../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set test environment variables manually
process.env.AGENT_NAME = 'My Custom Agent';
process.env.LINEAR_MCP_URL = 'https://api.sniff.to/mcp/linear';
process.env.RAGIE_API_KEY = 'test_api_key_12345';
process.env.RAGIE_MCP_URL = 'https://api.ragie.ai/v1/mcp';
process.env.RAGIE_NAME = 'Custom Knowledge Base';

console.log('\n🧪 Testing Config Loading with Environment Variables\n');

try {
  // Test 1: Load config with env vars
  console.log('📝 Test 1: Loading config with environment variables...');
  const configPath = resolve(__dirname, '../fixtures/config-with-env-vars.yml');
  const loadedConfig = loadConfig(configPath);

  console.log('\n✅ Config loaded successfully!\n');

  // Verify interpolation worked
  console.log('📋 Verification Results:\n');

  console.log(`Agent Name: ${loadedConfig.agent.name}`);
  console.log(`  ✓ Expected: "My Custom Agent"`);
  console.log(`  ✓ Got: "${loadedConfig.agent.name}"`);
  console.log(`  ${loadedConfig.agent.name === 'My Custom Agent' ? '✅ PASS' : '❌ FAIL'}\n`);

  // Check MCP servers
  const mcpServers = loadedConfig.agent.model.anthropic.mcp_servers;
  if (mcpServers && mcpServers.length === 2) {
    console.log(`MCP Servers Count: ${mcpServers.length}`);
    console.log(`  ✓ Expected: 2`);
    console.log(`  ✅ PASS\n`);

    // Check Linear integration (no auth token in config)
    const linearServer = mcpServers[0];
    console.log(`Linear MCP Server:`);
    console.log(`  - Name: ${linearServer.name}`);
    console.log(`  - URL: ${linearServer.url}`);
    console.log(`  - Has authorization_token: ${!!linearServer.authorization_token}`);
    console.log(
      `  ${!linearServer.authorization_token ? '✅ PASS (no token, will use JWT)' : '❌ FAIL'}\n`,
    );

    // Check third-party MCP (has auth token from env var)
    const ragieServer = mcpServers[1];
    console.log(`Third-Party MCP Server:`);
    console.log(`  - Name: ${ragieServer.name}`);
    console.log(`  - URL: ${ragieServer.url}`);
    console.log(`  - Has authorization_token: ${!!ragieServer.authorization_token}`);
    console.log(`  - Token value: ${ragieServer.authorization_token}`);
    console.log(
      `  ${ragieServer.authorization_token === 'test_api_key_12345' ? '✅ PASS' : '❌ FAIL'}\n`,
    );
  } else {
    console.log(`❌ FAIL: Expected 2 MCP servers, got ${mcpServers?.length || 0}\n`);
  }

  // Test 2: Verify defaults work when env vars not set
  console.log('\n📝 Test 2: Testing defaults when env vars not set...');
  delete process.env.AGENT_NAME;
  delete process.env.RAGIE_NAME;

  const configWithDefaults = loadConfig(configPath);
  console.log(`Agent Name (should use default): ${configWithDefaults.agent.name}`);
  console.log(
    `  ${configWithDefaults.agent.name === 'Test Environment Variables Agent' ? '✅ PASS' : '❌ FAIL'}\n`,
  );

  const ragieServerWithDefault = configWithDefaults.agent.model.anthropic.mcp_servers?.[1];
  console.log(`Ragie Server Name (should use default): ${ragieServerWithDefault?.name}`);
  console.log(`  ${ragieServerWithDefault?.name === 'Knowledge Base' ? '✅ PASS' : '❌ FAIL'}\n`);

  // Test 3: Verify required env var throws error
  console.log('\n📝 Test 3: Testing required env var (RAGIE_API_KEY) throws error when missing...');
  delete process.env.RAGIE_API_KEY;

  try {
    loadConfig(configPath);
    console.log('❌ FAIL: Should have thrown error for missing RAGIE_API_KEY\n');
  } catch (error) {
    if (error instanceof Error && error.message.includes('RAGIE_API_KEY')) {
      console.log('✅ PASS: Correctly threw error for missing required env var\n');
      console.log(`Error message: ${error.message}\n`);
    } else {
      console.log('❌ FAIL: Wrong error thrown\n');
    }
  }

  console.log('🎉 All tests completed!\n');
} catch (error) {
  console.error('\n❌ Test failed with error:');
  console.error(error);
  process.exit(1);
}
