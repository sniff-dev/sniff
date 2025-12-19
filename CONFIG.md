# Sniff Configuration Specification v1.0

## Overview

Sniff is a self-hosted AI agent framework for Linear. The configuration file (`sniff.yml`) defines your agents' identity, behavior, and model settings. All credentials come from environment variables.

## File Format

- **Format**: YAML
- **Encoding**: UTF-8
- **Location**: `./sniff.yml`
- **Schema Version**: 1.0

## Quick Start

```yaml
version: "1.0"

agents:
  - id: "triage-bot"
    name: "Triage Assistant"
    system_prompt: |
      You are a triage specialist.
      Classify issues as BUG/FEATURE/QUESTION/TASK.
      Set priority P0-P3.
    model:
      anthropic:
        name: "claude-sonnet-4-20250514"
        temperature: 0.7
        max_tokens: 4096
```

## Environment Variables

All credentials come from environment variables (not the YAML file):

| Variable                | Required | Description                   |
| ----------------------- | -------- | ----------------------------- |
| `LINEAR_ACCESS_TOKEN`   | Yes      | Linear API token              |
| `ANTHROPIC_API_KEY`     | Yes      | Anthropic API key             |
| `LINEAR_WEBHOOK_SECRET` | No       | Linear webhook signing secret |
| `PORT`                  | No       | Server port (default: 3000)   |

## Environment Variable Interpolation

Configuration values can reference environment variables using `${VAR_NAME}` syntax. This is useful for MCP server tokens:

```yaml
agents:
  - id: "my-agent"
    # ...
    model:
      anthropic:
        name: "claude-sonnet-4-20250514"
        mcp_servers:
          - type: url
            url: "https://api.example.com/mcp"
            name: "Example MCP"
            authorization_token: "${EXAMPLE_API_KEY}"
```

**Syntax**:

- `${VAR_NAME}` - Required (errors if not set)
- `${VAR_NAME:-default}` - Optional with default value

## Top-Level Structure

```yaml
version: "1.0" # Required - schema version
agents: [] # Required - array of agent definitions
```

## Agent Definition

Each agent in the `agents` array has the following structure:

### `id` (required)

**Type**: `string`
**Pattern**: `^[a-z0-9-]+$`
**Length**: 1-50 characters

Unique identifier for the agent.

```yaml
agents:
  - id: "triage-bot"
```

### `name` (required)

**Type**: `string`
**Length**: 1-100 characters

Human-readable display name.

```yaml
agents:
  - id: "triage-bot"
    name: "Triage Assistant"
```

### `description` (optional)

**Type**: `string`
**Length**: 0-500 characters

Brief description of the agent's purpose.

```yaml
agents:
  - id: "triage-bot"
    name: "Triage Assistant"
    description: "Analyzes and classifies engineering issues"
```

### `system_prompt` (required)

**Type**: `string`
**Length**: 1-50000 characters

Core instructions that define how the agent thinks and responds.

```yaml
agents:
  - id: "triage-bot"
    name: "Triage Assistant"
    system_prompt: |
      You are a triage specialist for a development team.

      When analyzing an issue:
      1. Classify as BUG/FEATURE/QUESTION/TASK
      2. Set priority P0-P3
      3. Provide clear reasoning

      Respond in markdown format.
```

### `model` (required)

**Type**: `object`

Model configuration. Currently only Anthropic is supported.

```yaml
agents:
  - id: "triage-bot"
    # ...
    model:
      anthropic:
        name: "claude-sonnet-4-20250514"
        temperature: 0.7
        max_tokens: 4096
```

## Anthropic Model Configuration

### `model.anthropic.name` (optional)

**Type**: `string`
**Default**: `"claude-sonnet-4-20250514"`

The Claude model to use.

### `model.anthropic.temperature` (optional)

**Type**: `number`
**Range**: `0.0 - 1.0`
**Default**: `1.0`

Controls randomness. Lower = more deterministic.

### `model.anthropic.max_tokens` (optional)

**Type**: `integer`
**Range**: `1 - 8192`
**Default**: `4096`

Maximum tokens for the response.

### `model.anthropic.top_p` (optional)

**Type**: `number`
**Range**: `0.0 - 1.0`

Nucleus sampling parameter.

### `model.anthropic.top_k` (optional)

**Type**: `integer`
**Range**: `> 0`

Top-k sampling parameter.

### `model.anthropic.stop_sequences` (optional)

**Type**: `array of strings`
**Max Items**: 10

Custom stop sequences.

```yaml
model:
  anthropic:
    stop_sequences:
      - "END_ANALYSIS"
      - "---"
```

### `model.anthropic.thinking` (optional)

**Type**: `object`

Extended thinking for complex reasoning.

```yaml
model:
  anthropic:
    thinking:
      type: "enabled"
      budget_tokens: 2000
```

**Requirements**:

- Minimum `budget_tokens`: 1024
- `temperature` must be 1 when thinking is enabled

### `model.anthropic.metadata` (optional)

**Type**: `object`

Metadata for tracking.

```yaml
model:
  anthropic:
    metadata:
      user_id: "workspace-abc123"
```

### `model.anthropic.tool_choice` (optional)

**Type**: `object`

Controls how the model uses tools.

