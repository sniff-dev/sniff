Today we're launching Sniff in public beta! After months of development with early adopters, we're ready to share our CLI-first platform for deploying AI agents to Linear. Go from zero to a production-ready agent in under 2 minutes with just 5 commands.

## What is Sniff?

Sniff is a developer tool that lets you deploy AI agents to Linear using simple YAML configuration. Define your agent's behavior, run `sniff deploy`, and watch it appear as a workspace member ready to handle issues. No servers to maintain, no infrastructure to manage—just pure configuration.

Whether you need an agent to triage incoming bugs, search documentation for answers, or generate release notes from closed issues, Sniff handles all the complexity: webhooks, OAuth flows, agent sessions, and GraphQL mutations.

## From Install to Deployed in 5 Commands

```bash
npm install -g @sniff-dev/cli
sniff login
sniff connect linear
sniff init
sniff deploy
```

That's it. Your agent appears as "@Sniff" in your Linear workspace. Team members can @mention it or assign issues directly. When you deploy multiple agents, Sniff asks users which specialized agent to run for each issue.

## Key Features

### Configuration as Code

Define everything in `config.yml`—system prompts, model settings, tools, and integrations. Version control friendly. No UI to click through. Deploy updates by rerunning `sniff deploy`.

### Bring Your Own Keys

Use your own Anthropic API keys. Full visibility into usage and costs. Your Linear tokens never touch our servers—they're managed securely through Ampersand's OAuth infrastructure.

### Powerful Capabilities

- **Extended thinking**: Enable Claude's deep reasoning mode for complex issues
- **Web tools**: Built-in web search and fetch powered by Anthropic
- **MCP integrations**: Query Linear issues, search your workspace, fetch related data
- **Multiple agents**: Deploy unlimited specialized agents, each with custom behavior

### Zero Infrastructure

Fully managed platform. We handle webhooks, scale automatically, and keep everything running. You write config, we run the agent.

## Real-World Use Cases

Our early adopters are using Sniff to:

- **Triage issues**: Automatically label, prioritize, and assign incoming bugs
- **Answer questions**: Search docs and provide cited answers to technical questions
- **Generate release notes**: Transform closed issues into polished, customer-ready updates
- **Find duplicates**: Prevent duplicate issues by searching for similar problems
- **Plan sprints**: Estimate effort, identify dependencies, and balance team capacity

## How It Works

Agents appear as a single workspace member in Linear. @mention Sniff in any issue comment or assign an issue to Sniff. The agent receives the issue context, processes it using Claude, and responds with activities streamed live to Linear—thoughts, actions, and final answers.

All agent execution happens on our managed infrastructure using your Anthropic API key and Linear OAuth connection. You stay in control while we handle the complexity.

## What's Next

This beta is just the beginning. We're working on:

- Additional MCP integrations (GitHub, Slack, Notion)
- Enhanced agent analytics and performance insights
- Advanced debugging tools with execution traces
- Custom tool development framework

We're eager to see what you build and hear your feedback on what capabilities matter most.

## Get Started Today

Install the CLI and deploy your first agent:

```bash
npm install -g @sniff-dev/cli
```

Check out our [documentation](https://docs.sniff.to) for configuration examples, best practices, and detailed guides. Join our [Discord community](https://discord.gg/huk9sSQCJA) to share your use cases, get help from the team, and connect with other developers building on Sniff.
