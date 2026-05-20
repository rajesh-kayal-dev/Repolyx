"use client";

import { useEffect, useState } from "react";
import { GitBranch, Layers, FileCode, Package } from "lucide-react";
import { api } from "@/lib/api-client";

interface DashboardStats {
  repositories: number;
  indexedRepositories: number;
  activeSessions: number;
  totalFiles: number;
  totalDependencies: number;
  totalAnalyses: number;
  healthyRepos: number;
  warningRepos: number;
}

const defaultStats: DashboardStats = {
  repositories: 0,
  indexedRepositories: 0,
  activeSessions: 0,
  totalFiles: 0,
  totalDependencies: 0,
  totalAnalyses: 0,
  healthyRepos: 0,
  warningRepos: 0,
};

export function WorkspaceOverview() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.dashboard.stats()
      .then((data) => { if (mounted) setStats(data.stats); })
      .catch((err) => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-xl overflow-hidden border border-white/[0.04]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#080b12] px-5 py-4">
            <div className="h-3 w-20 bg-white/[0.04] rounded animate-pulse" />
            <div className="mt-3 h-7 w-12 bg-white/[0.04] rounded animate-pulse" />
            <div className="mt-1.5 h-3 w-24 bg-white/[0.04] rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <p className="text-sm text-red-400">Failed to load dashboard: {error}</p>
      </div>
    );
  }

  const statItems = [
    {
      label: "Repositories",
      value: String(stats.repositories),
      icon: GitBranch,
      change: `${stats.indexedRepositories} indexed`,
    },
    {
      label: "Files Scanned",
      value: formatNumber(stats.totalFiles),
      icon: FileCode,
      change: `Across ${stats.repositories} repos`,
    },
    {
      label: "Dependencies",
      value: formatNumber(stats.totalDependencies),
      icon: Package,
      change: `${stats.totalAnalyses} analyses run`,
    },
    {
      label: "Health Score",
      value: `${Math.round(stats.repositories ? (stats.healthyRepos / stats.repositories) * 100 : 0)}%`,
      icon: Layers,
      change: `${stats.healthyRepos} healthy, ${stats.warningRepos} warning`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-xl overflow-hidden border border-white/[0.04]">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-[#080b12] px-5 py-4">
            <div className="flex items-center gap-2 text-neutral-500">
              <Icon size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white tracking-tight">{stat.value}</p>
            <p className="mt-0.5 text-xs text-neutral-500">{stat.change}</p>
          </div>
        );
      })}
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
