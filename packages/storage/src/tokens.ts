/**
 * Token storage implementation
 */

import type { OAuth2Tokens, TokenStorage } from '@sniff/core'
import { getTokenPath } from './paths'

export class FileTokenStorage implements TokenStorage {
  async get(platform: string): Promise<OAuth2Tokens | null> {
    const path = getTokenPath(platform)

    try {
      const file = Bun.file(path)
      if (!(await file.exists())) {
        return null
      }

      const data = await file.json()
      return {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      }
    } catch {
      return null
    }
  }

  async set(platform: string, tokens: OAuth2Tokens): Promise<void> {
    const path = getTokenPath(platform)

    const data = {
      ...tokens,
      expiresAt: tokens.expiresAt?.toISOString(),
    }

    await Bun.write(path, JSON.stringify(data, null, 2))
  }

  async delete(platform: string): Promise<void> {
    const path = getTokenPath(platform)
    const { unlink } = await import('node:fs/promises')

    try {
      await unlink(path)
    } catch {
      // File doesn't exist, ignore
    }
  }

  async has(platform: string): Promise<boolean> {
    const path = getTokenPath(platform)
    const file = Bun.file(path)
    return file.exists()
  }
}

/** Default token storage instance */
export const tokenStorage = new FileTokenStorage()
