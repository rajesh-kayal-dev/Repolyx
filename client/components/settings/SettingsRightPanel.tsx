import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';

const recommendations = [
    {
        title: 'Claude model limit approaching',
        detail: 'The current allocation is at 82% of the monthly allowance.',
        badge: 'AI limit',
        variant: 'warning',
    },
    {
        title: 'Repository permissions outdated',
        detail: '4 repos still use legacy access restrictions.',
        badge: 'Review',
        variant: 'muted',
    },
    {
        title: 'Unused API key detected',
        detail: 'A key has been dormant for 32 days, consider revoking it.',
        badge: 'Security',
        variant: 'warning',
    },
];

const stats = [
    { label: 'Integration health', value: '98%', note: 'GitHub + AI sync stable', icon: CheckCircle },
    { label: 'Security rating', value: 'A+', note: 'No anomalies in last 24h', icon: ShieldCheck },
    { label: 'Experimental flags', value: '3 active', note: 'Safe feature gates enabled', icon: Sparkles },
];

export function SettingsRightPanel() {
    return (
        <div className="space-y-6">
            <Card className="border-white/10 bg-[#090c13] p-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Contextual insights</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">Intelligence panel</h3>
                    </div>
                    <Badge variant="secondary">Live</Badge>
                </div>

                <div className="mt-5 space-y-4">
                    {recommendations.map((item) => (
                        <div key={item.title} className="rounded-3xl border border-white/10 bg-[#070a10] p-4 text-sm text-neutral-300">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-white">{item.title}</p>
                                    <p className="mt-2 text-sm text-neutral-400">{item.detail}</p>
                                </div>
                                <Badge variant={item.variant === 'warning' ? 'warning' : 'muted'}>{item.badge}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="space-y-4 border-white/10 bg-[#090c13] p-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Health snapshot</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">Workspace score</h3>
                    </div>
                    <Badge variant="success">Stable</Badge>
                </div>

                <div className="space-y-3">
                    {stats.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.label} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-[#07101a] p-4">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                                    <Icon size={18} />
                                </div>
                                <div className="min-w-0 flex-1 overflow-hidden">
                                    <p className="text-sm font-semibold text-white">{item.value}</p>
                                    <p className="truncate text-sm text-neutral-400">{item.label}</p>
                                </div>
                                <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">{item.note}</p>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Card className="border-white/10 bg-[#090c13] p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Tip</p>
                <p className="mt-3 text-sm leading-6 text-neutral-300">Keep provider failover enabled and limit repository write permissions to avoid accidental AI agent changes in production workflows.</p>
            </Card>
        </div>
    );
}
