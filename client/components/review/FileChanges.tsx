import { AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

interface FileChange {
    path: string;
    status: 'modified' | 'added' | 'deleted';
    risk: 'none' | 'low' | 'medium' | 'high';
    comments: number;
}

const files: FileChange[] = [
    { path: 'src/parser.ts', status: 'modified', risk: 'medium', comments: 3 },
    { path: 'src/utils/validator.ts', status: 'modified', risk: 'low', comments: 1 },
    { path: 'src/api/handler.ts', status: 'modified', risk: 'none', comments: 0 },
    { path: 'src/types/index.ts', status: 'added', risk: 'none', comments: 0 },
    { path: 'tests/parser.test.ts', status: 'added', risk: 'none', comments: 2 },
];

const riskIcons = {
    none: null,
    low: null,
    medium: AlertTriangle,
    high: AlertTriangle,
};

const riskColors = {
    none: '',
    low: 'text-amber-400',
    medium: 'text-amber-400',
    high: 'text-red-400',
};

const statusBadge = {
    modified: 'text-accent bg-accent/10',
    added: 'text-emerald-400 bg-emerald-400/10',
    deleted: 'text-red-400 bg-red-400/10',
};

export function FileChanges() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Changed Files</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">{files.length} files changed across 3 commits</p>
                </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04]">
                {files.map((file) => {
                    const RiskIcon = riskIcons[file.risk];
                    return (
                        <div key={file.path} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                            <FileText size={14} className="text-neutral-500 shrink-0" />
                            <span className="flex-1 text-sm text-neutral-200 font-mono">{file.path}</span>
                            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${statusBadge[file.status]}`}>
                                {file.status}
                            </span>
                            {RiskIcon && <RiskIcon size={13} className={riskColors[file.risk]} />}
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
