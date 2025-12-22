Your agents can now connect to GitHub. Query issues, search repositories, and fetch data—all through MCP tools configured in YAML. This complements our existing Linear integration, giving your agents visibility across both platforms.

## What You Get

The GitHub integration provides three MCP tools your agents can use:

### `list_repositories`

Discover repositories the authenticated user can access. Supports sorting by created, updated, pushed dates, or name. Returns up to 100 repositories per query. Useful when agents need to find repos or get repository information for other tools.

### `search_issues`

Text-based search across GitHub issues and pull requests using GitHub's advanced search syntax. Supports qualifiers like `repo:owner/name`, `is:issue`, `is:pr`, `state:open`, `author:username`, and `label:bug`. Returns up to 100 results ordered by relevance. Perfect for finding related issues, checking for duplicates, or investigating similar problems.

### `get_issue`

Retrieve complete details about a specific issue: title, body, state, assignees, labels, and all comments. Use this when you need the full context about a referenced issue.

## Real Use Cases

**Support agents** can search both Linear and GitHub issues to find related problems, link tickets to PRs, and provide complete context to users asking questions.

**Release note generators** can fetch closed GitHub issues and PRs, combine them with Linear tickets, and produce comprehensive changelogs spanning both platforms.

**Docs investigators** can search GitHub issues for bug reports and feature requests related to questions in your Linear workspace, giving agents deeper context when answering questions.

## Configuration

Add the GitHub MCP server to any agent's config:

```yaml
agent:
  id: 'support-agent'
  name: 'Support Agent'

  model:
    anthropic:
      name: 'claude-sonnet-4-5-20250929'

      mcp_servers:
        - type: url
          url: https://api.sniff.to/mcp/linear
          name: 'Linear Integration'
          tool_configuration:
            allowed_tools: ['searchIssues', 'getIssue']

        - type: url
          url: https://api.sniff.to/mcp/github
          name: 'GitHub Integration'
          tool_configuration:
            allowed_tools: ['search_issues', 'get_issue', 'list_repositories']
```

Control which tools each agent can access with `tool_configuration.allowed_tools`. Some agents might only need repository search, while others need full access to issues and repos.

## Get Connected

**Via CLI:**

```bash
sniff connect github
```

**Via Dashboard:**
Navigate to Settings → Connections and click "Connect" next to GitHub. You'll authenticate via OAuth, and the connection is saved securely through Ampersand.

## How It Works

When your agent executes, it can call GitHub MCP tools just like Linear tools. We handle authentication using your stored GitHub OAuth connection, make the API requests, and return results to your agent—all transparently.

Your GitHub credentials are managed through Ampersand's OAuth proxy. Tokens never touch our servers directly, and connections are isolated per user for security.

## What's Next

GitHub joins Linear as the second platform integration. We're continuing to expand MCP server support based on what developers need most. Future integrations include Slack for notifications, Notion for knowledge bases, and custom MCP servers you can host yourself.

Check out the [documentation](https://docs.sniff.to) for more configuration examples, or join our [Discord](https://discord.gg/huk9sSQCJA) to share what you're building with the GitHub integration.
