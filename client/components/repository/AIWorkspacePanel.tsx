'use client';

import { useState } from 'react';
import { FileText, GitBranch, MessageSquare, Shield } from 'lucide-react';
import type { AIAssistantEvent } from '@/lib/types';

interface AIWorkspacePanelProps {
    events: AIAssistantEvent[];
}

const prompts = [
    'Explain backend flow',
    'Where is auth handled?',
    'Show API relationships',
    'Find payment logic',
];

export function AIWorkspacePanel({ events }: AIWorkspacePanelProps) {
    const [input, setInput] = useState('');

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">AI Workspace</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Contextual understanding of this repository</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                    Indexed
                </span>
            </div>

            {/* Understanding summary */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-4">
                <p className="text-sm text-neutral-300 leading-relaxed">
                    This is a <span className="text-white">TypeScript monorepo</span> with Next.js frontend and Node.js API services.
                    The auth layer uses JWT + OAuth with middleware-based route protection. Three service clusters are connected
                    through a stable API gateway.
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                        <GitBranch size={12} /> 3 services mapped
                    </span>
                    <span className="flex items-center gap-1">
                        <Shield size={12} /> Auth flow tracked
                    </span>
                </div>
            </div>

            {/* Prompts */}
            <div className="mb-4">
                <p className="text-xs text-neutral-500 mb-2.5">Suggested questions</p>
                <div className="flex flex-wrap gap-1.5">
                    {prompts.map((prompt) => (
                        <button
                            key={prompt}
                            type="button"
                            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 hover:border-white/[0.1] transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat input */}
            <div className="relative mb-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about this repository..."
                    className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.1] transition-colors"
                />
                <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-neutral-500 hover:text-accent hover:bg-white/[0.06] transition-colors"
                >
                    <MessageSquare size={14} />
                </button>
            </div>

            {/* Repository memory */}
            <div>
                <p className="text-xs text-neutral-500 mb-2.5">Repository memory</p>
                <div className="space-y-1">
                    {events.map((event) => (
                        <div key={event.id} className="flex items-center gap-2.5 rounded-lg bg-white/[0.02] px-3 py-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent/50" />
                            <span className="text-xs text-neutral-400">{event.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
