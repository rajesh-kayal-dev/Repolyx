import { AlertTriangle, Bell, CheckCircle2, FileText, TerminalSquare } from 'lucide-react';

const alerts = [
    { label: 'Auth flow flagged for review', severity: 'high', type: 'security' },
    { label: 'Dependency risk: axios 1.4.0', severity: 'medium', type: 'dependency' },
    { label: 'API latency above threshold', severity: 'low', type: 'performance' },
];

const severityColors: Record<string, string> = {
    high: 'text-red-400 bg-red-400/10',
    medium: 'text-amber-400 bg-amber-400/10',
    low: 'text-neutral-400 bg-white/[0.04]',
};

export function ActivitySidebar() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Alerts</h2>
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                    <Bell size={12} />
                    {alerts.length} unresolved
                </span>
            </div>
            <div className="space-y-2">
                {alerts.map((alert) => (
                    <div key={alert.label} className="flex items-start gap-3 rounded-lg bg-white/[0.02] px-3 py-2.5">
                        <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-400" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-neutral-300">{alert.label}</p>
                        </div>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${severityColors[alert.severity]}`}>
                            {alert.severity}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <h2 className="text-sm font-semibold text-white mb-3">AI Actions</h2>
                <div className="space-y-2">
                    {[
                        { label: 'Indexed 3 repositories', time: '4m ago' },
                        { label: 'Generated docs for repolyx/api', time: '12m ago' },
                        { label: 'PR #413 review completed', time: '22m ago' },
                    ].map((action) => (
                        <div key={action.label} className="flex items-start gap-3 rounded-lg bg-white/[0.02] px-3 py-2.5">
                            <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-emerald-400" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-neutral-300">{action.label}</p>
                                <p className="text-[11px] text-neutral-500">{action.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
