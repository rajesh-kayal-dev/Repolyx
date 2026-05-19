'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { ChevronDown, FileText, Folder, Search } from 'lucide-react';
import type { ExplorerSection } from '@/lib/types';

interface RepoExplorerProps {
    repoName: string;
    branch: string;
    indexed: string;
    aiStatus: string;
    tree: ExplorerSection[];
}

export function RepoExplorer({ repoName, branch, indexed, aiStatus, tree }: RepoExplorerProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Repository explorer</p>
                        <h3 className="mt-2 text-xl text-white">{repoName}</h3>
                    </div>
                    <Badge>{aiStatus}</Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-[#090b10] p-4 text-sm text-neutral-400">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Branch</p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-white">{branch}</span>
                            <ChevronDown size={16} className="text-cyan-300" />
                        </div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-[#090b10] p-4 text-sm text-neutral-400">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Index status</p>
                        <p className="mt-3 text-white">{indexed}</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#090b10] p-4 text-sm text-neutral-400">
                    <label htmlFor="workspace-search" className="sr-only">Search files</label>
                    <div className="relative">
                        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                            id="workspace-search"
                            type="search"
                            placeholder="Search files and folders"
                            className="w-full rounded-3xl border border-white/10 bg-[#02050a] py-3 pl-12 pr-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {tree.map((section) => (
                        <div key={section.title} className="rounded-3xl border border-white/10 bg-[#090b10] p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-sm text-white">
                                    <Folder size={16} className="text-cyan-300" />
                                    <span className="font-medium">{section.title}</span>
                                </div>
                                <Badge variant="muted">{section.count} files</Badge>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-neutral-400">
                                {section.items.map((item) => (
                                    <button
                                        key={item.path}
                                        type="button"
                                        className={`flex w-full items-center justify-between rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-cyan-400/20 hover:bg-white/5 ${item.active ? 'border-cyan-400/20 bg-white/5 text-white' : ''}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <FileText size={14} className="text-cyan-300" />
                                            <span>{item.label}</span>
                                        </span>
                                        {item.tag && <Badge variant={item.tag === 'AI' ? 'success' : 'muted'}>{item.tag}</Badge>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <Button variant="secondary" className="w-full">Open selected file</Button>
            </Card>
        </motion.div>
    );
}
