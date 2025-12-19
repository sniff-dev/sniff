/**
 * Path utilities for ~/.sniff/ directory
 */

import { homedir } from 'node:os'
import { join } from 'node:path'

/** Base directory for Sniff data */
export const SNIFF_DIR = join(homedir(), '.sniff')

/** Tokens directory */
export const TOKENS_DIR = join(SNIFF_DIR, 'tokens')

/** Worktrees directory */
export const WORKTREES_DIR = join(SNIFF_DIR, 'worktrees')

/** Logs directory */
export const LOGS_DIR = join(SNIFF_DIR, 'logs')

/** Config file path */
export const CONFIG_FILE = join(SNIFF_DIR, 'config.json')

/**
 * Get the path for a platform's token file
 */
export function getTokenPath(platform: string): string {
  return join(TOKENS_DIR, `${platform}.json`)
}

/**
 * Get the path for a worktree
 */
export function getWorktreePath(issueId: string): string {
  // Sanitize issue ID for filesystem
  const sanitized = issueId.replace(/[^a-zA-Z0-9-_]/g, '-')
  return join(WORKTREES_DIR, sanitized)
}

/**
 * Get the path for a log file
 */
export function getLogPath(date: Date = new Date()): string {
  const dateStr = date.toISOString().split('T')[0]
  return join(LOGS_DIR, `${dateStr}.jsonl`)
}

/**
 * Ensure all required directories exist
 */
export async function ensureDirectories(): Promise<void> {
  const { mkdir } = await import('node:fs/promises')

  await mkdir(SNIFF_DIR, { recursive: true })
  await mkdir(TOKENS_DIR, { recursive: true })
  await mkdir(WORKTREES_DIR, { recursive: true })
  await mkdir(LOGS_DIR, { recursive: true })
}
