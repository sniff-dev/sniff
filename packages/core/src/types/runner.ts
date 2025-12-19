/**
 * Runner interface - abstraction for different CLI tools (Claude, Gemini, Codex)
 *
 * Uses types from @sniff/config to avoid duplication.
 */

import type { McpServer, PermissionMode, SystemPrompt } from '@sniff/config'

// Re-export for convenience
export type { McpServer, PermissionMode, SystemPrompt }

/**
 * Context passed to the runner for agent execution
 */
export interface RunnerContext {
  /** Working directory for the runner (typically a git worktree) */
  workingDirectory: string

  /** System prompt for the agent */
  systemPrompt?: SystemPrompt

  /** Model to use (e.g., 'sonnet', 'opus', or full model name) */
  model?: string

  /** Allowed tools for the runner */
  allowedTools?: string[]

  /** Disallowed tools for the runner */
  disallowedTools?: string[]

  /** MCP servers configuration (keyed by server name) */
  mcpServers?: Record<string, McpServer>

  /** Permission mode for tool execution */
  permissionMode?: PermissionMode

  /** Maximum conversation turns */
  maxTurns?: number

  /** Environment variables to pass to the runner */
  env?: Record<string, string>
}

export interface RunnerResult {
  /** Whether the run completed successfully */
  success: boolean
  /** Output/response from the runner */
  output: string
  /** List of files that were changed */
  filesChanged?: string[]
  /** Error message if run failed */
  error?: string
}

export interface RunnerProgress {
  /** Type of progress event */
  type: 'thinking' | 'tool_use' | 'output' | 'error'
  /** Content of the progress event */
  content: string
  /** Optional metadata */
  metadata?: Record<string, unknown>
}

export type RunnerProgressCallback = (progress: RunnerProgress) => void | Promise<void>

export interface Runner {
  /** Runner identifier (e.g., 'claude', 'gemini', 'codex') */
  readonly name: string

  /**
   * Run the agent with the given message
   */
  run(
    message: string,
    context: RunnerContext,
    onProgress?: RunnerProgressCallback,
  ): Promise<RunnerResult>

  /**
   * Stop the current run
   */
  stop(): Promise<void>
}
