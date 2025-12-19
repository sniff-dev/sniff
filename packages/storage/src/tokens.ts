/**
 * Token storage implementation
 */

import type { OAuth2Tokens, TokenStorage } from '@sniff/core'
import { getLocalTokenPath, getTokenPath } from './paths'

export class FileTokenStorage implements TokenStorage {
  /**
   * Get tokens for a platform.
   * Checks local (./.sniff/) first, then global (~/.sniff/).
   */
  async get(platform: string): Promise<OAuth2Tokens | null> {
    // Check local first
    const localPath = getLocalTokenPath(platform)
    const localFile = Bun.file(localPath)
    if (await localFile.exists()) {
      try {
        const data = await localFile.json()
        return {
          ...data,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        }
      } catch {
        // Fall through to global
      }
    }

    // Fall back to global
    const globalPath = getTokenPath(platform)
    try {
      const file = Bun.file(globalPath)
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

  /**
   * Store tokens globally (~/.sniff/).
   */
  async set(platform: string, tokens: OAuth2Tokens): Promise<void> {
    const path = getTokenPath(platform)

    const data = {
      ...tokens,
      expiresAt: tokens.expiresAt?.toISOString(),
    }

    await Bun.write(path, JSON.stringify(data, null, 2))
  }

  /**
   * Store tokens locally (./.sniff/).
   */
  async setLocal(platform: string, tokens: OAuth2Tokens): Promise<void> {
    const path = getLocalTokenPath(platform)

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

  /**
   * Check if tokens exist (local or global).
   */
  async has(platform: string): Promise<boolean> {
    const localPath = getLocalTokenPath(platform)
    const localFile = Bun.file(localPath)
    if (await localFile.exists()) {
      return true
    }

    const globalPath = getTokenPath(platform)
    const globalFile = Bun.file(globalPath)
    return globalFile.exists()
  }

  /**
   * Check if local tokens exist for a platform.
   */
  async hasLocal(platform: string): Promise<boolean> {
    const localPath = getLocalTokenPath(platform)
    const file = Bun.file(localPath)
    return file.exists()
  }
}

/** Default token storage instance */
export const tokenStorage = new FileTokenStorage()
