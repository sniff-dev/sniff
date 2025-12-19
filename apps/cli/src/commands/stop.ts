/**
 * stop command - Stop the running agent server
 */

import { Command } from 'commander'

export const stopCommand = new Command('stop')
  .description('Stop the running agent server')
  .action(async () => {
    // In a full implementation, this would send a signal to the running server
    // For now, users should use Ctrl+C
    console.log('To stop the agent server, press Ctrl+C in the terminal running "sniff start"')
    console.log('')
    console.log('Or find and kill the process:')
    console.log('  lsof -i :3847')
    console.log('  kill <PID>')
  })
