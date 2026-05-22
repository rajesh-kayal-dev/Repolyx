'use client';

import { FileText, GitCommit, Package, Server } from 'lucide-react';
import { DebugIncident } from '@/lib/types';

interface TechnicalDetailsProps {
    incident: DebugIncident;
    beginnerMode: boolean;
}

export function TechnicalDetails({ incident, beginnerMode }: TechnicalDetailsProps) {
    const files = incident.affectedFiles || [];
    const commits = incident.relatedCommits || [];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">
                        {beginnerMode ? 'Where to Look' : 'Technical Details'}
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        {beginnerMode ? 'Files and changes related to this problem' : 'Root cause context'}
                    </p>
                </div>
            </div>

            {/* Deploy version */}
            {incident.deployVersion && (
                <div className="mb-4">
                    <p className="text-xs text-neutral-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Package size={10} />
                        Deployment
                    </p>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                        <span className="text-xs font-mono text-neutral-300">{incident.deployVersion}</span>
                        {incident.service && (
                            <span className="ml-2 text-xs text-neutral-500">· {incident.service}</span>
                        )}
                    </div>
                </div>
            )}

            {/* Affected files */}
            {files.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-neutral-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <FileText size={10} />
                        {beginnerMode ? 'Files to check' : 'Affected files'}
                    </p>
                    <div className="space-y-1">
                        {files.map((file) => (
                            <div
                                key={file}
                                className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04] transition-colors cursor-pointer"
                            >
                                <FileText size={11} className="text-neutral-500 shrink-0" />
                                <span className="text-xs font-mono text-neutral-300 truncate">{file}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Related commits */}
            {commits.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-neutral-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <GitCommit size={10} />
                        {beginnerMode ? 'Recent changes' : 'Related commits'}
                    </p>
                    <div className="space-y-1">
                        {commits.map((commit, i) => (
                            <div
                                key={i}
                                className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
                            >
                                <p className="text-xs text-neutral-300 truncate">{commit.message}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-mono text-neutral-600">{commit.sha?.slice(0, 7)}</span>
                                    {commit.author && (
                                        <span className="text-[10px] text-neutral-600">· {commit.author}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Service info */}
            {incident.service && (
                <div>
                    <p className="text-xs text-neutral-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Server size={10} />
                        {beginnerMode ? 'Broken service' : 'Affected service'}
                    </p>
                    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                        <span className="text-xs font-mono text-neutral-300">{incident.service}</span>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {files.length === 0 && commits.length === 0 && !incident.deployVersion && !incident.service && (
                <p className="text-xs text-neutral-600 text-center py-4">
                    No technical context identified yet.
                </p>
            )}
        </div>
    );
}
