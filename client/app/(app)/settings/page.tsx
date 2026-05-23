'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SettingsNav } from '@/components/settings/SettingsNav';
import { SettingsRightPanel } from '@/components/settings/SettingsRightPanel';
import { ArrowRight, Clock3, Globe, Layers, Link2, ShieldCheck, Sparkles, TerminalSquare, Users, GitBranch, CreditCard, Bell, Eye, Settings2, Monitor, FolderOpen, CheckCircle, AlertTriangle, Server as ServerIcon, Wifi, WifiOff, HelpCircle, Keyboard, ExternalLink, BookOpen, MessageCircle, Zap, Search, Codepen, Command, Sliders, Download } from 'lucide-react';

const providerCards = [
  {
    title: 'OpenAI',
    model: 'gpt-4.1-small',
    status: 'Connected',
    usage: '42k tokens / 100k',
    route: 'Primary',
  },
  {
    title: 'Claude',
    model: 'claude-3.5',
    status: 'Connected',
    usage: '63k tokens / 120k',
    route: 'Failover',
  },
  {
    title: 'Gemini',
    model: 'gemini-pro',
    status: 'Pending',
    usage: '12k tokens / 80k',
    route: 'Experimental',
  },
  {
    title: 'OpenRouter',
    model: 'openrouter-a3',
    status: 'Connected',
    usage: '21k tokens / 70k',
    route: 'Routed',
  },
];

const repoAccess = [
  { name: 'repolyx/api', access: 'Admin', index: 'Indexed', visibility: 'Private' },
  { name: 'repolyx/cli', access: 'Developer', index: 'Indexed', visibility: 'Private' },
  { name: 'repolyx/ui', access: 'Reviewer', index: 'Pending', visibility: 'Public' },
];

const members = [
  { name: 'Anna Park', role: 'Admin', status: 'Active' },
  { name: 'Jude Kim', role: 'Developer', status: 'Active' },
  { name: 'Nina Liu', role: 'Reviewer', status: 'Pending' },
  { name: 'Mira Lopez', role: 'Viewer', status: 'Active' },
];

const metrics = [
  { label: 'AI token usage', value: '68%', detail: '24h steady usage', accent: 'bg-cyan-400/15' },
  { label: 'Repo scans', value: '17 / 20', detail: 'Daily limit', accent: 'bg-violet-500/15' },
  { label: 'Storage', value: '92 GB', detail: 'Vector DB + logs', accent: 'bg-amber-500/15' },
  { label: 'Plan', value: 'Pro', detail: 'Annual billing', accent: 'bg-emerald-500/15' },
];

const apiKeys = [
  { label: 'Core engine key', key: 'sk-••••••••••••1a2b', expires: '30d', status: 'Active' },
  { label: 'Analytics key', key: 'sk-••••••••••••3c4d', expires: 'expired', status: 'Revoked' },
];

