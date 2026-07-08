export interface ProfileData {
  displayName: string;
  email: string;
  avatarUrl: string;
  workspaceName: string;
}

export interface GithubIntegrationData {
  connected: boolean;
  githubUsername: string;
  organization: string;
  avatarUrl: string;
  installationId: string;
  connectedAt: string;
  lastSyncAt: string;
  repositoryCount: number;
}

export interface AppearanceData {
  theme: 'Dark' | 'Light' | 'Midnight Special' | 'System Default';
  density: 'Comfortable' | 'Compact' | 'Spacious';
}

export interface NotificationPreferences {
  emailSummary: boolean;
  pullRequestReview: boolean;
  systemStatus: boolean;
}

export interface AIPreferencesData {
  defaultModel: string;
  autoAudit: boolean;
  contextTips: boolean;
  backgroundIndexing: boolean;
}

export interface UserSessionData {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  isCurrent: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export interface AccessTokenData {
  id: string;
  name: string;
  tokenPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}
