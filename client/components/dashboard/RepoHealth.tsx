"use client";

import { useEffect, useState } from "react";
import { GitBranch } from "lucide-react";
import { api } from "@/lib/api-client";

interface Repo {
  id: string;
  name: string;
  language: string;
  defaultBranch: string;
  status: string;
  isIndexed: boolean;
  fileCount: number;
  dependencyCount: number;
  updatedAt: string;
}

const statusColor: Record<string, string> = {
  healthy: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-red-400",
};

export function RepoHealth() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.dashboard.repos()
      .then((data) => { if (mounted) setRepos(data.repositories || []); })
      .catch((err) => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Repository Health</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {repos.length === 0
              ? "No repositories imported"
              : `${repos.filter((r) => r.status === "healthy").length} healthy, ${repos.filter((r) => r.status === "error").length} failed`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <div className="border-b border-white/[0.04] px-4 py-2.5">
            <div className="h-3 w-20 bg-white/[0.04] rounded animate-pulse" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-4 py-3 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-white/[0.04] rounded animate-pulse" />
                <div className="h-4 w-32 bg-white/[0.04] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-xs text-red-400">Failed to load repositories: {error}</p>
        </div>
      ) : repos.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center">
          <GitBranch size={20} className="mx-auto text-neutral-600 mb-2" />
          <p className="text-sm text-neutral-500">No repositories imported</p>
          <p className="text-xs text-neutral-600 mt-1">Import a repository to track its health</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500">Repository</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500 hidden sm:table-cell">Branch</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500">Status</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500 hidden sm:table-cell">Files</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {repos.map((repo) => (
                <tr key={repo.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <GitBranch size={14} className="text-neutral-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-neutral-200">{repo.name}</p>
                        <p className="text-xs text-neutral-500">{repo.language}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-neutral-400">{repo.defaultBranch}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${statusColor[repo.status] || statusColor.warning}`} />
                      <span className="text-sm text-neutral-400 capitalize">{repo.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="text-sm text-neutral-500">{formatFileCount(repo.fileCount)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatFileCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