```yaml
# Auto (default)
tool_choice:
  type: "auto"

# Force any tool
tool_choice:
  type: "any"

# Force specific tool
tool_choice:
  type: "tool"
  name: "web_search"

# Disable tools
tool_choice:
  type: "none"
```

### `model.anthropic.tools` (optional)

**Type**: `array`

Server-side tools the agent can use.

#### Web Search Tool

```yaml
tools:
  - type: web_search_20250305
    name: web_search
    max_uses: 10 # Optional: limit per conversation
    allowed_domains: # Optional
      - "docs.example.com"
    blocked_domains: # Optional
      - "spam.com"
    user_location: # Optional
      type: approximate
      city: "San Francisco"
      region: "California"
      country: "US"
      timezone: "America/Los_Angeles"
```

#### Web Fetch Tool

```yaml
tools:
  - type: web_fetch_20250910
    name: web_fetch
    max_uses: 20 # Optional
    allowed_domains: # Optional
      - "docs.example.com"
    blocked_domains: # Optional
      - "private.example.com"
    citations: # Optional
      enabled: true
    max_content_tokens: 100000 # Optional
```

### `model.anthropic.mcp_servers` (optional)

**Type**: `array`

MCP (Model Context Protocol) servers for external integrations.

```yaml
mcp_servers:
  - type: url
    url: "https://api.example.com/mcp"
    name: "Example Integration"
    authorization_token: "${EXAMPLE_API_KEY}" # Use env var
    tool_configuration: # Optional
      enabled: true
      allowed_tools:
        - "get_data"
        - "search"
```

## Complete Examples

### Minimal Configuration

```yaml
version: "1.0"

agents:
  - id: "triage-bot"
    name: "Triage Assistant"
    system_prompt: |
      You are a triage specialist.
      Classify issues as BUG/FEATURE/QUESTION/TASK.
      Set priority P0-P3.
    model:
      anthropic:
        name: "claude-sonnet-4-20250514"
```

### Full Configuration

```yaml
version: "1.0"

agents:
  - id: "triage-bot"
    name: "Triage Assistant"
    description: "Analyzes and classifies engineering issues"
    system_prompt: |
      You are a triage specialist for a software development team.

      When analyzing an issue, follow these steps:

      1. **Classification**: Determine the issue type
         - BUG: Something is broken
         - FEATURE: Request for new functionality
         - QUESTION: User needs help
         - TASK: Maintenance or technical debt

      2. **Priority**: Assess urgency
         - P0: Critical - System down, security issue
         - P1: High - Major functionality broken
         - P2: Medium - Important but workaround exists
         - P3: Low - Nice to have

      3. **Analysis**: Provide clear reasoning

      Format your response in markdown.

    model:
      anthropic:
        name: "claude-sonnet-4-20250514"
        temperature: 0.7
        max_tokens: 4096
```

### Configuration with Web Search

```yaml
version: "1.0"

agents:
  - id: "research-bot"
    name: "Research Assistant"
    description: "AI agent that can search the web"
    system_prompt: |
      You are a research assistant.
      Use web search to find relevant information.
      Always cite your sources.

    model:
      anthropic:
        name: "claude-sonnet-4-20250514"
        temperature: 0.7
        max_tokens: 4096
        tool_choice:
          type: "auto"
        tools:
          - type: web_search_20250305
            name: web_search
            max_uses: 5
          - type: web_fetch_20250910
            name: web_fetch
            max_uses: 10
            citations:
              enabled: true
```

### Multiple Agents

```yaml
version: "1.0"

agents:
  - id: "triage-bot"
    name: "Triage Bot"
    system_prompt: |
      You triage incoming issues.
    model:
      anthropic:
        name: "claude-sonnet-4-20250514"

  - id: "docs-bot"
    name: "Documentation Bot"
    system_prompt: |
      You help with documentation questions.
    model:
      anthropic:
        name: "claude-sonnet-4-20250514"
        tools:
          - type: web_search_20250305
            name: web_search
```

## Deployment

### Docker (Recommended)

```bash
# 1. Create sniff.yml
sniff init

# 2. Set environment variables
export LINEAR_ACCESS_TOKEN=lin_api_xxx
export ANTHROPIC_API_KEY=sk-ant-xxx

# 3. Run
docker compose up
```

### Direct

```bash
# Using the sniff-server binary
LINEAR_ACCESS_TOKEN=xxx ANTHROPIC_API_KEY=xxx npx sniff-server
```

## Validation

Validate your configuration before deploying:

```bash
sniff validate
```

## Validation Rules

1. **Version**: Must be exactly `"1.0"`
2. **Agents**: At least one agent required
3. **Agent ID**: Lowercase alphanumeric with hyphens, 1-50 chars
4. **System Prompt**: Cannot be empty
5. **Temperature**: Must be between 0.0 and 1.0

## Troubleshooting

### Config Not Found

```
Config file not found: sniff.yml
```

**Solution**: Run `sniff init` to create a config file.

### Invalid YAML

```
Invalid YAML syntax
```

**Solution**: Check indentation (2 spaces), quotes, and special characters.

### Missing Environment Variable

```
Environment variable LINEAR_ACCESS_TOKEN is not set
```

**Solution**: Set the required environment variable.

## References

- [Linear API Documentation](https://developers.linear.app)
- [Anthropic API Documentation](https://docs.anthropic.com)
- [Sniff GitHub](https://github.com/caiopizzol/sniff)