const sections = [
  'Help & Support',
  'Keyboard Shortcuts',
  'General',
  'GitHub Integration',
  'AI Providers',
  'Repository Access',
  'Billing',
  'Team Members',
  'API Keys',
  'Notifications',
  'Security',
  'Appearance',
  'Experimental Features',
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('General');

  const renderSection = () => {
    switch (activeSection) {
      case 'General':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Workspace profile</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Workspace identity</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Manage workspace defaults, repository routing, timezone, and developer profile conventions.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="success">Live sync</Badge>
                  <Badge variant="secondary">Shared</Badge>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                  <label className="space-y-2 text-sm text-neutral-300">
                    <span className="text-xs uppercase tracking-[0.24em] text-neutral-500">Workspace name</span>
                    <input
                      type="text"
                      defaultValue="Repolyx AI Lab"
                      className="w-full rounded-3xl border border-white/10 bg-[#05070f] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-neutral-300">
                    <span className="text-xs uppercase tracking-[0.24em] text-neutral-500">Default repository</span>
                    <select className="w-full rounded-3xl border border-white/10 bg-[#05070f] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20">
                      <option>repolyx/api</option>
                      <option>repolyx/cli</option>
                      <option>repolyx/ui</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  <label className="space-y-2 text-sm text-neutral-300">
                    <span className="text-xs uppercase tracking-[0.24em] text-neutral-500">Timezone</span>
                    <select className="w-full rounded-3xl border border-white/10 bg-[#05070f] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20">
                      <option>UTC +2 (Berlin)</option>
                      <option>UTC -7 (San Francisco)</option>
                      <option>UTC +1 (London)</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-neutral-300">
                    <span className="text-xs uppercase tracking-[0.24em] text-neutral-500">Language</span>
                    <select className="w-full rounded-3xl border border-white/10 bg-[#05070f] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20">
                      <option>English</option>
                      <option>Deutsch</option>
                      <option>日本語</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-neutral-300">
                    <span className="text-xs uppercase tracking-[0.24em] text-neutral-500">Environment</span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {['Production', 'Staging'].map((env) => (
                        <button key={env} type="button" className={`rounded-2xl border px-4 py-3 text-sm transition ${env === 'Production' ? 'border-cyan-400 bg-cyan-500/10 text-white' : 'border-white/10 bg-white/5 text-neutral-300 hover:border-cyan-400 hover:bg-white/10'}`}>
                          {env}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>
              </div>
            </Card>

            <Card className="rounded-[32px] border-white/10 bg-[#090c13] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Profile preferences</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Developer defaults</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-400">Adjust the workspace experience for engineering teams and AI operators.</p>
                </div>
                <Button variant="secondary" size="sm">Save workspace</Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Show system prompts', enabled: true },
                  { label: 'Autofill issue titles', enabled: false },
                  { label: 'Enable preview snippets', enabled: true },
                  { label: 'Telemetry sharing', enabled: false },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-[#070c13] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="mt-2 text-sm text-neutral-400">{item.enabled ? 'Enabled for workspace' : 'Disabled by default'}</p>
                      </div>
                      <button
                        type="button"
                        className={`h-11 w-20 rounded-full border px-3 text-sm transition ${item.enabled ? 'border-cyan-400 bg-cyan-500/15 text-white' : 'border-white/10 bg-white/5 text-neutral-300 hover:border-cyan-400 hover:bg-white/10'}`}
                      >
                        {item.enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'Help & Support':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Repolyx MCP</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Help & support</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Get started with Repolyx MCP, access documentation, report issues, and connect with the community.</p>
                </div>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">Quick guides</p>
                  <div className="mt-5 space-y-4">
                    {[
                      { icon: BookOpen, title: 'Getting started', desc: 'Learn how to connect your workspace and set up the MCP server.', action: 'Read guide' },
                      { icon: GitBranch, title: 'GitHub workflow', desc: 'Understand branches, commits, PRs, and the GitHub Flow.', action: 'View tutorial' },
                      { icon: TerminalSquare, title: 'Pre-push validation', desc: 'Run automated checks before pushing to GitHub.', action: 'Learn more' },
                      { icon: Monitor, title: 'MCP server setup', desc: 'Install and configure the local MCP server on your machine.', action: 'Setup guide' },
                    ].map((guide) => {
                      const Icon = guide.icon;
                      return (
                        <div key={guide.title} className="rounded-2xl border border-white/10 bg-[#05070f] p-4">
                          <div className="flex items-start gap-3">
                            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-white">{guide.title}</p>
                              <p className="mt-1 text-xs text-neutral-400">{guide.desc}</p>
                            </div>
                            <button type="button" className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 hover:border-cyan-400 hover:text-white transition">
                              {guide.action}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">Contact & community</p>
                    <div className="mt-5 space-y-3">
                      {[
                        { icon: MessageCircle, label: 'Community forum', desc: 'Ask questions and share tips' },
                        { icon: ExternalLink, label: 'Report an issue', desc: 'File a bug or feature request' },
                        { icon: BookOpen, label: 'Documentation', desc: 'Full MCP reference guide' },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                                <Icon size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{item.label}</p>
                                <p className="text-xs text-neutral-400">{item.desc}</p>
                              </div>
                            </div>
                            <ExternalLink size={14} className="text-neutral-500 shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/[0.04] to-[#070a0f] p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-400">Tip</p>
                    <p className="mt-3 text-sm leading-6 text-neutral-300">
                      Run <span className="font-mono text-cyan-300">npx repolyx-mcp</span> in your project directory to start the local MCP server on port 3939.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'Keyboard Shortcuts':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Repolyx MCP</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Keyboard shortcuts</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Speed up your workflow with keyboard shortcuts for navigation, MCP operations, and common actions.</p>
                </div>
                <Badge variant="secondary">14 shortcuts</Badge>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">Navigation</p>
                  <div className="mt-5 space-y-3">
                    {[
                      { keys: ['⌘', 'K'], action: 'Command palette' },
                      { keys: ['⌘', '1'], action: 'Go to overview' },
                      { keys: ['⌘', '2'], action: 'Go to repositories' },
                      { keys: ['⌘', '3'], action: 'Go to AI Chat' },
                      { keys: ['⌘', '4'], action: 'Go to Pull Requests' },
                      { keys: ['⌘', ','], action: 'Open settings' },
                    ].map((item) => (
                      <div key={item.action} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3">
                        <span className="text-sm text-neutral-300">{item.action}</span>
                        <div className="flex items-center gap-1.5">
                          {item.keys.map((key) => (
                            <kbd key={key} className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2 text-xs font-mono text-neutral-200">
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">MCP operations</p>
                    <div className="mt-5 space-y-3">
                      {[
                        { keys: ['⌘', '⇧', 'W'], action: 'Connect workspace' },
                        { keys: ['⌘', '⇧', 'H'], action: 'Run health checks' },
                        { keys: ['⌘', '⇧', 'V'], action: 'Validate project' },
                        { keys: ['⌘', '⇧', 'P'], action: 'Push to GitHub' },
                      ].map((item) => (
                        <div key={item.action} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3">
                          <span className="text-sm text-neutral-300">{item.action}</span>
                          <div className="flex items-center gap-1.5">
                            {item.keys.map((key) => (
                              <kbd key={key} className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2 text-xs font-mono text-neutral-200">
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">Actions</p>
                    <div className="mt-5 space-y-3">
                      {[
                        { keys: ['⌘', 'S'], action: 'Save changes' },
                        { keys: ['⌘', 'Z'], action: 'Undo' },
                        { keys: ['⌘', '⇧', 'Z'], action: 'Redo' },
                        { keys: ['⌘', 'F'], action: 'Search files' },
                      ].map((item) => (
                        <div key={item.action} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3">
                          <span className="text-sm text-neutral-300">{item.action}</span>
                          <div className="flex items-center gap-1.5">
                            {item.keys.map((key) => (
                              <kbd key={key} className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2 text-xs font-mono text-neutral-200">
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'GitHub Integration':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">GitHub</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Connected integration</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Review OAuth state, repository permissions, webhook delivery, and sync status for GitHub access.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="success">OAuth active</Badge>
                  <Badge variant="secondary">Webhooks live</Badge>
                </div>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">Account</p>
                      <p className="mt-3 text-xl font-semibold text-white">repolyx-org / repolyx</p>
                      <p className="mt-2 text-sm text-neutral-400">Connected as repolyx-bot · GitHub Enterprise</p>
                    </div>
                    <Badge variant="success">Synced</Badge>
                  </div>
                  <div className="mt-6 space-y-3 text-sm text-neutral-400">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3">
                      <span>Repositories</span>
                      <span className="text-white">12 connected</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3">
                      <span>Webhook health</span>
                      <span className="text-white">99.7%</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3">
                      <span>OAuth status</span>
                      <span className="text-white">Authorized</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button variant="secondary" size="sm">Reconnect GitHub</Button>
                    <Button variant="outline" size="sm">Refresh repos</Button>
                    <Button variant="ghost" size="sm">Manage access</Button>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">Repository permissions</p>
                  <div className="mt-5 space-y-4">
                    {['repolyx/api', 'repolyx/cli', 'repolyx/ui'].map((repo) => (
                      <div key={repo} className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-4 text-sm text-neutral-300">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">{repo}</p>
                            <p className="text-xs text-neutral-500">Admin integration access</p>
                          </div>
                          <Badge variant="success">Full</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'AI Providers':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">AI routing</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Provider configuration</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Manage providers, models, usage boundaries, and priority routing for inferencing workflows.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="success">4 providers</Badge>
                  <Badge variant="secondary">Multi-route</Badge>
                </div>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-2">
                {providerCards.map((provider) => (
                  <div key={provider.title} className="rounded-3xl border border-white/10 bg-[#070c13] p-5 transition hover:border-cyan-400/20">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">{provider.title}</p>
                        <p className="mt-2 text-xl font-semibold text-white">{provider.model}</p>
                      </div>
                      <Badge variant={provider.status === 'Connected' ? 'success' : provider.status === 'Pending' ? 'muted' : 'secondary'}>{provider.status}</Badge>
                    </div>
                    <div className="mt-5 space-y-3 text-sm text-neutral-400">
                      <div className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Usage</p>
                        <p className="mt-2 text-sm text-white">{provider.usage}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Routing</p>
                        <p className="mt-2 text-sm text-white">{provider.route}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3">
                      <div className="rounded-2xl bg-[#02050a] px-4 py-3 text-sm text-neutral-300">
                        <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.2em] text-neutral-500">
                          <span>Temperature</span>
                          <span>0.8</span>
                        </div>
                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full w-4/5 rounded-full bg-cyan-400" />
                        </div>
                      </div>
                      <div className="rounded-2xl bg-[#02050a] px-4 py-3 text-sm text-neutral-300">
                        <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.2em] text-neutral-500">
                          <span>Context window</span>
                          <span>32k</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'Repository Access':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Access control</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Repository permissions</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Control indexing access, AI visibility, and repo-level team permission rules.</p>
                </div>
                <Badge variant="secondary">AI visibility</Badge>
              </div>

              <div className="mt-8 space-y-4">
                {repoAccess.map((repo) => (
                  <div key={repo.name} className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{repo.name}</p>
                        <p className="mt-2 text-sm text-neutral-400">Permission: {repo.access}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-300">
                        <Badge variant={repo.index === 'Indexed' ? 'success' : 'muted'}>{repo.index}</Badge>
                        <Badge variant={repo.visibility === 'Private' ? 'secondary' : 'muted'}>{repo.visibility}</Badge>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-400">
                      <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white transition hover:border-cyan-400 hover:bg-white/10">Toggle AI access</button>
                      <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white transition hover:border-cyan-400 hover:bg-white/10">Adjust role</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'Billing':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Billing</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Usage & plan</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Track AI token consumption, repository scans, storage, and plan status at a glance.</p>
                </div>
                <Button variant="secondary" size="sm">View invoice</Button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">{metric.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                    <p className="mt-2 text-sm text-neutral-400">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'Team Members':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Team</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Members & roles</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Control team access, role assignments, and invite workflows for production teams.</p>
                </div>
                <Button variant="secondary" size="sm">Invite member</Button>
              </div>

              <div className="mt-8 space-y-4">
                {members.map((member) => (
                  <div key={member.name} className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{member.name}</p>
                        <p className="mt-2 text-sm text-neutral-400">Role: {member.role}</p>
                      </div>
                      <Badge variant={member.status === 'Active' ? 'success' : 'muted'}>{member.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'API Keys':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Secrets</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">API key vault</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Generate, rotate, and secure API keys used by agents and developer workflows.</p>
                </div>
                <Button variant="secondary" size="sm">Generate key</Button>
              </div>

              <div className="mt-8 space-y-4">
                {apiKeys.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-neutral-500">{item.expires} until rotation</p>
                      </div>
                      <Badge variant={item.status === 'Active' ? 'success' : 'muted'}>{item.status}</Badge>
                    </div>
                    <div className="mt-4 rounded-3xl border border-white/10 bg-[#05070f] p-4 font-mono text-sm text-neutral-200 tracking-[0.08em]">
                      {item.key}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button variant="secondary" size="sm">Revoke key</Button>
                      <Button variant="ghost" size="sm">View usage</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'Notifications':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Alerts</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Notification rules</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Choose how workspace events are surfaced to teams, channels, and AI operator feeds.</p>
                </div>
                <Badge variant="secondary">Push + Email</Badge>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  { name: 'Sync failures', enabled: true },
                  { name: 'Model latency spikes', enabled: true },
                  { name: 'New member invites', enabled: false },
                  { name: 'Security alerts', enabled: true },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#070c13] px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-sm text-neutral-400">{item.enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <button type="button" className={`h-11 w-20 rounded-full border px-3 text-sm transition ${item.enabled ? 'border-cyan-400 bg-cyan-500/15 text-white' : 'border-white/10 bg-white/5 text-neutral-300 hover:border-cyan-400 hover:bg-white/10'}`}>{item.enabled ? 'ON' : 'OFF'}</button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'Security':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Security</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Protection controls</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Manage 2FA, session history, device access, and audit logging for the workspace.</p>
                </div>
                <Badge variant="warning">High priority</Badge>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">Two-factor authentication</p>
                  <p className="mt-3 text-sm text-neutral-300">Protect workspace account access with hardware or authenticator-based 2FA.</p>
                  <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#05070f] px-4 py-4">
                    <div>
                      <p className="font-semibold text-white">Enabled</p>
                      <p className="text-sm text-neutral-400">Last verified 2h ago</p>
                    </div>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">Session management</p>
                  <div className="mt-4 space-y-3 text-sm text-neutral-300">
                    <div className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">Desktop · Windows</p>
                        <p className="text-xs text-neutral-500">Active now</p>
                      </div>
                      <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-neutral-300">Revoke</button>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">Mobile · iOS</p>
                        <p className="text-xs text-neutral-500">Last seen 4d ago</p>
                      </div>
                      <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-neutral-300">Revoke</button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-[32px] border-white/10 bg-[#090c13] p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Audit</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Recent login history</h3>
                </div>
                <Badge variant="muted">6 entries</Badge>
              </div>
              <div className="mt-5 space-y-3 text-sm text-neutral-300">
                {[
                  { action: 'User login', detail: 'Anna Park · Chrome · US', status: 'Safe' },
                  { action: 'API token created', detail: 'Core engine key', status: 'Warning' },
                  { action: 'Session revoked', detail: 'Mira Lopez · macOS', status: 'Alert' },
                ].map((item) => (
                  <div key={item.detail} className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{item.action}</p>
                      <p className="text-sm text-neutral-400">{item.detail}</p>
                    </div>
                    <Badge variant={item.status === 'Safe' ? 'success' : item.status === 'Warning' ? 'warning' : 'muted'}>{item.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'Appearance':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Appearance</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Workspace theme</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Choose a premium workspace palette and motion preference for a polished engineering interface.</p>
                </div>
                <Badge variant="secondary">Dark mode</Badge>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Compact density', description: 'Tighter list spacing for desktop workflows' },
                  { label: 'Glassmorphism', description: 'Subtle surface blur and acrylic panels' },
                  { label: 'Glow accents', description: 'Refined cyan highlights on focus' },
                  { label: 'Motion', description: 'Smooth micro-interactions only' },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-2 text-sm text-neutral-400">{item.description}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-neutral-300">Enabled</span>
                      <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-neutral-300">Toggle</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'Experimental Features':
        return (
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Labs</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Feature flags</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Enable developer previews for next-gen AI integrations and workspace automation experiments.</p>
                </div>
                <Badge variant="warning">Beta</Badge>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  { name: 'Auto-categorize PRs', description: 'Use AI to classify incoming pull requests', active: true },
                  { name: 'Repository drift guard', description: 'Auto-flag stale permissions and schema changes', active: false },
                  { name: 'Live debug assistant', description: 'Enable AI-driven debug hints in code flow', active: true },
                ].map((item) => (
                  <div key={item.name} className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        <p className="mt-2 text-sm text-neutral-400">{item.description}</p>
                      </div>
                      <button type="button" className={`h-11 w-20 rounded-full border px-3 text-sm transition ${item.active ? 'border-cyan-400 bg-cyan-500/15 text-white' : 'border-white/10 bg-white/5 text-neutral-300 hover:border-cyan-400 hover:bg-white/10'}`}>{item.active ? 'ON' : 'OFF'}</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-7 pb-10">
      <SectionHeader
        eyebrow="09 // AI engineering control center"
        title="Settings built for production teams"
        description="A premium configuration hub for providers, integrations, repository access, security, and workspace controls."
      >
        <Button variant="secondary">Open command palette</Button>
      </SectionHeader>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.7fr_0.85fr]">
        <SettingsNav active={activeSection} onSelect={setActiveSection} />

        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          <div className="rounded-[32px] border border-white/10 bg-[#090c13] p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{activeSection}</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{activeSection} settings</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm">Save changes</Button>
                <Button variant="outline" size="sm">Reset</Button>
              </div>
            </div>
          </div>

          {renderSection()}
        </motion.div>

        <SettingsRightPanel />
      </div>
    </div>
  );
}
