import { AlertTriangle, FileText, Info, Search, XCircle } from 'lucide-react';

interface LogEntry {
    timestamp: string;
    level: 'error' | 'warn' | 'info';
    message: string;
    source: string;
}

const logs: LogEntry[] = [
    { timestamp: '12:15:02', level: 'error', message: 'GET /api/scan - 502 upstream connection timeout', source: 'api-gateway' },
    { timestamp: '12:14:54', level: 'warn', message: 'Connection pool at 92% capacity — queuing requests', source: 'database' },
    { timestamp: '12:14:20', level: 'error', message: 'POST /api/parse - 504 gateway timeout after 30s', source: 'api-gateway' },
    { timestamp: '12:13:45', level: 'info', message: 'Worker pool scaled from 4 to 8 instances', source: 'orchestrator' },
    { timestamp: '12:13:10', level: 'warn', message: 'Average latency exceeded 500ms threshold', source: 'monitoring' },
    { timestamp: '12:12:30', level: 'error', message: 'GET /api/auth/validate - 503 service unavailable', source: 'auth-service' },
];

const levelConfig = {
    error: { icon: XCircle, class: 'text-red-400' },
    warn: { icon: AlertTriangle, class: 'text-amber-400' },
    info: { icon: Info, class: 'text-neutral-400' },
};

export function LogViewer() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Logs & Traces</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Recent error events across services</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors"
                    >
                        Filter
                    </button>
                    <button
                        type="button"
                        className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors"
                    >
                        Export
                    </button>
                </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04]">
                {logs.map((log, i) => {
                    const config = levelConfig[log.level];
                    const Icon = config.icon;
                    return (
                        <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors font-mono text-xs">
                            <Icon size={12} className={`shrink-0 mt-0.5 ${config.class}`} />
                            <span className="text-neutral-500 shrink-0 w-14">{log.timestamp}</span>
                            <span className={`shrink-0 w-10 text-[10px] font-medium uppercase ${config.class}`}>{log.level}</span>
                            <span className="flex-1 text-neutral-300">{log.message}</span>
                            <span className="text-neutral-500 shrink-0 hidden sm:inline">{log.source}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
