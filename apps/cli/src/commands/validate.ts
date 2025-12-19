/**
 * validate command - Validate sniff.yml configuration
 */

import { loadConfig } from '@sniff/config'
import { Command } from 'commander'

export const validateCommand = new Command('validate')
  .description('Validate sniff.yml configuration')
  .option('-c, --config <path>', 'Path to config file', 'sniff.yml')
  .action(async (options) => {
    try {
      const config = await loadConfig({ path: options.config })

      console.log('✓ Configuration is valid')
      console.log('')
      console.log(`  Version: ${config.version}`)
      console.log(`  Agents: ${config.agents.length}`)

      for (const agent of config.agents) {
        console.log(`    - ${agent.name} (${agent.id})`)

        // Determine runner type from config
        const runnerType = agent.runner.claude ? 'claude' : 'unknown'
        console.log(`      Runner: ${runnerType}`)
      }
    } catch (error) {
      console.error('✗ Configuration is invalid')
      console.error('')
      console.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })
