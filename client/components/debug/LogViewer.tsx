'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info, Search, XCircle } from 'lucide-react';
import { DebugLog } from '@/lib/types';

interface CollapsibleLogsProps {
    logs: DebugLog[];
    incidentId?: string;
    beginnerMode: boolean;
    onLogsUpdated: () => void;
}

const levelConfig = {
    error: { icon: XCircle, class: 'text-red-400', badge: 'text-red-400 bg-red-400/10' },
    warn:  { icon: AlertTriangle, class: 'text-amber-400', badge: 'text-amber-400 bg-amber-400/10' },
    info:  { icon: Info, class: 'text-neutral-400', badge: 'text-neutral-500 bg-white/[0.04]' },
};

export function CollapsibleLogs({ logs, incidentId, beginnerMode, onLogsUpdated }: CollapsibleLogsProps) {
    const [expanded, setExpanded] = useState(false);
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    const errorCount = logs.filter((l) => l.level === 'error').length;
    const warnCount = logs.filter((l) => l.level === 'warn').length;

    const filtered = useMemo(() => {
        return logs.filter((log) => {
            const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
            const matchesSearch = !search ||
                log.message.toLowerCase().includes(search.toLowerCase()) ||
                log.source.toLowerCase().includes(search.toLowerCase()) ||
                (log.service || '').toLowerCase().includes(search.toLowerCase());
            return matchesLevel && matchesSearch;
        });
    }, [logs, levelFilter, search]);

    function formatLogTime(ts: string) {
        try {
            return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch { return ts; }
    }

    return (
        <div>
            {/* Collapsed header — always visible */}
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors rounded-t-xl"
            >
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                            {expanded ? 'Hide logs' : 'Show technical logs'}
                            {!expanded && (
                                <span className="text-xs text-neutral-600">
                                    {beginnerMode ? '— for developers' : ''}
                                </span>
                            )}
                        </p>
                        {!expanded && (
                            <p className="text-xs text-neutral-600 mt-0.5">
                                {errorCount > 0 && (
                                    <span className="text-red-400 mr-2">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
                                )}
                                {warnCount > 0 && (
                                    <span className="text-amber-400 mr-2">{warnCount} warning{warnCount !== 1 ? 's' : ''}</span>
                                )}
                                {logs.length} total log entries
                            </p>
                        )}
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp size={14} className="text-neutral-500" />
                ) : (
                    <ChevronDown size={14} className="text-neutral-500" />
                )}
            </button>

            {/* Expanded content */}
            {expanded && (
                <div className="border-t border-white/[0.04]">
                    {/* Search + filter bar */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04]">
                        <div className="relative flex-1">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search logs…"
                                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-1.5 pl-8 pr-3 text-xs text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.1]"
                            />
                        </div>
                        <div className="flex gap-1">
                            {(['all', 'error', 'warn', 'info'] as const).map((lvl) => (
                                <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => setLevelFilter(lvl)}
                                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors capitalize ${
                                        levelFilter === lvl
                                            ? 'bg-white/[0.08] text-neutral-200'
                                            : 'text-neutral-500 hover:text-neutral-300'
                                    }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                        <span className="text-xs text-neutral-600 shrink-0">{filtered.length} entries</span>
                    </div>

                    {/* Log rows */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.03]">
                        {filtered.length === 0 ? (
                            <p className="px-4 py-6 text-xs text-neutral-600 text-center">No log entries match your filter.</p>
                        ) : (
                            filtered.map((log) => {
                                const cfg = levelConfig[log.level] || levelConfig.info;
                                const Icon = cfg.icon;
                                const isOpen = expandedLog === log.id;
                                return (
                                    <div
                                        key={log.id}
                                        className="hover:bg-white/[0.02] transition-colors"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setExpandedLog(isOpen ? null : log.id)}
                                            className="flex items-start gap-3 px-4 py-2.5 w-full text-left font-mono text-xs"
                                        >
                                            <Icon size={11} className={`shrink-0 mt-0.5 ${cfg.class}`} />
                                            <span className="text-neutral-600 shrink-0 w-16 tabular-nums">
                                                {formatLogTime(log.loggedAt)}
                                            </span>
                                            <span className={`shrink-0 w-10 text-[10px] font-semibold uppercase ${cfg.class}`}>
                                                {log.level}
                                            </span>
                                            <span className="flex-1 text-neutral-300 text-left truncate">
                                                {log.message}
                                            </span>
                                            <span className="text-neutral-600 shrink-0 hidden sm:inline ml-2">
                                                {log.source}
                                            </span>
                                        </button>

                                        {/* Expandable stack trace */}
                                        {isOpen && log.stackTrace && (
                                            <div className="px-4 pb-3">
                                                <pre className="rounded-lg bg-black/40 border border-white/[0.04] p-3 text-[10px] text-neutral-500 font-mono whitespace-pre-wrap overflow-x-auto">
                                                    {log.stackTrace}
                                                </pre>
                                            </div>
                                        )}
                                        {isOpen && !log.stackTrace && (
                                            <div className="px-4 pb-3 grid grid-cols-2 gap-2 text-xs">
                                                {log.service && (
                                                    <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                                                        <p className="text-neutral-600 text-[10px] mb-1">Service</p>
                                                        <p className="font-mono text-neutral-300">{log.service}</p>
                                                    </div>
                                                )}
                                                <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                                                    <p className="text-neutral-600 text-[10px] mb-1">Source</p>
                                                    <p className="font-mono text-neutral-300">{log.source}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
