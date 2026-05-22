'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
    Bell,
    ChevronDown,
    FileText,
    GitBranch,
    GitPullRequest,
    Menu,
    MessageSquare,
    Search,
    TerminalSquare,
} from 'lucide-react';
import { RepolyxLogo } from '@/components/brand/RepolyxLogo';
import { Sidebar } from './Sidebar';
import { HelpModal } from '@/components/settings/HelpModal';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useImportRepo } from '@/lib/import-repo-context';

const HEADER_HEIGHT = 56;
const SIDEBAR_WIDTH = 240;

const repos = [
    { name: 'repolyx/cli', branch: 'main' },
    { name: 'repolyx/api', branch: 'develop' },
    { name: 'repolyx/ui', branch: 'main' },
];

const quickActions = [
    { label: 'Repositories', icon: GitBranch },
    { label: 'Pull Requests', icon: FileText },
    { label: 'AI Chat', icon: MessageSquare },
    { label: 'Debug Console', icon: TerminalSquare },
];

export function PlatformShell({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isRepoSwitcherOpen, setIsRepoSwitcherOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeRepo, setActiveRepo] = useState(repos[0]);
    const { openImportRepo } = useImportRepo();
    const searchRef = useRef<HTMLDivElement | null>(null);
    const repoSwitcherRef = useRef<HTMLDivElement | null>(null);

    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
            setIsSearchOpen(false);
        }
        if (repoSwitcherRef.current && !repoSwitcherRef.current.contains(e.target as Node)) {
            setIsRepoSwitcherOpen(false);
        }
    }, []);

    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsSearchOpen(false);
            setIsRepoSwitcherOpen(false);
            setIsHelpOpen(false);
            setIsSettingsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [handleClickOutside, handleEscape]);

    return (
        <div className="h-screen overflow-hidden bg-[#050708] text-white">
            {/* Header */}
            <header
                className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#080b12]"
                style={{ height: HEADER_HEIGHT }}
            >
                <div className="mx-auto flex h-full max-w-[1920px] items-center gap-1.5 px-4">
                    {/* Left: toggle + logo */}
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300 transition-colors"
                            aria-label="Toggle sidebar"
                        >
                            <Menu size={16} />
                        </button>
                        <RepolyxLogo />
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Right group: search, repo switcher, import, pr, notifications, profile */}
                    <div className="flex items-center gap-1.5">
                        {/* Import */}
                        <button
                            type="button"
                            onClick={openImportRepo}
                            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 transition-colors mr-1"
                        >
                            <GitBranch size={13} />
                            Import
                        </button>
                        {/* Search */}
                        <div ref={searchRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen(true)}
                                className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-400 w-[180px] lg:w-[240px]"
                            >
                                <Search size={14} />
                                <span className="flex-1 text-left truncate hidden sm:inline">Search repos, PRs...</span>
                                <span className="flex-1 text-left truncate sm:hidden">Search...</span>
                                <kbd className="items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-neutral-500 hidden sm:inline-flex">
                                    <span>⌘</span>K
                                </kbd>
                            </button>

                            {isSearchOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-80 rounded-xl border border-white/[0.08] bg-[#0c101a] p-3 shadow-elevated">
                                    <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                                        <Search size={14} className="text-neutral-500" />
                                        <input
                                            autoFocus
                                            type="search"
                                            aria-label="Search"
                                            placeholder="Search repos, PRs, errors..."
                                            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
                                        />
                                    </div>
                                    <div className="mt-3 space-y-1">
                                        <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                                            Quick actions
                                        </p>
                                        {quickActions.map((action) => {
                                            const Icon = action.icon;
                                            return (
                                                <button
                                                    key={action.label}
                                                    type="button"
                                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-neutral-200"
                                                >
                                                    <Icon size={14} className="text-neutral-500" />
                                                    <span>{action.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Repo switcher */}
                        <div ref={repoSwitcherRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsRepoSwitcherOpen(!isRepoSwitcherOpen)}
                                className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-neutral-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                            >
                                <GitBranch size={14} className="text-neutral-500" />
                                <span className="hidden lg:inline">{activeRepo.name}</span>
                                <span className="lg:hidden">{activeRepo.name.split('/')[1]}</span>
                                <ChevronDown size={14} className="text-neutral-500" />
                            </button>

                            {isRepoSwitcherOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-white/[0.08] bg-[#0c101a] py-1 shadow-elevated">
                                    {repos.map((repo) => (
                                        <button
                                            key={repo.name}
                                            type="button"
                                            onClick={() => { setActiveRepo(repo); setIsRepoSwitcherOpen(false); }}
                                            className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${activeRepo.name === repo.name ? 'bg-white/[0.06] text-white' : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'}`}
                                        >
                                            <GitBranch size={14} className="shrink-0 text-neutral-500" />
                                            <span className="flex-1 text-left">{repo.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pull Requests */}
                        <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300 transition-colors relative"
                            aria-label="Pull requests"
                        >
                            <GitPullRequest size={16} />
                            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-semibold text-white">
                                3
                            </span>
                        </button>

                        {/* Notifications */}
                        <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300 transition-colors relative"
                            aria-label="Notifications"
                        >
                            <Bell size={16} />
                            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-semibold text-black">
                                5
                            </span>
                        </button>


                        {/* Profile */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-neutral-300 ml-1">
                            RJ
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar + Main */}
            <div className="flex h-full" style={{ paddingTop: HEADER_HEIGHT }}>
                <div
                    className="fixed left-0 top-[56px] bottom-0 z-40 transition-transform duration-200 ease-in-out"
                    style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
                >
                    <Sidebar
                        onOpenSettings={() => setIsSettingsOpen(true)}
                        onOpenHelp={() => setIsHelpOpen(true)}
                    />
                </div>

                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <main
                    className="flex-1 overflow-y-auto bg-[#050708] transition-all duration-200 ease-in-out"
                    style={{ marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0 }}
                >
                    <div className="mx-auto max-w-[1440px] px-6 py-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>

            <AnimatePresence>
                {isHelpOpen && <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />}
                {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
            </AnimatePresence>
            <ToastContainer />
        </div>
    );
}
