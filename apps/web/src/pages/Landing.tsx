import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '../components/Button';
import { features } from '../config/features';

export default function Landing() {
  const navigate = useNavigate();
  const [configCopied, setConfigCopied] = useState(false);
  const [cliCopied, setCliCopied] = useState(false);
  const [hoveredCapability, setHoveredCapability] = useState<string | null>(null);

  const handleGetStarted = () => {
    window.open('https://docs.sniff.to/quickstart', '_blank');
  };

  const handleInstallCLI = async () => {
    try {
      await navigator.clipboard.writeText('npm install -g @sniff-dev/cli');
      setCliCopied(true);
      setTimeout(() => setCliCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyConfig = async () => {
    const config = `version: "2.0"

agents:
  - id: "triage-agent"
    name: "Triage Agent"
    runner:
      claude:
        mcpServers:
          linear:
            type: sse
            url: \${LINEAR_MCP_URL}
        allowedTools:
          - linear_search_issues
          - linear_update_issue
        hooks:
          PostToolUse:
            - hooks:
              - type: command
                command: ./log-action.sh
        permissionMode: acceptEdits`;

    try {
      await navigator.clipboard.writeText(config);
      setConfigCopied(true);
      setTimeout(() => setConfigCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-sniff-bg text-sniff-text-primary">
      <Navigation />

      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 sm:pt-32 pb-16 sm:pb-24 text-center">
        {/* Feature Announcement Badge */}
        {features.featureAnnouncement && (
          <button
            onClick={() => navigate('/changelog')}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-sniff-border bg-sniff-surface/50 text-sm text-sniff-text-primary hover:border-sniff-accent-muted hover:bg-sniff-surface transition-all group"
          >
            <span className="text-sniff-accent">New:</span>
            <span>Sniff is now fully self-hosted</span>
            <svg
              className="w-4 h-4 text-sniff-text-secondary group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
          Sniff is
          <br />
          <span className="bg-gradient-to-r from-sniff-accent to-sniff-accent-muted bg-clip-text text-transparent">
            on the case.
          </span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-sniff-text-secondary mb-8 sm:mb-12">
          Deploy agents that track issues, search docs, and never lose the trail.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={handleGetStarted}
          className="group hover:pr-10"
        >
          <span className="inline-flex items-center gap-1">
            Put Sniff on it
            <span className="inline-block w-0 overflow-hidden transition-all duration-300 group-hover:w-4 group-hover:ml-1">
              →
            </span>
          </span>
        </Button>
      </section>

      {/* How it works in Linear */}
      {/* <section className="max-w-3xl mx-auto px-6 py-24 bg-zinc-900/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How it works in Linear</h2>
          <p className="text-zinc-400 text-lg">
            Agents appear as a single workspace member. @mention or assign issues to activate them.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-black border border-zinc-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">@Mention Sniff</h3>
            <p className="text-zinc-400">
              Tag Sniff in any issue comment. Choose which agent to run, and get instant AI-powered assistance.
            </p>
          </div>

          <div className="bg-black border border-zinc-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Delegate Issues</h3>
            <p className="text-zinc-400">
              Assign issues directly to Sniff. You stay accountable, while Sniff does the work as your delegate.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-blue-500/5 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-zinc-300">
                <span className="font-semibold">One workspace member, multiple agents:</span> All your deployed agent configurations appear as a single "Sniff" member in Linear. When you interact, you choose which specialized agent to use for that task.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Every trail needs a specialist */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-24 border-y border-sniff-border">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Every trail needs a specialist
          </h2>
          <p className="text-sniff-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
            Configure specialized agents tailored to your team's workflows. Each agent is
            purpose-built with its own capabilities, knowledge, and behavior—all through simple YAML
            configuration.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
          <div className="bg-sniff-surface/50 border border-sniff-border rounded-lg p-4 sm:p-6 text-center hover:border-sniff-accent/50 transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sniff-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-sniff-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">The Tracker</h3>
            <p className="text-xs sm:text-sm text-sniff-text-secondary">
              Follows issue trails, classifies what it finds
            </p>
          </div>

          <div className="bg-sniff-surface/50 border border-sniff-border rounded-lg p-4 sm:p-6 text-center hover:border-sniff-accent-muted/50 transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sniff-accent-muted/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-sniff-accent-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">The Seeker</h3>
            <p className="text-xs sm:text-sm text-sniff-text-secondary">
              Sniffs through documentation
            </p>
          </div>

          <div className="bg-sniff-surface/50 border border-sniff-border rounded-lg p-4 sm:p-6 text-center hover:border-sniff-success/50 transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sniff-success/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-sniff-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">The Reporter</h3>
            <p className="text-xs sm:text-sm text-sniff-text-secondary">Brings back findings</p>
          </div>
        </div>

        <div className="bg-sniff-surface/30 border border-sniff-border rounded-lg p-4 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-sniff-text-secondary mb-4">
            Configure each agent's system prompt, tools, and capabilities to match your exact needs
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-sniff-text-secondary">
              <svg
                className="w-4 h-4 text-sniff-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Custom instructions
            </div>
            <div className="flex items-center gap-2 text-sm text-sniff-text-secondary">
              <svg
                className="w-4 h-4 text-sniff-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Choose tools & integrations
            </div>
            <div className="flex items-center gap-2 text-sm text-sniff-text-secondary">
              <svg
                className="w-4 h-4 text-sniff-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Deploy as many as you need
            </div>
          </div>
        </div>
      </section>

      {/* Platform Integration */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Built for developers who follow the code
          </h2>
          <p className="text-sniff-text-secondary text-base sm:text-lg">
            No dashboards. No distractions. Just config and results.
          </p>
        </div>

        <div className="space-y-8 sm:space-y-12">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sniff-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:rotate-6 hover:scale-105 hover:bg-sniff-accent/20">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-sniff-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Config-driven</h3>
              <p className="text-sniff-text-secondary text-sm sm:text-base">
                Define your agent in YAML. No UI to click through, just pure configuration as code.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sniff-accent-muted/10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:rotate-6 hover:scale-105 hover:bg-sniff-accent-muted/20">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-sniff-accent-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Lightning fast</h3>
              <p className="text-sniff-text-secondary text-sm sm:text-base">
                From zero to deployed agent in under 2 minutes. Change config, redeploy, see results
                instantly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sniff-success/10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:rotate-6 hover:scale-105 hover:bg-sniff-success/20">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-sniff-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Bring your own keys</h3>
              <p className="text-sniff-text-secondary text-sm sm:text-base">
                Use your own API keys. Full control over your usage and costs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sniff-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:rotate-6 hover:scale-105 hover:bg-sniff-accent/20">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-sniff-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Fully self-hosted</h3>
              <p className="text-sniff-text-secondary text-sm sm:text-base">
                Run on your infrastructure. Your data never leaves your servers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities + Config */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            What your bloodhound can track
          </h2>
          <p className="text-sniff-text-secondary text-base sm:text-lg">
            Configure everything through YAML
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="bg-sniff-bg border border-sniff-border rounded-xl overflow-hidden">
            <div className="bg-sniff-surface px-4 py-2 border-b border-sniff-border flex items-center justify-between">
              <span className="text-xs text-sniff-text-secondary font-mono">sniff.yml</span>
              <Button
                size="sm"
                variant="text"
                onClick={handleCopyConfig}
                disabled={configCopied}
                className={
                  configCopied
                    ? 'text-sniff-accent bg-sniff-accent/10'
                    : 'text-sniff-text-secondary hover:text-sniff-text-primary'
                }
              >
                {configCopied ? '✓ Copied' : 'Copy'}
              </Button>
            </div>
            <pre className="p-4 sm:p-6 text-xs sm:text-sm font-mono text-sniff-text-secondary leading-relaxed overflow-x-auto">
              <code>
                {`version: "2.0"

agents:
  - id: "triage-agent"
    name: "Triage Agent"
    runner:
      claude:
        `}
                <span
                  className={`transition-all duration-200 ${hoveredCapability === 'mcp' ? 'bg-sniff-accent/30 text-sniff-accent-hover' : 'bg-sniff-accent/10 text-sniff-accent'}`}
                >{`mcpServers:
          linear:
            type: sse
            url: \${LINEAR_MCP_URL}`}</span>
                {`
        `}
                <span
                  className={`transition-all duration-200 ${hoveredCapability === 'tools' ? 'bg-sniff-accent-muted/30 text-sniff-text-primary' : 'bg-sniff-accent-muted/10 text-sniff-accent-muted'}`}
                >{`allowedTools:
          - linear_search_issues
          - linear_update_issue`}</span>
                {`
        `}
                <span
                  className={`transition-all duration-200 ${hoveredCapability === 'hooks' ? 'bg-sniff-success/30 text-sniff-text-primary' : 'bg-sniff-success/10 text-sniff-success'}`}
                >{`hooks:
          PostToolUse:
            - hooks:
              - type: command
                command: ./log-action.sh`}</span>
                {`
        `}
                <span
                  className={`transition-all duration-200 ${hoveredCapability === 'permissions' ? 'bg-sniff-border/50 text-sniff-text-primary' : 'bg-sniff-border/30 text-sniff-text-secondary'}`}
                >{`permissionMode: acceptEdits`}</span>
              </code>
            </pre>
          </div>

          <div className="space-y-6 sm:space-y-8 mt-8 md:mt-0">
            <div
              className="flex items-start gap-3 sm:gap-5 transition-opacity hover:opacity-100 opacity-90"
              onMouseEnter={() => setHoveredCapability('mcp')}
              onMouseLeave={() => setHoveredCapability(null)}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-sniff-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:rotate-6 hover:scale-105 hover:bg-sniff-accent/20">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-sniff-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-sniff-accent">
                  MCP servers
                </h3>
                <p className="text-sm sm:text-base text-sniff-text-secondary">
                  Connect to Linear, GitHub, Slack, and more
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-3 sm:gap-5 transition-opacity hover:opacity-100 opacity-90"
              onMouseEnter={() => setHoveredCapability('tools')}
              onMouseLeave={() => setHoveredCapability(null)}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-sniff-accent-muted/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:rotate-6 hover:scale-105 hover:bg-sniff-accent-muted/20">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-sniff-accent-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-sniff-accent-muted">
                  Fine-grained tools
                </h3>
                <p className="text-sm sm:text-base text-sniff-text-secondary">
                  Allowed and disallowed tools per agent
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-3 sm:gap-5 transition-opacity hover:opacity-100 opacity-90"
              onMouseEnter={() => setHoveredCapability('hooks')}
              onMouseLeave={() => setHoveredCapability(null)}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-sniff-success/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:rotate-6 hover:scale-105 hover:bg-sniff-success/20">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-sniff-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-sniff-success">
                  Hooks
                </h3>
                <p className="text-sm sm:text-base text-sniff-text-secondary">
                  Run scripts on tool use, stop, and more
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-3 sm:gap-5 transition-opacity hover:opacity-100 opacity-90"
              onMouseEnter={() => setHoveredCapability('permissions')}
              onMouseLeave={() => setHoveredCapability(null)}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-sniff-border/30 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:rotate-6 hover:scale-105 hover:bg-sniff-border/50">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-sniff-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-sniff-text-secondary">
                  Permission modes
                </h3>
                <p className="text-sm sm:text-base text-sniff-text-secondary">
                  Control what agents can access and modify
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
            Nose to the ground. <span className="text-sniff-text-secondary">Always.</span>
          </h2>
          <p className="text-lg sm:text-xl text-sniff-text-secondary mb-8 sm:mb-10">
            Simple beats clever. Config beats UI. Your bloodhound never rests.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleInstallCLI}
            className="group relative overflow-hidden w-full sm:min-w-[380px] sm:w-auto"
          >
            {!cliCopied && (
              <span className="absolute inset-0 bg-gradient-to-r from-sniff-accent-muted to-sniff-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            )}
            <span
              className={`relative z-10 text-sm sm:text-base ${!cliCopied && 'group-hover:text-sniff-bg transition-colors duration-300'}`}
            >
              {cliCopied ? '✓ Copied!' : 'npm install -g @sniff-dev/cli'}
            </span>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sniff-border mt-12 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-8">
            <img src="/logo.png" alt="Sniff" className="h-6" />
          </div>

          <p className="text-sm text-sniff-text-secondary">© 2025 Sniff. All rights reserved.</p>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .shimmer-animation {
          animation: shimmer 0.8s ease-out;
        }

        @keyframes successBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .bounce-animation {
          animation: successBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes checkRotate {
          0% { transform: rotate(-180deg) scale(0); opacity: 0; }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }

        .check-rotate-animation {
          animation: checkRotate 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .ripple-animation {
          animation: ripple 0.8s ease-out;
        }

        .ripple-animation-delayed {
          animation: ripple 0.8s ease-out 0.2s;
        }

        @keyframes elastic {
          0% { transform: scale(1); }
          20% { transform: scale(1.25); }
          40% { transform: scale(0.95); }
          60% { transform: scale(1.1); }
          80% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }

        .elastic-animation {
          animation: elastic 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes checkPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }

        .check-pop-animation {
          animation: checkPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes popRotate {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1.1) rotate(0deg); }
        }

        .pop-rotate-animation {
          animation: popRotate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes heartbeat {
          0% { transform: scale(1); }
          10% { transform: scale(1.15); }
          20% { transform: scale(1); }
          30% { transform: scale(1.15); }
          40% { transform: scale(1); }
          100% { transform: scale(1); }
        }

        .heartbeat-animation {
          animation: heartbeat 0.8s ease-in-out;
        }

        @keyframes squeezePop {
          0% { transform: scale(1, 1); }
          25% { transform: scale(0.85, 1.15); }
          50% { transform: scale(1.15, 0.85); }
          75% { transform: scale(0.95, 1.05); }
          100% { transform: scale(1, 1); }
        }

        .squeeze-pop-animation {
          animation: squeezePop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes checkSpin {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .check-spin-animation {
          animation: checkSpin 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
