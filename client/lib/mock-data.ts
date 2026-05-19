import type { ActivityItem, ActivityEvent, ActivityFilterItem, ActivityInsight, ActivitySuggestion, DocTypeItem, DocPreviewSection, EndpointDoc, ArchitectureInsight, AIAssistantMessage, AIAssistantEvent, ExplorerSection, DependencyRisk, ApiRoute, AuthFlowStep, ChatMessageOld, RepoSummary, PrReview, DebugEntry, DocTemplate, RepoWorkspace } from './types';

export const repoSummaries: RepoSummary[] = [
  {
    name: 'repolyx/cli',
    description: 'Monorepo tooling and repository orchestration.',
    language: 'TypeScript',
    issues: 4,
    scanProgress: 82,
    riskScore: 'Low'
  },
  {
    name: 'repolyx/api',
    description: 'Backend API layer with code intelligence endpoints.',
    language: 'Node.js',
    issues: 7,
    scanProgress: 59,
    riskScore: 'Medium'
  },
  {
    name: 'repolyx/ui',
    description: 'Developer dashboard and AI conversation experience.',
    language: 'React',
    issues: 2,
    scanProgress: 94,
    riskScore: 'Low'
  }
];

export const dashboardActivities: ActivityItem[] = [
  { title: 'Architecture report generated', detail: 'repolyx/cli', timestamp: '2m ago', status: 'success' },
  { title: 'Indexing pipeline started', detail: 'repolyx/api', timestamp: '8m ago', status: 'info' },
  { title: 'Dependency risk found', detail: 'axios 1.4.0', timestamp: '14m ago', status: 'warning' }
];

export const activityFilters: ActivityFilterItem[] = [
  { label: 'All activity', count: 24, unread: 6, active: true },
  { label: 'Repository scans', count: 7, unread: 2 },
  { label: 'AI analysis', count: 9, unread: 3 },
  { label: 'Pull requests', count: 5, unread: 1 },
  { label: 'Debug events', count: 4, unread: 1 },
  { label: 'Documentation', count: 3, unread: 0 },
  { label: 'GitHub sync', count: 8, unread: 0 },
  { label: 'Security alerts', count: 2, unread: 1 }
];

