// packages/cli/src/commands/deploy.ts
import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import ora from 'ora';
import chalk from 'chalk';
import { Config } from '../lib/config.js';
import { api } from '../lib/api.js';
import { parseAndValidateConfig } from '@sniff-dev/config';

export const deploy = new Command('deploy')
  .description('Deploy agent to Linear')
  .option('-c, --config <path>', 'Config file path', 'config.yml')
  .option('--dry-run', 'Validate without deploying')
  .action(async (options: { config: string; dryRun?: boolean }) => {
    const userConfig = new Config();
    const token = userConfig.get('token');

    if (!token) {
      console.error(chalk.red('✗ Not authenticated. Run `sniff login` first.'));
      process.exit(1);
    }

    // Check config file exists
    if (!existsSync(options.config)) {
      console.error(chalk.red(`✗ Config file not found: ${options.config}`));
      console.log(chalk.gray('\nRun `sniff init` to create a config file.'));
      process.exit(1);
    }

    const spinner = ora('Loading configuration...').start();

    try {
      // Load and parse YAML
      const yamlContent = readFileSync(options.config, 'utf-8');

      // Validate config
      spinner.text = 'Validating configuration...';
      const validConfig = parseAndValidateConfig(yamlContent);

      if (options.dryRun) {
        spinner.succeed('Configuration is valid');
        console.log(chalk.green('\n✓ Dry run successful'));
        return;
      }

      // Check required connections
      spinner.text = 'Checking connections...';
      const connections = await api.get<any[]>('/connections', token);
      const linearConnection = connections.find((c) => c.provider === 'linear');
      const anthropicConnection = connections.find((c) => c.provider === 'anthropic');

      if (!linearConnection || !anthropicConnection) {
        spinner.fail('Missing required connections');
        console.error(chalk.red('\n✗ Both Linear and Anthropic connections are required.'));

        if (!linearConnection) {
          console.log(chalk.gray('  • Run `sniff connect linear` to connect Linear workspace'));
        }
        if (!anthropicConnection) {
          console.log(chalk.gray('  • Run `sniff connect anthropic` to connect Anthropic API key'));
        }

        process.exit(1);
      }

      // Deploy agent
      spinner.text = 'Deploying agent...';
      const result = await api.post<{ agentId: string; updated?: boolean }>(
        '/agents',
        {
          config: validConfig,
          platform: 'linear',
          workspaceId: linearConnection.workspaceId,
        },
        token,
      );

      const action = result.updated ? 'updated' : 'deployed';
      spinner.succeed(`Agent "${chalk.cyan(validConfig.agent.name)}" ${action}`);

      console.log(
        '\n' + chalk.green('✓'),
        result.updated ? 'Update successful!' : 'Deployment successful!',
      );
      console.log(chalk.gray('  ID:'), result.agentId);
      console.log(chalk.gray('  Connection:'), linearConnection.workspaceId);
      console.log(chalk.gray('  Status:'), chalk.green('Active'));

      console.log('\n' + chalk.gray('Your agent is now listening for Linear events.'));
      console.log(chalk.gray('Create an issue in Linear to test it!'));
    } catch (error) {
      spinner.fail('Deployment failed');

      if ((error as any).name === 'ZodError') {
        console.error(chalk.red('\n✗ Invalid configuration:'));
        (error as any).issues.forEach((err: any) => {
          console.error(chalk.gray('  •'), `${err.path.join('.')}: ${err.message}`);
        });
      } else {
        console.error(chalk.red('\n✗'), (error as Error).message);
      }

      process.exit(1);
    }
  });
