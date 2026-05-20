"use client";

import { useEffect, useState } from "react";
import { ArrowRight, RefreshCw, Search, AlertTriangle, FileText, Shield } from "lucide-react";
import { api } from "@/lib/api-client";

interface Action {
  label: string;
  description: string;
  icon: string;
  priority: string;
}

const iconMap: Record<string, any> = {
  RefreshCw,
  Search,
  AlertTriangle,
  FileText,
  Shield,
};

export function SuggestedActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.dashboard.actions()
      .then((data) => { if (mounted) setActions(data.actions || []); })
      .catch((err) => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Suggested Actions</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Contextual next steps based on repository state</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-px">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-4 py-3">
              <div className="h-8 w-8 rounded-lg bg-white/[0.04] animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-36 bg-white/[0.04] rounded animate-pulse" />
                <div className="h-3 w-56 bg-white/[0.04] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg bg-white/[0.02] px-4 py-3">
          <p className="text-xs text-red-400">Failed to load actions: {error}</p>
        </div>
      ) : actions.length === 0 ? (
        <div className="rounded-lg bg-white/[0.02] px-4 py-6 text-center">
          <p className="text-sm text-neutral-500">No suggested actions</p>
          <p className="text-xs text-neutral-600 mt-1">Everything looks up to date</p>
        </div>
      ) : (
        <div className="space-y-px">
          {actions.map((action) => {
            const Icon = iconMap[action.icon] || Search;
            return (
              <button
                key={action.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.04] group"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.priority === "high" ? "bg-accent/10 text-accent" : "bg-white/[0.04] text-neutral-400"}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">{action.label}</p>
                  <p className="text-xs text-neutral-500 truncate">{action.description}</p>
                </div>
                <ArrowRight size={14} className="shrink-0 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
