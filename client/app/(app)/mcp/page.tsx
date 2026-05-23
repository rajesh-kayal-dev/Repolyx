'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CheckCircle, AlertTriangle, FolderOpen, GitBranch, Monitor, Server as ServerIcon, Sparkles, TerminalSquare, Wifi } from 'lucide-react';

export default function MCPPage() {
  return (
    <div className="space-y-7 pb-10">
      <SectionHeader
        eyebrow="Repolyx MCP Server"
        title="Local workspace connection"
        description="Connect Repolyx to your local machine via the MCP server for repository scanning, Git operations, and project validation."
      >
        <Button variant="secondary">Open MCP docs</Button>
      </SectionHeader>

      <div className="space-y-6">
        {/* Local Workspace Connection */}
        <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">MCP Server</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Local workspace connection</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Connect Repolyx to your local machine via the MCP server for repository scanning, Git operations, and project validation.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success">localhost:3939</Badge>
              <Badge variant="secondary">v1.0.0</Badge>
            </div>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <Wifi size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Connected</p>
                  <p className="text-xs text-neutral-400">MCP Server active</p>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm text-neutral-400">
                <div className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3 flex items-center justify-between gap-3">
                  <span>Host</span>
                  <span className="text-white font-mono">localhost</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3 flex items-center justify-between gap-3">
                  <span>Port</span>
                  <span className="text-white font-mono">3939</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3 flex items-center justify-between gap-3">
                  <span>Status</span>
                  <span className="text-emerald-400">Online</span>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <Button variant="secondary" size="sm">Reconnect</Button>
                <Button variant="ghost" size="sm">Disconnect</Button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400">
                  <FolderOpen size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Project workspace</p>
                  <p className="text-xs text-neutral-400">Connected repository</p>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm text-neutral-400">
                <div className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Path</p>
                  <p className="mt-2 text-sm text-white font-mono truncate">/projects/repolyx</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3 flex items-center justify-between gap-3">
                  <span>Framework</span>
                  <Badge variant="secondary">Next.js</Badge>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-3 flex items-center justify-between gap-3">
                  <span>Total files</span>
                  <span className="text-white">1,284</span>
                </div>
              </div>
              <div className="mt-5">
                <Button variant="secondary" size="sm" className="w-full">Change workspace</Button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400">
                  <ServerIcon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">MCP capabilities</p>
                  <p className="text-xs text-neutral-400">Available modules</p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {[
                  { name: 'Filesystem', active: true },
                  { name: 'Git operations', active: true },
                  { name: 'GitHub API', active: true },
                  { name: 'Validation', active: true },
                  { name: 'Documentation', active: true },
                ].map((cap) => (
                  <div key={cap.name} className="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
                    <span className="text-neutral-300">{cap.name}</span>
                    <CheckCircle size={14} className="text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Repository Health Dashboard */}
        <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Health</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Repository health system</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Comprehensive project validation covering build status, Git hygiene, documentation, dependencies, and security readiness.</p>
            </div>
            <Badge variant="success">All checks passing</Badge>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { label: 'Build status', value: 'Passing', icon: CheckCircle, accent: 'bg-emerald-500/15 text-emerald-400', detail: 'No TypeScript or lint errors' },
              { label: 'Git status', value: 'Clean', icon: CheckCircle, accent: 'bg-emerald-500/15 text-emerald-400', detail: 'No uncommitted changes' },
              { label: 'Documentation', value: 'Complete', icon: CheckCircle, accent: 'bg-emerald-500/15 text-emerald-400', detail: 'README + API docs present' },
              { label: 'Dependencies', value: 'Up to date', icon: CheckCircle, accent: 'bg-emerald-500/15 text-emerald-400', detail: 'No outdated packages' },
              { label: 'Security', value: 'No warnings', icon: CheckCircle, accent: 'bg-emerald-500/15 text-emerald-400', detail: 'No vulnerabilities detected' },
              { label: 'GitHub readiness', value: 'Ready', icon: CheckCircle, accent: 'bg-emerald-500/15 text-emerald-400', detail: 'All pre-push checks pass' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-[#070c13] p-5 transition hover:border-emerald-400/20">
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.accent}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-neutral-400">{item.value}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-neutral-400">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Before Push Validation */}
        <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Validation</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Before push validation</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Automated checks that run before every push to ensure code quality, security, and repository completeness.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success">10 checks</Badge>
              <Badge variant="secondary">Auto-fix available</Badge>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { name: 'TypeScript errors', status: 'pass', detail: 'No errors found' },
              { name: 'ESLint validation', status: 'pass', detail: 'All rules passing' },
              { name: 'Build errors', status: 'pass', detail: 'Build compiles cleanly' },
              { name: 'README.md exists', status: 'pass', detail: 'Documentation present' },
              { name: '.gitignore configured', status: 'pass', detail: 'Ignore rules set' },
              { name: '.env.example present', status: 'warn', detail: 'Template environment file missing' },
              { name: 'node_modules excluded', status: 'pass', detail: 'Properly ignored' },
              { name: 'Exposed secrets check', status: 'pass', detail: 'No secrets detected' },
              { name: 'Broken imports', status: 'pass', detail: 'All imports resolve' },
              { name: 'Package integrity', status: 'pass', detail: 'Dependencies consistent' },
            ].map((item) => (
              <div key={item.name} className="rounded-3xl border border-white/10 bg-[#070c13] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {item.status === 'pass' ? (
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                        <CheckCircle size={16} />
                      </div>
                    ) : (
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                        <AlertTriangle size={16} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-neutral-400">{item.detail}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === 'pass' ? 'success' : 'warning'}>
                    {item.status === 'pass' ? 'Pass' : 'Warning'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" size="sm">Run all checks</Button>
            <Button variant="outline" size="sm">Fix warnings</Button>
            <Button variant="ghost" size="sm">Configure rules</Button>
          </div>
        </Card>

        {/* GitHub Workflow & CI/CD */}
        <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-[#09101a] to-[#070a0f] p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Pipeline</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">GitHub workflow & CI/CD</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Industry-standard GitHub Flow with automated CI/CD pipeline for continuous integration and deployment.</p>
            </div>
            <Badge variant="secondary">Recommended</Badge>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">GitHub flow</p>
              <div className="mt-5 space-y-4">
                {[
                  { step: '1', title: 'Create branch', desc: 'Feature branches from main' },
                  { step: '2', title: 'Make changes', desc: 'Commit with conventional messages' },
                  { step: '3', title: 'Open PR', desc: 'Request review from team' },
                  { step: '4', title: 'Merge & deploy', desc: 'Squash merge to main' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 text-xs font-bold text-cyan-400">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-neutral-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#070c13] p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">CI/CD pipeline</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[#05070f] p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-white">GitHub Actions</p>
                      <p className="mt-1 text-neutral-400">Auto-build, lint, test on push</p>
                    </div>
                    <Badge variant="success">Configured</Badge>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#05070f] p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-white">Auto-deploy</p>
                      <p className="mt-1 text-neutral-400">Continuous deployment to production</p>
                    </div>
                    <Badge variant="muted">Pending</Badge>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#05070f] p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-white">Status checks</p>
                      <p className="mt-1 text-neutral-400">Required PR checks before merge</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="secondary" size="sm" className="w-full">
                    <GitBranch size={14} className="mr-2" />
                    Create CI/CD workflow
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Suggestion Panel */}
        <div className="rounded-[32px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.03] to-[#070a0f] p-6">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400 shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-400">AI suggestion</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Repository improvements</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Based on your workspace analysis, consider adding an <span className="text-cyan-300">.env.example</span> file to document environment variables, and enable CI/CD to automatically catch build and lint issues before merging.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="secondary" size="sm">Add .env.example</Button>
                <Button variant="outline" size="sm">Create CI/CD</Button>
                <Button variant="ghost" size="sm">Dismiss</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
