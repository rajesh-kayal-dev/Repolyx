'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Command, Search, GitBranch, Star, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Settings2, HelpCircle, MessageSquare, TerminalSquare, FileText, Zap, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const shortcuts = [
    { keys: ['⌘', 'K'], desc: 'Open command palette', icon: Search },
    { keys: ['⌘', 'B'], desc: 'Toggle sidebar', icon: ArrowLeft },
    { keys: ['⌘', 'P'], desc: 'Quick repository switch', icon: GitBranch },
    { keys: ['⌘', 'I'], desc: 'Import repository', icon: Star },
    { keys: ['Esc'], desc: 'Close modals / dialogs', icon: ArrowDown },
    { keys: ['⌘', 'S'], desc: 'Save changes', icon: Settings2 },
    { keys: ['⌘', 'H'], desc: 'Open help & support', icon: HelpCircle },
    { keys: ['⌘', '1'], desc: 'Go to Repolyx MCP', icon: Zap },
    { keys: ['⌘', '2'], desc: 'Go to Overview', icon: Star },
    { keys: ['⌘', '3'], desc: 'Go to Repositories', icon: GitBranch },
    { keys: ['⌘', '4'], desc: 'Go to AI Chat', icon: MessageSquare },
    { keys: ['⌘', '5'], desc: 'Go to Pull Requests', icon: FileText },
    { keys: ['⌘', '6'], desc: 'Go to Debug Assistant', icon: TerminalSquare },
    { keys: ['⌘', '7'], desc: 'Go to Documentation', icon: FileText },
    { keys: ['⌘', '8'], desc: 'Go to Activity', icon: ArrowUp },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c0f16] shadow-soft flex flex-col overflow-hidden max-h-[85vh]"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0e121a]/50 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                            <Keyboard size={13} className="text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white tracking-tight">Keyboard Shortcuts</h2>
                            <p className="text-[10px] text-neutral-500">Use the keyboard to navigate faster</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    <div className="grid gap-1">
                        {shortcuts.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.desc}
                                    className="flex items-center justify-between rounded-xl border border-white/[0.02] bg-white/[0.01] px-4 py-2.5 hover:border-white/[0.06] hover:bg-white/[0.02] transition-all group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0e121a] border border-white/5 text-neutral-500 shrink-0 group-hover:text-neutral-300 transition-colors">
                                            <Icon size={13} />
                                        </div>
                                        <span className="text-xs text-neutral-400 group-hover:text-neutral-200 transition-colors truncate">{item.desc}</span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {item.keys.map((key, i) => (
                                            <span key={i}>
                                                <kbd className="inline-flex items-center justify-center min-w-[22px] h-5 rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 text-[10px] font-mono text-neutral-400 group-hover:text-neutral-300 transition-colors">
                                                    {key}
                                                </kbd>
                                                {i < item.keys.length - 1 && <span className="text-[9px] text-neutral-600 mx-0.5">+</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
