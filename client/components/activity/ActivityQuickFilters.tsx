'use client';

import { Download, Scan, ShieldAlert, FileText, GitPullRequest, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ActivityQuickFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { label: 'Repository Imports', icon: Download, color: 'text-blue-400' },
  { label: 'AI Scans', icon: Scan, color: 'text-cyan-400' },
  { label: 'Security Alerts', icon: ShieldAlert, color: 'text-red-400' },
  { label: 'Documentation Updates', icon: FileText, color: 'text-emerald-400' },
  { label: 'Pull Request Reviews', icon: GitPullRequest, color: 'text-purple-400' },
  { label: 'AI Suggestions', icon: Sparkles, color: 'text-amber-400' },
  { label: 'Failed Scans', icon: AlertTriangle, color: 'text-red-400' },
  { label: 'Resolved Issues', icon: CheckCircle2, color: 'text-emerald-400' },
];

export function ActivityQuickFilters({ activeFilter, onFilterChange }: ActivityQuickFiltersProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-4">
      <h3 className="text-[11px] uppercase tracking-[0.15em] text-neutral-500 mb-3">Quick Filters</h3>
      <div className="space-y-1">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = activeFilter === f.label;
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => onFilterChange(isActive ? 'all' : f.label)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                isActive
                  ? 'bg-white/[0.06] text-white'
                  : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
              }`}
            >
              <Icon size={14} className={`shrink-0 ${f.color}`} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
