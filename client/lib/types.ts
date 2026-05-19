export interface RepoSummary {
  name: string;
  description: string;
  language: string;
  issues: number;
  scanProgress: number;
  riskScore: string;
}

export interface ActivityItem {
  title: string;
  detail: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
  meta?: string;
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

export interface AIAssistantMessage {
  id: string;
  role: 'assistant' | 'user';
  context: string;
  text: string;
  code?: string;
}

export interface AIAssistantEvent {
  id: string;
  label: string;
}

export interface ActivityFilterItem {
  label: string;
  count: number;
  unread: number;
  active?: boolean;
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
