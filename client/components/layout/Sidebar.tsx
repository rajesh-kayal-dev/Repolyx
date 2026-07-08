'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Activity,
    FileText,
    GitBranch,
    HelpCircle,
    Keyboard,
    LogOut,
    MessageSquare,
    Settings2,
    TerminalSquare,
    Zap,
    User,
    Bot,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
    onOpenSettings: () => void;
    onOpenHelp: () => void;
    onOpenKeyboardShortcuts: () => void;
}


const navItems = [
    { href: '/overview', label: 'Overview', icon: User },
    { href: '/repositories', label: 'Repositories', icon: GitBranch },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/reviews', label: 'Pull Requests', icon: FileText },
    { href: '/debug', label: 'Debug Assistant', icon: TerminalSquare },
    { href: '/docs', label: 'Documentation', icon: FileText },
    { href: '/activity', label: 'Activity', icon: Activity },
    { href: '/workspace/github', label: 'AI GitHub Workspace', icon: Bot },
];

export function Sidebar({ onOpenSettings, onOpenHelp, onOpenKeyboardShortcuts }: SidebarProps) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : '??';

    return (
        <>
            <aside className="flex h-full w-[240px] flex-col border-r border-white/[0.06] bg-[#080b12]">
                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${active
                                            ? 'bg-white/[0.06] text-white'
                                            : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                                        }`}
                                 >
                                    {active && (
                                        <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-accent" />
                                    )}
                                    <Icon size={16} className={`shrink-0 ${active ? 'text-accent' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User section */}
                <div className="border-t border-white/[0.04] px-3 py-3 relative">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/[0.03] transition-colors"
                    >
                        {user?.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="h-8 w-8 rounded-full border border-white/10 object-cover"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-neutral-300">
                                {initials}
                            </div>
                        )}
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-neutral-200 truncate">{user?.username || 'Guest'}</p>
                            <p className="text-[11px] text-neutral-500 truncate">{user?.email || 'GitHub User'}</p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-emerald-400/70 animate-pulse-dot" />
                    </button>

                    {/* Dropdown menu */}
                    {menuOpen && (
                        <div className="absolute bottom-full left-3 right-3 mb-1 rounded-xl border border-white/[0.08] bg-[#0c101a] py-1 shadow-elevated animate-fade-in">
                            <button
                                type="button"
                                onClick={() => { setMenuOpen(false); onOpenSettings(); }}
                                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors"
                            >
                                <Settings2 size={14} />
                                Settings
                            </button>
                            <Link
                                href="/mcp"
                                onClick={() => setMenuOpen(false)}
                                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors"
                            >
                                <Zap size={14} />
                                Repolyx MCP
                            </Link>
                            <button
                                type="button"
                                onClick={() => { setMenuOpen(false); onOpenHelp(); }}
                                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors"
                            >
                                <HelpCircle size={14} />
                                Help & Support
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMenuOpen(false); onOpenKeyboardShortcuts(); }}
                                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors"
                            >
                                <Keyboard size={14} />
                                Keyboard Shortcuts
                            </button>
                            <div className="my-1 border-t border-white/[0.04]" />
                            <button
                                type="button"
                                onClick={() => { setMenuOpen(false); logout(); }}
                                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-neutral-400 hover:bg-white/[0.03] hover:text-red-400 transition-colors"
                            >
                                <LogOut size={14} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
