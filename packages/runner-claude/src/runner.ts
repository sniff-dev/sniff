/**
 * Claude Code runner implementation using the Claude Agent SDK
 *
 * Uses @anthropic-ai/claude-agent-sdk for native integration with Claude Code.
 */

import { query } from '@anthropic-ai/claude-agent-sdk'
import type { Options as ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk'
import type { Runner, RunnerContext, RunnerProgressCallback, RunnerResult } from '@sniff/core'

export interface ClaudeRunnerOptions {
  /** Model to use (default: uses SDK default) */
  model?: string
}

export class ClaudeRunner implements Runner {
  readonly name = 'claude'
  private options: ClaudeRunnerOptions
  private abortController: AbortController | null = null

  constructor(options: ClaudeRunnerOptions = {}) {
    this.options = options
  }

  async run(
    message: string,
    context: RunnerContext,
    onProgress?: RunnerProgressCallback,
  ): Promise<RunnerResult> {
    this.abortController = new AbortController()

    // Build SDK options from runner context
    const sdkOptions: ClaudeAgentOptions = {
      cwd: context.workingDirectory,
      abortController: this.abortController,

      // Model - use context model, fallback to runner option
      model: context.model ?? this.options.model,

      // System prompt - handle both string and preset object
      systemPrompt: context.systemPrompt,

      // Tool control
      allowedTools: context.allowedTools,
      disallowedTools: context.disallowedTools,

      // MCP servers
      mcpServers: context.mcpServers,

      // Permission mode - default to acceptEdits for autonomous operation
      permissionMode: context.permissionMode ?? 'acceptEdits',

      // Execution limits
      maxTurns: context.maxTurns,

      // Environment
      env: context.env,

      // Don't load any filesystem settings - use only what we provide
      settingSources: [],
    }

    const filesChanged: string[] = []
    let finalResult = ''

    try {
      for await (const msg of query({ prompt: message, options: sdkOptions })) {
        // Handle assistant messages
        if (msg.type === 'assistant') {
          const content = msg.message?.content
          if (Array.isArray(content)) {
            for (const block of content) {
              // Handle thinking blocks
              if (block.type === 'thinking' && onProgress) {
                const thinking = (block as { type: 'thinking'; thinking: string }).thinking
                if (thinking) {
                  onProgress({ type: 'thinking', content: thinking })
                }
              }

              // Handle text blocks
              if (block.type === 'text' && onProgress) {
                const text = (block as { type: 'text'; text: string }).text
                if (text) {
                  onProgress({ type: 'output', content: text })
                }
              }

              // Handle tool use blocks
              if (block.type === 'tool_use') {
                const toolBlock = block as { type: 'tool_use'; name: string; input: unknown }
                const toolInput = toolBlock.input as Record<string, unknown> | undefined

                // Report tool use to progress callback
                if (onProgress) {
                  onProgress({
                    type: 'tool_use',
                    content: toolBlock.name,
                    metadata: {
                      tool: toolBlock.name,
                      input: toolInput,
                    },
                  })
                }

                // Track file changes
                if (toolBlock.name === 'Write' || toolBlock.name === 'Edit') {
                  const filePath = toolInput?.file_path as string | undefined
                  if (filePath && !filesChanged.includes(filePath)) {
                    filesChanged.push(filePath)
                  }
                }
              }
            }
          }
        }

        // Handle result messages
        if (msg.type === 'result') {
          const resultMsg = msg as {
            type: 'result'
            subtype: string
            result?: string
            errors?: string[]
          }

          if (resultMsg.subtype === 'success') {
            finalResult = resultMsg.result ?? 'Task completed.'
          } else {
            // Error result
            const errorMessage = resultMsg.errors?.join('\n') ?? 'Unknown error'
            return {
              success: false,
              output: '',
              error: errorMessage,
            }
          }
        }
      }

      return {
        success: true,
        output: finalResult,
        filesChanged,
      }
    } catch (error) {
      // Handle abort
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          output: '',
          error: 'Task was stopped',
        }
      }

      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
      }
    } finally {
      this.abortController = null
    }
  }

  async stop(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}

/**
 * Create a Claude runner with default options
 */
export function createClaudeRunner(options?: ClaudeRunnerOptions): Runner {
  return new ClaudeRunner(options)
}
