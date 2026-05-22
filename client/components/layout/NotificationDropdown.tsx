'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, CheckCheck, ExternalLink, GitPullRequest, Star, GitCommit, AlertCircle, CircleDot } from 'lucide-react';

interface Notification {
  id: string;
  reason: string;
  unread: boolean;
  title: string;
  type: string;
  url: string;
  repository: string;
  repoUrl: string;
  updatedAt: string;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('repolyx_token');
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('repolyx_token');
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PullRequest': return GitPullRequest;
      case 'Issue': return CircleDot;
      case 'CheckSuite': return GitCommit;
      case 'RepositoryVulnerabilityAlert': return AlertCircle;
      default: return Star;
    }
  };

  const getReasonLabel = (reason: string) => {
    const map: Record<string, string> = {
      assign: 'Assigned',
      author: 'Your PR',
      comment: 'Commented',
      invitation: 'Invited',
      manual: 'Manual',
      mention: 'Mentioned',
      review_requested: 'Review requested',
      security_alert: 'Security alert',
      state_change: 'State changed',
      subscribed: 'Subscribed',
      team_mention: 'Team mentioned',
    };
    return map[reason] || reason;
  };

  const getGithubUrl = (n: Notification) => {
    const parts = n.url.split('/');
    const type = parts.includes('pulls') ? 'pull' : 'issues';
    const issueNumber = parts[parts.length - 1];
    return `https://github.com/${n.repository}/${type}/${issueNumber}`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-96 rounded-xl border border-white/[0.08] bg-[#0c101a] shadow-elevated overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-neutral-400" />
              <span className="text-sm font-medium text-neutral-200">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-accent border-solid border-t-accent border-r-transparent" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center py-8 text-neutral-500">
                <Bell size={24} className="mb-2 opacity-40" />
                <p className="text-sm">All caught up!</p>
                <p className="text-xs mt-0.5">No notifications</p>
              </div>
            )}

            {!loading && notifications.map((n) => {
              const Icon = getIcon(n.type);
              return (
                <a
                  key={n.id}
                  href={getGithubUrl(n)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-start gap-3 border-b border-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.03] ${
                    n.unread ? 'bg-accent/[0.03]' : ''
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 ${n.unread ? 'text-accent' : 'text-neutral-500'}`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${n.unread ? 'font-medium text-white' : 'text-neutral-400'}`}>
                        {n.title}
                      </p>
                      <ExternalLink size={10} className="mt-1 shrink-0 text-neutral-600" />
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                      <span>{n.repository}</span>
                      <span>·</span>
                      <span>{getReasonLabel(n.reason)}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          <a
            href="https://github.com/notifications"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 border-t border-white/[0.06] px-4 py-2.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            View all on GitHub
            <ExternalLink size={10} />
          </a>
        </div>
      )}
    </div>
  );
}
