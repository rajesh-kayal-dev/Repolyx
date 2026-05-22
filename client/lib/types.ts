export interface Repository {
  id: string;
  githubRepoId: string;
  name: string;
  fullName: string;
  visibility: string;
  defaultBranch: string | null;
  language: string | null;
  description: string | null;
  cloneUrl: string | null;
  isIndexed: boolean;
  scanStatus: string;
  aiSummary: string | null;
  techStack: string | null;
  dependencyCount: number;
  fileCount: number;
  branchCount: number;
  createdAt: string;
  updatedAt: string;
  files?: RepositoryFile[];
  events?: RepositoryEvent[];
  analyses?: RepositoryAnalysis[];
}

export interface RepositoryFile {
  id: string;
  repositoryId: string;
  path: string;
  name: string;
  extension: string;
  size: number;
  type: string;
  content?: string | null;
  isImportant: boolean;
  aiAnalysis: string | null;
  modulePurpose: string | null;
  explanation?: string;
  createdAt: string;
}

export interface RepositoryEvent {
  id: string;
  repositoryId: string;
  type: string;
  message: string;
  metadata: any;
  createdAt: string;
}

export interface RepositoryAnalysis {
  id: string;
  repositoryId: string;
  type: string;
  summary: string | null;
  data: any;
  createdAt: string;
}

