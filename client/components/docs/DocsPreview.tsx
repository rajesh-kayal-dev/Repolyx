'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Copy, ChevronRight, FileText, Sparkles } from 'lucide-react';
import type { ArchitectureInsight, DocPreviewSection, EndpointDoc } from '@/lib/types';

interface DocsPreviewProps {
    title: string;
    description: string;
    sections: DocPreviewSection[];
    apiDocs: EndpointDoc[];
    architecture: ArchitectureInsight[];
}

export function DocsPreview({ title, description, sections, apiDocs, architecture }: DocsPreviewProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-neutral-500">
                            <FileText size={14} />
                            <span>Generated documentation</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-white">{title}</h2>
                            <p className="mt-2 text-sm leading-6 text-neutral-400">{description}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" size="sm">
                            <Copy size={16} /> Export MD
                        </Button>
                        <Button size="sm">Regenerate</Button>
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#04070d] p-6">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <Badge variant="secondary">Priority: High</Badge>
                        <Badge variant="outline">Style: Technical</Badge>
                        <Badge variant="outline">Focus: Onboarding</Badge>
                    </div>

                    <article className="space-y-6 text-sm leading-7 text-neutral-300">
                        {sections.map((section) => (
                            <section key={section.title} className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                                    <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">{section.tag}</span>
                                </div>
                                <p>{section.content}</p>
                                {section.code && (
                                    <div className="rounded-3xl border border-white/10 bg-[#02050a] p-4 text-sm text-neutral-200">
                                        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-neutral-500">
                                            <span>{section.codeLabel}</span>
                                            <Button variant="ghost" size="sm" className="gap-2">
                                                <Copy size={14} /> Copy
                                            </Button>
                                        </div>
                                        <pre className="overflow-x-auto text-xs leading-5 text-neutral-100">{section.code}</pre>
                                    </div>
                                )}
                            </section>
                        ))}
                    </article>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-[#080c14] p-6">
                        <div className="mb-5 flex items-center gap-3 text-sm text-white">
                            <Sparkles size={18} />
                            <div>
                                <p className="font-semibold">API docs included</p>
                                <p className="text-sm text-neutral-400">Generated from repository endpoint definitions.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {apiDocs.map((endpoint) => (
                                <div key={endpoint.route} className="rounded-3xl border border-white/10 bg-[#02050a] p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-white">{endpoint.route}</p>
                                            <p className="text-sm text-neutral-400">{endpoint.summary}</p>
                                        </div>
                                        <Badge variant="secondary">{endpoint.method}</Badge>
                                    </div>
                                    <div className="mt-4 grid gap-2 text-xs text-neutral-400 sm:grid-cols-2">
                                        <span>Auth: {endpoint.auth}</span>
                                        <span>Response: {endpoint.response}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-[#080c14] p-6">
                        <div className="mb-5 flex items-center gap-3 text-sm text-white">
                            <ChevronRight size={18} />
                            <div>
                                <p className="font-semibold">Architecture summary</p>
                                <p className="text-sm text-neutral-400">High-level design notes for the next engineering wave.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {architecture.map((item) => (
                                <div key={item.title} className="rounded-3xl border border-white/10 bg-[#02050a] p-4">
                                    <p className="text-sm font-semibold text-white">{item.title}</p>
                                    <p className="mt-2 text-sm leading-6 text-neutral-400">{item.summary}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
