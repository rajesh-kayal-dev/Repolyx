'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { Code, Cpu, MessageSquare } from 'lucide-react';
import type { AIAssistantEvent, AIAssistantMessage } from '@/lib/types';

interface AIAssistantPanelProps {
    events: AIAssistantEvent[];
    messages: AIAssistantMessage[];
    prompts: string[];
}

export function AIAssistantPanel({ events, messages, prompts }: AIAssistantPanelProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <Card className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">AI assistant</p>
                        <h3 className="mt-2 text-xl text-white">Contextual insights</h3>
                    </div>
                    <Badge>Live</Badge>
                </div>

                <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`rounded-3xl border border-white/10 p-4 ${message.role === 'assistant' ? 'bg-[#071012]' : 'bg-[#0f172a]'}`}>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                                <span>{message.role === 'assistant' ? 'Assistant' : 'You'}</span>
                                <span>•</span>
                                <span>{message.context}</span>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-neutral-300">{message.text}</p>
                            {message.code && (
                                <pre className="mt-4 overflow-x-auto rounded-3xl border border-white/10 bg-[#02050a] p-4 text-xs font-mono text-neutral-200">
                                    <code>{message.code}</code>
                                </pre>
                            )}
                        </div>
                    ))}
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#090b10] p-4 text-sm text-neutral-300">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">Suggested prompts</p>
                    <div className="grid gap-3">
                        {prompts.map((prompt) => (
                            <Button key={prompt} variant="ghost" className="justify-start text-left text-sm text-neutral-200 hover:text-white">
                                <MessageSquare size={16} className="text-cyan-300" />
                                <span>{prompt}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 text-sm text-neutral-400">
                    <div className="flex items-center justify-between gap-3 text-white">
                        <span className="font-medium">Repository memory</span>
                        <Badge variant="muted">Updated</Badge>
                    </div>
                    <div className="space-y-2 rounded-3xl border border-white/10 bg-[#090b10] p-4 text-sm text-neutral-400">
                        {events.map((event) => (
                            <div key={event.id} className="flex items-center gap-3">
                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
                                <p>{event.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
