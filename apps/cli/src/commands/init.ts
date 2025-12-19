/**
 * init command - Create a new sniff.yml config file
 */

import { Command } from 'commander'

const SNIFF_YML_TEMPLATE = `# Sniff Agent Configuration
# Documentation: https://github.com/caiopizzol/sniff

version: "2.0"

agents:
  - id: triage-agent
    name: Triage Agent
    systemPrompt: |
      You are a helpful triage agent. When assigned an issue:
      1. Analyze the issue description
      2. Identify the root cause if possible
      3. Suggest next steps or solutions
      4. Be concise and actionable

    runner:
      claude:
        allowedTools:
          - Read
          - Glob
          - Grep
`

const ENV_TEMPLATE = `# Sniff CLI Environment Configuration
# Copy to .env and fill in your values

# =============================================================================
# REQUIRED
# =============================================================================

# Your deployed proxy URL (Cloudflare Worker)
SNIFF_PROXY_URL=https://your-proxy.workers.dev

# =============================================================================
# OPTIONAL
# =============================================================================

# Local server port (default: 3847)
# SNIFF_PORT=3847

# Linear webhook secret for signature verification
# Must match WEBHOOK_SECRET in your proxy
# LINEAR_WEBHOOK_SECRET=
`

export const initCommand = new Command('init')
  .description('Create a new sniff.yml configuration file')
  .option('-f, --force', 'Overwrite existing config file')
  .action(async (options) => {
    const configPath = 'sniff.yml'
    const envPath = '.env.example'
    const configFile = Bun.file(configPath)

    if ((await configFile.exists()) && !options.force) {
      console.error('Error: sniff.yml already exists. Use --force to overwrite.')
      process.exit(1)
    }

    await Bun.write(configPath, SNIFF_YML_TEMPLATE)
    console.log('Created sniff.yml')

    // Create .env.example if it doesn't exist
    const envFile = Bun.file(envPath)
    if (!(await envFile.exists())) {
      await Bun.write(envPath, ENV_TEMPLATE)
      console.log('Created .env.example')
    }

    console.log('')
    console.log('Next steps:')
    console.log('  1. Copy .env.example to .env and fill in your values')
    console.log('  2. Deploy your proxy worker: cd apps/proxy && bunx wrangler deploy')
    console.log('  3. Update SNIFF_PROXY_URL in .env with your proxy URL')
    console.log('  4. Authenticate with Linear: sniff auth linear')
    console.log('  5. Start your agent: sniff start')
  })
