'use client';

import { useState } from 'react';
import { CheckCircle2, ExternalLink, FileText, Github, MessageSquare, Shield, Zap } from 'lucide-react';
import { DebugIncident } from '@/lib/types';
import { api } from '@/lib/api-client';

interface RecommendedFixCardProps {
    incident: DebugIncident;
}

const riskConfig = {
    low: { label: 'Low risk', class: 'text-emerald-400 bg-emerald-400/10' },
    medium: { label: 'Medium risk', class: 'text-amber-400 bg-amber-400/10' },
    high: { label: 'High risk', class: 'text-red-400 bg-red-400/10' },
};

export function RecommendedFixCard({ incident }: RecommendedFixCardProps) {
    const [creatingIssue, setCreatingIssue] = useState(false);
    const [issueUrl, setIssueUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const risk = riskConfig[incident.riskLevel as keyof typeof riskConfig] || riskConfig.medium;

    const handleCreateIssue = async () => {
        setCreatingIssue(true);
        setError(null);
        try {
            const res = await api.debug.incidents.createGitHubIssue(incident.id);
            setIssueUrl(res.issueUrl);
        } catch (err: any) {
            setError(err.message || 'Failed to create GitHub issue');
        } finally {
            setCreatingIssue(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Zap size={14} className="text-emerald-400" />
                        Recommended Fix
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">AI-generated action plan</p>
                </div>
                <div className="flex items-center gap-2">
                    {incident.riskLevel && (
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${risk.class}`}>
                            {risk.label}
                        </span>
                    )}
                    {incident.aiConfidence > 0 && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                            {incident.aiConfidence}% confidence
                        </span>
                    )}
                </div>
            </div>

            {/* Fix content */}
            <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4 mb-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10 shrink-0 mt-0.5">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                    </div>
                    <div className="w-full">
                        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-3">
                            What to do
                        </p>
                        {incident.aiRecommendations && incident.aiRecommendations.length > 0 ? (
                            <ul className="space-y-2">
                                {incident.aiRecommendations.map((rec, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-neutral-200">
                                        <span className="text-emerald-400/50 mt-0.5">•</span>
                                        <span className="leading-relaxed">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-neutral-200 leading-relaxed">
                                {incident.aiFixSuggestion || "No specific fix recommended."}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Affected files */}
            {incident.affectedFiles && incident.affectedFiles.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1.5">
                        <FileText size={11} />
                        Files to check
                    </p>
                    <div className="space-y-1">
                        {incident.affectedFiles.map((file) => (
                            <div
                                key={file}
                                className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04] transition-colors"
                            >
                                <FileText size={11} className="text-neutral-500 shrink-0" />
                                <span className="text-xs font-mono text-neutral-300 truncate">{file}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mb-3 rounded-lg border border-red-400/20 bg-red-400/[0.05] px-3 py-2">
                    <p className="text-xs text-red-400">{error}</p>
                </div>
            )}

            {/* GitHub issue success */}
            {issueUrl && (
                <div className="mb-3 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.05] px-3 py-2 flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <a
                        href={issueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                        GitHub issue created
                        <ExternalLink size={10} />
                    </a>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={handleCreateIssue}
                    disabled={creatingIssue || !!issueUrl}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Github size={12} />
                    {creatingIssue ? 'Creating…' : issueUrl ? 'Issue Created' : 'Create GitHub Issue'}
                </button>
                <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-400 hover:bg-amber-400/20 transition-colors"
                >
                    <Zap size={12} />
                    Apply with AI
                </button>
            </div>
        </div>
    );
}