export const activityEvents: ActivityEvent[] = [
  {
    id: 'a1',
    type: 'scan',
    repo: 'repolyx/api',
    title: 'Repository structure indexed',
    description: 'Source tree and manifest config were analyzed to surface dependency relationships and deployment targets.',
    timestamp: 'Just now',
    status: 'processing',
    severity: 'info',
    details: ['Indexing 1,243 files', '8 services scanned', 'Live sync enabled'],
    quickActions: ['View analysis', 'Open repository'],
    live: true
  },
  {
    id: 'a2',
    type: 'analysis',
    repo: 'repolyx/cli',
    title: 'AI architecture analysis completed',
    description: 'Component boundaries and auth flows were mapped, with new recommendations for service isolation.',
    timestamp: '3m ago',
    status: 'completed',
    severity: 'info',
    details: ['Core service graph updated', 'API contract reviewed'],
    quickActions: ['View analysis', 'Regenerate docs']
  },
  {
    id: 'a3',
    type: 'pr',
    repo: 'repolyx/ui',
    title: 'Pull request reviewed',
    description: 'AI assistant flagged a performance regression in the rendering pipeline and suggested a memoization patch.',
    timestamp: '12m ago',
    status: 'completed',
    severity: 'warning',
    details: ['PR #413 · feature/ui-state', 'Review score 78%'],
    quickActions: ['View PR', 'Open repository']
  },
  {
    id: 'a4',
    type: 'security',
    repo: 'repolyx/api',
    title: 'Security warning detected',
    description: 'OAuth callback route contains legacy redirect logic. Recommendation issued to harden the session flow.',
    timestamp: '22m ago',
    status: 'warning',
    severity: 'critical',
    details: ['Auth flow review required', 'Token refresh path flagged'],
    quickActions: ['Open debug report', 'View analysis']
  },
  {
    id: 'a5',
    type: 'dependency',
    repo: 'repolyx/cli',
    title: 'Dependency issue found',
    description: 'A vulnerable package was discovered in the build pipeline. Lockfile pin recommended for immediate patching.',
    timestamp: '34m ago',
    status: 'warning',
    severity: 'warning',
    details: ['Package: axios', 'Version: 1.4.0'],
    quickActions: ['View analysis', 'Open repository']
  },
  {
    id: 'a6',
    type: 'docs',
    repo: 'repolyx/ui',
    title: 'Documentation generated',
    description: 'AI docs were produced from the latest API contract and code metadata for the UI module.',
    timestamp: '41m ago',
    status: 'completed',
    severity: 'info',
    details: ['README draft ready', 'API reference updated'],
    quickActions: ['Regenerate docs', 'Open repository']
  },
  {
    id: 'a7',
    type: 'debug',
    repo: 'repolyx/api',
    title: 'Stack trace analyzed',
    description: 'A failing handler was traced across middleware and async routes. Candidate fix attached for review.',
    timestamp: '55m ago',
    status: 'completed',
    severity: 'warning',
    details: ['Failure in /api/scan', 'Session token mismatch'],
    quickActions: ['Open debug report', 'View analysis']
  },
  {
    id: 'a8',
    type: 'analysis',
    repo: 'repolyx/cli',
    title: 'AI debugging recommendation created',
    description: 'Recommendation generated for auth race conditions in the CLI bootstrap sequence.',
    timestamp: '1h ago',
    status: 'queued',
    severity: 'info',
    details: ['Recommendation queued', 'Root cause inferred'],
    quickActions: ['Open debug report', 'View analysis']
  },
  {
    id: 'a9',
    type: 'sync',
    repo: 'repolyx/api',
    title: 'GitHub sync completed',
    description: 'Branch state reconciled with upstream and latest release notes captured.',
    timestamp: '1h 20m ago',
    status: 'completed',
    severity: 'info',
    details: ['Branch main synced', '6 commits merged'],
    quickActions: ['Open repository', 'View PR']
  },
  {
    id: 'a10',
    type: 'auth',
    repo: 'repolyx/cli',
    title: 'Authentication flow detected',
    description: 'New OAuth provider flow was identified in the CLI auth layer and marked for review.',
    timestamp: '1h 45m ago',
    status: 'completed',
    severity: 'info',
    details: ['OAuth callback detected', 'Token refresh path mapped'],
    quickActions: ['View analysis', 'Open repository']
  }
];

export const activityInsights: ActivityInsight[] = [
  {
    title: 'Indexing progress',
    value: '82%',
    detail: 'Repository scans are complete for 5 of 6 tracked repos.',
    badge: 'Live'
  },
  {
    title: 'Security risk posture',
    value: '2 critical',
    detail: 'Two auth-related alerts are pending review.',
    badge: 'Alert'
  },
  {
    title: 'AI throughput',
    value: '12 tasks',
    detail: 'Live analysis and docs generation are active.',
    badge: 'Active'
  },
  {
    title: 'Sync health',
    value: 'Stable',
    detail: 'GitHub and branch reconciliation has no failures.',
    badge: 'Good'
  }
];

export const activitySuggestions: ActivitySuggestion[] = [
  {
    title: 'Review critical PR warning',
    description: 'Inspect the flagged PR for performance and security regressions.',
    action: 'Open PR dashboard'
  },
  {
    title: 'Update vulnerable package',
    description: 'Patch the dependency issue discovered in the CLI pipeline.',
    action: 'Open dependency report'
  },
  {
    title: 'Regenerate API docs',
    description: 'Refresh docs after the latest service contract changes.',
    action: 'Run doc generator'
  }
];

export const repoChat: ChatMessageOld[] = [
  { role: 'ai', content: 'I found a broken auth flow in src/app/init.ts. The environment binding is missing before bootstrap.', meta: 'repolyx/api' },
  { role: 'user', content: 'Show me which files changed in the latest pull request and highlight tests gaps.' },
  { role: 'ai', content: 'PR #218 updates src/parser.ts, src/utils/validator.ts, and src/api/handler.ts. Coverage gaps exist for parser edge cases.' }
];

