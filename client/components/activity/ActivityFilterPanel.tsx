'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { ActivityFilterItem } from '@/lib/types';

interface ActivityFilterPanelProps {
    activeFilter: string;
    filters: ActivityFilterItem[];
}

export function ActivityFilterPanel({ activeFilter, filters }: ActivityFilterPanelProps) {
    return (
        <motion.aside initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
            <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-[#090b10] p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Activity filters</p>
                            <h2 className="mt-2 text-lg text-white">Stream selection</h2>
                        </div>
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
                            <SlidersHorizontal size={18} />
                        </div>
                    </div>

                    <div className="mt-5 rounded-3xl border border-white/10 bg-[#05080d] p-3 text-sm text-neutral-400">
                        <div className="flex items-center gap-3 text-neutral-300">
                            <Search size={16} />
                            <span>Search activity</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#090b10] p-5 text-sm text-neutral-300">
                    <div className="flex items-center justify-between gap-3 pb-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Active filter</p>
                            <p className="mt-2 text-white">{activeFilter}</p>
                        </div>
                        <Badge variant="success">{filters.find((filter) => filter.label === activeFilter)?.count ?? 0}</Badge>
                    </div>

                    <div className="space-y-2">
                        {filters.map((filter) => (
                            <button
                                key={filter.label}
                                type="button"
                                className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 text-left text-sm transition ${filter.label === activeFilter
                                        ? 'border-cyan-400/30 bg-cyan-500/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.12)]'
                                        : 'border-white/10 bg-[#05080d] text-neutral-300 hover:border-white/20 hover:bg-white/5'
                                    }`}
                            >
                                <div>
                                    <p className="font-medium">{filter.label}</p>
                                    <p className="text-xs text-neutral-500">{filter.count} events</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {filter.unread > 0 && (
                                        <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-cyan-500/15 px-2 text-xs text-cyan-300">
                                            {filter.unread}
                                        </span>
                                    )}
                                    <Badge variant={filter.label === activeFilter ? 'success' : 'secondary'}>{filter.count}</Badge>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#090b10] p-5 text-sm text-neutral-300">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Live activity</p>
                    <div className="mt-4 space-y-3">
                        <div className="rounded-3xl bg-[#05080d] p-4">
                            <p className="text-sm text-white">Scanning repository structure</p>
                            <p className="mt-2 text-xs text-neutral-500">Indexing and AI metadata extraction are in progress.</p>
                        </div>
                        <div className="rounded-3xl bg-[#05080d] p-4">
                            <p className="text-sm text-white">Analyzing authentication flow</p>
                            <p className="mt-2 text-xs text-neutral-500">AI model is tracing routes and security boundaries.</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}
