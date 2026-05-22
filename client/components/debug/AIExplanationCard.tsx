'use client';

import { useState } from 'react';
import { AlertTriangle, FileText, Lightbulb, MessageSquare, Send, Sparkles, Loader2 } from 'lucide-react';
import { DebugIncident } from '@/lib/types';
import { api } from '@/lib/api-client';

interface AIExplanationCardProps {
    incident: DebugIncident;
    beginnerMode: boolean;
}

const QUICK_QUESTIONS = [
    'Why did this happen?',
    'Which file should I check first?',
    'Which commit caused this?',
    'Can you explain the fix in more detail?',
];

export function AIExplanationCard({ incident, beginnerMode }: AIExplanationCardProps) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [asking, setAsking] = useState(false);

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
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                        {incident.aiConfidence}% confidence
                    </span>
                )}
            </div>

            {/* AI Explanation block */}
            <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.03] p-4 mb-4 space-y-6">
                
                {/* Summary Section */}
                <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10 shrink-0 mt-0.5 border border-amber-400/20">
                        <Lightbulb size={13} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">
                            {beginnerMode ? 'What Happened' : 'Executive Summary'}
                        </p>
                        <p className="text-sm text-neutral-200 leading-relaxed">
                            {incident.aiSummary || incident.aiExplanation || "Analysis complete but no summary provided."}
                        </p>
                    </div>
                </div>

                {/* Problem Section */}
                {incident.aiProblem && (
                    <div className="flex items-start gap-3 border-t border-amber-400/10 pt-4">
                        <div className="flex-1 min-w-0 pl-10">
                            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">
                                {beginnerMode ? 'The Core Issue' : 'Technical Problem Details'}
                            </p>
                            <p className="text-sm text-neutral-300 leading-relaxed">
                                {incident.aiProblem}
                            </p>
                        </div>
                    </div>
                )}

                {/* Impact Section */}
                {incident.aiImpact && (
                    <div className="flex items-start gap-3 border-t border-amber-400/10 pt-4">
                        <div className="flex-1 min-w-0 pl-10">
                            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">
                                {beginnerMode ? 'Why It Matters' : 'System Impact'}
                            </p>
                            <p className="text-sm text-neutral-300 leading-relaxed">
                                {incident.aiImpact}
                            </p>
                        </div>
                    </div>
                )}

                {/* Developer-mode extras */}
                {!beginnerMode && incident.affectedFiles && incident.affectedFiles.length > 0 && (
                    <div className="flex items-center gap-3 text-xs border-t border-amber-400/10 pt-4 pl-10">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                            <FileText size={12} className="text-neutral-500" />
                            {incident.affectedFiles.length} file{incident.affectedFiles.length !== 1 ? 's' : ''} affected
                        </span>
                        {incident.riskLevel && (
                            <span className={`flex items-center gap-1.5 ${
                                incident.riskLevel === 'high' ? 'text-red-400' :
                                incident.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                                <AlertTriangle size={12} />
                                {incident.riskLevel} severity
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Q&A section */}
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {QUICK_QUESTIONS.map(q => (
                        <button
                            key={q}
                            onClick={() => handleAsk(q)}
                            disabled={asking}
                            className="text-xs bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] text-neutral-300 px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
                        >
                            {q}
                        </button>
                    ))}
                </div>

                {answer && (
                    <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 flex gap-3">
                        <MessageSquare size={14} className="text-accent mt-0.5 shrink-0" />
                        <p className="text-sm text-neutral-200">{answer}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask the AI a specific question..."
                        className="w-full bg-[#080b12] border border-white/[0.06] rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/[0.1] focus:border-white/[0.1] transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!question.trim() || asking}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500 hover:text-white disabled:opacity-50 transition-colors"
                    >
                        {asking ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
