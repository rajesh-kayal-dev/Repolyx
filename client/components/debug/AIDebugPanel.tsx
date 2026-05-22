'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, Lightbulb, MessageSquare, Send, Sparkles, Zap } from 'lucide-react';
import { DebugIncident } from '@/lib/types';
import { api } from '@/lib/api-client';

interface AIExplanationCardProps {
    incident: DebugIncident;
    beginnerMode: boolean;
    analyzing: boolean;
    onAnalyze: () => void;
}

const QUICK_QUESTIONS = [
    'Why did this happen?',
    'Which file should I check first?',
    'Which deployment caused this?',
    'Can AI fix this automatically?',
];

export function AIExplanationCard({ incident, beginnerMode, analyzing, onAnalyze }: AIExplanationCardProps) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [asking, setAsking] = useState(false);

    const hasAnalysis = !!incident.aiExplanation;

    const handleAsk = async (q: string) => {
        const trimmed = q.trim();
        if (!trimmed || asking) return;
        setAsking(true);
        setAnswer('');
        try {
            const res = await api.debug.incidents.ask(incident.id, trimmed);
            setAnswer(res.answer);
        } catch {
            setAnswer('Could not connect to AI. Please try again.');
        } finally {
            setAsking(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAsk(question);
        setQuestion('');
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400" />
                        AI Explanation
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        {beginnerMode ? 'Plain English — no tech jargon' : 'Technical root cause analysis'}
                    </p>
                </div>
                {incident.aiConfidence > 0 && (
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                        {incident.aiConfidence}% confidence
                    </span>
                )}
            </div>

            {/* AI Explanation block */}
            {hasAnalysis ? (
                <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.03] p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10 shrink-0 mt-0.5">
                            <Lightbulb size={13} className="text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">
                                What happened
                            </p>
                            <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
                                {incident.aiExplanation}
                            </p>

                            {/* Developer-mode extras */}
                            {!beginnerMode && incident.affectedFiles && incident.affectedFiles.length > 0 && (
                                <div className="mt-3 flex items-center gap-3 text-xs">
                                    <span className="text-neutral-500 flex items-center gap-1">
                                        <FileText size={11} />
                                        {incident.affectedFiles.length} file{incident.affectedFiles.length !== 1 ? 's' : ''} affected
                                    </span>
                                    {incident.riskLevel && (
                                        <span className={`flex items-center gap-1 ${
                                            incident.riskLevel === 'high' ? 'text-red-400' :
                                            incident.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                                        }`}>
                                            <AlertTriangle size={11} />
                                            {incident.riskLevel} risk
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : analyzing ? (
                /* Loading skeleton */
                <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.03] p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-lg bg-amber-400/10 shrink-0 animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-24 bg-white/[0.06] rounded animate-pulse" />
                            <div className="h-3 w-full bg-white/[0.04] rounded animate-pulse" />
                            <div className="h-3 w-4/5 bg-white/[0.04] rounded animate-pulse" />
                            <div className="h-3 w-3/5 bg-white/[0.04] rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            ) : (
                /* No analysis yet */
                <div className="rounded-xl border border-dashed border-white/[0.08] p-6 mb-4 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 mx-auto mb-3">
                        <Zap size={18} className="text-amber-400" />
                    </div>
                    <p className="text-sm font-medium text-neutral-300 mb-1">No AI analysis yet</p>
                    <p className="text-xs text-neutral-500 mb-3">
                        {beginnerMode
                            ? 'Let AI explain what went wrong in plain English'
                            : 'Run AI analysis to identify root cause and generate a fix'}
                    </p>
                    <button
                        type="button"
                        onClick={onAnalyze}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-400/20 transition-colors"
                    >
                        <Sparkles size={13} />
                        Run AI Analysis
                    </button>
                </div>
            )}

            {/* Quick questions */}
            {hasAnalysis && (
                <div className="mb-3">
                    <p className="text-xs text-neutral-500 mb-2">Ask AI about this incident</p>
                    <div className="flex flex-wrap gap-1.5">
                        {QUICK_QUESTIONS.map((q) => (
                            <button
                                key={q}
                                type="button"
                                onClick={() => handleAsk(q)}
                                disabled={asking}
                                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 hover:border-white/[0.1] transition-colors disabled:opacity-50"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Answer */}
            {(answer || asking) && (
                <div className="rounded-xl border border-accent/10 bg-accent/[0.03] p-4 mb-3">
                    <div className="flex items-start gap-2">
                        <MessageSquare size={13} className="text-accent shrink-0 mt-0.5" />
                        {asking ? (
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-full bg-white/[0.04] rounded animate-pulse" />
                                <div className="h-3 w-4/5 bg-white/[0.04] rounded animate-pulse" />
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-300 leading-relaxed">{answer}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Custom question input */}
            {hasAnalysis && (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask anything about this incident…"
                        className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.12] focus:bg-white/[0.05] transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!question.trim() || asking}
                        className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={11} />
                        Ask
                    </button>
                </form>
            )}
        </div>
    );
}
