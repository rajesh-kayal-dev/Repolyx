'use client';

import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Search, FileText, Layers, Sparkles, ShieldCheck, TerminalSquare } from 'lucide-react';
import type { DocTypeItem } from '@/lib/types';

const iconMap: Record<string, ComponentType<{ size?: number | string }>> = {
    'README Generator': FileText,
    'API Documentation': Layers,
    'Setup Guide': Sparkles,
    'Endpoint Docs': TerminalSquare,
    'Database Schema': ShieldCheck,
    'Architecture Summary': Layers,
    'Onboarding Docs': Sparkles,
    Changelog: FileText,
};

interface DocsNavigatorProps {
    repo: string;
    branch: string;
    types: DocTypeItem[];
    activeType: string;
}

export function DocsNavigator({ repo, branch, types, activeType }: DocsNavigatorProps) {
    return (
        <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
            <Card className="space-y-6">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Documentation tool</p>
                    <h3 className="mt-2 text-xl text-white">Doc types</h3>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#090b10] p-4 text-sm text-neutral-400">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Repository</p>
                            <p className="mt-2 text-white">{repo}</p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cyan-300">{branch}</div>
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#090b10] p-4 text-sm text-neutral-400">
                    <label htmlFor="docs-search" className="sr-only">Search docs types</label>
                    <div className="relative">
                        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                            id="docs-search"
                            type="search"
                            placeholder="Search doc types"
                            className="w-full rounded-3xl border border-white/10 bg-[#02050a] py-3 pl-12 pr-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {types.map((type) => {
                        const Icon = iconMap[type.title] || FileText;
                        return (
                            <button
                                key={type.title}
                                type="button"
                                className={`flex w-full items-start gap-3 rounded-3xl border px-4 py-4 text-left transition ${type.title === activeType
                                        ? 'border-cyan-400/30 bg-cyan-500/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.18)]'
                                        : 'border-white/5 bg-[#080b12] text-neutral-300 hover:border-white/10 hover:bg-white/5'
                                    }`}
                            >
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-cyan-300">
                                    <Icon size={18} />
                                </span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-medium">{type.title}</span>
                                        {type.generated && <Badge variant="success">AI</Badge>}
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-neutral-400">{type.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <Button variant="secondary" className="w-full">New generated doc</Button>
            </Card>
        </motion.div>
    );
}
