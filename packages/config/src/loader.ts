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

  return result.data
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
