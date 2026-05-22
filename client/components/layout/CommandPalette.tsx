'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  GitPullRequest,
  TerminalSquare,
  FileText,
  Activity,
  Settings,
  BookOpen,
  Search,
} from 'lucide-react';

interface NavRepo {
  id: string;
  name: string;
  language: string;
  defaultBranch: string;
  status: string;
  isIndexed: boolean;
}

interface Suggestion {
  id: string;
  label: string;
  description: string;
  icon: typeof GitBranch;
  action: () => void;
  category: string;
}

export function CommandPalette({
  isOpen,
  onClose,
  navRepos,
}: {
  isOpen: boolean;
  onClose: () => void;
  navRepos: NavRepo[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navPages = [
    { label: 'Overview', icon: LayoutDashboard, href: '/overview', cat: 'Navigation' },
    { label: 'Repositories', icon: GitBranch, href: '/repositories', cat: 'Navigation' },
    { label: 'AI Chat', icon: MessageSquare, href: '/chat', cat: 'Navigation' },
    { label: 'Pull Requests', icon: GitPullRequest, href: '/reviews', cat: 'Navigation' },
    { label: 'Debug Assistant', icon: TerminalSquare, href: '/debug', cat: 'Navigation' },
    { label: 'Documentation', icon: BookOpen, href: '/docs', cat: 'Navigation' },
    { label: 'Activity', icon: Activity, href: '/activity', cat: 'Navigation' },
    { label: 'Settings', icon: Settings, href: '/settings', cat: 'Navigation' },
  ];

  const suggestions = useMemo(() => {
    const results: Suggestion[] = [];

    const q = query.toLowerCase().trim();

    if (!q) {
      navPages.forEach((p) =>
        results.push({
          id: `nav-${p.href}`,
          label: p.label,
          description: `Go to ${p.label}`,
          icon: p.icon,
          category: p.cat,
          action: () => { router.push(p.href); onClose(); },
        })
      );
      navRepos.slice(0, 8).forEach((r) =>
        results.push({
          id: `repo-${r.id}`,
          label: r.name,
          description: `${r.language || 'Unknown'} · ${r.defaultBranch || 'main'}`,
          icon: GitBranch,
          category: 'Repositories',
          action: () => { router.push(`/repositories/${r.id}`); onClose(); },
        })
      );
      return results;
    }

    navPages.forEach((p) => {
      if (p.label.toLowerCase().includes(q) || p.href.toLowerCase().includes(q)) {
        results.push({
          id: `nav-${p.href}`,
          label: p.label,
          description: `Go to ${p.label}`,
          icon: p.icon,
          category: p.cat,
          action: () => { router.push(p.href); onClose(); },
        });
      }
    });

    navRepos.forEach((r) => {
      if (r.name.toLowerCase().includes(q)) {
        results.push({
          id: `repo-${r.id}`,
          label: r.name,
          description: `${r.language || 'Unknown'} · ${r.defaultBranch || 'main'}`,
          icon: GitBranch,
          category: 'Repositories',
          action: () => { router.push(`/repositories/${r.id}`); onClose(); },
        });
      }
    });

    return results;
  }, [query, navRepos, router, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && suggestions[selectedIndex]) {
        e.preventDefault();
        suggestions[selectedIndex].action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [suggestions, selectedIndex, onClose]
  );

  if (!isOpen) return null;

  const grouped = suggestions.reduce<Record<string, Suggestion[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  let globalIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0c101a] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
          <Search size={16} className="shrink-0 text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search repos, pages, and more..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
          />
          <kbd className="shrink-0 rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-neutral-500">
            ESC
          </kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                {category}
              </p>
              {items.map((s) => {
                globalIndex++;
                const idx = globalIndex;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={s.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      idx === selectedIndex
                        ? 'bg-accent/10 text-accent'
                        : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
                    }`}
                  >
                    <Icon size={15} className="shrink-0" />
                    <div className="flex-1 text-left">
                      <span>{s.label}</span>
                      <span className="ml-2 text-[11px] text-neutral-500">
                        {s.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

          {suggestions.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-neutral-500">
              No results for &quot;{query}&quot;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