export const prReviews: PrReview[] = [
  { title: 'Feature/refactor parser', branch: 'feature/refactor-parser', score: 78, issues: 7, securityRisks: 2, status: 'In review' },
  { title: 'Fix auth redirect', branch: 'bugfix/auth-redirect', score: 92, issues: 1, securityRisks: 0, status: 'Ready' }
];

export const debugEntries: DebugEntry[] = [
  { label: 'Stack trace', content: "TypeError: Cannot read property 'load' of undefined\n  at Object.bootstrap (src/app/init.ts:54:22)\n  at processTicksAndRejections (internal/process/task_queues.js:97:5)\n  at async startServer (src/server/index.ts:112:7)" },
  { label: 'Terminal logs', content: '[12:34:08] starting app bootstrap\n[12:34:10] loading env config\n[12:34:11] warning: missing SESSION_SECRET' }
];

export const docTemplates: DocTemplate[] = [
  { title: 'README generation', description: 'Draft a repo README with setup and integration highlights.' },
  { title: 'API docs', description: 'Create endpoint reference pages with usage examples.' },
  { title: 'Developer guide', description: 'Generate onboarding notes for contributors and release flow.' }
];

export const docTypes: DocTypeItem[] = [
  { title: 'README Generator', description: 'Draft an onboarding README for developers and contributors.', generated: true },
  { title: 'API Documentation', description: 'Build reference docs for service endpoints and payloads.' },
  { title: 'Setup Guide', description: 'Create a quickstart guide for local and cloud deployment.' },
  { title: 'Endpoint Docs', description: 'Generate API endpoint summaries with sample requests.' },
  { title: 'Architecture Summary', description: 'Summarize system design, data flow, and service boundaries.' },
  { title: 'Changelog', description: 'Produce release notes and update logs for the repo.' }
];

export const generatedDocSections: DocPreviewSection[] = [
  {
    title: 'Project mission',
    tag: 'Overview',
    content: 'Repolyx unifies developer workflows by providing an AI-native repository intelligence workspace for code analysis, docs, and architecture guidance.',
  },
  {
    title: 'Quick start',
    tag: 'Setup',
    content: 'Clone the repo, install dependencies, and run `npm run dev` to start the local workspace. The CLI and API modules are indexed for on-demand documentation generation.',
    code: 'git clone git@github.com:repolyx/repolyx.git\ncd repolyx\nnpm install\nnpm run dev',
    codeLabel: 'Shell commands'
  },
  {
    title: 'Core architecture',
    tag: 'Design',
    content: 'The repository is split into a frontend dashboard, backend AI services, and shared developer utilities. Documentation is generated from source metadata and endpoint contracts.'
  }
];

export const docEndpoints: EndpointDoc[] = [
  {
    route: '/api/scan',
    summary: 'Triggers repository indexing and analysis.',
    method: 'POST',
    auth: 'API key',
    response: '202 Accepted'
  },
  {
    route: '/api/docs',
    summary: 'Fetches generated documentation preview content.',
    method: 'GET',
    auth: 'Bearer',
    response: '200 OK'
  },
  {
    route: '/api/auth/refresh',
    summary: 'Refreshes the authenticated session token.',
    method: 'POST',
    auth: 'OAuth2',
    response: '200 OK'
  }
];

export const architectureInsights: ArchitectureInsight[] = [
  {
    title: 'Modular service graph',
    summary: 'Each subsystem exposes a bounded context with a dedicated API layer for documentation and testing.'
  },
  {
    title: 'AI-assisted content flow',
    summary: 'Documentation is generated from code metadata, schema introspection, and repository heuristics.'
  },
  {
    title: 'Version-aware docs',
    summary: 'Generated docs account for branch-specific changes and release-channel metadata.'
  }
];

export const docAIAssistantMessages: AIAssistantMessage[] = [
  {
    id: 'd1',
    role: 'assistant',
    context: 'Docs workspace',
    text: 'I detected the API contract for /api/docs and can surface a complete reference section with sample payloads.',
    code: 'fetch("/api/docs")\n  .then((r) => r.json())\n  .then(console.log);'
  },
  {
    id: 'd2',
    role: 'user',
    context: 'Action',
    text: 'Show me the generated README summary and include deployment steps.'
  }
];

