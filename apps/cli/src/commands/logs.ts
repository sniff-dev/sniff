/**
 * logs command - View execution logs
 */

import { logStorage } from '@sniff/storage'
import { Command } from 'commander'

export const logsCommand = new Command('logs')
  .description('View execution logs')
  .option('-f, --follow', 'Follow log output (not yet implemented)')
  .option('-n, --lines <number>', 'Number of lines to show', '50')
  .option('--issue <id>', 'Filter by issue ID')
  .option('--level <level>', 'Filter by log level (debug, info, warn, error)')
  .action(async (options) => {
    const entries = await logStorage.list({
      limit: parseInt(options.lines, 10),
      level: options.level,
    })

    if (entries.length === 0) {
      console.log('No logs found')
      return
    }

    // Filter by issue if specified
    let filtered = entries
    if (options.issue) {
      filtered = entries.filter((e) => e.runId?.includes(options.issue))
    }

    for (const entry of filtered) {
      const time = entry.timestamp.toISOString().split('T')[1].split('.')[0]
      const level = entry.level.toUpperCase().padEnd(5)
      console.log(`[${time}] [${level}] ${entry.message}`)

      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        console.log(`         ${JSON.stringify(entry.metadata)}`)
      }
    }

    if (options.follow) {
      console.log('')
      console.log('--follow is not yet implemented')
    }
  })
