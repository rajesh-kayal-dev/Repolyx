import { AlertTriangle, ArrowRight, Clock, Database, Server } from 'lucide-react';

interface Incident {
    title: string;
    severity: 'critical' | 'high' | 'medium';
    service: string;
    timestamp: string;
    status: 'investigating' | 'identified' | 'monitoring';
    summary: string;
    cause: string;
}

const incidents: Incident[] = [
    {
        title: 'API timeout spike on /api/scan',
        severity: 'critical',
        service: 'api-gateway',
        timestamp: '4 min ago',
        status: 'investigating',
        summary: 'Error rate increased from 0.5% to 12% in the last 5 minutes.',
        cause: 'Upstream database connection pool exhausted after deployment v2.4.1',
    },
    {
        title: 'Authentication failures increasing',
        severity: 'high',
        service: 'auth-service',
        timestamp: '18 min ago',
        status: 'identified',
        summary: 'OAuth token refresh failures affecting 8% of requests.',
        cause: 'Session secret rotation invalidated cached tokens',
    },
];

const severityColors = {
    critical: 'text-red-400 bg-red-400/10',
    high: 'text-amber-400 bg-amber-400/10',
    medium: 'text-accent bg-accent/10',
};

const statusConfig = {
    investigating: { label: 'Investigating', class: 'text-amber-400' },
    identified: { label: 'Identified', class: 'text-accent' },
    monitoring: { label: 'Monitoring', class: 'text-emerald-400' },
};

export function ActiveIncidents() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Active Incidents</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">{incidents.length} ongoing issues requiring attention</p>
                </div>
            </div>
            <div className="space-y-3">
                {incidents.map((incident) => (
                    <div key={incident.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5 ${severityColors[incident.severity]}`}>
                                    <AlertTriangle size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-medium text-white">{incident.title}</p>
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${severityColors[incident.severity]}`}>
                                            {incident.severity}
                                        </span>
                                        <span className={`text-[11px] ${statusConfig[incident.status].class}`}>
                                            {statusConfig[incident.status].label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-1">{incident.summary}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                                        <span className="flex items-center gap-1">
                                            <Server size={11} /> {incident.service}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={11} /> {incident.timestamp}
                                        </span>
                                    </div>
                                    <div className="mt-2 rounded-lg bg-amber-400/5 border border-amber-400/10 px-3 py-2">
                                        <p className="text-xs text-amber-300/90">
                                            <span className="font-medium">Probable cause:</span> {incident.cause}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300 transition-colors shrink-0"
                            >
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
