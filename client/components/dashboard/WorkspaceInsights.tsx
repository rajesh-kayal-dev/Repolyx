"use client";

import { useEffect, useState } from "react";
import { BarChart3, FileCode, Package, Brain, Activity } from "lucide-react";
import { api } from "@/lib/api-client";

interface Insights {
  repositories: number;
  indexedRepositories: number;
  totalFiles: number;
  totalDependencies: number;
  totalAnalyses: number;
  healthyRepos: number;
  warningRepos: number;
  activeSessions: number;
}

const defaultInsights: Insights = {
  repositories: 0, indexedRepositories: 0, totalFiles: 0,
  totalDependencies: 0, totalAnalyses: 0, healthyRepos: 0,
  warningRepos: 0, activeSessions: 0,
};

interface Item {
  label: string;
  icon: any;
  value?: string;
  sub?: string;
  health?: boolean;
}

export function WorkspaceInsights() {
  const [insights, setInsights] = useState<Insights>(defaultInsights);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.dashboard.stats()
      .then((data) => { if (mounted) setInsights(data.stats); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const healthScore = insights.repositories
    ? Math.round((insights.healthyRepos / insights.repositories) * 100)
    : 0;

  function fmt(v: number): string {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return String(v);
  }

  const items: Item[] = [
    { label: "Repositories Indexed", icon: BarChart3, value: fmt(insights.indexedRepositories), sub: `of ${insights.repositories} total` },
    { label: "Files Scanned", icon: FileCode, value: fmt(insights.totalFiles), sub: "across all repos" },
    { label: "Dependencies Mapped", icon: Package, value: fmt(insights.totalDependencies), sub: `${insights.totalAnalyses} analyses run` },
    { label: "AI Sessions", icon: Brain, value: fmt(insights.activeSessions), sub: "active conversations" },
    { label: "Health Score", icon: Activity, value: `${healthScore}%`, sub: `${insights.healthyRepos} healthy, ${insights.warningRepos} warning` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/[0.04] rounded-xl overflow-hidden border border-white/[0.04]">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="bg-[#0d1117] px-4 py-4">
            <div className="flex items-center gap-1.5 text-neutral-500">
              <Icon size={13} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
            </div>
            <p className="mt-1.5 text-xl font-bold text-white tracking-tight">{loading ? "—" : item.value}</p>
            {!loading && item.sub && (
              <p className="text-[10px] text-neutral-500 mt-0.5">{item.sub}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
