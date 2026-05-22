'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
    ChevronDown,
    GitBranch,
    GitPullRequest,
    Menu,
    Search,
} from 'lucide-react';
import { RepolyxLogo } from '@/components/brand/RepolyxLogo';
import { Sidebar } from './Sidebar';
import { HelpModal } from '@/components/settings/HelpModal';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useImportRepo } from '@/lib/import-repo-context';
import { useAuth } from '@/lib/auth-context';
import { CommandPalette } from './CommandPalette';
import { NotificationDropdown } from './NotificationDropdown';

const HEADER_HEIGHT = 56;
const SIDEBAR_WIDTH = 240;

interface NavRepo {
    id: string;
    name: string;
    language: string;
    defaultBranch: string;
    status: string;
    isIndexed: boolean;
}

export function PlatformShell({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isRepoSwitcherOpen, setIsRepoSwitcherOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [navRepos, setNavRepos] = useState<NavRepo[]>([]);
    const [activeRepo, setActiveRepo] = useState<NavRepo | null>(null);
    const { openImportRepo } = useImportRepo();
    const repoSwitcherRef = useRef<HTMLDivElement | null>(null);

    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (repoSwitcherRef.current && !repoSwitcherRef.current.contains(e.target as Node)) {
            setIsRepoSwitcherOpen(false);
        }
    }, []);

    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsRepoSwitcherOpen(false);
            setIsHelpOpen(false);
            setIsSettingsOpen(false);
        }
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsCommandPaletteOpen((prev) => !prev);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClickOutside, handleEscape, handleKeyDown]);

    useEffect(() => {
        const token = localStorage.getItem('repolyx_token');
        if (!token) return;

        fetch('/api/dashboard/repos', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setNavRepos(data.repositories);
                    if (data.repositories.length > 0) {
                        setActiveRepo(data.repositories[0]);
                    }
                }
            })
            .catch(() => {});
    }, []);

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

                    {/* Right group */}
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

                        {/* Search / Command Palette trigger */}
                        <button
                            type="button"
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-400 w-[180px] lg:w-[240px]"
                        >
                            <Search size={14} />
                            <span className="flex-1 text-left truncate hidden sm:inline">Search repos, PRs...</span>
                            <span className="flex-1 text-left truncate sm:hidden">Search...</span>
                            <kbd className="items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-neutral-500 hidden sm:inline-flex">
                                <span>⌘</span>K
                            </kbd>
                        </button>

                        {/* Repo switcher */}
                        {navRepos.length > 0 && activeRepo && (
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
                                        {navRepos.map((repo) => (
                                            <button
                                                key={repo.id}
                                                type="button"
                                                onClick={() => { setActiveRepo(repo); setIsRepoSwitcherOpen(false); }}
                                                className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${activeRepo.id === repo.id ? 'bg-white/[0.06] text-white' : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'}`}
                                            >
                                                <GitBranch size={14} className="shrink-0 text-neutral-500" />
                                                <span className="flex-1 text-left">{repo.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pull Requests */}
                        <a
                            href={`https://github.com/pulls`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300 transition-colors relative"
                            aria-label="Pull requests"
                        >
                            <GitPullRequest size={16} />
                        </a>

                        {/* Notifications (in-app) */}
                        <NotificationDropdown />

                        {/* Profile */}
                        <a
                            href={`https://github.com/${user?.username || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-neutral-300 hover:bg-white/[0.10] transition-colors ml-1 overflow-hidden"
                            aria-label="GitHub profile"
                        >
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                user?.username?.slice(0, 2).toUpperCase() || '??'
                            )}
                        </a>
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

            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                navRepos={navRepos}
            />

            <AnimatePresence>
                {isHelpOpen && <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />}
                {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
            </AnimatePresence>
            <ToastContainer />
        </div>
    );
}
