'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { ActivityInsight, ActivitySuggestion } from '@/lib/types';

interface ActivityInsightsProps {
    insights: ActivityInsight[];
    suggestions: ActivitySuggestion[];
}

export function ActivityInsights({ insights, suggestions }: ActivityInsightsProps) {
    return (
        <motion.aside initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
            <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-[#090b10] p-5 text-sm text-neutral-300">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Contextual insights</p>
                            <h2 className="mt-2 text-lg text-white">System pulse</h2>
                        </div>
                        <Badge variant="success">AI</Badge>
                    </div>

                    <div className="mt-5 space-y-3">
                        {insights.map((insight) => (
                            <div key={insight.title} className="rounded-3xl border border-white/10 bg-[#05080d] p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{insight.title}</p>
                                        <p className="mt-2 text-sm text-neutral-400">{insight.detail}</p>
                                    </div>
                                    <Badge variant={insight.badge === 'Alert' ? 'warning' : insight.badge === 'Good' ? 'success' : 'secondary'}>
                                        {insight.badge}
                                    </Badge>
                                </div>
                                <p className="mt-4 text-3xl font-semibold text-white">{insight.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#090b10] p-5 text-sm text-neutral-300">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Suggested actions</p>
                            <h2 className="mt-2 text-lg text-white">Action items</h2>
                        </div>
                        <Badge variant="secondary">Priority</Badge>
                    </div>

                    <div className="mt-5 space-y-3">
                        {suggestions.map((item) => (
                            <div key={item.title} className="rounded-3xl border border-white/10 bg-[#05080d] p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{item.title}</p>
                                        <p className="mt-2 text-sm text-neutral-400">{item.description}</p>
                                    </div>
                                    <Button variant="ghost" className="h-10 rounded-2xl border border-white/10 px-4 text-xs uppercase tracking-[0.16em] text-white/80 hover:text-white">
                                        {item.action}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}
