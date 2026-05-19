interface RepoSummaryProps {
    stack: string;
    status: string;
    files: number;
    dependencies: number;
    apis: number;
    lastSync: string;
    size: string;
}

const items = [
    { label: 'Tech stack', key: 'stack' },
    { label: 'Frameworks', key: 'frameworks' },
    { label: 'APIs', key: 'apis' },
    { label: 'Last sync', key: 'lastSync' },
    { label: 'Repo size', key: 'size' },
    { label: 'Indexing', key: 'status' },
] as const;

export function RepoSummary(props: RepoSummaryProps) {
    const values: Record<string, string> = {
        stack: props.stack,
        frameworks: 'Next.js, Express',
        apis: `${props.apis} endpoints`,
        lastSync: props.lastSync,
        size: props.size,
        status: props.status,
    };

    return (
        <div>
            <h2 className="text-sm font-semibold text-white mb-3">About</h2>
            <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04]">
                {items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs text-neutral-500">{item.label}</span>
                        <span className="text-xs text-neutral-300">{values[item.key]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
