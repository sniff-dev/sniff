/**
 * Sniff Server
 *
 * A simple headless server that:
 * - Receives webhooks from Linear
 * - Routes them to the appropriate agent
 * - Executes agents using the LLM
 * - Sends responses back via Linear
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { Platform } from '../platforms/platform.js';
import { getAgentSessionId } from '../platforms/types.js';
import type { AnthropicClient } from '../llm/anthropic.js';
import { runAgent, type AgentConfig } from '../agent/runner.js';
import type { LinearWebhook } from '@usepolvo/linear';

export interface SniffServerConfig {
  port: number;
  platform: Platform;
  agents: AgentConfig[];
  llmClient: AnthropicClient;
}

export interface SniffServer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

/**
 * Create a Sniff server instance
 */
export function createSniffServer(config: SniffServerConfig): SniffServer {
  const { port, platform, agents, llmClient } = config;

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // Health check
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    // Webhook endpoint
    if (req.method === 'POST' && req.url === '/webhook/linear') {
      try {
        const body = await readBody(req);
        const signature = (req.headers['linear-signature'] as string) || '';

        // Verify webhook
        if (!platform.verifyWebhook(body, signature)) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid webhook signature' }));
          return;
        }

        // Parse webhook
        const payload = JSON.parse(body);
        const webhook = platform.parseWebhook(payload);

        if (!webhook) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ignored' }));
          return;
        }

        // Check if we should process
        if (!platform.shouldProcess(webhook)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'skipped' }));
          return;
        }

        // Find agent
        const agent = findAgent(agents, webhook);
        if (!agent) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'no_matching_agent' }));
          return;
        }

        // Respond immediately, process async
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'processing' }));

        // Get session ID from webhook
        const sessionId = getAgentSessionId(webhook);
        if (!sessionId) {
          console.error('No agent session ID in webhook');
          return;
        }

        // Run agent
        runAgent({
          webhook,
          config: agent,
          platform,
          llmClient,
          sessionId,
        }).catch((error) => {
          console.error('Agent run failed:', error);
        });
      } catch (error) {
        console.error('Webhook processing error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }

      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  return {
    start: () =>
      new Promise((resolve) => {
        server.listen(port, () => {
          console.log(`Sniff server listening on port ${port}`);
          console.log(`Webhook endpoint: POST /webhook/linear`);
          resolve();
        });
      }),

    stop: () =>
      new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      }),
  };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findAgent(agents: AgentConfig[], webhook: LinearWebhook): AgentConfig | null {
  // TODO: Add filtering based on webhook data
  return agents[0] || null;
}

// Export startServer
export { startServer, type StartServerOptions } from './start.js';
