/**
 * Event types for Sniff
 */

export interface WebhookEvent {
  /** Event type */
  type: string
  /** Event action */
  action: string
  /** Raw payload */
  payload: unknown
  /** Timestamp */
  timestamp: Date
}

export interface LinearWebhookEvent extends WebhookEvent {
  type: 'linear'
  /** Linear-specific data */
  data: {
    issueId: string
    issueIdentifier: string
    issueTitle: string
    issueDescription?: string
    teamId: string
    teamKey: string
    labels: string[]
    assigneeId?: string
    projectId?: string
  }
}

export interface AgentRunEvent {
  /** Unique run identifier */
  runId: string
  /** Agent that is running */
  agentId: string
  /** Issue/ticket identifier */
  issueId: string
  /** Run status */
  status: 'started' | 'running' | 'completed' | 'failed'
  /** Timestamp */
  timestamp: Date
  /** Error message if failed */
  error?: string
}
