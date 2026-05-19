'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Settings2, GitBranch, Layers, FileText, CreditCard, Users, TerminalSquare, Bell, ShieldCheck, Eye, Sparkles } from 'lucide-react';

const sections = [
    {
        group: 'Workspace',
        items: [
            { id: 'General', label: 'General', icon: Settings2 },
            { id: 'GitHub Integration', label: 'GitHub Integration', icon: GitBranch },
            { id: 'AI Providers', label: 'AI Providers', icon: Layers },
            { id: 'Repository Access', label: 'Repository Access', icon: FileText },
        ],
    },
    {
        group: 'Governance',
        items: [
            { id: 'Billing', label: 'Billing', icon: CreditCard },
            { id: 'Team Members', label: 'Team Members', icon: Users },
            { id: 'API Keys', label: 'API Keys', icon: TerminalSquare },
            { id: 'Notifications', label: 'Notifications', icon: Bell },
        ],
    },
    {
        group: 'Security',
        items: [
            { id: 'Security', label: 'Security', icon: ShieldCheck },
            { id: 'Appearance', label: 'Appearance', icon: Eye },
            { id: 'Experimental Features', label: 'Experimental Features', icon: Sparkles },
        ],
    },
];

interface SettingsNavProps {
    active: string;
    onSelect: (section: string) => void;
}

export function SettingsNav({ active, onSelect }: SettingsNavProps) {
    return (
        <Card className="space-y-5 border-white/10 bg-[#090c13] p-4 xl:p-5">
            <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Settings</p>
                <h3 className="text-lg font-semibold text-white">Control center</h3>
                <p className="text-sm leading-6 text-neutral-400">Navigate workspace preferences, provider routing, access, and security from a single engineering hub.</p>
            </div>

            <div className="space-y-6">
                {sections.map((group) => (
                    <div key={group.group} className="space-y-3">
                        <p className="text-[11px] uppercase tracking-[0.35em] text-neutral-500">{group.group}</p>
                        <div className="space-y-2">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const selected = active === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => onSelect(item.id)}
                                        className={`group flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left transition ${selected ? 'border-cyan-500/25 bg-cyan-500/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.15)]' : 'border-transparent text-neutral-300 hover:border-white/10 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${selected ? 'bg-cyan-500/15 text-cyan-300' : 'bg-white/5 text-cyan-300 group-hover:bg-cyan-500/10'}`}>
                                            <Icon size={18} />
                                        </span>
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                            <p className="truncate text-sm font-medium">{item.label}</p>
                                            <p className="truncate text-xs text-neutral-500">{item.id === 'API Keys' ? 'Secure management' : item.id === 'Security' ? 'Lockdown controls' : 'Workspace configuration'}</p>
                                        </div>
                                        {selected ? <Badge variant="success">Active</Badge> : null}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