export const docAIAssistantEvents: AIAssistantEvent[] = [
  { id: 'de1', label: 'Generated README draft in 2.1s' },
  { id: 'de2', label: 'Linked 4 API routes automatically' },
  { id: 'de3', label: 'Detected auth changes on branch main' }
];

export const repoWorkspace: RepoWorkspace = {
  name: 'repolyx/cli',
  stack: 'TypeScript · Next.js · Node.js',
  status: 'Indexed',
  health: 'A+',
  aiStatus: 'Workspace ready',
  branch: 'main',
  metrics: {
    files: 482,
    dependencies: 63,
    apis: 14,
    authFlows: 3
  }
};

export const repoTree: ExplorerSection[] = [
  {
    title: 'src',
    count: 16,
    items: [
      { path: 'src/app/init.ts', label: 'app/init.ts', active: false, tag: 'Analyzed' },
      { path: 'src/lib/intel.ts', label: 'lib/intel.ts', active: true, tag: 'AI' },
      { path: 'src/components/WorkspaceShell.tsx', label: 'components/WorkspaceShell.tsx', active: false },
      { path: 'src/pages/dashboard.tsx', label: 'pages/dashboard.tsx', active: false }
    ]
  },
  {
    title: 'api',
    count: 8,
    items: [
      { path: 'api/handler.ts', label: 'handler.ts', active: false, tag: 'AI' },
      { path: 'api/scan.ts', label: 'scan.ts', active: false },
      { path: 'api/auth.ts', label: 'auth.ts', active: false }
    ]
  },
  {
    title: 'infra',
    count: 4,
    items: [
      { path: 'infra/deploy.yml', label: 'deploy.yml', active: false },
      { path: 'infra/monitoring.ts', label: 'monitoring.ts', active: false }
    ]
  }
];

export const dependencyRisks: DependencyRisk[] = [
  { name: 'axios', category: 'Network', status: 'Warning', note: 'Requires security review for redirect handling.' },
  { name: 'jsonwebtoken', category: 'Auth', status: 'Safe', note: 'JWT flow is stable, version up to date.' },
  { name: 'mongoose', category: 'Database', status: 'Critical', note: 'Outdated major version; migration required.' }
];

export const apiRoutes: ApiRoute[] = [
  { route: '/api/scan', method: 'POST', service: 'Indexing', status: 'Stable' },
  { route: '/api/auth/redirect', method: 'GET', service: 'Auth', status: 'Review' },
  { route: '/api/deploy', method: 'POST', service: 'CI/CD', status: 'Stable' },
  { route: '/api/docs', method: 'GET', service: 'Docs', status: 'Deprecated' }
];

export const authFlow: AuthFlowStep[] = [
  { label: 'JWT verification', detail: 'Middleware validates token on protected routes.', status: 'Secure' },
  { label: 'OAuth redirect', detail: 'Legacy callback route requires audit.', status: 'Warning' },
  { label: 'Session refresh', detail: 'Refresh endpoint is active and monitored.', status: 'Secure' }
];

export const aiAssistantMessages: AIAssistantMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    context: 'Repository intelligence',
    text: 'The CLI repo is healthy and its auth flow is isolated in api/auth.ts. API relationships are stable with a strong frontend/backend separation.',
    code: 'const isAuthenticated = await verifyToken(req.headers.authorization);'
  },
  {
    id: 'm2',
    role: 'user',
    context: 'Query',
    text: 'Where is the main auth provider configured and which routes are protected?'
  }
];

export const aiAssistantPrompts = [
  'Explain backend flow',
  'Where is authentication handled?',
  'Which API handles payments?',
  'Explain database structure'
];

export const aiAssistantEvents: AIAssistantEvent[] = [
  { id: 'e1', label: 'Indexed 3 repositories in 4m' },
  { id: 'e2', label: 'Auth flow flagged for review' },
  { id: 'e3', label: 'Dependency risk added for axios' }
];
