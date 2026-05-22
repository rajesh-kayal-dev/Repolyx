'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { CreateIncidentForm, DebugSeverity } from '@/lib/types';

interface CreateIncidentModalProps {
    onClose: () => void;
    onCreate: (data: CreateIncidentForm) => Promise<void>;
}

const severities: { value: DebugSeverity; label: string; desc: string; color: string }[] = [
    { value: 'critical', label: 'Critical', desc: 'Immediate action needed — users blocked', color: 'border-red-400/30 text-red-300 bg-red-400/10' },
    { value: 'high', label: 'High', desc: 'Major impact, fix ASAP', color: 'border-amber-400/30 text-amber-300 bg-amber-400/10' },
    { value: 'medium', label: 'Medium', desc: 'Moderate issue, investigate soon', color: 'border-accent/30 text-accent bg-accent/10' },
    { value: 'low', label: 'Low', desc: 'Minor issue, fix when possible', color: 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10' },
];

export function CreateIncidentModal({ onClose, onCreate }: CreateIncidentModalProps) {
    const [form, setForm] = useState<CreateIncidentForm>({
        title: '',
        severity: 'medium',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('A title is required.'); return; }
        setSubmitting(true);
        setError('');
        try {
            await onCreate(form);
        } catch (err: any) {
            setError(err.message || 'Failed to create incident.');
        } finally {
            setSubmitting(false);
        }
    };

    const update = (key: keyof CreateIncidentForm, value: string) =>
        setForm(f => ({ ...f, [key]: value }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10">
                            <AlertTriangle size={13} className="text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white">Report New Incident</h2>
                            <p className="text-xs text-neutral-500">Describe what went wrong</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.06] transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                            What is broken? <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => update('title', e.target.value)}
                            placeholder="e.g. Login button is not working"
                            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white/[0.15] focus:bg-white/[0.05] transition-all"
                        />
                    </div>

                    {/* Impact */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                            How many users are affected?
                        </label>
                        <input
                            type="text"
                            value={form.impactStatement || ''}
                            onChange={(e) => update('impactStatement', e.target.value)}
                            placeholder="e.g. About 30% of users can't sign in since 10am"
                            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white/[0.15] transition-all"
                        />
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                            How serious is it?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {severities.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => update('severity', s.value)}
                                    className={`rounded-lg border p-2.5 text-left transition-all ${
                                        form.severity === s.value
                                            ? s.color
                                            : 'border-white/[0.06] text-neutral-500 hover:border-white/[0.1] hover:text-neutral-300'
                                    }`}
                                >
                                    <p className="text-xs font-semibold">{s.label}</p>
                                    <p className="text-[10px] opacity-80 mt-0.5">{s.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Service + deploy */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                                Which service?
                            </label>
                            <input
                                type="text"
                                value={form.service || ''}
                                onChange={(e) => update('service', e.target.value)}
                                placeholder="e.g. auth-service"
                                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white/[0.15] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                                Deploy version
                            </label>
                            <input
                                type="text"
                                value={form.deployVersion || ''}
                                onChange={(e) => update('deployVersion', e.target.value)}
                                placeholder="e.g. v2.4.1"
                                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white/[0.15] transition-all"
                            />
                        </div>
                    </div>

                    {/* Error rate */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                            Error rate (optional)
                        </label>
                        <input
                            type="text"
                            value={form.errorRate || ''}
                            onChange={(e) => update('errorRate', e.target.value)}
                            placeholder="e.g. 12% of requests failing"
                            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white/[0.15] transition-all"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-400 bg-red-400/[0.08] border border-red-400/20 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] py-2.5 text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.05] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 rounded-lg bg-amber-400/10 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-400/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Creating…' : 'Create Incident'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
