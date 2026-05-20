"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { api } from "@/lib/api-client";

interface Session {
  id: string;
  title: string;
  repo: string;
  repoId: string;
  status: string;
  detail: string;
  updatedAt: string;
}

export function ActiveSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.dashboard.sessions()
      .then((data) => { if (mounted) setSessions(data.sessions || []); })
      .catch((err) => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">AI Chat Sessions</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {sessions.length === 0
              ? "No active conversations"
              : `${sessions.length} session${sessions.length > 1 ? "s" : ""} across repositories`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-px">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg bg-white/[0.02] px-4 py-3">
              <div className="h-8 w-8 rounded-lg bg-white/[0.04] animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-40 bg-white/[0.04] rounded animate-pulse" />
                <div className="h-3 w-56 bg-white/[0.04] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg bg-white/[0.02] px-4 py-3">
          <p className="text-xs text-red-400">Failed to load sessions: {error}</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-lg bg-white/[0.02] px-4 py-6 text-center">
          <MessageSquare size={20} className="mx-auto text-neutral-600 mb-2" />
          <p className="text-sm text-neutral-500">No chat sessions yet</p>
          <p className="text-xs text-neutral-600 mt-1">Start a conversation from any repository</p>
        </div>
      ) : (
        <div className="space-y-px">
          {sessions.map((session) => {
            const timeAgo = getTimeAgo(session.updatedAt);
            return (
              <div
                key={session.id}
                className="flex items-center gap-4 rounded-lg bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                  <MessageSquare size={14} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-200 truncate">{session.title}</p>
                  <p className="text-xs text-neutral-500 truncate">
                    {session.repo} &middot; {session.detail}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-neutral-500">{timeAgo}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
