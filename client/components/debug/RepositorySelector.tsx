import { Code2, ArrowRight, Server, ShieldAlert, CheckCircle2, GitBranch, Box, Plus } from 'lucide-react';
import { RepoHealthSummary } from '@/lib/types';
import { useImportRepo } from '@/lib/import-repo-context';

interface RepositorySelectorProps {
    repositories: RepoHealthSummary[];
    onSelect: (repoId: string) => void;
    loading: boolean;
}

export function RepositorySelector({ repositories, onSelect, loading }: RepositorySelectorProps) {
    const { openImportRepo } = useImportRepo();
    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 rounded-xl border border-white/[0.06] bg-white/[0.02] animate-pulse" />
                ))}
            </div>
        );
    }

    if (repositories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-6">
                    <Server className="w-8 h-8 text-neutral-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Repositories Imported</h3>
                <p className="text-sm text-neutral-400 max-w-md mb-6">
                    You need to import a repository before the Debug Assistant can scan it for issues.
                </p>
                <button onClick={openImportRepo} className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
                    Import Repository
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Select a Repository</h2>
                    <p className="text-sm text-neutral-400 mt-1">Choose a repository to scan for potential issues, misconfigurations, and bugs.</p>
                </div>
                <button 
                    onClick={openImportRepo} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-sm font-medium text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Import Repository
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {repositories.map(repo => (
                    <button
                        key={repo.id}
                        onClick={() => onSelect(repo.id)}
                        className="group flex flex-col text-left rounded-xl border border-white/[0.06] bg-[#080b12] p-5 hover:border-white/[0.12] transition-colors"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 rounded-lg bg-white/[0.04]">
                                <Code2 className="w-5 h-5 text-neutral-400" />
                            </div>
                            {repo.healthScore === 'Clean' ? (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Clean
                                </span>
                            ) : repo.healthScore === 'Warning' ? (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20">
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    Warning
                                </span>
                            ) : repo.healthScore === 'Critical' ? (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-red-400 bg-red-400/10 border border-red-400/20">
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    Critical
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-neutral-400 bg-white/[0.04] border border-white/[0.08]">
                                    Not Scanned
                                </span>
                            )}
                        </div>

                        <div className="flex-1">
                            <h3 className="font-medium text-neutral-200 mb-1 truncate">{repo.name}</h3>
                            <p className="text-xs text-neutral-500 mb-4 truncate">{repo.fullName}</p>
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mb-4">
                                <span className="flex items-center gap-1">
                                    <GitBranch className="w-3.5 h-3.5" />
                                    {repo.branchCount || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Box className="w-3.5 h-3.5" />
                                    {repo.dependencyCount || 0}
                                </span>
                                {repo.incidentCount > 0 && (
                                    <span className="flex items-center gap-1 text-amber-400/80">
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        {repo.incidentCount} active issues
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-white/[0.06]">
                            <div className="text-[11px] text-neutral-500">
                                {repo.lastScanAt ? `Last scan: ${repo.scanDuration ? repo.scanDuration + 'ms' : new Date(repo.lastScanAt).toLocaleDateString()}` : 'Never scanned'}
                            </div>
                            <div className="flex items-center text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                                Scan <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
