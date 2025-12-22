Sniff is now fully self-hosted. No cloud backend, no managed infrastructure, no vendor lock-in. Just a Docker container running on your servers, configured with a single YAML file.

## Why Self-Hosted?

We built Sniff for developers who want control. Control over their data, their infrastructure, and their costs. The managed platform was convenient, but it meant your Linear webhooks and agent conversations passed through our servers.

Now everything runs on your infrastructure:

- **Your data stays yours** — Webhooks go directly to your server
- **Direct API calls** — Talk to Anthropic and Linear without intermediaries
- **No account required** — Just clone, configure, and deploy
- **Full transparency** — It's open source, audit every line

## What Changed

We removed the cloud backend entirely:

| Before                 | After                             |
| ---------------------- | --------------------------------- |
| `sniff login`          | Not needed                        |
| `sniff connect linear` | Set `LINEAR_ACCESS_TOKEN` env var |
| `sniff deploy`         | `docker compose up`               |
| Managed webhooks       | Self-configured webhooks          |
| Our servers            | Your servers                      |

The CLI now focuses on what it does best: initializing and validating configuration.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/sniff-dev/sniff.git
cd sniff

# Configure credentials
cp .env.example .env
# Edit .env with your LINEAR_ACCESS_TOKEN and ANTHROPIC_API_KEY

# Deploy
docker compose up
```

That's it. Your agent is running at `http://localhost:3000/webhook/linear`.

## Simple Architecture

```
Linear → Your Server → Anthropic
           ↓
       MCP Servers (optional)
```

No database. No session storage. No external dependencies beyond Linear and Anthropic. The entire state lives in your `sniff.yml` configuration file.

## Configuration

Same YAML format, now with `agents` as an array:

```yaml
version: '1.0'

agents:
  - id: 'triage-bot'
    name: 'Triage Assistant'
    system_prompt: |
      You are a triage specialist.
      Classify issues and set priorities.
    model:
      anthropic:
        name: 'claude-sonnet-4-20250514'
        tools:
          - type: web_search_20250305
            name: web_search
```

## Deploy Anywhere

Run Sniff wherever you run containers:

- **Docker Compose** — Local development or single-server deployment
- **Kubernetes** — Scale across your cluster
- **Cloud Run / ECS / Fargate** — Serverless container platforms
- **Your laptop** — For development and testing

## What's Next

Self-hosting is just the foundation. We're working on:

- **More platforms** — GitHub and Slack integrations
- **Better observability** — Structured logging and metrics
- **Helm charts** — One-click Kubernetes deployment

## Get Started

Check out the [quickstart guide](https://docs.sniff.to/quickstart) or dive into the [GitHub repository](https://github.com/sniff-dev/sniff). Join our [Discord](https://discord.gg/huk9sSQCJA) if you have questions or want to share what you're building.
