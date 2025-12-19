# @sniff-dev/config

Configuration validation for Sniff agent framework.

## Installation

```bash
npm install @sniff-dev/config
```

## Usage

```typescript
import { loadConfig, validateConfig, interpolateEnvVars } from '@sniff-dev/config';

// Load and validate from file
const config = loadConfig('sniff.yml');

// Validate a parsed object
const validated = validateConfig(parsedYaml);

// Interpolate environment variables in YAML content
const interpolated = interpolateEnvVars(yamlString);
```

## API

### `loadConfig(path?: string): Config`

Load and validate configuration from a YAML file. Defaults to `sniff.yml`.

### `validateConfig(config: unknown): Config`

Validate a parsed configuration object against the schema.

### `interpolateEnvVars(yamlContent: string): string`

Replace `${VAR_NAME}` and `${VAR_NAME:-default}` with environment variable values.

### `ConfigSchema`

Zod schema for validation. Can be used for custom validation logic.

## Configuration Schema

```yaml
version: '1.1'

agents:
  - id: 'my-agent'
    name: 'My Agent'
    systemPrompt: 'You are a helpful assistant.'
    runner:
      type: claude
      allowedTools:
        - Read
        - Glob
        - Grep
```

See [CONFIG.md](../../CONFIG.md) for full specification.

## License

MIT
