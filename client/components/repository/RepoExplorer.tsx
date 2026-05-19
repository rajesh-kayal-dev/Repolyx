'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder, Search } from 'lucide-react';
import type { ExplorerSection } from '@/lib/types';

interface RepoExplorerProps {
    tree: ExplorerSection[];
}

export function RepoExplorer({ tree }: RepoExplorerProps) {
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const [search, setSearch] = useState('');

    const toggle = (title: string) => setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));

    const filtered = tree
        .map((section) => ({
            ...section,
            items: section.items.filter(
                (item) => !search || item.label.toLowerCase().includes(search.toLowerCase())
            ),
        }))
        .filter((section) => section.items.length > 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Files</h2>
                <span className="text-xs text-neutral-500">{tree.reduce((a, s) => a + s.items.length, 0)} files</span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search files..."
                    className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-1.5 pl-8 pr-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.1] transition-colors"
                />
            </div>

            {/* Tree */}
            <div className="space-y-0.5">
                {filtered.map((section) => (
                    <div key={section.title}>
                        <button
                            type="button"
                            onClick={() => toggle(section.title)}
                            className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors"
                        >
                            {collapsed[section.title] ? (
                                <ChevronRight size={12} className="shrink-0" />
                            ) : (
                                <ChevronDown size={12} className="shrink-0" />
                            )}
                            <Folder size={13} className="shrink-0 text-neutral-500" />
                            <span>{section.title}</span>
                            <span className="ml-auto text-[11px] text-neutral-500">{section.items.length}</span>
                        </button>

                        {!collapsed[section.title] && (
                            <div className="ml-4 space-y-0.5">
                                {section.items.map((item) => (
                                    <button
                                        key={item.path}
                                        type="button"
                                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${item.active
                                                ? 'bg-accent/10 text-accent'
                                                : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                                            }`}
                                    >
                                        <FileText size={13} className="shrink-0 text-neutral-500" />
                                        <span className="truncate">{item.label}</span>
                                        {item.tag && (
                                            <span className={`ml-auto text-[10px] font-medium ${item.tag === 'AI' ? 'text-accent' : 'text-neutral-500'}`}>
                                                {item.tag}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
