const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const TOKEN_KEY = "repolyx_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

export const api = {
  repositories: {
    list() {
      return request<{ repositories: any[] }>("/api/repositories/imported");
    },
    get(id: string) {
      return request<{ repository: any }>(`/api/repositories/${id}`);
    },
    import(repoData: any) {
      return request<{ repository: any }>("/api/repositories/import", {
        method: "POST",
        body: JSON.stringify({ repoData }),
      });
    },
    importAndScan(repoData: any, branch?: string) {
      return request<{ repository: any; scanResult: any }>("/api/repositories/import-and-scan", {
        method: "POST",
        body: JSON.stringify({ repoData, branch }),
      });
    },
    fetchGithub() {
      return request<{ repositories: any[] }>("/api/repositories/github");
    },
    scan(id: string, branch?: string) {
      const params = branch ? `?branch=${branch}` : "";
      return request<{ scanResult: any }>(`/api/repositories/${id}/scan${params}`, {
        method: "POST",
      });
    },
    getTree(id: string) {
      return request<{ tree: any[]; files: any[] }>(`/api/repositories/${id}/tree`);
    },
    getBranches(id: string) {
      return request<{ branches: any[]; defaultBranch: string }>(`/api/repositories/${id}/branches`);
    },
    getFile(id: string, fileId: string, branch?: string) {
      const params = branch ? `?branch=${branch}` : "";
      return request<{ file: any }>(`/api/repositories/${id}/files/${fileId}${params}`);
    },
    generateSummary(id: string) {
      return request<{ summary: string }>(`/api/repositories/${id}/summary`, {
        method: "POST",
      });
    },
    analyze(id: string, type: string) {
      return request<{ analysis: any }>(`/api/repositories/${id}/analyze`, {
        method: "POST",
        body: JSON.stringify({ type }),
      });
    },
    getEvents(id: string, limit = 50) {
      return request<{ events: any[] }>(`/api/repositories/${id}/events?limit=${limit}`);
    },
    getAnalyses(id: string) {
      return request<{ analyses: any[] }>(`/api/repositories/${id}/analyses`);
    },
    query(id: string, query: string, selectedFile?: string, selectedBranch?: string) {
      return request<{ answer: string; context: any }>(`/api/repositories/${id}/query`, {
        method: "POST",
        body: JSON.stringify({ query, selectedFile, selectedBranch }),
      });
    },
  },
  dashboard: {
    stats() {
      return request<{ stats: any; recentActivity: any[] }>("/api/dashboard/stats");
    },
    sessions() {
      return request<{ sessions: any[] }>("/api/dashboard/sessions");
    },
    repos() {
      return request<{ repositories: any[] }>("/api/dashboard/repos");
    },
    actions() {
      return request<{ actions: any[] }>("/api/dashboard/actions");
    },
    githubProfile() {
      return request<{ profile: any }>("/api/dashboard/github-profile");
    },
    contributions() {
      return request<{ contributions: any }>("/api/dashboard/contributions");
    },
    achievements() {
      return request<{ achievements: any[] }>("/api/dashboard/achievements");
    },
    readme() {
      return request<{ readme: string | null; htmlUrl: string | null }>("/api/dashboard/readme");
    },
  },
  ai: {
    sessions: {
      list(repositoryId: string) {
        return request<{ sessions: any[] }>(`/api/ai/sessions/repository/${repositoryId}`);
      },
      get(id: string) {
        return request<{ session: any; messages: any[] }>(`/api/ai/sessions/${id}`);
      },
      create(repositoryId: string, title?: string) {
        return request<{ session: any }>("/api/ai/sessions", {
          method: "POST",
          body: JSON.stringify({ repositoryId, title }),
        });
      },
      delete(id: string) {
        return request<{ success: boolean; message: string }>(`/api/ai/sessions/${id}`, {
          method: "DELETE",
        });
      },
    },
    chat(sessionId: string, message: string, activeFile?: string, provider?: string, model?: string, mode?: string, contextScope?: string) {
      return request<{ userMessage: any; aiMessage: any; title: string; analysis?: any }>("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ sessionId, message, activeFile, provider, model, mode, contextScope }),
      });
    },
    getPrompts(repositoryId: string) {
      return request<{ prompts: string[] }>(`/api/ai/prompts/${repositoryId}`);
    },
  },
  reviews: {
    listPrs(repositoryId: string) {
      return request<{ prs: any[] }>(`/api/reviews/prs/${repositoryId}`);
    },
    create(data: any) {
      return request<any>("/api/reviews", { method: "POST", body: JSON.stringify(data) });
    },
    list() {
      return request<any>("/api/reviews");
    },
    get(id: any) {
      return request<any>(`/api/reviews/${id}`);
    },
    delete(id: any) {
      return request<any>(`/api/reviews/${id}`, { method: "DELETE" });
    },
    analyze(id: any, provider?: any, model?: any) {
      return request<any>(`/api/reviews/${id}/analyze`, {
        method: "POST",
        body: JSON.stringify({ provider, model }),
      });
    },
  },
  activity: {
    feed(params?: { type?: string; repo?: string; time?: string; search?: string; limit?: number; offset?: number }) {
      const q = new URLSearchParams();
      if (params?.type) q.set("type", params.type);
      if (params?.repo) q.set("repo", params.repo);
      if (params?.time) q.set("time", params.time);
      if (params?.search) q.set("search", params.search);
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.offset) q.set("offset", String(params.offset));
      const qs = q.toString();
      return request<any>(`/api/activity${qs ? `?${qs}` : ""}`);
    },
  },
  docs: {
    get(repositoryId: string) {
      return request<any>(`/api/docs/${repositoryId}`);
    },
    generate(repositoryId: string) {
      return request<any>(`/api/docs/${repositoryId}/generate`, { method: "POST" });
    },
  },
  debug: {
    repositories: {
      list() {
        return request<{ repositories: import('./types').RepoHealthSummary[] }>("/api/debug/repositories");
      },
    },
    scan(repositoryId: string) {
      return request<{ incidents: import('./types').DebugIncident[], scanDuration: number }>(`/api/debug/scan/${repositoryId}`, {
        method: "POST",
      });
    },
    incidents: {
      list() {
        return request<{ incidents: any[] }>("/api/debug/incidents");
      },
      get(id: string) {
        return request<{ incident: any }>(`/api/debug/incidents/${id}`);
      },
      create(data: {
        title: string;
        impactStatement?: string;
        severity?: string;
        service?: string;
        deployVersion?: string;
        errorRate?: string;
        affectedUsers?: string;
        repositoryId?: string;
      }) {
        return request<{ incident: any }>("/api/debug/incidents", {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      analyze(id: string) {
        return request<{ incident: any }>(`/api/debug/incidents/${id}/analyze`, {
          method: "POST",
        });
      },
      ask(id: string, question: string) {
        return request<{ answer: string }>(`/api/debug/incidents/${id}/ask`, {
          method: "POST",
          body: JSON.stringify({ question }),
        });
      },
      updateStatus(id: string, status: string) {
        return request<{ incident: any }>(`/api/debug/incidents/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
      },
      delete(id: string) {
        return request<{ success: boolean }>(`/api/debug/incidents/${id}`, {
          method: "DELETE",
        });
      },
      createGitHubIssue(id: string) {
        return request<{ issueUrl: string; issueNumber: number }>(
          `/api/debug/incidents/${id}/github-issue`,
          { method: "POST" }
        );
      },
    },
    logs: {
      list(filters?: { level?: string; service?: string; limit?: number; incidentId?: string }) {
        const params = new URLSearchParams();
        if (filters?.level) params.set("level", filters.level);
        if (filters?.service) params.set("service", filters.service);
        if (filters?.limit) params.set("limit", String(filters.limit));
        if (filters?.incidentId) params.set("incidentId", filters.incidentId);
        const qs = params.toString();
        return request<{ logs: any[] }>(`/api/debug/logs${qs ? `?${qs}` : ""}`);
      },
      add(data: {
        incidentId?: string;
        level: string;
        message: string;
        source?: string;
        service?: string;
        stackTrace?: string;
        loggedAt?: string;
      }) {
        return request<{ log: any }>("/api/debug/logs", {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
    },
  },
  settings: {
    profile: {
      get() { return request<{ success: boolean; data: import('./types/settings').ProfileData }>('/api/settings/profile'); },
      update(data: { displayName: string; workspaceName: string }) {
        return request<{ success: boolean }>('/api/settings/profile', { method: 'PATCH', body: JSON.stringify(data) });
      },
    },
    github: {
      get() { return request<{ success: boolean; data: import('./types/settings').GithubIntegrationData }>('/api/settings/github'); },
      disconnect() { return request<{ success: boolean }>('/api/settings/github', { method: 'DELETE' }); },
    },
    appearance: {
      get() { return request<{ success: boolean; data: import('./types/settings').AppearanceData }>('/api/settings/appearance'); },
      update(data: import('./types/settings').AppearanceData) {
        return request<{ success: boolean; data: import('./types/settings').AppearanceData }>('/api/settings/appearance', { method: 'PATCH', body: JSON.stringify(data) });
      },
    },
    notifications: {
      get() { return request<{ success: boolean; data: import('./types/settings').NotificationPreferences }>('/api/settings/notifications'); },
      update(data: import('./types/settings').NotificationPreferences) {
        return request<{ success: boolean; data: import('./types/settings').NotificationPreferences }>('/api/settings/notifications', { method: 'PATCH', body: JSON.stringify(data) });
      },
    },
    ai: {
      get() { return request<{ success: boolean; data: import('./types/settings').AIPreferencesData }>('/api/settings/ai-preferences'); },
      update(data: import('./types/settings').AIPreferencesData) {
        return request<{ success: boolean; data: import('./types/settings').AIPreferencesData }>('/api/settings/ai-preferences', { method: 'PATCH', body: JSON.stringify(data) });
      },
    },
    security: {
      sessions() { return request<{ success: boolean; sessions: import('./types/settings').UserSessionData[] }>('/api/settings/security'); },
      deleteSession(id: string) { return request<{ success: boolean }>(`/api/settings/sessions/${id}`, { method: 'DELETE' }); },
      deleteAllOtherSessions() { return request<{ success: boolean }>('/api/settings/sessions', { method: 'DELETE' }); },
      tokens() { return request<{ success: boolean; data: import('./types/settings').AccessTokenData[] }>('/api/settings/access-tokens'); },
      createToken(data: { name: string; expiresInDays?: number }) {
        return request<{ success: boolean; data: import('./types/settings').AccessTokenData & { token: string } }>('/api/settings/access-tokens', { method: 'POST', body: JSON.stringify(data) });
      },
      revokeToken(id: string) { return request<{ success: boolean }>(`/api/settings/access-tokens/${id}/revoke`, { method: 'PATCH' }); },
      deleteToken(id: string) { return request<{ success: boolean }>(`/api/settings/access-tokens/${id}`, { method: 'DELETE' }); },
    },
  githubWorkspace: {
    connect(token: string) {
      return request<{ connected: boolean; username: string; avatar: string; connectedAt: string }>('/api/github/workspace/connect', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    },
    status() {
      return request<{ connected: boolean; username?: string; avatar?: string; connectedAt?: string }>('/api/github/workspace/status');
    },
    disconnect() {
      return request<{ success: boolean }>('/api/github/workspace/disconnect', { method: 'DELETE' });
    },
    chat(message: string, history: any[] = [], context: any = {}) {
      return request<{ response: string; state?: any }>('/api/github/workspace/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history, context }),
      });
    }
  },
};
