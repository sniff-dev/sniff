/**
 * Log storage implementation
 */

import type { LogEntry, LogFilter, LogStorage } from '@sniff/core'
import { getLogPath, LOGS_DIR } from './paths'

export class FileLogStorage implements LogStorage {
  async append(entry: LogEntry): Promise<void> {
    const path = getLogPath(entry.timestamp)
    const line = JSON.stringify({
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    })

    const file = Bun.file(path)
    const existing = (await file.exists()) ? await file.text() : ''
    await Bun.write(path, `${existing + line}\n`)
  }

  async list(filter?: LogFilter): Promise<LogEntry[]> {
    const { readdir } = await import('node:fs/promises')
    const entries: LogEntry[] = []

    try {
      const files = await readdir(LOGS_DIR)
      const logFiles = files
        .filter((f) => f.endsWith('.jsonl'))
        .sort()
        .reverse()

      for (const filename of logFiles) {
        const file = Bun.file(`${LOGS_DIR}/${filename}`)
        const content = await file.text()
        const lines = content.trim().split('\n').filter(Boolean)

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            const entry: LogEntry = {
              ...data,
              timestamp: new Date(data.timestamp),
            }

            // Apply filters
            if (filter?.runId && entry.runId !== filter.runId) continue
            if (filter?.level && entry.level !== filter.level) continue
            if (filter?.since && entry.timestamp < filter.since) continue
            if (filter?.until && entry.timestamp > filter.until) continue

            entries.push(entry)

            if (filter?.limit && entries.length >= filter.limit) {
              return entries
            }
          } catch {
            // Skip invalid lines
          }
        }
      }
    } catch {
      // Directory doesn't exist yet
    }

    return entries
  }

  async clear(olderThan: Date): Promise<number> {
    const { readdir, unlink } = await import('node:fs/promises')
    let count = 0

    try {
      const files = await readdir(LOGS_DIR)

      for (const filename of files) {
        if (!filename.endsWith('.jsonl')) continue

        // Parse date from filename (YYYY-MM-DD.jsonl)
        const dateStr = filename.replace('.jsonl', '')
        const fileDate = new Date(dateStr)

        if (fileDate < olderThan) {
          await unlink(`${LOGS_DIR}/${filename}`)
          count++
        }
      }
    } catch {
      // Directory doesn't exist
    }

    return count
  }
}

/** Default log storage instance */
export const logStorage = new FileLogStorage()
