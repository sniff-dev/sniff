/**
 * Git worktree management
 */

import { exec } from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { logger } from '@sniff/core'
import { WORKTREES_DIR } from '@sniff/storage'

const execAsync = promisify(exec)

export interface WorktreeInfo {
  issueId: string
  path: string
  branch: string
  createdAt: Date
}

export class WorktreeManager {
  private basePath: string

  constructor(basePath: string = WORKTREES_DIR) {
    this.basePath = basePath
  }

  /**
   * Create a worktree for an issue
   */
  async create(issueId: string, repositoryPath: string, branch?: string): Promise<string> {
    const sanitizedId = this.sanitizeId(issueId)
    const worktreePath = join(this.basePath, sanitizedId)
    const branchName = branch ?? `sniff/${sanitizedId}`

    // Check if worktree already exists
    try {
      const { stdout } = await execAsync('git worktree list --porcelain', {
        cwd: repositoryPath,
      })
      if (stdout.includes(worktreePath)) {
        logger.info('Reusing existing worktree', { issueId, path: worktreePath })
        return worktreePath
      }
    } catch {
      // Ignore - will try to create
    }

    try {
      // Create the worktree with a new branch
      await execAsync(`git worktree add -b "${branchName}" "${worktreePath}"`, {
        cwd: repositoryPath,
      })

      logger.info('Created worktree', { issueId, path: worktreePath, branch: branchName })
      return worktreePath
    } catch (error) {
      // If branch already exists, try to use existing branch
      try {
        await execAsync(`git worktree add "${worktreePath}" "${branchName}"`, {
          cwd: repositoryPath,
        })
        logger.info('Created worktree with existing branch', { issueId, path: worktreePath, branch: branchName })
        return worktreePath
      } catch {
        throw new Error(
          `Failed to create worktree: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }
  }

  /**
   * Get worktree path for an issue
   */
  get(issueId: string): string {
    const sanitizedId = this.sanitizeId(issueId)
    return join(this.basePath, sanitizedId)
  }

  /**
   * Remove a worktree
   */
  async remove(issueId: string, repositoryPath: string): Promise<void> {
    const sanitizedId = this.sanitizeId(issueId)
    const worktreePath = join(this.basePath, sanitizedId)

    try {
      await execAsync(`git worktree remove "${worktreePath}" --force`, {
        cwd: repositoryPath,
      })
      logger.info('Removed worktree', { issueId, path: worktreePath })
    } catch (error) {
      logger.warn('Failed to remove worktree', {
        issueId,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * List all worktrees
   */
  async list(repositoryPath: string): Promise<WorktreeInfo[]> {
    try {
      const { stdout } = await execAsync('git worktree list --porcelain', {
        cwd: repositoryPath,
      })

      const worktrees: WorktreeInfo[] = []
      const entries = stdout.split('\n\n').filter(Boolean)

      for (const entry of entries) {
        const lines = entry.split('\n')
        const pathLine = lines.find((l) => l.startsWith('worktree '))
        const branchLine = lines.find((l) => l.startsWith('branch '))

        if (pathLine?.includes(this.basePath)) {
          const path = pathLine.replace('worktree ', '')
          const branch = branchLine?.replace('branch refs/heads/', '') ?? ''
          const issueId = path.split('/').pop() ?? ''

          worktrees.push({
            issueId,
            path,
            branch,
            createdAt: new Date(), // Would need stat for actual time
          })
        }
      }

      return worktrees
    } catch {
      return []
    }
  }

  /**
   * Cleanup old worktrees
   */
  async cleanup(repositoryPath: string, _olderThanHours: number): Promise<number> {
    // For now, just list and log - actual cleanup would need file stats
    const worktrees = await this.list(repositoryPath)
    logger.info('Found worktrees for potential cleanup', { count: worktrees.length })
    return 0
  }

  /**
   * Sanitize issue ID for filesystem
   */
  private sanitizeId(issueId: string): string {
    return issueId.replace(/[^a-zA-Z0-9-_]/g, '-')
  }
}
