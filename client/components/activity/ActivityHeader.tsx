'use client';

import { GitBranch, Search } from 'lucide-react';

const filterTabs = ['All', 'Scan', 'AI Analysis', 'Alerts', 'Security', 'Docs'];

interface ActivityHeaderProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ActivityHeader({ activeFilter, onFilterChange, searchQuery, onSearchChange }: ActivityHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8" cy="8" r="2" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Activity</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Recent events across your workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search activity..."
              className="w-36 rounded-lg border border-white/[0.06] bg-white/[0.03] py-1.5 pl-8 pr-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.1] transition-colors"
            />
          </div>
          <button
            type="button"
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors"
          >
            Export
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onFilterChange(tab)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === activeFilter
                ? 'bg-accent/10 text-accent'
                : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
