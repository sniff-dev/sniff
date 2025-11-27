// packages/config/src/index.ts
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { z } from 'zod';

// Tool Schemas
// Web Search Tool - Discovery and exploration
const WebSearchToolSchema = z.object({
  type: z.literal('web_search_20250305'),
  name: z.literal('web_search'),
  max_uses: z.number().int().min(1).optional(),
  allowed_domains: z.array(z.string()).optional(),
  blocked_domains: z.array(z.string()).optional(),
  user_location: z
    .object({
      type: z.literal('approximate'),
      city: z.string().optional(),
      region: z.string().optional(),
      country: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
});

// Web Fetch Tool - Content extraction from specific URLs
const WebFetchToolSchema = z.object({
  type: z.literal('web_fetch_20250910'),
  name: z.literal('web_fetch'),
  max_uses: z.number().int().min(1).optional(),
  allowed_domains: z.array(z.string()).optional(),
  blocked_domains: z.array(z.string()).optional(),
  citations: z
    .object({
      enabled: z.boolean(),
    })
    .optional(),
  max_content_tokens: z.number().int().min(1).optional(),
});

// Union of all supported tool types
const ToolSchema = z.discriminatedUnion('type', [WebSearchToolSchema, WebFetchToolSchema]);

// MCP Server Schema
const MCPServerSchema = z.object({
  type: z.literal('url'),
  url: z.string().url(),
  name: z.string().min(1).max(100),
  authorization_token: z.string().optional(),
  tool_configuration: z
    .object({
      enabled: z.boolean().optional(),
      allowed_tools: z.array(z.string()).optional(),
      disabled_tools: z.array(z.string()).optional(),
    })
    .optional(),
});

// Anthropic model configuration schema
const AnthropicModelSchema = z.object({
  name: z.string().default('claude-sonnet-4-20250514'),
  temperature: z.number().min(0).max(1).default(1.0), // Match Anthropic's default
  max_tokens: z.number().int().min(1).max(8192).default(4096), // Match Anthropic's default
  top_p: z.number().min(0).max(1).optional(),
  top_k: z.number().int().min(0).optional(),
  stop_sequences: z.array(z.string()).max(10).optional(),
  thinking: z
    .discriminatedUnion('type', [
      z.object({
        type: z.literal('enabled'),
        budget_tokens: z.number().int().min(1024),
      }),
      z.object({
        type: z.literal('disabled'),
      }),
    ])
    .optional(),
  metadata: z
    .object({
      user_id: z.string().max(256).optional(),
    })
    .optional(),
  tool_choice: z
    .union([
      z.object({
        type: z.literal('auto'),
        disable_parallel_tool_use: z.boolean().optional(),
      }),
      z.object({
        type: z.literal('any'),
        disable_parallel_tool_use: z.boolean().optional(),
      }),
      z.object({
        type: z.literal('tool'),
        name: z.string(),
        disable_parallel_tool_use: z.boolean().optional(),
      }),
      z.object({ type: z.literal('none') }),
    ])
    .optional(),
  tools: z.array(ToolSchema).optional(),
  mcp_servers: z.array(MCPServerSchema).optional(),
});

// Model Configuration Schema
// Currently only Anthropic is supported. Future: add OpenAI, Gemini with discriminated union
const ModelConfigSchema = z.object({
  anthropic: AnthropicModelSchema,
});

// Agent definition
const AgentSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Agent ID must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  system_prompt: z.string().min(1).max(50000),
  model: ModelConfigSchema,
});

// Configuration Schema v1.0
// Minimal: just version and agents
// All credentials come from environment variables
export const ConfigSchema = z.object({
  version: z.literal('1.0'),
  agents: z.array(AgentSchema).min(1),
});

export type Config = z.infer<typeof ConfigSchema>;

// Model capabilities (which features each model supports)
// Used for validating that requested features are available on the selected model
// Anthropic's API will reject invalid model names, so we don't validate model names here
export const MODEL_CAPABILITIES: Record<string, string[]> = {
  'claude-sonnet-4-5-20250929': ['web_search', 'web_fetch', 'thinking', 'mcp'],
  'claude-opus-4-1-20250805': ['web_search', 'web_fetch', 'thinking', 'mcp'],
  'claude-haiku-4-5-20251001': ['web_search', 'web_fetch', 'mcp'],
  'claude-3-7-sonnet-20250219': ['web_search', 'web_fetch', 'thinking', 'mcp'],
  'claude-sonnet-4-20250514': ['web_search', 'web_fetch', 'thinking', 'mcp'],
  'claude-3-5-sonnet-20241022': ['thinking', 'mcp'], // Older model, no server tools
  'claude-3-5-haiku-20241022': ['mcp'], // Older model, no server tools or thinking
};

/**
 * Interpolate environment variables in YAML content
 * Supports syntax: ${VAR_NAME} and ${VAR_NAME:-default_value}
 */
export function interpolateEnvVars(yamlContent: string): string {
  const regex = /\$\{([A-Z_][A-Z0-9_]*)(:-([^}]*))?\}/g;

  return yamlContent.replace(regex, (_match, varName, hasDefault, defaultValue) => {
    const envValue = process.env[varName];

    if (envValue !== undefined) {
      return envValue;
    }

    if (hasDefault !== undefined) {
      return defaultValue || '';
    }

    throw new Error(
      `Environment variable ${varName} is not set and has no default value. ` +
        `Use \${${varName}:-default} to provide a default, or set ${varName} in your environment.`,
    );
  });
}

/**
 * Load and validate config from a file path
 */
export function loadConfig(path = 'sniff.yml'): Config {
  try {
    const file = readFileSync(path, 'utf-8');
    const interpolated = interpolateEnvVars(file);
    const parsed = parse(interpolated);
    return ConfigSchema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid configuration in', path);
      console.error('\nValidation errors:');
      error.issues.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid configuration');
    }
    throw error;
  }
}

/**
 * Validate a parsed config object
 */
export function validateConfig(config: unknown): Config {
  return ConfigSchema.parse(config);
}

/**
 * Parse YAML string and validate
 */
export function parseAndValidateConfig(yamlContent: string): Config {
  const interpolated = interpolateEnvVars(yamlContent);
  const parsed = parse(interpolated);
  return validateConfig(parsed);
}
