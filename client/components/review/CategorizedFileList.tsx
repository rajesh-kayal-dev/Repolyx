import { useState } from 'react';
import { FileCode, Braces, BookOpen, Wrench, ChevronDown, ChevronRight, FileText } from 'lucide-react';

interface FileItem {
    id?: string;
    path: string;
    status: string;
    additions: number;
    deletions: number;
    risk?: string | null;
}

interface CategoryConfig {
    label: string;
    icon: any;
    color: string;
    bg: string;
    pattern: RegExp;
}

const CATEGORIES: CategoryConfig[] = [
    { label: 'Frontend', icon: Braces, color: 'text-accent', bg: 'bg-accent/10', pattern: /\.(tsx|jsx|css|scss|sass)$/i },
    { label: 'Backend', icon: FileCode, color: 'text-emerald-400', bg: 'bg-emerald-400/10', pattern: /\.(js|ts|py|go|rb|java|rs|php)$/i },
    { label: 'Config', icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-400/10', pattern: /\.(json|ya?ml|toml|env\w*)$/i },
    { label: 'Docs', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10', pattern: /\.(md|mdx)$/i },
];

function categorizeFile(path: string): CategoryConfig {
    for (const cat of CATEGORIES) {
        if (cat.pattern.test(path)) return cat;
    }
    if (/^src\//.test(path) || /^app\//.test(path) || /^components\//.test(path)) return CATEGORIES[0];
    if (/^server\//.test(path) || /^api\//.test(path) || /^controllers?\//.test(path) || /^services?\//.test(path) || /^routes\//.test(path) || /^lib\//.test(path) || /^utils?\//.test(path)) return CATEGORIES[1];
    if (/^config\//.test(path) || /Dockerfile/.test(path) || /\.(conf|cfg|ini)$/i.test(path)) return CATEGORIES[2];
    if (/^docs\//.test(path) || /README/i.test(path)) return CATEGORIES[3];
    return { label: 'Other', icon: FileText, color: 'text-neutral-400', bg: 'bg-white/[0.04]', pattern: /.*/ };
}

const statusBadge: Record<string, string> = {
    modified: 'text-accent bg-accent/10',
    added: 'text-emerald-400 bg-emerald-400/10',
    deleted: 'text-red-400 bg-red-400/10',
};

interface CategorizedFileListProps {
    files: FileItem[];
}

export function CategorizedFileList({ files }: CategorizedFileListProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Frontend', 'Backend', 'Config', 'Docs', 'Other']));

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

    const groups = new Map<string, FileItem[]>();
    files.forEach(f => {
        const cat = categorizeFile(f.path);
        if (!groups.has(cat.label)) groups.set(cat.label, []);
        groups.get(cat.label)!.push(f);
    });

    const totalAdditions = files.reduce((sum, f) => sum + (f.additions || 0), 0);
    const totalDeletions = files.reduce((sum, f) => sum + (f.deletions || 0), 0);

    const toggleCategory = (label: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(label)) next.delete(label);
            else next.add(label);
            return next;
        });
    };

    const groupEntries = CATEGORIES.filter(c => groups.has(c.label));

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

            {groupEntries.map((cat) => {
                const catFiles = groups.get(cat.label)!;
                const Icon = cat.icon;
                const isExpanded = expandedCategories.has(cat.label);
                return (
                    <div key={cat.label} className="rounded-xl border border-white/[0.06] mb-2 overflow-hidden">
                        <button
                            onClick={() => toggleCategory(cat.label)}
                            className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className={`flex h-6 w-6 items-center justify-center rounded-md ${cat.bg}`}>
                                <Icon size={12} className={cat.color} />
                            </div>
                            <span className="text-xs font-medium text-neutral-300">{cat.label}</span>
                            <span className="text-[11px] text-neutral-500">{catFiles.length} file{catFiles.length !== 1 ? 's' : ''}</span>
                            <div className="flex-1" />
                            {isExpanded ? <ChevronDown size={13} className="text-neutral-600" /> : <ChevronRight size={13} className="text-neutral-600" />}
                        </button>
                        {isExpanded && (
                            <div className="divide-y divide-white/[0.03] border-t border-white/[0.04]">
                                {catFiles.map((file) => (
                                    <div key={file.path} className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.02] transition-colors">
                                        <FileText size={13} className="text-neutral-600 shrink-0" />
                                        <span className="flex-1 text-xs text-neutral-200 font-mono truncate">{file.path}</span>
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusBadge[file.status] || 'text-neutral-500 bg-white/[0.04]'}`}>
                                            {file.status}
                                        </span>
                                        {file.additions > 0 && (
                                            <span className="text-[11px] text-emerald-400/70">+{file.additions}</span>
                                        )}
                                        {file.deletions > 0 && (
                                            <span className="text-[11px] text-red-400/70">-{file.deletions}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
