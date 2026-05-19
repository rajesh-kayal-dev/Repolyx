'use client';

import { useState } from 'react';
import { ChevronDown, FileText, GitBranch, MessageSquare, Zap } from 'lucide-react';

const suggestedPrompts = [
    'Explain backend flow',
    'Find auth middleware',
    'Show API relationships',
    'Review latest PR',
    'Explain database structure',
];

export default function ChatPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [contextOpen, setContextOpen] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages((prev) => [...prev, { role: 'user', content: input.trim() }]);
        setInput('');
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                        <MessageSquare size={14} className="text-accent" />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-white">AI Chat</h1>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <span>repolyx/cli</span>
                            <span className="text-neutral-600">·</span>
                            <span className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Indexed
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setContextOpen(!contextOpen)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 transition-colors"
                    >
                        <FileText size={13} />
                        Context
                        <ChevronDown size={12} className={`transition-transform ${contextOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Context panel (collapsible) */}
            {contextOpen && (
                <div className="flex items-center gap-4 py-3 text-xs text-neutral-400 border-b border-white/[0.04] animate-fade-in">
                    <span className="flex items-center gap-1.5">
                        <GitBranch size={12} /> main
                    </span>
                    <span className="flex items-center gap-1.5">
                        <FileText size={12} /> 482 files indexed
                    </span>
                    <span className="flex items-center gap-1.5 text-accent">
                        <Zap size={12} /> AI memory active
                    </span>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-6">
                <div className="mx-auto max-w-3xl space-y-6">
                    {messages.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-4">
                                <MessageSquare size={20} className="text-accent" />
                            </div>
                            <h2 className="text-lg font-semibold text-white mb-1">Ask about your repository</h2>
                            <p className="text-sm text-neutral-500 max-w-sm">
                                Get instant answers about architecture, auth flows, API routes, dependencies, and more.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${msg.role === 'ai'
                                            ? 'bg-accent/10 text-accent'
                                            : 'bg-white/[0.06] text-neutral-300'
                                        }`}
                                >
                                    {msg.role === 'ai' ? 'AI' : 'U'}
                                </div>

                                {/* Message */}
                                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                    <div
                                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'ai'
                                                ? 'bg-white/[0.04] text-neutral-200'
                                                : 'bg-accent/10 text-white'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                    {msg.meta && (
                                        <span className="mt-1.5 px-1 text-[11px] text-neutral-500">{msg.meta}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Input area */}
            <div className="border-t border-white/[0.04] pt-4 pb-2">
                <div className="mx-auto max-w-3xl">
                    {/* Suggested prompts */}
                    {messages.length <= 2 && (
                        <div className="flex flex-wrap gap-1.5 mb-3 animate-fade-in">
                            {suggestedPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    type="button"
                                    onClick={() => {
                                        setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
                                    }}
                                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 hover:border-white/[0.1] transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask about architecture, APIs, auth flow, pull requests, or debugging..."
                            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 pr-24 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.12] focus:bg-white/[0.04] transition-colors"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                                type="button"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.06] transition-colors"
                            >
                                <Zap size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-30"
                            >
                                <MessageSquare size={14} />
                            </button>
                        </div>
                    </div>
                    <p className="mt-2 text-[11px] text-neutral-500 text-center">
                        AI responses are based on repository context. Verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
}
