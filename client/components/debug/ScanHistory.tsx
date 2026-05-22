import { Clock, ShieldAlert, CheckCircle2, History } from 'lucide-react';
import { RepoHealthSummary } from '@/lib/types';

interface ScanHistoryProps {
    repository: RepoHealthSummary;
    totalIncidents: number;
}

export function ScanHistory({ repository, totalIncidents }: ScanHistoryProps) {
    return (
        <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <History size={14} className="text-neutral-400" />
                Scan History
            </h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Last Scan</span>
                    <span className="text-white">
                        {repository.lastScanAt ? new Date(repository.lastScanAt).toLocaleString() : 'Never'}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Duration</span>
                    <span className="text-white flex items-center gap-1">
                        <Clock size={12} className="text-neutral-500" />
                        {repository.scanDuration ? `${(repository.scanDuration / 1000).toFixed(1)}s` : 'Unknown'}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Current Issues</span>
                    <span className="text-amber-400 flex items-center gap-1 font-medium">
                        <ShieldAlert size={12} />
                        {repository.incidentCount} active
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Status</span>
                    {repository.healthScore === 'Clean' ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 size={12} /> Clean
                        </span>
                    ) : repository.healthScore === 'Warning' ? (
                        <span className="text-amber-400 flex items-center gap-1 font-medium">
                            <ShieldAlert size={12} /> Warning
                        </span>
                    ) : (
                        <span className="text-red-400 flex items-center gap-1 font-medium">
                            <ShieldAlert size={12} /> Critical
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
