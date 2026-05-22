'use client';

import { Search } from 'lucide-react';
import type { RepoOption } from '@/lib/types';

interface ActivityHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRepo: string;
  onRepoChange: (repoId: string) => void;
  timeFilter: string;
  onTimeChange: (time: string) => void;
  isBeginner: boolean;
  onModeToggle: () => void;
  repositories: RepoOption[];
}

const timeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export function ActivityHeader({
  searchQuery,
  onSearchChange,
  selectedRepo,
  onRepoChange,
  timeFilter,
  onTimeChange,
  isBeginner,
  onModeToggle,
  repositories,
}: ActivityHeaderProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-cyan-400">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8" cy="8" r="2" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Workspace Activity Feed</h1>
            <p className="text-xs text-neutral-500 mt-0.5">Timeline and intelligence feed for your entire workspace</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search activity..."
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.1] transition-colors"
            />
          </div>

          <select
            value={selectedRepo}
            onChange={(e) => onRepoChange(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-neutral-300 outline-none focus:border-white/[0.1] transition-colors appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="all">All Repositories</option>
            {repositories.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <div className="flex rounded-lg border border-white/[0.06] overflow-hidden">
            {timeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onTimeChange(opt.value)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  timeFilter === opt.value
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-neutral-500">Beginner</span>
            <button
              type="button"
              onClick={onModeToggle}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isBeginner ? 'bg-cyan-500/30' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  isBeginner ? 'translate-x-1' : 'translate-x-[18px]'
                }`}
              />
            </button>
            <span className="text-xs text-neutral-500">Developer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
