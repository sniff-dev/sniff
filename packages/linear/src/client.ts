/**
 * Linear GraphQL client wrapper
 */

import { LinearClient as SDKClient } from '@linear/sdk'
import type { ActivityContent } from './agent-session'

export interface LinearClientOptions {
  accessToken: string
}

export class LinearClient {
  private client: SDKClient

  constructor(options: LinearClientOptions) {
    this.client = new SDKClient({
      accessToken: options.accessToken,
    })
  }

  /**
   * Get an issue by ID
   */
  async getIssue(issueId: string) {
    return this.client.issue(issueId)
  }

  /**
   * Get the current user
   */
  async getCurrentUser() {
    return this.client.viewer
  }

  /**
   * Create a comment on an issue
   */
  async createComment(issueId: string, body: string) {
    return this.client.createComment({
      issueId,
      body,
    })
  }

  /**
   * Update an issue
   */
  async updateIssue(issueId: string, data: { stateId?: string; assigneeId?: string }) {
    return this.client.updateIssue(issueId, data)
  }

  /**
   * Send an agent activity to a session
   * Used for Linear Agents API to report progress/results
   * @param ephemeral - If true, activity auto-replaces when next activity arrives (only for thought/action)
   */
  async sendAgentActivity(
    sessionId: string,
    content: ActivityContent,
    ephemeral?: boolean,
  ): Promise<void> {
    await this.client.createAgentActivity({
      agentSessionId: sessionId,
      content,
      ephemeral,
    })
  }

  /**
   * Send a thought activity (for immediate acknowledgment)
   */
  async sendThought(sessionId: string, body: string): Promise<void> {
    await this.sendAgentActivity(sessionId, { type: 'thought', body })
  }

  /**
   * Send an ephemeral thought activity (auto-replaces when next activity arrives)
   * Use for live thinking/progress that doesn't need to persist
   */
  async sendEphemeralThought(sessionId: string, body: string): Promise<void> {
    await this.sendAgentActivity(sessionId, { type: 'thought', body }, true)
  }

  /**
   * Send an action activity (for tool usage)
   */
  async sendAction(
    sessionId: string,
    action: string,
    parameter: string,
    result?: string,
  ): Promise<void> {
    await this.sendAgentActivity(sessionId, { type: 'action', action, parameter, result })
  }

  /**
   * Send a response activity (for final result)
   */
  async sendResponse(sessionId: string, body: string): Promise<void> {
    await this.sendAgentActivity(sessionId, { type: 'response', body })
  }

  /**
   * Send an error activity
   */
  async sendError(sessionId: string, body: string): Promise<void> {
    await this.sendAgentActivity(sessionId, { type: 'error', body })
  }

  /**
   * Get the underlying SDK client for advanced operations
   */
  get sdk(): SDKClient {
    return this.client
  }
}
