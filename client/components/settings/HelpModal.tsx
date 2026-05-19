'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    ExternalLink,
    GitBranch,
    MessageSquare,
    Search,
    Send,
    Shield,
    X,
    Zap,
    Loader2,
    Check,
} from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const guides = [
    {
        icon: Zap,
        title: 'Getting Started',
        desc: 'Learn the basics of navigating Repolyx and running your first analysis.',
    },
    {
        icon: GitBranch,
        title: 'Connect GitHub',
        desc: 'Link repositories and enable AI-powered review.',
    },
    {
        icon: Search,
        title: 'Analyze Repository',
        desc: 'Scan for architecture, dependencies, and risks.',
    },
    {
        icon: MessageSquare,
        title: 'AI Code Review',
        desc: 'Get contextual AI suggestions on PRs and changes.',
    },
    {
        icon: BookOpen,
        title: 'Documentation Guide',
        desc: 'Generate and manage docs from your structure.',
    },
];

const links = [
    { label: 'Documentation', href: '#' },
    { label: 'GitHub Repository', href: '#' },
    { label: 'Keyboard Shortcuts', href: '#' },
    { label: 'Release Notes', href: '#' },
    { label: 'Privacy Policy', href: '#' },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isSending) onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose, isSending]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) return;

        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setSent(true);

            // Open mailto link
            const subject = encodeURIComponent(`Repolyx Support — ${name}`);
            const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`);
            window.location.href = `mailto:support@repolyx.dev?subject=${subject}&body=${body}`;
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                    if (!isSending) onClose();
                }}
                className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c0f16] shadow-soft flex flex-col overflow-hidden max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0e121a]/50 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
                            <Shield size={13} className="text-accent animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white tracking-tight">Help & Support</h2>
                            <p className="text-[10px] text-neutral-500">Get help and find resources</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSending}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Quick guides section */}
                    <div>
                        <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-3">Quick help guides</h3>
                        <div className="space-y-1.5">
                            {guides.map((guide) => {
                                const Icon = guide.icon;
                                return (
                                    <button
                                        key={guide.title}
                                        type="button"
                                        className="flex w-full items-center gap-3.5 rounded-xl border border-white/[0.02] bg-white/[0.01] px-4 py-3 text-left hover:border-white/10 hover:bg-white/[0.03] hover:translate-x-0.5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0e121a] border border-white/5 text-accent shrink-0 group-hover:scale-105 duration-200 transition-transform shadow-[0_0_12px_rgba(56,189,248,0.05)]">
                                            <Icon size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors">
                                                {guide.title}
                                            </p>
                                            <p className="text-[11px] text-neutral-500 leading-normal mt-0.5">{guide.desc}</p>
                                        </div>
                                        <ExternalLink size={11} className="text-neutral-600 group-hover:text-neutral-400 transition-colors shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contact Form Section */}
                    <div>
                        <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-3">Contact support</h3>
                        {sent ? (
                            <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-6 text-center animate-slide-up">
                                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 mb-3">
                                    <Check size={16} strokeWidth={3} className="animate-bounce" />
                                </div>
                                <p className="text-xs font-semibold text-emerald-400">Message prepared!</p>
                                <p className="mt-1.5 text-[11px] text-neutral-400 leading-normal max-w-xs mx-auto">
                                    We&apos;ve opened your mail client with support details. Send the draft to <span className="text-neutral-300 font-medium">support@repolyx.dev</span>.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSent(false)}
                                    className="mt-4 text-[10px] text-neutral-500 hover:text-neutral-300 underline underline-offset-2 transition-colors"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSend} className="space-y-3.5">
                                <div className="grid gap-3.5 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Name</span>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={isSending}
                                            placeholder="Your name"
                                            className="mt-1.5 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-white outline-none placeholder:text-neutral-600 transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Email</span>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isSending}
                                            placeholder="you@example.com"
                                            className="mt-1.5 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-white outline-none placeholder:text-neutral-600 transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                                        />
                                    </label>
                                </div>
                                <label className="block">
                                    <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Message</span>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        disabled={isSending}
                                        rows={3}
                                        placeholder="Describe the issue you are experiencing..."
                                        className="mt-1.5 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-white outline-none placeholder:text-neutral-600 transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/20 resize-none disabled:opacity-50 leading-normal"
                                    />
                                </label>
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="rounded-lg bg-accent/10 border border-accent/20 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent/20 transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 shadow-[0_0_12px_rgba(56,189,248,0.05)] cursor-pointer"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin text-accent" />
                                            Preparing...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={12} />
                                            Send support message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Useful links chips */}
                    <div>
                        <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-3">Useful resources</h3>
                        <div className="flex flex-wrap gap-2">
                            {links.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="rounded-lg border border-white/[0.06] bg-white/[0.01] px-3 py-2 text-[11px] text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 hover:border-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer metadata */}
                <div className="px-6 py-3.5 border-t border-white/5 bg-[#0a0d13] flex items-center justify-between shrink-0">
                    <p className="text-[10px] text-neutral-500">
                        Repolyx v1.0.0 &middot; <a href="mailto:support@repolyx.dev" className="hover:text-neutral-400 transition-colors">support@repolyx.dev</a>
                    </p>
                    <span className="text-[9px] font-bold text-neutral-600 tracking-wider uppercase">
                        SaaS Client
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
