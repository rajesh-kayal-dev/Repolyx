'use client';

import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { DebugIncident } from '@/lib/types';

interface InfrastructureStatusProps {
    incident: DebugIncident | null;
}

function deriveServices(incident: DebugIncident | null) {
    const base = [
        { name: 'API Gateway', key: 'api-gateway' },
        { name: 'Auth Service', key: 'auth-service' },
        { name: 'Database', key: 'database' },
        { name: 'Cache', key: 'cache' },
        { name: 'Queue Worker', key: 'queue' },
    ];

    return base.map((svc) => {
        if (!incident) {
            return { ...svc, status: 'healthy', label: 'Healthy', color: 'text-emerald-400 bg-emerald-400/10' };
        }

        const isAffected =
            incident.service?.toLowerCase().includes(svc.key) ||
            (Array.isArray(incident.affectedFiles) &&
                incident.affectedFiles.some((f) => f.toLowerCase().includes(svc.key)));

        if (incident.status === 'resolved') {
            return { ...svc, status: 'healthy', label: 'Healthy', color: 'text-emerald-400 bg-emerald-400/10' };
        }

        if (isAffected) {
            const label =
                incident.severity === 'critical' ? 'Degraded' :
                incident.severity === 'high' ? 'Warning' : 'At risk';
            return { ...svc, status: 'affected', label, color: 'text-amber-400 bg-amber-400/10' };
        }

        return { ...svc, status: 'healthy', label: 'Healthy', color: 'text-emerald-400 bg-emerald-400/10' };
    });
}

export function InfrastructureStatus({ incident }: InfrastructureStatusProps) {
    const [expanded, setExpanded] = useState(false);
    const services = deriveServices(incident);
    const affectedCount = services.filter((s) => s.status === 'affected').length;

    return (
        <div>
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="flex items-center justify-between w-full text-left"
            >
                <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Activity size={13} className={affectedCount > 0 ? 'text-amber-400' : 'text-emerald-400'} />
                        Infrastructure
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        {affectedCount > 0 ? `${affectedCount} service${affectedCount !== 1 ? 's' : ''} affected` : 'All services healthy'}
                    </p>
                </div>
                {expanded ? (
                    <ChevronUp size={14} className="text-neutral-500" />
                ) : (
                    <ChevronDown size={14} className="text-neutral-500" />
                )}
            </button>

            {expanded && (
                <div className="mt-4 rounded-xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                    {services.map((svc) => (
                        <div key={svc.key} className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-xs text-neutral-400">{svc.name}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${svc.color}`}>
                                {svc.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
