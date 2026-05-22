import { DebugIncident } from '@/lib/types';
import { AlertCircle, FileCode, CheckCircle2, Shield, Settings, GitCommit, Search } from 'lucide-react';

interface DetectedIssuesProps {
    incidents: DebugIncident[];
    selectedId?: string;
    onSelect: (incident: DebugIncident) => void;
    onDelete?: (id: string) => void;
    beginnerMode?: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
    high: AlertCircle,
    medium: Shield,
    low: Settings,
    critical: AlertCircle,
};

const getBeginnerTitle = (originalTitle: string) => {
    const lower = originalTitle.toLowerCase();
    if (lower.includes('dependency') || lower.includes('package')) return 'Package Problem';
    if (lower.includes('env') || lower.includes('config')) return 'Configuration Issue';
    if (lower.includes('type') || lower.includes('syntax')) return 'Code Error';
    if (lower.includes('security')) return 'Security Risk';
    if (lower.includes('test')) return 'Missing Tests';
    return 'Application Issue';
};

export function DetectedIssues({ incidents, selectedId, onSelect, onDelete, beginnerMode }: DetectedIssuesProps) {
    if (incidents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-sm font-medium text-white mb-1">0 Issues Found</h3>
                <p className="text-xs text-neutral-500 max-w-[200px]">
                    The AI scan found no major bugs or misconfigurations.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-semibold text-white">Detected Issues</h2>
                <span className="text-xs text-neutral-500">{incidents.length} found</span>
            </div>

            <div className="space-y-2">
                {incidents.map((incident) => {
                    const isSelected = selectedId === incident.id;
                    const Icon = CATEGORY_ICONS[incident.severity] || Search;
                    
                    return (
                        <button
                            key={incident.id}
                            onClick={() => onSelect(incident)}
                            className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                                isSelected 
                                    ? 'bg-white/[0.06] border-white/[0.1]' 
                                    : 'bg-transparent border-transparent hover:bg-white/[0.02]'
                            }`}
                        >
                            <div className={`mt-0.5 p-1.5 rounded-md ${
                                incident.severity === 'high' ? 'bg-red-400/10 text-red-400' :
                                incident.severity === 'medium' ? 'bg-amber-400/10 text-amber-400' :
                                'bg-neutral-400/10 text-neutral-400'
                            }`}>
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-medium truncate mb-1 ${isSelected ? 'text-white' : 'text-neutral-200'}`}>
                                    {beginnerMode ? getBeginnerTitle(incident.title) : incident.title}
                                </h3>
                                <p className="text-xs text-neutral-500 line-clamp-1 mb-2">
                                    {incident.impactStatement}
                                </p>
                                
                                <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                                    {incident.affectedFiles && incident.affectedFiles.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <FileCode className="w-3 h-3" />
                                            {incident.affectedFiles.length} file{incident.affectedFiles.length !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                    {incident.relatedCommits && incident.relatedCommits.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <GitCommit className="w-3 h-3" />
                                            {incident.relatedCommits.length} commit{incident.relatedCommits.length !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
