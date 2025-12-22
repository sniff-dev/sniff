/**
 * Zod schemas for Sniff configuration v2.0
 *
 * These schemas mirror @anthropic-ai/claude-agent-sdk types for runtime YAML validation.
 * Structure supports multiple runner types (claude, gemini, codex) for future extensibility.
 */

import { z } from 'zod'

// =============================================================================
// MCP Server Configurations (mirrors SDK McpServerConfig)
// =============================================================================

const McpStdioServerSchema = z.object({
  type: z.literal('stdio').optional(),
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
})

const McpSSEServerSchema = z.object({
  type: z.literal('sse'),
  url: z.string(),
  headers: z.record(z.string(), z.string()).optional(),
})

const McpHttpServerSchema = z.object({
  type: z.literal('http'),
  url: z.string(),
  headers: z.record(z.string(), z.string()).optional(),
})

export const McpServerSchema = z.union([
  McpStdioServerSchema,
  McpSSEServerSchema,
  McpHttpServerSchema,
])

// =============================================================================
// Permission Mode (mirrors SDK PermissionMode)
// =============================================================================

export const PermissionModeSchema = z.enum([
  'default',
  'acceptEdits',
  'bypassPermissions',
  'plan',
])

// =============================================================================
// System Prompt (mirrors SDK systemPrompt option)
// =============================================================================

const SystemPromptPresetSchema = z.object({
  type: z.literal('preset'),
  preset: z.literal('claude_code'),
  append: z.string().optional(),
})

export const SystemPromptSchema = z.union([z.string(), SystemPromptPresetSchema])

// =============================================================================
// Hooks (YAML-compatible command-based hooks)
// Note: SDK hooks support JS callbacks, but YAML can only define command hooks
// =============================================================================

const HookCommandSchema = z.object({
  type: z.literal('command'),
  command: z.string(),
  timeout: z.number().optional(),
})

const HookMatcherSchema = z.object({
  matcher: z.string().optional(),
  hooks: z.array(HookCommandSchema),
})

export const HooksSchema = z
  .object({
    PreToolUse: z.array(HookMatcherSchema).optional(),
    PostToolUse: z.array(HookMatcherSchema).optional(),
    PostToolUseFailure: z.array(HookMatcherSchema).optional(),
    UserPromptSubmit: z.array(HookMatcherSchema).optional(),
    Stop: z.array(HookMatcherSchema).optional(),
    SubagentStart: z.array(HookMatcherSchema).optional(),
    SubagentStop: z.array(HookMatcherSchema).optional(),
    PreCompact: z.array(HookMatcherSchema).optional(),
    SessionStart: z.array(HookMatcherSchema).optional(),
    SessionEnd: z.array(HookMatcherSchema).optional(),
    Notification: z.array(HookMatcherSchema).optional(),
    PermissionRequest: z.array(HookMatcherSchema).optional(),
  })
  .passthrough()

// =============================================================================
// Sandbox Settings (mirrors SDK SandboxSettings)
// =============================================================================

const SandboxNetworkSchema = z.object({
  allowLocalBinding: z.boolean().optional(),
  allowUnixSockets: z.array(z.string()).optional(),
  allowAllUnixSockets: z.boolean().optional(),
  httpProxyPort: z.number().optional(),
  socksProxyPort: z.number().optional(),
})

const SandboxIgnoreViolationsSchema = z.object({
  file: z.array(z.string()).optional(),
  network: z.array(z.string()).optional(),
})

export const SandboxSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  autoAllowBashIfSandboxed: z.boolean().optional(),
  excludedCommands: z.array(z.string()).optional(),
  allowUnsandboxedCommands: z.boolean().optional(),
  network: SandboxNetworkSchema.optional(),
  ignoreViolations: SandboxIgnoreViolationsSchema.optional(),
  enableWeakerNestedSandbox: z.boolean().optional(),
})

// =============================================================================
// Setting Sources (mirrors SDK SettingSource)
// =============================================================================

export const SettingSourceSchema = z.enum(['user', 'project', 'local'])

// =============================================================================
// Claude Runner Options (maps to ClaudeAgentOptions)
// =============================================================================

export const ClaudeRunnerOptionsSchema = z.object({
  // Core options
  model: z.string().optional(),
  allowedTools: z.array(z.string()).optional(),
  disallowedTools: z.array(z.string()).optional(),
  mcpServers: z.record(z.string(), McpServerSchema).optional(),

  // Permission control
  permissionMode: PermissionModeSchema.optional(),

  // Execution limits
  maxTurns: z.number().optional(),
  maxBudgetUsd: z.number().optional(),
  maxThinkingTokens: z.number().optional(),

  // Advanced options
  hooks: HooksSchema.optional(),
  sandbox: SandboxSettingsSchema.optional(),
  settingSources: z.array(SettingSourceSchema).optional(),
  additionalDirectories: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),

  // Beta features
  betas: z.array(z.string()).optional(),
})

// =============================================================================
// Runner Configuration (supports multiple runner types)
// =============================================================================

export const RunnerConfigSchema = z.object({
  claude: ClaudeRunnerOptionsSchema.optional(),
  // Future: gemini, codex, etc.
})

// =============================================================================
// Agent Configuration
// =============================================================================

export const AgentConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  label: z.string().min(1).optional(),
  team: z.string().min(1).optional(),
  systemPrompt: SystemPromptSchema.optional(),
  runner: RunnerConfigSchema,
})

// =============================================================================
// Root Configuration
// =============================================================================

export const ConfigSchema = z.object({
  version: z.literal('2.0'),
  agents: z.array(AgentConfigSchema).min(1),
})

// =============================================================================
// Type Exports
// =============================================================================

export type McpServer = z.infer<typeof McpServerSchema>
export type PermissionMode = z.infer<typeof PermissionModeSchema>
export type SystemPrompt = z.infer<typeof SystemPromptSchema>
export type Hooks = z.infer<typeof HooksSchema>
export type SandboxSettings = z.infer<typeof SandboxSettingsSchema>
export type SettingSource = z.infer<typeof SettingSourceSchema>
export type ClaudeRunnerOptions = z.infer<typeof ClaudeRunnerOptionsSchema>
export type RunnerConfig = z.infer<typeof RunnerConfigSchema>
export type AgentConfig = z.infer<typeof AgentConfigSchema>
export type Config = z.infer<typeof ConfigSchema>
