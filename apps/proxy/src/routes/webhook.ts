/**
 * Webhook forwarding handler
 */

import type { Env } from '../index'

/**
 * Verify Linear webhook signature
 */
async function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return signature === expectedSignature
}

export async function handleWebhook(request: Request, env: Env): Promise<Response> {
  // Check if tunnel URL is configured
  if (!env.TUNNEL_URL) {
    return new Response('Tunnel URL not configured', { status: 503 })
  }

  const body = await request.text()

  // Verify signature if secret is set
  if (env.WEBHOOK_SECRET) {
    const signature = request.headers.get('linear-signature')
    if (!signature) {
      return new Response('Missing signature', { status: 401 })
    }

    const isValid = await verifySignature(body, signature, env.WEBHOOK_SECRET)
    if (!isValid) {
      return new Response('Invalid signature', { status: 401 })
    }
  }

  // Forward to local agent
  try {
    const forwardUrl = `${env.TUNNEL_URL}/webhook/linear`

    const response = await fetch(forwardUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Linear-Signature': request.headers.get('linear-signature') ?? '',
        'X-Forwarded-For': request.headers.get('cf-connecting-ip') ?? '',
      },
      body,
    })

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Failed to forward webhook:', error)
    return new Response('Failed to forward webhook', { status: 502 })
  }
}
