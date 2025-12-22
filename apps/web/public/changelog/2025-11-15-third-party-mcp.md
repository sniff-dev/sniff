Today we're expanding Sniff's integration capabilities with two powerful features: support for any MCP-compatible server and environment variable interpolation in your configuration files.

## What's New

### Connect to Any MCP Server

Previously, agents could only connect to Sniff's official MCP integrations (Linear and GitHub). Now you can connect to **any MCP-compatible service**:

- **Knowledge bases** like Ragie for semantic search
- **Custom MCP servers** you build for your organization
- **Enterprise integrations** with specialized tools
- **Third-party services** in the growing MCP ecosystem

### Environment Variable Support

Configuration files now support environment variable interpolation with the `${VAR_NAME}` syntax. This enables:

- **Secure configuration** - Keep API keys out of version control
- **Environment-specific settings** - Different values for dev/staging/prod
- **CI/CD friendly** - Works seamlessly with GitHub Actions, Jenkins, and other platforms
- **Default values** - Use `${VAR:-default}` for optional variables

## Quick Start

Here's how to connect a third-party MCP server:

```yaml
version: '1.0'

agent:
  id: 'support-bot'
  name: 'Support Assistant'

  system_prompt: |
    You help users by searching our knowledge base.
    Use the search_knowledge tool before answering questions.

  model:
    anthropic:
      name: 'claude-sonnet-4-5-20250929'

      mcp_servers:
        # Sniff's Linear integration (no token needed)
        - type: url
          url: https://api.sniff.to/mcp/linear
          name: 'Linear Integration'

        # Third-party knowledge base with API key
        - type: url
          url: ${RAGIE_MCP_URL:-https://api.ragie.ai/v1/mcp}
          name: 'Knowledge Base'
          authorization_token: ${RAGIE_API_KEY}
```

Then set your environment variables:

```bash
# .env
RAGIE_API_KEY=your_secret_api_key_here
RAGIE_MCP_URL=https://api.ragie.ai/v1/mcp

```

Deploy with environment variables loaded:

```bash
export $(cat .env | xargs)
sniff deploy
```

## Security Best Practices

**Never commit secrets to version control.** Environment variables keep your API keys and tokens secure. Use `${API_KEY}` in config.yml. Don't hardcode `authorization_token: sk_live_abc123...`

## CI/CD Integration

Works seamlessly with GitHub Actions and other CI platforms:

```yaml
# .github/workflows/deploy.yml
- name: Deploy agent
  env:
    RAGIE_API_KEY: ${{ secrets.RAGIE_API_KEY }}
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: npx @sniff-dev/cli deploy
```

## Use Cases

This unlocks powerful new capabilities:

- **Knowledge bases**: Connect Ragie, Pinecone, or custom vector databases
- **Enterprise tools**: Integrate with internal MCP servers
- **Custom workflows**: Build your own MCP servers for specialized tasks
- **Multi-environment deployments**: Same config, different credentials per environment

## Environment Variable Syntax

- `${VAR_NAME}` - Required variable (error if not set)
- `${VAR_NAME:-default}` - Optional with default value
- Variable names must be UPPERCASE with underscores: `A-Z`, `0-9`, `_`

## Learn More

- [Configuration documentation](https://docs.sniff.to/configuration#environment-variables) - Complete guide to environment variables
- [MCP Integrations](https://docs.sniff.to/configuration#mcp-integrations) - How to configure MCP servers
- [Model Context Protocol](https://modelcontextprotocol.io) - Learn about MCP

---

**What's next?** We're working on more official MCP integrations and tools to make building custom MCP servers even easier. Let us know what integrations you'd like to see!