export interface TreeNode {
  id?: string;
  name: string;
  path: string;
  type: "file" | "directory";
  extension?: string;
  size?: number;
  isImportant?: boolean;
  modulePurpose?: string;
  children?: TreeNode[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface ScanStatus {
  status: "idle" | "scanning" | "importing" | "summarizing" | "completed" | "failed";
  message: string;
  progress: number;
  step: string;
}

export interface GitHubRepo {
  id: string;
  name: string;
  fullName: string;
  visibility: string;
  defaultBranch: string;
  language: string;
  description: string;
  cloneUrl: string;
  lastUpdated: string;
  stack: string;
  isImported: boolean;
}

export interface ActivityItem {
  title: string;
  detail: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export interface ActivityEvent {
  id: string;
  type: 'scan' | 'analysis' | 'pr' | 'security' | 'dependency' | 'docs' | 'debug' | 'sync' | 'auth';
  repo: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'processing' | 'queued' | 'warning' | 'critical';
  severity: 'info' | 'warning' | 'critical';
  details: string[];
  quickActions: string[];
  live?: boolean;
}

export interface ActivityFilterItem {
  label: string;
  count: number;
  unread: number;
  active?: boolean;
}

export interface ActivityInsight {
  title: string;
  value: string;
  detail: string;
  badge?: string;
}

export interface ActivitySuggestion {
  title: string;
  description: string;
  action: string;
}

export interface ExplorerFile {
  path: string;
  label: string;
  active?: boolean;
  tag?: 'AI' | 'Analyzed';
}

export interface ExplorerSection {
  title: string;
  count: number;
  items: ExplorerFile[];
}

export interface AIAssistantEvent {
  id: string;
  label: string;
}

export interface AIAssistantMessage {
  id: string;
  role: 'assistant' | 'user';
  context: string;
  text: string;
  code?: string;
}

export interface DocTypeItem {
  title: string;
  description: string;
  generated?: boolean;
}

export interface DocPreviewSection {
  title: string;
  tag: string;
  content: string;
  code?: string;
  codeLabel?: string;
}

export interface EndpointDoc {
  route: string;
  summary: string;
  method: string;
  auth: string;
  response: string;
}

export interface ArchitectureInsight {
  title: string;
  summary: string;
}

export interface DependencyRisk {
  name: string;
  category: string;
  status: 'Safe' | 'Warning' | 'Critical';
  note: string;
}

export interface ApiRoute {
  route: string;
  method: string;
  service: string;
  status: 'Stable' | 'Deprecated' | 'Review';
}

export interface AuthFlowStep {
  label: string;
  detail: string;
  status: 'Secure' | 'Warning' | 'Review';
}

export interface ChatMessageOld {
  role: 'ai' | 'user';
  content: string;
  meta?: string;
}

export interface RepoSummary {
  name: string;
  description: string;
  language: string;
  issues: number;
  scanProgress: number;
  riskScore: string;
}

export interface PrReview {
  title: string;
  branch: string;
  score: number;
  issues: number;
  securityRisks: number;
  status: 'Open' | 'In review' | 'Ready';
}

export interface DebugEntry {
  label: string;
  content: string;
}

export interface DocTemplate {
  title: string;
  description: string;
}

export interface ReviewSession {
  id: string;
  repositoryId: string;
  prUrl: string | null;
  prNumber: number | null;
  title: string;
  baseBranch: string | null;
  headBranch: string | null;
  author: string | null;
  status: string;
  riskLevel: string | null;
  testCoverage: string | null;
  ciStatus: string | null;
  mergeReady: number;
  summary: string | null;
  files: ReviewFile[];
  suggestions: ReviewSuggestion[];
  _count?: { files: number; suggestions: number };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFile {
  id: string;
  reviewSessionId: string;
  path: string;
  status: string;
  risk: string | null;
  additions: number;
  deletions: number;
  patch: string | null;
  content: string | null;
  comments: number;
  createdAt: string;
}

export interface ReviewSuggestion {
  id: string;
  reviewSessionId: string;
  filePath: string | null;
  type: string;
  title: string;
  description: string;
  severity: string;
  lineStart: number | null;
  lineEnd: number | null;
  codeSnippet: string | null;
  createdAt: string;
}

export interface RepoWorkspace {
  name: string;
  stack: string;
  status: string;
  health: string;
  aiStatus: string;
  branch: string;
  metrics: {
    files: number;
    dependencies: number;
    apis: number;
    authFlows: number;
  };
}

// ─── Debug Assistant Types ────────────────────────────────────────────────────

export type DebugSeverity = 'critical' | 'high' | 'medium' | 'low';
export type DebugStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type DebugLogLevel = 'error' | 'warn' | 'info';
export type DebugRisk = 'low' | 'medium' | 'high';
export type DebugTimelineType = 'deploy' | 'failure' | 'finding' | 'event';

export interface DebugTimelineEvent {
  type: DebugTimelineType;
  title: string;
  detail: string;
  timestamp: string;
}

export interface DebugCommit {
  sha: string;
  message: string;
  author: string;
}

export interface DebugIncident {
  id: string;
  userId: string;
  repositoryId: string | null;
  title: string;
  impactStatement: string | null;
  severity: DebugSeverity;
  status: DebugStatus;
  service: string | null;
  deployVersion: string | null;
  errorRate: string | null;
  affectedUsers: string | null;
  aiSummary?: string | null;
  aiProblem?: string | null;
  aiImpact?: string | null;
  aiRecommendations?: string[] | null;
  aiExplanation: string | null; // Legacy
  aiFixSuggestion: string | null; // Legacy
  aiConfidence: number;
  riskLevel: DebugRisk | null;
  affectedFiles: string[] | null;
  relatedCommits: DebugCommit[] | null;
  timelineEvents: DebugTimelineEvent[] | null;
  resolvedAt: string | null;
  logs?: DebugLog[];
  createdAt: string;
  updatedAt: string;
}

export interface DebugLog {
  id: string;
  incidentId: string | null;
  userId: string;
  level: DebugLogLevel;
  message: string;
  source: string;
  service: string | null;
  stackTrace: string | null;
  metadata: any;
  loggedAt: string;
  createdAt: string;
}

export interface DebugFix {
  suggestion: string;
  riskLevel: DebugRisk;
  confidence: number;
  affectedFiles: string[];
}

export type ScanLifecycleState = 'idle' | 'queued' | 'scanning' | 'analyzing' | 'completed' | 'failed';

export interface DebugResult {
  summary: string;
  problem: string;
  impact: string;
  affectedFiles: string[];
  recommendations: string[];
  confidence: number;
}

export interface CreateIncidentForm {
  title: string;
  impactStatement?: string;
  severity?: DebugSeverity;
  service?: string;
  deployVersion?: string;
  errorRate?: string;
  affectedUsers?: string;
  repositoryId?: string;
}

export interface RepoHealthSummary {
  id: string;
  name: string;
  fullName: string;
  language: string | null;
  lastScanAt: string | null;
  incidentCount: number;
  scanStatus: 'clean' | 'issues';
  healthScore: 'Clean' | 'Warning' | 'Critical';
  branchCount: number;
  dependencyCount: number;
  scanDuration?: number;
}

export interface ScanResult {
  incidents: DebugIncident[];
  scanDuration: number;
}
