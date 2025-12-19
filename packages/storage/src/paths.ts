/**
 * Path utilities for ~/.sniff/ directory
 */

import { homedir } from 'node:os'
import { join } from 'node:path'

/** Base directory for Sniff data (global) */
export const SNIFF_DIR = join(homedir(), '.sniff')

/** Tokens directory (global) */
export const TOKENS_DIR = join(SNIFF_DIR, 'tokens')

/** Local .sniff directory (project-specific) */
export const LOCAL_SNIFF_DIR = '.sniff'

/** Local tokens directory (project-specific) */
export const LOCAL_TOKENS_DIR = join(LOCAL_SNIFF_DIR, 'tokens')

/** Worktrees directory */
export const WORKTREES_DIR = join(SNIFF_DIR, 'worktrees')

/** Logs directory */
export const LOGS_DIR = join(SNIFF_DIR, 'logs')

/** Config file path */
export const CONFIG_FILE = join(SNIFF_DIR, 'config.json')

/**
 * Get the path for a platform's token file (global)
 */
export function getTokenPath(platform: string): string {
  return join(TOKENS_DIR, `${platform}.json`)
}

/**
 * Get the path for a platform's local token file (project-specific)
 */
export function getLocalTokenPath(platform: string): string {
  return join(LOCAL_TOKENS_DIR, `${platform}.json`)
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
 * Ensure all required directories exist (global)
 */
export async function ensureDirectories(): Promise<void> {
  const { mkdir } = await import('node:fs/promises')

  await mkdir(SNIFF_DIR, { recursive: true })
  await mkdir(TOKENS_DIR, { recursive: true })
  await mkdir(WORKTREES_DIR, { recursive: true })
  await mkdir(LOGS_DIR, { recursive: true })
}

/**
 * Ensure local .sniff directories exist (project-specific)
 */
export async function ensureLocalDirectories(): Promise<void> {
  const { mkdir } = await import('node:fs/promises')

  await mkdir(LOCAL_SNIFF_DIR, { recursive: true })
  await mkdir(LOCAL_TOKENS_DIR, { recursive: true })
}
