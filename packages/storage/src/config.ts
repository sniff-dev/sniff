/**
 * Config storage implementation
 */

import type { ConfigStorage } from '@sniff/core'
import { CONFIG_FILE } from './paths'

export class FileConfigStorage implements ConfigStorage {
  async get(): Promise<unknown | null> {
    try {
      const file = Bun.file(CONFIG_FILE)
      if (!(await file.exists())) {
        return null
      }

      return await file.json()
    } catch {
      return null
    }
  }

  async set(config: unknown): Promise<void> {
    await Bun.write(CONFIG_FILE, JSON.stringify(config, null, 2))
  }

  async exists(): Promise<boolean> {
    const file = Bun.file(CONFIG_FILE)
    return file.exists()
  }
}

/** Default config storage instance */
export const configStorage = new FileConfigStorage()
