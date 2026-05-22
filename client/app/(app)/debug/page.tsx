'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useRepositories } from '@/lib/use-repositories';
import { DebugIncident, RepoHealthSummary, DebugLog } from '@/lib/types';
import { DebugHeader } from '@/components/debug/DebugHeader';
import { RepositorySelector } from '@/components/debug/RepositorySelector';
import { ScanProgress } from '@/components/debug/ScanProgress';
import { AIExplanationCard } from '@/components/debug/AIExplanationCard';
import { RecommendedFixCard } from '@/components/debug/RecommendedFixCard';
import { TechnicalDetails } from '@/components/debug/TechnicalDetails';
import { DetectedIssues } from '@/components/debug/DetectedIssues';
import { CollapsibleLogs } from '@/components/debug/CollapsibleLogs';
import { ScanHistory } from '@/components/debug/ScanHistory';

export type ScanLifecycleState = 'idle' | 'queued' | 'scanning' | 'analyzing' | 'completed' | 'failed';

export default function DebugPage() {
    const router = useRouter();
    const { repositories, isLoading: loadingRepos, refresh } = useRepositories();
    const [scanState, setScanState] = useState<ScanLifecycleState>('idle');
    const [selectedRepo, setSelectedRepo] = useState<RepoHealthSummary | null>(null);
    const [incidents, setIncidents] = useState<DebugIncident[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<DebugIncident | null>(null);
    const [logs, setLogs] = useState<DebugLog[]>([]);
    
    const [beginnerMode, setBeginnerMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('debug-mode') !== 'developer';
        }
        return true;
    });

    useEffect(() => {
        localStorage.setItem('debug-mode', beginnerMode ? 'beginner' : 'developer');
    }, [beginnerMode]);

    useEffect(() => {
        if (!loadingRepos && repositories.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const scanRepoId = params.get('scanRepoId');
            if (scanRepoId && scanState === 'idle') {
                const repo = repositories.find(r => r.id === scanRepoId);
                if (repo) {
                    handleSelectRepo(repo.id);
                    // Remove query parameter cleanly
                    router.replace('/debug');
                }
            }
        }
    }, [loadingRepos, repositories, scanState, router]);

    const loadLogs = useCallback(async (incidentId: string) => {
        try {
            const res = await api.debug.logs.list({ incidentId });
            setLogs(res.logs);
        } catch (err) {
            console.error('Failed to load logs', err);
            setLogs([]);
        }
    }, []);

    useEffect(() => {
        if (selectedIncident) {
            loadLogs(selectedIncident.id);
        } else {
            setLogs([]);
        }
    }, [selectedIncident, loadLogs]);

    const handleSelectRepo = async (repoId: string) => {
        if (scanState === 'scanning' || scanState === 'analyzing') return; // Queue protection
        
        const repo = repositories.find(r => r.id === repoId) || null;
        setSelectedRepo(repo);
        setScanState('scanning');
        
        try {
            // Wait for brief progress UI
            await new Promise(r => setTimeout(r, 1000));
            setScanState('analyzing');
            
            const res = await api.debug.scan(repoId);
            setIncidents(res.incidents);
            if (res.incidents.length > 0) {
                setSelectedIncident(res.incidents[0]);
            } else {
                setSelectedIncident(null);
            }
            setScanState('completed');
            refresh();
        } catch (err) {
            console.error('Scan failed', err);
            setIncidents([]);
            setSelectedIncident(null);
            setScanState('failed');
        }
    };

    const handleScanAnother = () => {
        setScanState('idle');
        setSelectedRepo(null);
        setIncidents([]);
        setSelectedIncident(null);
    };

    return (
        <div className="space-y-6 pb-8">
            <DebugHeader
                beginnerMode={beginnerMode}
                onToggleMode={() => setBeginnerMode(m => !m)}
                onScanAnother={handleScanAnother}
                showScanButton={scanState === 'completed' || scanState === 'failed'}
            />

            {(scanState === 'idle' || scanState === 'failed') && (
                <RepositorySelector 
                    repositories={repositories} 
                    onSelect={handleSelectRepo} 
                    loading={loadingRepos} 
                />
            )}

            {(scanState === 'scanning' || scanState === 'analyzing') && selectedRepo && (
                <ScanProgress 
                    repositoryName={selectedRepo.name.split('/').pop() || selectedRepo.name} 
                    scanState={scanState}
                />
            )}

            {scanState === 'completed' && (
                <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                    {/* LEFT: Findings & AI */}
                    <div className="space-y-5 min-w-0">
                        {/* Auto-detected issues list */}
                        <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                            <DetectedIssues
                                incidents={incidents}
                                selectedId={selectedIncident?.id}
                                onSelect={setSelectedIncident}
                                beginnerMode={beginnerMode}
                            />
                        </div>

                        {/* AI Explanation */}
                        {selectedIncident && (
                            <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                                <AIExplanationCard
                                    incident={selectedIncident}
                                    beginnerMode={beginnerMode}
                                />
                            </div>
                        )}

                        {/* Recommended Fix */}
                        {selectedIncident?.aiFixSuggestion && (
                            <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                                <RecommendedFixCard incident={selectedIncident} />
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Technical Context */}
                    <div className="space-y-5">
                        <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                            <ScanHistory 
                                repository={selectedRepo!}
                                totalIncidents={incidents.length}
                            />
                        </div>

                        {selectedIncident && (
                            <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                                <TechnicalDetails
                                    incident={selectedIncident}
                                    beginnerMode={beginnerMode}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Logs - available in results state */}
            {scanState === 'completed' && (
                <div className="rounded-xl border border-white/[0.06] bg-[#080b12] mt-6">
                    <CollapsibleLogs
                        logs={logs}
                        incidentId={selectedIncident?.id}
                        beginnerMode={beginnerMode}
                        onLogsUpdated={() => selectedIncident && loadLogs(selectedIncident.id)}
                    />
                </div>
            )}
        </div>
    );
}
