'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, Eye, Github, Shield, User, Zap, X, Loader2, Check } from 'lucide-react';
import { useProfile, useGithubIntegration, useAppearance, useNotifications, useAIPreferences, useSecurity } from '@/lib/hooks/use-settings';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'github', label: 'GitHub', icon: Github },
    { id: 'appearance', label: 'Appearance', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Preferences', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={onChange}
            className={`relative h-6 w-10 shrink-0 cursor-pointer rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                enabled ? 'border-accent/40 bg-accent/20 shadow-[0_0_8px_rgba(56,189,248,0.1)]' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]'
            }`}
        >
            <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                    enabled ? 'translate-x-[18px]' : 'translate-x-[1px]'
                }`}
                style={{ marginTop: '0px' }}
            />
        </button>
    );
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Hooks
    const { profile, updateProfile, isLoading: profileLoading } = useProfile();
    const { github, disconnect, isLoading: githubLoading } = useGithubIntegration();
    const { appearance, updateAppearance, isLoading: appearanceLoading } = useAppearance();
    const { notifications, updateNotifications, isLoading: notificationsLoading } = useNotifications();
    const { aiPreferences, updateAIPreferences, isLoading: aiLoading } = useAIPreferences();
    const { sessions, tokens, deleteSession, deleteAllOtherSessions, createToken, deleteToken, revokeToken, isLoading: securityLoading } = useSecurity();

    // Local Profile State (for detecting unsaved changes)
    const [name, setName] = useState('');
    const [workspace, setWorkspace] = useState('');
    
    useEffect(() => {
        if (profile) {
            setName(profile.displayName);
            setWorkspace(profile.workspaceName);
        }
    }, [profile]);

    const hasUnsavedChanges = useMemo(() => {
        if (!profile) return false;
        return name !== profile.displayName || workspace !== profile.workspaceName;
    }, [name, workspace, profile]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isSaving) {
                if (hasUnsavedChanges) {
                    if (window.confirm('You have unsaved changes. Are you sure you want to close?')) onClose();
                } else {
                    onClose();
                }
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose, isSaving, hasUnsavedChanges]);

    const handleBackdropClick = () => {
        if (isSaving) return;
        if (hasUnsavedChanges) {
            if (window.confirm('You have unsaved changes. Are you sure you want to close?')) onClose();
        } else {
            onClose();
        }
    };

    const handleSave = async () => {
        if (activeTab === 'profile') {
            setIsSaving(true);
            const success = await updateProfile({ displayName: name, workspaceName: workspace });
            setIsSaving(false);
            if (success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleBackdropClick}
                className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0c0f16] shadow-soft flex flex-col overflow-hidden max-h-[85vh] md:h-[580px]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0e121a]/50 shrink-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-white tracking-tight">Settings</h2>
                        <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-neutral-400 px-1.5 py-0.5 rounded">
                            Workspace configuration
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Body split */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Left: Tab selectors */}
                    <div className="w-full md:w-[200px] shrink-0 p-3 bg-[#080b11] border-b md:border-b-0 md:border-r border-white/5 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-1 shrink-0">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = tab.id === activeTab;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                                        isActive
                                            ? 'bg-accent/10 text-accent font-medium'
                                            : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                                    }`}
                                >
                                    {isActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-[2px] rounded-full bg-accent hidden md:block" />
                                    )}
                                    <Icon size={14} className={isActive ? 'text-accent' : 'text-neutral-500'} />
                                    <span className="whitespace-nowrap">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right: Tab content */}
                    <div className="flex-1 p-6 overflow-y-auto bg-transparent space-y-6">
                        {activeTab === 'profile' && (
                            <div className="space-y-5 animate-fade-in">
                                {profileLoading ? (
                                    <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-neutral-500" /></div>
                                ) : (
                                <div>
                                    <h3 className="text-xs font-semibold text-white tracking-wide uppercase mb-1">Profile Info</h3>
                                    <p className="text-[11px] text-neutral-500 mb-4">Update your profile details and workspace credentials.</p>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-3 rounded-lg border border-white/[0.04] bg-white/[0.01] mb-2">
                                            {profile?.avatarUrl ? (
                                                <img src={profile.avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full border border-white/10 shrink-0 object-cover" />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full border border-white/10 bg-gradient-to-tr from-accent/20 to-accentSoft/40 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                                                    {name?.substring(0, 2).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-white">{name}</p>
                                                <p className="text-xs text-neutral-500">Team Administrator</p>
                                            </div>
                                        </div>

                                        <label className="block">
                                            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Display Name</span>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="mt-1.5 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3.5 py-2 text-xs text-white outline-none placeholder:text-neutral-500 transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                                            />
                                        </label>
                                        
                                        <label className="block opacity-75">
                                            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Email Address</span>
                                            <input
                                                type="email"
                                                value={profile?.email || 'No email provided'}
                                                readOnly
                                                disabled
                                                className="mt-1.5 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs text-neutral-400 outline-none cursor-not-allowed"
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Workspace Name</span>
                                            <input
                                                type="text"
                                                value={workspace}
                                                onChange={(e) => setWorkspace(e.target.value)}
                                                className="mt-1.5 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3.5 py-2 text-xs text-white outline-none placeholder:text-neutral-500 transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                                            />
                                        </label>
                                    </div>
                                </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'github' && (
                            <div className="space-y-5 animate-fade-in">
                                {githubLoading ? (
                                    <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-neutral-500" /></div>
                                ) : (
                                <div>
                                    <h3 className="text-xs font-semibold text-white tracking-wide uppercase mb-1">GitHub Integration</h3>
                                    <p className="text-[11px] text-neutral-500 mb-4">Manage access controls and webhook configurations for GitHub.</p>
                                    
                                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 border border-white/5 text-white overflow-hidden">
                                                    {github?.avatarUrl ? <img src={github.avatarUrl} alt="org" className="w-full h-full object-cover" /> : <Github size={20} />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-white">{github?.organization !== 'N/A' ? github?.organization : github?.githubUsername}</p>
                                                    <p className="text-[11px] text-neutral-500 mt-0.5">Linked workspace</p>
                                                    <p className="text-[10px] text-neutral-600 mt-1">Authorized via OAuth &bull; {github?.repositoryCount || 0} repos</p>
                                                </div>
                                            </div>
                                            {github?.connected ? (
                                                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/15 px-2 py-0.5 rounded-full shrink-0">Connected</span>
                                            ) : (
                                                <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-400/10 border border-neutral-400/15 px-2 py-0.5 rounded-full shrink-0">Disconnected</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => window.open('https://github.com/settings/applications', '_blank')}
                                            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3.5 py-2 text-xs text-neutral-300 hover:bg-white/[0.06] hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                                        >
                                            Configure repositories
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if(window.confirm('Are you sure you want to disconnect your GitHub account? This will prevent syncing.')) disconnect();
                                            }}
                                            disabled={!github?.connected}
                                            className="rounded-lg border border-red-500/10 bg-red-500/5 px-3.5 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 disabled:opacity-50"
                                        >
                                            Disconnect Integration
                                        </button>
                                    </div>
                                </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-5 animate-fade-in">
                                {appearanceLoading ? (
                                    <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-neutral-500" /></div>
                                ) : (
                                <div>
                                    <h3 className="text-xs font-semibold text-white tracking-wide uppercase mb-1">Appearance</h3>
                                    <p className="text-[11px] text-neutral-500 mb-4">Tailor the user interface layout and color preferences.</p>
                                    
                                    <div className="space-y-4">
                                        <label className="block">
                                            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Theme Mode</span>
                                            <select 
                                                value={appearance?.theme || 'Dark'}
                                                onChange={(e) => updateAppearance({ ...appearance!, theme: e.target.value as any })}
                                                className="mt-1.5 w-full rounded-lg border border-white/[0.06] bg-[#080b11] px-3 py-2 text-xs text-white outline-none cursor-pointer hover:border-white/10 transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                                            >
                                                <option value="Dark">Dark</option>
                                                <option value="Light">Light</option>
                                                <option value="Midnight Special">Midnight Special</option>
                                                <option value="System Default">System Default</option>
                                            </select>
                                        </label>
                                        
                                        <label className="block">
                                            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">UI Spacing Density</span>
                                            <select 
                                                value={appearance?.density || 'Comfortable'}
                                                onChange={(e) => updateAppearance({ ...appearance!, density: e.target.value as any })}
                                                className="mt-1.5 w-full rounded-lg border border-white/[0.06] bg-[#080b11] px-3 py-2 text-xs text-white outline-none cursor-pointer hover:border-white/10 transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                                            >
                                                <option value="Comfortable">Comfortable</option>
                                                <option value="Compact">Compact</option>
                                                <option value="Spacious">Spacious</option>
                                            </select>
                                        </label>
                                    </div>
                                </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-5 animate-fade-in">
                                {notificationsLoading ? (
                                    <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-neutral-500" /></div>
                                ) : (
                                <div>
                                    <h3 className="text-xs font-semibold text-white tracking-wide uppercase mb-1">Notifications</h3>
                                    <p className="text-[11px] text-neutral-500 mb-4">Toggle alert rules and newsletter delivery settings.</p>
                                    
                                    <div className="space-y-2">
                                        {[
                                            { key: 'emailSummary', label: 'Email summaries', desc: 'Periodic review reports and activity digests' },
                                            { key: 'pullRequestReview', label: 'Pull request reviews', desc: 'Real-time alert when a review is compiled' },
                                            { key: 'systemStatus', label: 'System status updates', desc: 'Platform announcements and beta logs' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5">
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-medium text-neutral-200">{item.label}</p>
                                                    <p className="text-[10px] text-neutral-500">{item.desc}</p>
                                                </div>
                                                <Toggle 
                                                    enabled={notifications?.[item.key as keyof typeof notifications] ?? false} 
                                                    onChange={() => updateNotifications({ ...notifications!, [item.key]: !notifications?.[item.key as keyof typeof notifications] })} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="space-y-5 animate-fade-in">
                                {aiLoading ? (
                                    <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-neutral-500" /></div>
                                ) : (
                                <div>
                                    <h3 className="text-xs font-semibold text-white tracking-wide uppercase mb-1">AI Preferences</h3>
                                    <p className="text-[11px] text-neutral-500 mb-4">Calibrate analysis models and background auditing preferences.</p>
                                    
                                    <div className="space-y-4">
                                        <label className="block">
                                            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Default Intelligence Model</span>
                                            <select 
                                                value={aiPreferences?.defaultModel || 'Claude 3.5 Sonnet'}
                                                onChange={(e) => updateAIPreferences({ ...aiPreferences!, defaultModel: e.target.value })}
                                                className="mt-1.5 w-full rounded-lg border border-white/[0.06] bg-[#080b11] px-3 py-2 text-xs text-white outline-none cursor-pointer hover:border-white/10 transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                                            >
                                                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                                                <option value="GPT-5">GPT-5</option>
                                                <option value="Gemini 2.5 Pro">Gemini 2.5 Pro</option>
                                                <option value="DeepSeek">DeepSeek</option>
                                                <option value="Mistral">Mistral</option>
                                            </select>
                                        </label>

                                        <div className="space-y-2">
                                            {[
                                                { key: 'autoAudit', label: 'Automated PR audit', desc: 'Trigger agent reviews immediately on sync' },
                                                { key: 'contextTips', label: 'Contextual code tips', desc: 'Inject subtle autocomplete suggestions inside review feed' },
                                                { key: 'backgroundIndexing', label: 'Vector background indexing', desc: 'Index codebase dependencies during off-hours' },
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5">
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-medium text-neutral-200">{item.label}</p>
                                                        <p className="text-[10px] text-neutral-500">{item.desc}</p>
                                                    </div>
                                                    <Toggle 
                                                        enabled={!!aiPreferences?.[item.key as keyof typeof aiPreferences]} 
                                                        onChange={() => updateAIPreferences({ ...aiPreferences!, [item.key]: !aiPreferences?.[item.key as keyof typeof aiPreferences] })} 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-5 animate-fade-in">
                                {securityLoading ? (
                                    <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-neutral-500" /></div>
                                ) : (
                                <div>
                                    <h3 className="text-xs font-semibold text-white tracking-wide uppercase mb-1">Security & Sessions</h3>
                                    <p className="text-[11px] text-neutral-500 mb-4">View active authentication sessions and access tokens.</p>
                                    
                                    <div className="space-y-3">
                                        <div className="rounded-xl border border-white/[0.04] bg-[#0e121a]/30 p-3.5 space-y-2">
                                            {sessions?.map((session) => (
                                                <div key={session.id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0 pt-2 first:pt-0">
                                                    <div>
                                                        <p className="text-xs font-semibold text-white">{session.os} Client</p>
                                                        <p className="text-[10px] text-neutral-500">{session.browser} &bull; {session.location} &bull; {session.ip}</p>
                                                    </div>
                                                    {session.isCurrent ? (
                                                        <span className="text-[9px] font-bold text-accent bg-accent/10 border border-accent/15 px-1.5 py-0.5 rounded uppercase">Current Session</span>
                                                    ) : (
                                                        <button type="button" onClick={() => deleteSession(session.id)} className="text-[10px] text-red-400 hover:text-red-300">Sign Out</button>
                                                    )}
                                                </div>
                                            ))}
                                            {!sessions?.length && (
                                                <p className="text-xs text-neutral-500">No active sessions found.</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => deleteAllOtherSessions()}
                                                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3.5 py-2 text-xs text-neutral-300 hover:bg-white/[0.06] hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                                            >
                                                Sign out of all other sessions
                                            </button>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const tokenName = window.prompt('Enter a name for the new access token:');
                                                    if (tokenName) {
                                                        const token = await createToken(tokenName);
                                                        if (token) {
                                                            window.prompt('Copy your token now. You will not be able to see it again.', token);
                                                        }
                                                    }
                                                }}
                                                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3.5 py-2 text-xs text-neutral-300 hover:bg-white/[0.06] hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                                            >
                                                Manage access tokens
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-white/5 bg-[#0a0d13] shrink-0">
                    <button
                        type="button"
                        onClick={handleBackdropClick}
                        disabled={isSaving}
                        className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-xs text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || saveSuccess || activeTab !== 'profile' || !hasUnsavedChanges}
                        className="relative rounded-lg bg-accent text-neutral-900 font-semibold px-4.5 py-2 text-xs hover:bg-accent/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(56,189,248,0.2)] flex items-center justify-center min-w-[110px]"
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-1.5">
                                <Loader2 size={13} className="animate-spin" />
                                Saving...
                            </span>
                        ) : saveSuccess ? (
                            <span className="flex items-center gap-1 text-emerald-950 font-bold">
                                <Check size={13} strokeWidth={3} className="animate-bounce" />
                                Saved!
                            </span>
                        ) : (
                            'Save changes'
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
