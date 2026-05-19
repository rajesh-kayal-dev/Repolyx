import { AlertTriangle, ArrowRight, CheckCircle2, Cpu, GitCommit, Server } from 'lucide-react';

interface TimelineEvent {
    type: 'deploy' | 'failure' | 'finding' | 'event';
    title: string;
    detail: string;
    timestamp: string;
}

const events: TimelineEvent[] = [
    { type: 'deploy', title: 'Deployment v2.4.1 rolled out', detail: '3 services updated including api-gateway', timestamp: '10 min ago' },
    { type: 'failure', title: 'Error rate spike detected', detail: '/api/scan returning 502 for 12% of requests', timestamp: '6 min ago' },
    { type: 'finding', title: 'AI analysis completed', detail: 'Connection pool exhaustion identified as root cause', timestamp: '4 min ago' },
    { type: 'event', title: 'Database connection pool at 95%', detail: 'Max connections reached; queue depth increasing', timestamp: '3 min ago' },
    { type: 'finding', title: 'Fix recommended', detail: 'Increase pool size and add connection retry logic', timestamp: '1 min ago' },
];

const typeConfig = {
    deploy: { icon: GitCommit, class: 'text-accent', line: 'bg-accent/30' },
    failure: { icon: AlertTriangle, class: 'text-red-400', line: 'bg-red-400/30' },
    finding: { icon: CheckCircle2, class: 'text-emerald-400', line: 'bg-emerald-400/30' },
    event: { icon: Cpu, class: 'text-neutral-400', line: 'bg-white/[0.06]' },
};

export function InvestigationTimeline() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Investigation Timeline</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Events leading to the current incident</p>
                </div>
            </div>
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[13px] top-2 bottom-2 w-px bg-white/[0.06]" />

                <div className="space-y-4">
                    {events.map((event, i) => {
                        const config = typeConfig[event.type];
                        const Icon = config.icon;
                        return (
                            <div key={i} className="relative flex items-start gap-4 pl-1">
                                <div className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#050708] border border-white/[0.06] ${config.class}`}>
                                    <Icon size={12} />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-neutral-200">{event.title}</p>
                                        <span className="text-[11px] text-neutral-500">{event.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-0.5">{event.detail}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
