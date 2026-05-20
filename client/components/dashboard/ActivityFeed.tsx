"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2, GitCommit, Info, RefreshCw, AlertTriangle,
  Shield, FileText, Search,
} from "lucide-react";
import { api } from "@/lib/api-client";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  repo: string;
  timestamp: string;
}

const iconMap: Record<string, { icon: any; class: string }> = {
  import: { icon: CheckCircle2, class: "text-emerald-400 bg-emerald-400/10" },
  scan: { icon: Search, class: "text-accent bg-accent/10" },
  analysis: { icon: GitCommit, class: "text-accent bg-accent/10" },
  ai: { icon: RefreshCw, class: "text-emerald-400 bg-emerald-400/10" },
  security: { icon: Shield, class: "text-amber-400 bg-amber-400/10" },
  dependency: { icon: PackageIcon, class: "text-neutral-400 bg-white/[0.04]" },
  info: { icon: Info, class: "text-neutral-400 bg-white/[0.04]" },
  docs: { icon: FileText, class: "text-neutral-400 bg-white/[0.04]" },
  error: { icon: AlertTriangle, class: "text-red-400 bg-red-400/10" },
};

function PackageIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" /><path d="M12 22.08V12" />
    </svg>
  );
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.dashboard.stats()
      .then((data) => { if (mounted) setActivities(data.recentActivity || []); })
      .catch((err) => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Latest events across your workspace</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-px">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-white/[0.02] px-4 py-3">
              <div className="h-7 w-7 rounded-lg bg-white/[0.04] animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-48 bg-white/[0.04] rounded animate-pulse" />
                <div className="h-3 w-36 bg-white/[0.04] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg bg-white/[0.02] px-4 py-3">
          <p className="text-xs text-red-400">Failed to load activity: {error}</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-lg bg-white/[0.02] px-4 py-6 text-center">
          <p className="text-sm text-neutral-500">No recent activity</p>
          <p className="text-xs text-neutral-600 mt-1">Import a repository to get started</p>
        </div>
      ) : (
        <div className="space-y-px">
          {activities.map((activity) => {
            const config = iconMap[activity.type] || iconMap.info;
            const Icon = config.icon;
            const timeAgo = getTimeAgo(activity.timestamp);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 mt-0.5 ${config.class}`}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-200">{activity.title}</p>
                  {activity.repo && (
                    <p className="text-xs text-neutral-500 truncate">{activity.repo}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-neutral-500">{timeAgo}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
