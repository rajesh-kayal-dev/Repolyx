'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { GitBranch, ChevronDown, Check, Search, Star } from 'lucide-react';

interface Branch {
  name: string;
  sha?: string;
  isDefault?: boolean;
}

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch: string;
  defaultBranch: string;
  onSelectBranch: (branch: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function BranchSelector({
  branches,
  selectedBranch,
  defaultBranch,
  onSelectBranch,
  isOpen,
  onToggle,
}: BranchSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredBranches = useMemo(() => {
    if (!searchQuery) return branches;
    const q = searchQuery.toLowerCase();
    return branches.filter((b) => b.name.toLowerCase().includes(q));
  }, [branches, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredBranches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredBranches[activeIndex]) {
      e.preventDefault();
      onSelectBranch(filteredBranches[activeIndex].name);
      onToggle();
    } else if (e.key === 'Escape') {
      onToggle();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 transition-colors"
      >
        <GitBranch size={12} className="text-neutral-500 shrink-0" />
        <span className="max-w-[100px] truncate">{selectedBranch}</span>
        <ChevronDown size={11} className="text-neutral-600 shrink-0" />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1.5 w-72 rounded-lg border border-white/[0.08] bg-[#0d1117] shadow-elevated z-50 overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          <div className="p-2 border-b border-white/[0.06]">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveIndex(0); }}
                placeholder="Find a branch..."
                className="w-full rounded-md border border-white/[0.06] bg-white/[0.03] py-1.5 pl-8 pr-2 text-[11px] text-white outline-none placeholder:text-neutral-500 focus:border-accent/30 transition-colors"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto" ref={listRef}>
            <div className="px-3 py-1.5 text-[9px] font-semibold text-neutral-500 uppercase tracking-widest">
              Branches
            </div>
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch, i) => {
                const isSelected = branch.name === selectedBranch;
                const isDefault = branch.name === defaultBranch;
                return (
                  <button
                    key={branch.name}
                    onClick={() => { onSelectBranch(branch.name); onToggle(); }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                      i === activeIndex ? 'bg-accent/[0.06]' : ''
                    } ${
                      isSelected ? 'text-accent font-medium' : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    <GitBranch size={13} className={`shrink-0 ${isSelected ? 'text-accent' : 'text-neutral-500'}`} />
                    <span className="flex-1 truncate">{branch.name}</span>
                    {isSelected && <Check size={11} className="shrink-0 text-accent" />}
                    {isDefault && !isSelected && (
                      <span className="shrink-0 text-[9px] text-neutral-500 flex items-center gap-0.5">
                        <Star size={9} />
                        Default
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center text-[11px] text-neutral-500">
                No branches matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
