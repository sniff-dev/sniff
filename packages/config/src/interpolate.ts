/**
 * Environment variable interpolation for config values
 * Supports ${VAR_NAME} and ${VAR_NAME:-default} syntax
 */

const ENV_VAR_PATTERN = /\$\{([^}]+)\}/g

/**
 * Interpolate environment variables in a string
 */
export function interpolateString(value: string): string {
  return value.replace(ENV_VAR_PATTERN, (match, expression) => {
    // Check for default value syntax: ${VAR:-default}
    const [varName, defaultValue] = expression.split(':-')
    const envValue = process.env[varName.trim()]

    if (envValue !== undefined) {
      return envValue
    }

    if (defaultValue !== undefined) {
      return defaultValue
    }

    // Return original if no value and no default
    return match
  })
}

/**
 * Recursively interpolate environment variables in an object
 */
export function interpolateEnvVars<T>(obj: T): T {
  if (typeof obj === 'string') {
    return interpolateString(obj) as T
  }

  if (Array.isArray(obj)) {
    return obj.map(interpolateEnvVars) as T
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateEnvVars(value)
    }
    return result as T
  }

  return obj
}
