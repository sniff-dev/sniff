// packages/cli/src/commands/auth.ts
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { exec } from 'child_process';
import { authenticateLinear } from '@sniff-dev/core';

function openBrowser(url: string): void {
  const cmd =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} "${url}"`);
}

const DEFAULT_SERVER_URL = 'https://api.sniff.to';

function getServerUrl(): string {
  return process.env.SNIFF_SERVER_URL || DEFAULT_SERVER_URL;
}

function isLocalhost(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export const auth = new Command('auth').description('Authenticate with Linear').addCommand(
  new Command('linear').description('Authenticate with Linear via OAuth2').action(async () => {
    const serverUrl = getServerUrl();
    const useLocal = isLocalhost(serverUrl);

    if (useLocal) {
      // Local flow: start a local server to handle OAuth
      const clientId = process.env.LINEAR_CLIENT_ID;
      const clientSecret = process.env.LINEAR_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.error(chalk.red('Set LINEAR_CLIENT_ID and LINEAR_CLIENT_SECRET'));
        process.exit(1);
      }

      const spinner = ora('Waiting for authorization...').start();

      try {
        const result = await authenticateLinear({
          clientId,
          clientSecret,
          redirectUri: `${serverUrl}/auth/linear/callback`,
        });

        if (result.success) {
          spinner.succeed('Authenticated with Linear');
        } else {
          spinner.fail(result.error || 'Authentication failed');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail((error as Error).message);
        process.exit(1);
      }
    } else {
      // Cloud flow: direct user to the server's auth endpoint
      const authUrl = `${serverUrl}/auth/linear`;
      console.log(chalk.cyan(authUrl) + '\n');
      openBrowser(authUrl);

      // Poll server to confirm auth completed
      const spinner = ora('Waiting for authorization...').start();
      const maxAttempts = 60; // 2 minutes
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        try {
          const res = await fetch(`${serverUrl}/api/auth/status`);
          if (res.ok) {
            const data = (await res.json()) as { authenticated: boolean };
            if (data.authenticated) {
              spinner.succeed('Authenticated with Linear');
              return;
            }
          }
        } catch {
          // Server not reachable, keep polling
        }
      }
      spinner.fail('Timed out waiting for authorization');
      process.exit(1);
    }
  }),
);
