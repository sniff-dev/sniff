/**
 * YAML config loading and validation
 */

import YAML from 'yaml'
import { interpolateEnvVars } from './interpolate'
import { type Config, ConfigSchema } from './schema'

export interface LoadConfigOptions {
  /** Path to the config file */
  path?: string
  /** Whether to interpolate environment variables */
  interpolate?: boolean
}

/**
 * Load and validate a config file
 */
export async function loadConfig(options: LoadConfigOptions = {}): Promise<Config> {
  const { path = 'sniff.yml', interpolate = true } = options

  const file = Bun.file(path)

  if (!(await file.exists())) {
    throw new Error(`Config file not found: ${path}`)
  }

  const content = await file.text()
  let data = YAML.parse(content)

  if (interpolate) {
    data = interpolateEnvVars(data)
  }

  return validateConfig(data)
}

/**
 * Validate a config object
 */
export function validateConfig(data: unknown): Config {
  const result = ConfigSchema.safeParse(data)

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')

    throw new Error(`Invalid configuration:\n${errors}`)
  }

  validateAgentTriggers(result.data)

  return result.data
}

/**
 * Validate that agent label+team combinations don't conflict
 */
function validateAgentTriggers(config: Config): void {
  const triggers = new Map<string, string>() // "label:team" -> agentId

  for (const agent of config.agents) {
    // Skip agents without labels (they only trigger via @mention/delegation)
    if (!agent.label) {
      continue
    }

    const key = agent.team ? `${agent.label}:${agent.team}` : agent.label

    // Check for exact duplicates (same label + same team)
    const existing = triggers.get(key)
    if (existing) {
      const scope = agent.team ? `label "${agent.label}" and team "${agent.team}"` : `label "${agent.label}"`
      throw new Error(`Duplicate trigger: agents "${existing}" and "${agent.id}" both use ${scope}`)
    }

    // Check for conflicts: if this agent has no team, no other agent can use the same label
    // If this agent has a team, check that no agent without team uses the same label
    if (agent.team) {
      const noTeamKey = agent.label
      const noTeamAgent = triggers.get(noTeamKey)
      if (noTeamAgent) {
        throw new Error(
          `Conflicting triggers: agent "${noTeamAgent}" uses label "${agent.label}" for all teams, ` +
            `but agent "${agent.id}" uses the same label for team "${agent.team}"`
        )
      }
    } else {
      // This agent has no team - check no other agent uses same label with a specific team
      for (const [existingKey, existingAgentId] of triggers) {
        if (existingKey.startsWith(`${agent.label}:`)) {
          const existingTeam = existingKey.split(':')[1]
          throw new Error(
            `Conflicting triggers: agent "${agent.id}" uses label "${agent.label}" for all teams, ` +
              `but agent "${existingAgentId}" uses the same label for team "${existingTeam}"`
          )
        }
      }
    }

    triggers.set(key, agent.id)
  }
}

/**
 * Parse YAML content and validate
 */
export function parseConfig(content: string, interpolate = true): Config {
  let data = YAML.parse(content)

  if (interpolate) {
    data = interpolateEnvVars(data)
  }

  return validateConfig(data)
}
