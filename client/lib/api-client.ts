const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
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
    chat(sessionId: string, message: string, activeFile?: string, provider?: string, model?: string) {
      return request<{ userMessage: any; aiMessage: any; title: string; analysis?: any }>("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ sessionId, message, activeFile, provider, model }),
      });
    },
    getPrompts(repositoryId: string) {
      return request<{ prompts: string[] }>(`/api/ai/prompts/${repositoryId}`);
    },
  },
};
