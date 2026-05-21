import { AlertTriangle, FileText } from 'lucide-react';

interface FileChange {
    id?: string;
    path: string;
    status: string;
    risk: string | null;
    additions: number;
    deletions: number;
    comments: number;
}

interface FileChangesProps {
    files: FileChange[];
}

const riskIcons: Record<string, typeof AlertTriangle | null> = {
    none: null,
    low: null,
    medium: AlertTriangle,
    high: AlertTriangle,
};

const riskColors: Record<string, string> = {
    none: '',
    low: 'text-amber-400',
    medium: 'text-amber-400',
    high: 'text-red-400',
};

const statusBadge: Record<string, string> = {
    modified: 'text-accent bg-accent/10',
    added: 'text-emerald-400 bg-emerald-400/10',
    deleted: 'text-red-400 bg-red-400/10',
};

export function FileChanges({ files }: FileChangesProps) {
    if (!files || files.length === 0) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-white">Changed Files</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">No files changed</p>
                    </div>
                </div>
            </div>
        );
    }

    const totalAdditions = files.reduce((sum, f) => sum + (f.additions || 0), 0);
    const totalDeletions = files.reduce((sum, f) => sum + (f.deletions || 0), 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Changed Files</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        {files.length} file{files.length !== 1 ? 's' : ''} changed
                        {totalAdditions > 0 && <span className="text-emerald-400 ml-1">+{totalAdditions}</span>}
                        {totalDeletions > 0 && <span className="text-red-400 ml-1">-{totalDeletions}</span>}
                    </p>
                </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04]">
                {files.map((file) => {
                    const RiskIcon = file.risk ? riskIcons[file.risk] || null : null;
                    return (
                        <div key={file.path} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                            <FileText size={14} className="text-neutral-500 shrink-0" />
                            <span className="flex-1 text-sm text-neutral-200 font-mono truncate">{file.path}</span>
                            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${statusBadge[file.status] || 'text-neutral-500 bg-white/[0.04]'}`}>
                                {file.status}
                            </span>
                            {file.additions > 0 && (
                                <span className="text-[11px] text-emerald-400/70">+{file.additions}</span>
                            )}
                            {file.deletions > 0 && (
                                <span className="text-[11px] text-red-400/70">-{file.deletions}</span>
                            )}
                            {RiskIcon && <RiskIcon size={13} className={riskColors[file.risk] || ''} />}
                            {file.comments > 0 && (
                                <span className="text-[11px] text-neutral-500">{file.comments} comments</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
