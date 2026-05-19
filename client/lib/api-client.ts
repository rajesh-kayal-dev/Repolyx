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
};
