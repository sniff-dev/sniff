/**
 * Linear activity/comment posting
 */

import type { RunnerProgress } from '@sniff/core'
import type { LinearClient } from './client'

export interface ActivitySender {
  /** Send a thinking/progress update */
  sendProgress(progress: RunnerProgress): Promise<void>
  /** Send the final response */
  sendResponse(response: string): Promise<void>
  /** Send an error */
  sendError(error: string): Promise<void>
}

export interface CreateActivitySenderOptions {
  client: LinearClient
  issueId: string
}

/**
 * Create an activity sender for a Linear issue
 */
export function createActivitySender(options: CreateActivitySenderOptions): ActivitySender {
  const { client, issueId } = options

  return {
    async sendProgress(progress: RunnerProgress): Promise<void> {
      // For now, we batch progress updates
      // In the future, we could use Linear's activity API
      if (progress.type === 'thinking') {
        // Optionally post thinking as a comment
        // await client.createComment(issueId, `🤔 ${progress.content}`)
      }
    },

    async sendResponse(response: string): Promise<void> {
      await client.createComment(issueId, response)
    },

    async sendError(error: string): Promise<void> {
      await client.createComment(issueId, `❌ Error: ${error}`)
    },
  }
}
