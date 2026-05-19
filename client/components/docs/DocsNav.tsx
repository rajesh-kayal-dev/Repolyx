'use client';

import { useState } from 'react';
import { FileText, Layers, Search, ShieldCheck, Sparkles, TerminalSquare } from 'lucide-react';
import type { DocTypeItem } from '@/lib/types';

const iconMap: Record<string, typeof FileText> = {
    'README Generator': FileText,
    'API Documentation': Layers,
    'Setup Guide': Sparkles,
    'Endpoint Docs': TerminalSquare,
    'Architecture Summary': Layers,
    Changelog: FileText,
};

const docTypes: DocTypeItem[] = [
    { title: 'README Generator', description: 'Draft an onboarding README', generated: true },
    { title: 'API Documentation', description: 'Build endpoint reference docs' },
    { title: 'Setup Guide', description: 'Create quickstart guide' },
    { title: 'Endpoint Docs', description: 'Generate API endpoint summaries' },
    { title: 'Architecture Summary', description: 'Summarize system design' },
    { title: 'Changelog', description: 'Produce release notes' },
];

export function DocsNav() {
    const [active, setActive] = useState('README Generator');
    const [search, setSearch] = useState('');

    const filtered = docTypes.filter(
        (t) => !search || t.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Document types</h2>
                <span className="text-xs text-neutral-500">{docTypes.length}</span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-1.5 pl-8 pr-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.1] transition-colors"
                />
            </div>

            {/* List */}
            <div className="space-y-0.5">
                {filtered.map((type) => {
                    const Icon = iconMap[type.title] || FileText;
                    const isActive = type.title === active;
                    return (
                        <button
                            key={type.title}
                            type="button"
                            onClick={() => setActive(type.title)}
                            className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                                    ? 'bg-accent/10 text-accent'
                                    : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                                }`}
                        >
                            <Icon size={15} className={`shrink-0 ${isActive ? 'text-accent' : 'text-neutral-500'}`} />
                            <span className="flex-1 text-left">{type.title}</span>
                            {type.generated && (
                                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                                    AI
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
