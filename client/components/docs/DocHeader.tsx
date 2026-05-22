'use client';

import { Search, BookOpen, FileText, Download, RefreshCw, Sparkles, RotateCcw } from 'lucide-react';

interface DocHeaderProps {
  selectedRepo: string;
  onRepoChange: (id: string) => void;
  isBeginner: boolean;
  onModeToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  repositories: { id: string; name: string }[];
  onGenerateDocs: () => void;
  onRegenerate: () => void;
  onExportMarkdown: () => void;
  onSync: () => void;
  generating: boolean;
  syncing?: boolean;
  hasDocs: boolean;
}

export function DocHeader({
  selectedRepo,
  onRepoChange,
  isBeginner,
  onModeToggle,
  searchQuery,
  onSearchChange,
  repositories,
  onGenerateDocs,
  onRegenerate,
  onExportMarkdown,
  onSync,
  generating,
  syncing,
  hasDocs,
}: DocHeaderProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/20 to-teal-500/20">
            <BookOpen size={14} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">AI Documentation Workspace</h1>
            <p className="text-xs text-neutral-500 mt-0.5">AI-powered knowledge center for your repositories</p>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-neutral-500">Beginner</span>
            <button
              type="button"
              onClick={onModeToggle}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isBeginner ? 'bg-emerald-500/30' : 'bg-neutral-700'
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

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search documentation..."
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.1] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 border-r border-white/[0.06] pr-3">
            <select
              value={selectedRepo}
              onChange={(e) => onRepoChange(e.target.value)}
              className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-neutral-300 outline-none focus:border-white/[0.1] transition-colors appearance-none cursor-pointer min-w-[150px]"
            >
              <option value="">Select repository...</option>
              {repositories.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onGenerateDocs}
            disabled={!selectedRepo || generating}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-4 py-2 text-xs font-medium text-emerald-400 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-500/10"
          >
            <Sparkles size={13} />
            {generating ? 'Generating...' : 'Generate Docs'}
          </button>

          <button
            type="button"
            onClick={onExportMarkdown}
            disabled={!hasDocs}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.06] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileText size={13} />
            Export MD
          </button>

          <button
            type="button"
            disabled={!hasDocs}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.06] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={13} />
            Export ZIP
          </button>

          <button
            type="button"
            onClick={onSync}
            disabled={!selectedRepo || generating || syncing}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.06] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync'}
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={!selectedRepo || generating || !hasDocs}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.06] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={13} />
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}
