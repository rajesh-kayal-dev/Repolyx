'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, File, Folder, ChevronRight } from 'lucide-react';
import { getFileInfo } from '@/lib/file-types';
import type { TreeNode, RepositoryFile } from '@/lib/types';

interface FileFinderProps {
  tree: TreeNode[];
  files: RepositoryFile[];
  onFileSelect: (file: RepositoryFile) => void;
}

interface FlatEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  file?: RepositoryFile;
}

function flattenTree(nodes: TreeNode[], files: RepositoryFile[]): FlatEntry[] {
  const result: FlatEntry[] = [];
  function walk(list: TreeNode[]) {
    for (const node of list) {
      if (node.type === 'directory') {
        result.push({ name: node.name, path: node.path, type: 'directory' });
        if (node.children) walk(node.children);
      } else {
        const file = files.find((f) => f.path === node.path);
        result.push({ name: node.name, path: node.path, type: 'file', file });
      }
    }
  }
  walk(nodes);
  return result;
}

export function FileFinder({ tree, files, onFileSelect }: FileFinderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const flatEntries = useMemo(() => flattenTree(tree, files), [tree, files]);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return flatEntries.filter((e) => e.path.toLowerCase().includes(q));
  }, [flatEntries, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        if (!isOpen) setQuery('');
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleSelect = useCallback((entry: FlatEntry) => {
    if (entry.type === 'file' && entry.file) {
      onFileSelect(entry.file);
    }
    setIsOpen(false);
    setQuery('');
  }, [onFileSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault();
      handleSelect(filtered[activeIndex]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-[11px] text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300 transition-colors w-[140px]"
      >
        <Search size={11} className="shrink-0" />
        <span className="flex-1 text-left truncate">Find file...</span>
        <kbd className="flex items-center gap-0.5 rounded border border-white/[0.06] bg-white/[0.04] px-1 py-0.5 text-[9px] text-neutral-600">
          <span>⌘</span>K
        </kbd>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-80 rounded-lg border border-white/[0.08] bg-[#0d1117] shadow-elevated z-50 overflow-hidden">
          <div className="p-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search files and directories..."
                className="w-full rounded-md border border-white/[0.06] bg-white/[0.03] py-1.5 pl-8 pr-2 text-[11px] text-white outline-none placeholder:text-neutral-500 focus:border-accent/30 transition-colors"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((entry, i) => {
                const fileInfo = entry.type === 'file' && entry.file
                  ? getFileInfo(entry.file.name)
                  : null;
                const Icon = entry.type === 'directory' ? Folder : (fileInfo?.icon || File);
                const iconColor = entry.type === 'directory'
                  ? (filtered.length > 0 && i === activeIndex ? '#38bdf8' : '#38bdf880')
                  : (fileInfo?.color || '#6c6c6c');

                return (
                  <button
                    key={entry.path}
                    onClick={() => handleSelect(entry)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                      i === activeIndex ? 'bg-accent/[0.06]' : ''
                    } ${
                      entry.type === 'directory' ? 'text-neutral-400' : 'text-neutral-300'
                    }`}
                  >
                    <Icon size={13} className="shrink-0" style={{ color: iconColor }} />
                    <span className="flex-1 truncate">{entry.path}</span>
                    {entry.type === 'directory' && <ChevronRight size={10} className="text-neutral-600 shrink-0" />}
                    {entry.type === 'file' && (
                      <span className="text-[9px] text-neutral-600 shrink-0">
                        {entry.file?.extension?.replace('.', '')?.toUpperCase() || 'FILE'}
                      </span>
                    )}
                  </button>
                );
              })
            ) : query.trim() ? (
              <div className="px-3 py-6 text-center text-[11px] text-neutral-500">
                No results matching &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="px-3 py-6 text-center text-[11px] text-neutral-500">
                Type to search files and directories
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
