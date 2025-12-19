/**
 * Local HTTP server using Bun.serve
 */

import { logger } from '@sniff/core'

export interface LocalServerOptions {
  port: number
  onWebhook?: (request: Request) => Promise<Response>
  onOAuthCallback?: (platform: string, tokens: OAuthTokens) => Promise<Response>
  onHealth?: () => Promise<Response>
}

export interface OAuthTokens {
  access_token: string
  token_type?: string
  expires_in?: number
  refresh_token?: string
  scope?: string
}

export class LocalServer {
  private server: ReturnType<typeof Bun.serve> | null = null
  private options: LocalServerOptions

  constructor(options: LocalServerOptions) {
    this.options = options
  }

  /**
   * Start the server
   */
  start(): void {
    const { port, onWebhook, onOAuthCallback, onHealth } = this.options

    this.server = Bun.serve({
      port,
      fetch: async (request) => {
        const url = new URL(request.url)

        // Health check
        if (url.pathname === '/health' && request.method === 'GET') {
          if (onHealth) {
            return onHealth()
          }
          return new Response('OK', { status: 200 })
        }

        // OAuth callback from proxy
        if (url.pathname === '/oauth/callback' && request.method === 'POST') {
          if (!onOAuthCallback) {
            return new Response('OAuth callback not configured', { status: 404 })
          }
          try {
            const body = (await request.json()) as { platform: string; tokens: OAuthTokens }
            return onOAuthCallback(body.platform, body.tokens)
          } catch (error) {
            logger.error('OAuth callback error', {
              error: error instanceof Error ? error.message : String(error),
            })
            return new Response('Invalid request', { status: 400 })
          }
        }

        // Webhook endpoint
        if (url.pathname === '/webhook/linear' && request.method === 'POST') {
          if (!onWebhook) {
            return new Response('Webhook handler not configured', { status: 404 })
          }
          return onWebhook(request)
        }

        return new Response('Not Found', { status: 404 })
      },
      error(error) {
        logger.error('Server error', { error: error.message })
        return new Response('Internal Server Error', { status: 500 })
      },
    })

    logger.info(`Local server started on port ${port}`)
  }

  /**
   * Stop the server
   */
  stop(): void {
    if (this.server) {
      this.server.stop()
      this.server = null
      logger.info('Local server stopped')
    }
  }

  /**
   * Get the server URL
   */
  get url(): string | null {
    if (!this.server) return null
    return `http://localhost:${this.options.port}`
  }
}

export { LocalServer as default }
