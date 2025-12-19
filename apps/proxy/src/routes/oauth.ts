/**
 * OAuth handling for Linear
 */

import type { Env } from '../index'

const LINEAR_AUTH_URL = 'https://linear.app/oauth/authorize'
const LINEAR_TOKEN_URL = 'https://api.linear.app/oauth/token'

interface OAuthState {
  csrf: string
  callback?: string
}

/**
 * Encode state as base64 JSON
 */
function encodeState(state: OAuthState): string {
  return btoa(JSON.stringify(state))
}

/**
 * Decode state from base64 JSON
 */
function decodeState(encoded: string): OAuthState | null {
  try {
    return JSON.parse(atob(encoded))
  } catch {
    return null
  }
}

/**
 * Start OAuth flow
 */
export async function handleOAuth(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const redirectUri = `${url.origin}/auth/linear/callback`

  // Get local callback URL from query params
  const localCallback = url.searchParams.get('callback')

  // Generate state with CSRF token and optional callback URL
  const state: OAuthState = {
    csrf: crypto.randomUUID(),
    callback: localCallback || undefined,
  }

  const authUrl = new URL(LINEAR_AUTH_URL)
  authUrl.searchParams.set('client_id', env.LINEAR_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  // Use actor=app for Linear Agents API access
  // Scopes: read write for general API, app:assignable app:mentionable for agent features
  authUrl.searchParams.set('actor', 'app')
  authUrl.searchParams.set('scope', 'read write app:assignable app:mentionable')
  // Force re-authorization even if already installed
  authUrl.searchParams.set('prompt', 'consent')
  authUrl.searchParams.set('state', encodeState(state))

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
    },
  })
}

/**
 * Handle OAuth callback
 */
export async function handleOAuthCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const stateParam = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    return new Response(`OAuth error: ${error}`, { status: 400 })
  }

  if (!code) {
    return new Response('Missing authorization code', { status: 400 })
  }

  // Decode state to get callback URL
  const state = stateParam ? decodeState(stateParam) : null
  const callbackUrl = state?.callback || env.TUNNEL_URL

  // Exchange code for token
  const redirectUri = `${url.origin}/auth/linear/callback`

  try {
    const tokenResponse = await fetch(LINEAR_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: env.LINEAR_CLIENT_ID,
        client_secret: env.LINEAR_CLIENT_SECRET,
        redirect_uri: redirectUri,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      return new Response(`Token exchange failed: ${errorText}`, { status: 400 })
    }

    const tokens = await tokenResponse.json()

    // Forward tokens to local agent if callback URL is available
    let tokensSent = false
    if (callbackUrl) {
      try {
        const callbackResponse = await fetch(`${callbackUrl}/oauth/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            platform: 'linear',
            tokens,
          }),
        })
        tokensSent = callbackResponse.ok
      } catch {
        // Local agent might not be reachable
      }
    }

    // Return success page
    return new Response(
      `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Sniff - Authentication Successful</title>
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background: #f5f5f5;
      }
      .container {
        text-align: center;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        max-width: 500px;
      }
      h1 { color: #333; margin-bottom: 1rem; }
      p { color: #666; line-height: 1.5; }
      .success { color: #22c55e; }
      .warning { color: #f59e0b; }
      code {
        background: #f0f0f0;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        display: block;
        margin: 1rem 0;
        word-break: break-all;
        font-size: 0.875rem;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${tokensSent ? '<span class="success">✓</span>' : ''} Authentication Successful</h1>
      ${
        tokensSent
          ? '<p>Tokens have been saved. You can close this window and return to the CLI.</p>'
          : `<p class="warning">Could not automatically save tokens. Copy this access token and paste it in the CLI:</p>
             <code>${(tokens as { access_token: string }).access_token}</code>`
      }
    </div>
  </body>
</html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      },
    )
  } catch (error) {
    return new Response(`OAuth error: ${error}`, { status: 500 })
  }
}
